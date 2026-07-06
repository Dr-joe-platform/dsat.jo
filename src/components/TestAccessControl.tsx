import React, { useState } from 'react';
import { Lock, Search, Check, X, Loader2 } from 'lucide-react';
import { AppUser, AdminTestBank, updateTestBank, MiniQuiz, updateMiniQuiz } from '@/lib/db';

interface Props {
  tests: AdminTestBank[];
  miniQuizzes?: MiniQuiz[];
  students: AppUser[];
  onAccessUpdated: () => void;
  loading?: boolean;
}

export default function TestAccessControl({ tests, miniQuizzes = [], students, onAccessUpdated, loading = false }: Props) {
  const [tab, setTab] = useState<'tests'|'miniquizzes'>('tests');
  
  const currentList = tab === 'tests' 
    ? tests.map(t => ({ ...t, displayType: 'test' as const, displayName: t.name, displayQuestions: t.questions })) 
    : miniQuizzes.map(q => ({ ...q, displayType: 'miniquiz' as const, displayName: q.title, displayQuestions: q.questions?.length }));

  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // If list updates and we don't have a selection or the selection is not in the list, pick the first
  if (currentList.length > 0 && (!selectedTestId || !currentList.find(t => t.id === selectedTestId)) && !loading) {
    setSelectedTestId(currentList[0].id!);
  } else if (currentList.length === 0 && selectedTestId) {
    setSelectedTestId(null);
  }

  const test = currentList.find(t => t.id === selectedTestId);

  // By default, if visibleTo is 'all' or undefined, everyone has access
  const isVisibleToAll = !test?.visibleTo || test.visibleTo === 'all';
  const visibleList = Array.isArray(test?.visibleTo) ? test.visibleTo : [];

  const filteredStudents = students.filter(s =>
    (s.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAccess = async (student: AppUser) => {
    if (!test || !test.id) return;
    setSaving(true);
    try {
      let newVisibleTo: string[] = [];
      
      if (isVisibleToAll) {
        // If it's currently 'all', we change it to an explicit array of ALL OTHER students
        newVisibleTo = students.map(s => s.uid).filter(id => id !== student.uid);
      } else {
        const hasAccess = visibleList.includes(student.uid);
        if (hasAccess) {
          newVisibleTo = visibleList.filter(id => id !== student.uid);
        } else {
          newVisibleTo = [...visibleList, student.uid];
        }
      }

      const updateFn = test.displayType === 'test' ? updateTestBank : updateMiniQuiz;

      // If array is exactly equal to all students, we can optionally set it back to 'all'
      if (newVisibleTo.length === students.length) {
        await updateFn(test.id, { visibleTo: 'all' });
      } else {
        await updateFn(test.id, { visibleTo: newVisibleTo });
      }
      
      onAccessUpdated();
    } catch (err) {
      console.error(err);
      alert('Error updating access');
    }
    setSaving(false);
  };

  const grantAll = async () => {
    if (!test || !test.id || !confirm("Grant access to all students?")) return;
    setSaving(true);
    try {
      const updateFn = test.displayType === 'test' ? updateTestBank : updateMiniQuiz;
      await updateFn(test.id, { visibleTo: 'all' });
      onAccessUpdated();
    } catch (err) {
      console.error(err);
      alert('Error granting all');
    }
    setSaving(false);
  };

  const revokeAll = async () => {
    if (!test || !test.id || !confirm("Revoke access from all students?")) return;
    setSaving(true);
    try {
      const updateFn = test.displayType === 'test' ? updateTestBank : updateMiniQuiz;
      await updateFn(test.id, { visibleTo: [] });
      onAccessUpdated();
    } catch (err) {
      console.error(err);
      alert('Error revoking all');
    }
    setSaving(false);
  };

  const studentsWithAccess = isVisibleToAll 
    ? students.length 
    : students.filter(s => visibleList.includes(s.uid)).length;

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Lock size={22} color="#6366f1" /> Test Access Control
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Control exactly which students can access each exam or quiz on their dashboard.</p>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setTab('tests')}
            style={{
              padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600',
              border: tab === 'tests' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: tab === 'tests' ? '#0f172a' : '#fff',
              color: tab === 'tests' ? '#fff' : '#475569', cursor: 'pointer'
            }}
          >
            Exams & Assignments
          </button>
          <button
            onClick={() => setTab('miniquizzes')}
            style={{
              padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600',
              border: tab === 'miniquizzes' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: tab === 'miniquizzes' ? '#0f172a' : '#fff',
              color: tab === 'miniquizzes' ? '#fff' : '#475569', cursor: 'pointer'
            }}
          >
            Mini Quizzes
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
          Loading...
        </div>
      ) : currentList.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
          No {tab === 'tests' ? 'tests' : 'quizzes'} found. Create one first!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          {/* Test list */}
          <div className="stat-card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start', maxHeight: '700px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Test
            </div>
            <div style={{ overflowY: 'auto' }}>
              {currentList.map(t => (
                <div key={t.id} onClick={() => setSelectedTestId(t.id!)}
                  style={{ padding: '0.875rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc', background: selectedTestId === t.id ? '#f0f4ff' : 'transparent', borderLeft: selectedTestId === t.id ? '3px solid #6366f1' : '3px solid transparent', transition: 'all 0.15s' }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem' }}>{t.displayName}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                    <span>{t.displayQuestions || '?'} Qs</span>
                    <span>•</span>
                    <span style={{ color: t.isPublic ? '#22c55e' : '#f59e0b', fontWeight: '600' }}>{t.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students access */}
          <div className="stat-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{test?.displayName}</h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                  {studentsWithAccess} / {students.length} students have access
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={grantAll} disabled={saving || isVisibleToAll} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.72rem', cursor: isVisibleToAll ? 'not-allowed' : 'pointer', opacity: isVisibleToAll ? 0.5 : 1 }}>
                  <Check size={11} /> Grant All
                </button>
                <button onClick={revokeAll} disabled={saving || (!isVisibleToAll && visibleList.length === 0)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer' }}>
                  <X size={11} /> Revoke All
                </button>
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', margin: 0 }} />
              </div>
            </div>

            <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
              {filteredStudents.map(s => {
                const hasAccess = isVisibleToAll || visibleList.includes(s.uid);
                return (
                  <div key={s.uid} style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: hasAccess ? 'linear-gradient(135deg, #22c55e, #10b981)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hasAccess ? '#fff' : '#94a3b8', fontWeight: '800', fontSize: '0.75rem' }}>
                        {(s.displayName || s.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>{s.displayName || 'Unnamed Student'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{s.email}</div>
                      </div>
                    </div>
                    <button onClick={() => toggleAccess(s)} disabled={saving} style={{
                      padding: '0.375rem 1rem', border: 'none', borderRadius: '1rem', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer',
                      background: hasAccess ? '#dcfce7' : '#f1f5f9', color: hasAccess ? '#16a34a' : '#94a3b8',
                      transition: 'all 0.15s',
                    }}>
                      {hasAccess ? '✓ Has Access' : 'Grant Access'}
                    </button>
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                 <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                   No students found.
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
