"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTeacherClasses, getUsersByIds, getAllResults, AppUser, TestResult, createAssignment, addNotification, AdminTestBank, ClassModel, ensureTeacherCode } from '@/lib/db';
import { filterStudentsBySubject, filterItemsBySubject, filterResultsBySubject } from '@/lib/subject-filter';
import { Users, PenTool, TrendingUp, Clock, Flame, ArrowUpRight, RefreshCw, Loader2, Phone, MessageCircle, Send, X, Database, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';

export default function TeacherDashboardPage() {
  const { appUser } = useAuth();
  const [students, setStudents] = useState<AppUser[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [teacherTests, setTeacherTests] = useState<AdminTestBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ student: AppUser } | null>(null);
  const [assignTestId, setAssignTestId] = useState('');
  const [assignDue, setAssignDue] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [teacherCode, setTeacherCode] = useState('');

  const load = async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      const { getTestBanks } = await import('@/lib/db');
      
      const [teacherCls, res, banks, tCode] = await Promise.all([
        getTeacherClasses(appUser.uid),
        getAllResults(200),
        getTestBanks(),
        ensureTeacherCode(appUser.uid),
      ]);
      setTeacherCode(tCode);
      
      // Extract all unique student IDs from all classes
      const studentIds = new Set<string>();
      teacherCls.forEach(c => c.studentIds?.forEach(id => studentIds.add(id)));
      
      const studs = await getUsersByIds(Array.from(studentIds));
      
      // ── Subject Isolation: only show students matching this teacher's subject ──
      const filteredStuds = filterStudentsBySubject(studs as any, appUser.teacherSubject);
      
      // ── Subject Isolation: only show tests for this teacher's subject ──
      const filteredBanks = banks
        .filter(b => b.createdBy === appUser.uid || b.teacherId === appUser.uid)
        .filter(b => filterItemsBySubject([b] as any, appUser.teacherSubject).length > 0);

      setClasses(teacherCls);
      setStudents(filteredStuds as any);
      setResults(res);
      setTeacherTests(filteredBanks);
    } catch { /* Firestore not seeded yet */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [appUser]);

  const getStudentResults = (uid: string) => filterResultsBySubject(results.filter(r => r.userId === uid), appUser?.teacherSubject);

  const myStudentsResults = filterResultsBySubject(results.filter(r => students.some(s => s.uid === r.userId)), appUser?.teacherSubject);
  const totalTests = myStudentsResults.length;
  
  const allStudentsWithTests = students.filter(s => getStudentResults(s.uid).length > 0);
  const avgScore = allStudentsWithTests.length > 0
    ? allStudentsWithTests.reduce((sum, s) => {
      const r = getStudentResults(s.uid);
      return sum + (r.reduce((a, b) => a + b.percentage, 0) / r.length);
    }, 0) / allStudentsWithTests.length
    : 0;

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Teacher Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome back, <strong>{appUser?.displayName}</strong> — {appUser?.teacherSubject || 'All'} teacher · showing only your subject's data.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {teacherCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Teacher Code:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>{teacherCode}</span>
            </div>
          )}
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', color: '#475569', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
            <RefreshCw size={13} />
          </button>
          <Link href="/teacher/create-test" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#22c55e', color: '#fff', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
            <PenTool size={15} /> + Create Test
          </Link>
        </div>
      </div>

      {/* Class Management Banner */}
      <div style={{ marginBottom: '1.25rem', padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.125rem' }}>Class Management</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>You have {classes.length} active class{classes.length === 1 ? '' : 'es'}. Manage classes and share join codes with students.</div>
          </div>
        </div>
        <Link href="/teacher/classes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#38bdf8', color: '#0f172a', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
          Manage Classes <ChevronRight size={16} />
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'My Students', value: loading ? '—' : students.length, icon: Users, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
          { label: 'Tests Taken', value: loading ? '—' : totalTests, icon: PenTool, gradient: 'linear-gradient(135deg, #22c55e, #10b981)' },
          { label: 'Avg Score', value: loading ? '—' : `${avgScore.toFixed(0)}%`, icon: TrendingUp, gradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
          { label: 'Active Students', value: loading ? '—' : allStudentsWithTests.length, icon: Flame, gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '1.25rem', borderRadius: '1rem', background: s.gradient, color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.85 }}>{s.label}</span>
              <s.icon size={18} style={{ opacity: 0.8 }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', lineHeight: '1' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* My Tests */}
        <div className="stat-card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} /> My Custom Tests
            </h3>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
              </div>
            ) : teacherTests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <PenTool size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                <p style={{ fontWeight: '600' }}>No tests generated yet</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Use the AI Generator to create your first test.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    {['Test Name', 'Questions', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teacherTests.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>{t.name}</td>
                      <td style={{ padding: '1rem', color: '#475569', fontSize: '0.875rem', fontWeight: '500' }}>{t.questions} Qs</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: t.isPublic ? '#dcfce7' : '#f1f5f9', color: t.isPublic ? '#166534' : '#475569', borderRadius: '1rem', fontWeight: '700' }}>
                          {t.isPublic ? 'PUBLIC' : 'CLASS ONLY'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Student Roster */}
        <div className="stat-card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} /> Enrolled Students
            </h3>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                <p style={{ fontWeight: '600' }}>No students enrolled yet</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: '1.5' }}>Go to Class Management to create a class and get a join code.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    {['Student', 'Avg Score', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const myResults = getStudentResults(s.uid);
                    const avg = myResults.length > 0 ? myResults.reduce((a, b) => a + b.percentage, 0) / myResults.length : 0;
                    return (
                      <tr key={s.uid} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>
                              {(s.displayName || s.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>{s.displayName || '—'}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{myResults.length} tests taken</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', minWidth: '100px' }}>
                          {myResults.length > 0 ? (
                            <div>
                              <div className="progress-bar" style={{ height: '5px', marginBottom: '0.25rem' }}>
                                <div className="progress-fill" style={{ width: `${avg}%`, background: avg >= 80 ? '#22c55e' : avg >= 60 ? '#f59e0b' : '#ef4444' }} />
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{avg.toFixed(1)}%</span>
                            </div>
                          ) : <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>—</span>}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => setAssignModal({ student: s })}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: '600', color: '#fff', background: '#6366f1', border: 'none', borderRadius: '0.375rem', padding: '0.375rem 0.625rem', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                          >
                            <Send size={10} /> Assign
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Assign Test Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', width: '400px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>Assign Test</h3>
              <button onClick={() => { setAssignModal(null); setAssignSuccess(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>Assigning to: <strong>{assignModal.student.displayName}</strong></p>

            {assignSuccess ? (
              <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '0.5rem', color: '#166534', fontWeight: '700', textAlign: 'center', fontSize: '0.875rem' }}>
                ✅ {assignSuccess}
              </div>
            ) : (
              <>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Test</label>
                <select
                  value={assignTestId}
                  onChange={e => setAssignTestId(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', boxSizing: 'border-box' }}
                >
                  <option value="" disabled>Select a test...</option>
                  {teacherTests.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.375rem' }}>Due Date</label>
                <input
                  type="date"
                  value={assignDue}
                  onChange={e => setAssignDue(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', boxSizing: 'border-box' }}
                />

                <button
                  disabled={assigning || !assignDue || !assignTestId}
                  onClick={async () => {
                    if (!appUser || !assignDue || !assignTestId) return;
                    setAssigning(true);
                    try {
                      const dueTimestamp = Timestamp.fromDate(new Date(assignDue));
                      const selectedTest = teacherTests.find(t => t.id === assignTestId);
                      await createAssignment({
                        testId: assignTestId,
                        testName: selectedTest ? selectedTest.name : 'Custom Test',
                        subject: selectedTest?.subject,
                        studentId: assignModal.student.uid,
                        teacherId: appUser.uid,
                        teacherName: appUser.displayName,
                        dueDate: dueTimestamp,
                        status: 'pending',
                      });
                      await addNotification({
                        userId: assignModal.student.uid,
                        type: 'test_assigned',
                        title: '📋 New Test Assigned',
                        message: `${appUser.displayName} assigned you ${selectedTest ? selectedTest.name : 'a new test'} — due ${new Date(assignDue).toLocaleDateString()}`,
                        isRead: false,
                        link: '/dashboard/assignments',
                      });
                      setAssignSuccess(`Test assigned to ${assignModal.student.displayName}!`);
                    } catch(e) { console.error(e); }
                    setAssigning(false);
                  }}
                  style={{ width: '100%', padding: '0.75rem', background: assigning || !assignDue || !assignTestId ? '#e2e8f0' : '#6366f1', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', cursor: assigning || !assignDue || !assignTestId ? 'not-allowed' : 'pointer' }}
                >
                  {assigning ? 'Assigning...' : 'Assign Test'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
