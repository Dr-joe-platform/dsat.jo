"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Search, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getTestBanks, getTeacherStudents, updateUser, AppUser, AdminTestBank } from '@/lib/db';

export default function TestAccessPage() {
  const { appUser } = useAuth();
  const [tests, setTests] = useState<AdminTestBank[]>([]);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (appUser) loadData();
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [myTests, subjectStudents] = await Promise.all([
        getTestBanks(appUser?.uid, appUser?.role, appUser?.teacherSubject),
        getTeacherStudents(appUser!.uid, appUser?.teacherSubject),
      ]);
      setTests(myTests);
      if (myTests.length > 0 && !selectedTest) {
        setSelectedTest(myTests[0].id!);
      }

      setStudents(subjectStudents);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(s =>
    (s.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAccess = async (student: AppUser) => {
    if (!selectedTest) return;
    setSaving(true);
    try {
      const allowed = student.allowedTests || [];
      const hasAccess = allowed.includes(selectedTest);
      
      const newAllowed = hasAccess 
        ? allowed.filter(id => id !== selectedTest)
        : [...allowed, selectedTest];
      
      await updateUser(student.uid, { allowedTests: newAllowed });
      setStudents(prev => prev.map(s => s.uid === student.uid ? { ...s, allowedTests: newAllowed } : s));
    } catch (err) {
      console.error(err);
      alert('Error updating access');
    }
    setSaving(false);
  };

  const grantAll = async () => {
    if (!selectedTest || !confirm("Grant access to all students?")) return;
    setSaving(true);
    try {
      for (const s of students) {
        const allowed = s.allowedTests || [];
        if (!allowed.includes(selectedTest)) {
          await updateUser(s.uid, { allowedTests: [...allowed, selectedTest] });
        }
      }
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error granting all');
    }
    setSaving(false);
  };

  const revokeAll = async () => {
    if (!selectedTest || !confirm("Revoke access from all students?")) return;
    setSaving(true);
    try {
      for (const s of students) {
        const allowed = s.allowedTests || [];
        if (allowed.includes(selectedTest)) {
          await updateUser(s.uid, { allowedTests: allowed.filter(id => id !== selectedTest) });
        }
      }
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error revoking all');
    }
    setSaving(false);
  };

  const test = tests.find(t => t.id === selectedTest);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Lock size={22} color="#6366f1" /> Test Access Control
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Control which students can access each test.</p>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
          Loading...
        </div>
      ) : tests.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
          No tests found for your subject. Create a test first!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          {/* Test list */}
          <div className="stat-card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Test
            </div>
            {tests.map(t => (
              <div key={t.id} onClick={() => setSelectedTest(t.id!)}
                style={{ padding: '0.875rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc', background: selectedTest === t.id ? '#f0f4ff' : 'transparent', borderLeft: selectedTest === t.id ? '3px solid #6366f1' : '3px solid transparent', transition: 'all 0.15s' }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem' }}>{t.name}</div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                  <span>{t.questions} Qs</span>
                  <span>•</span>
                  <span style={{ color: t.isPublic ? '#22c55e' : '#f59e0b', fontWeight: '600' }}>{t.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Students access */}
          <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{test?.name}</h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                  {students.filter(s => (s.allowedTests || []).includes(selectedTest!)).length} / {students.length} students have access
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={grantAll} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer' }}>
                  <Check size={11} /> Grant All
                </button>
                <button onClick={revokeAll} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer' }}>
                  <X size={11} /> Revoke All
                </button>
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filteredStudents.map(s => {
                const hasAccess = (s.allowedTests || []).includes(selectedTest!);
                return (
                  <div key={s.uid} style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: hasAccess ? 'linear-gradient(135deg, #22c55e, #10b981)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hasAccess ? '#fff' : '#94a3b8', fontWeight: '800', fontSize: '0.75rem' }}>
                        {(s.displayName || s.email)[0].toUpperCase()}
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
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
