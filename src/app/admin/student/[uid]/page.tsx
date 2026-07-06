"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserResults, AppUser, TestResult, getPublicTests, FirestoreTest } from '@/lib/db';
import { ArrowLeft, User, Phone, Mail, Award, BookOpen, AlertTriangle, CheckCircle, BarChart2, Star } from 'lucide-react';
import Link from 'next/link';

export default function AdminStudentProfile() {
  const { uid } = useParams() as { uid: string };
  const router = useRouter();

  const [student, setStudent] = useState<AppUser | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [allTests, setAllTests] = useState<FirestoreTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const docRef = doc(db, 'users', uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const sData = { uid: snap.id, ...snap.data() } as AppUser;
          setStudent(sData);

          // Get their results
          const r = await getUserResults(uid);
          setResults(r);

          // Get public tests
          const t = await getPublicTests();
          setAllTests(t);

          // Get their teachers
          let teacherCodes: string[] = [];
          if (sData.teacherCodes && sData.teacherCodes.length > 0) {
            teacherCodes = sData.teacherCodes;
          } else if (sData.teacherCode) {
            teacherCodes = [sData.teacherCode];
          } else if ((sData as any).referredBy) {
            teacherCodes = [(sData as any).referredBy];
          }

          if (teacherCodes.length > 0) {
            const tQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
            const tSnap = await getDocs(tQuery);
            const allTeachers = tSnap.docs.map(d => ({ uid: d.id, ...d.data() } as AppUser));
            const assigned = allTeachers.filter(t => t.teacherCode && teacherCodes.includes(t.teacherCode));
            setTeachers(assigned);
          }
        }
      } catch (err) {
        console.error("Error loading student profile", err);
      } finally {
        setLoading(false);
      }
    }
    if (uid) loadData();
  }, [uid]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading student profile...</div>;
  }

  if (!student) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Student not found.</div>;
  }

  // Calculations
  const solvedTestIds = new Set(results.map(r => r.testId));
  const unsolvedTests = allTests.filter(t => !solvedTestIds.has(t.id));

  // Averages
  const mathScores = results.map(r => r.totalMathScore).filter(s => s !== undefined);
  const englishScores = results.map(r => r.totalEnglishScore).filter(s => s !== undefined);
  const totalScores = results.map(r => r.totalScore).filter(s => s !== undefined);

  const avgMath = mathScores.length ? Math.round((mathScores.reduce((a, b) => a + b, 0) / mathScores.length) / 10) * 10 : 0;
  const avgEnglish = englishScores.length ? Math.round((englishScores.reduce((a, b) => a + b, 0) / englishScores.length) / 10) * 10 : 0;
  const avgTotal = totalScores.length ? Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) / 10) * 10 : 0;

  // Predict next score (simple trend or just average for now)
  const rawPredictedScore = totalScores.length > 0 ? (totalScores[totalScores.length - 1] + avgTotal) / 2 : 0;
  const predictedScore = Math.round(rawPredictedScore / 10) * 10;

  return (
    <div style={{ maxWidth: '1200px', paddingBottom: '3rem' }}>
      <button onClick={() => router.push('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Users
      </button>

      {/* Header Profile Card */}
      <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '2.5rem', overflow: 'hidden', flexShrink: 0 }}>
          {student.photoURL ? (
            <img src={student.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (student.displayName || 'S')[0].toUpperCase()
          )}
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>{student.displayName || 'Unknown Student'}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}><Mail size={16} /> {student.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
              <Phone size={16} /> Student: 
              {student.phone ? <a href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontWeight: 'bold', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{student.phone}</a> : 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
              <Phone size={16} /> Parent: 
              {student.parentPhone ? <a href={`https://wa.me/${student.parentPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontWeight: 'bold', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{student.parentPhone}</a> : 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}><User size={16} /> Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: student.status === 'approved' ? '#10b981' : '#f59e0b' }}>{student.status}</span></div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {teachers.map(t => (
              <span key={t.uid} style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '700' }}>
                Assigned to: {t.displayName} ({t.teacherCode})
              </span>
            ))}
            {teachers.length === 0 && <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '700' }}>No Teachers Assigned</span>}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', opacity: 0.9 }}><CheckCircle size={18} /> Tests Completed</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{results.length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(59,130,246,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', opacity: 0.9 }}><BarChart2 size={18} /> Avg Total Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{avgTotal}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(139,92,246,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', opacity: 0.9 }}><Star size={18} /> Predicted Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{predictedScore}</div>
        </div>
      </div>

      {/* Tests Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Solved Tests */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="#10b981" /> Solved Tests ({results.length})
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {results.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No tests solved yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Test Name</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Score</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0)).map((r, idx) => {
                    const dateObj = r.completedAt?.toDate ? r.completedAt.toDate() : r.completedAt?.seconds ? new Date(r.completedAt.seconds * 1000) : new Date(r.completedAt as any);
                    return (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#0f172a', fontSize: '0.85rem' }}>{r.testName || r.testId}</td>
                        <td style={{ padding: '1rem', fontWeight: '800', color: '#3b82f6', fontSize: '0.85rem' }}>{r.totalScore}</td>
                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>{dateObj.toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Unsolved Tests */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#f59e0b" /> Unsolved Tests ({unsolvedTests.length})
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {unsolvedTests.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>All available tests have been solved!</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Test Name</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {unsolvedTests.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#0f172a', fontSize: '0.85rem' }}>{t.title}</td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>{t.category || 'General'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
