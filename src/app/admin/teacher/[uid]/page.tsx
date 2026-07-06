"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  AppUser, TestResult, getAllUsers, getResultsForUsers,
  getTestBanks, AdminTestBank,
  getMiniQuizzes, MiniQuiz,
  getFlashcardSets, FlashcardSet,
  getEbooks, Ebook,
  getSharedResources, SharedResource,
  getTeacherClasses, ClassModel,
  getFeatureControls, FeatureControls
} from '@/lib/db';
import { ArrowLeft, User, Phone, Mail, Award, BookOpen, BarChart2, Users, Target, Shield, Settings, FileText, FileQuestion, BookMarked, Layers } from 'lucide-react';
import Link from 'next/link';

export default function AdminTeacherProfile() {
  const { uid } = useParams() as { uid: string };
  const router = useRouter();

  const [teacher, setTeacher] = useState<AppUser | null>(null);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  
  // New States
  const [testBanks, setTestBanks] = useState<AdminTestBank[]>([]);
  const [quizzes, setQuizzes] = useState<MiniQuiz[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [featureControls, setFeatureControls] = useState<Record<string, FeatureControls>>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const docRef = doc(db, 'users', uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const tData = { uid: snap.id, ...snap.data() } as AppUser;
          setTeacher(tData);

          if (tData.teacherCode) {
            // Find all students for this teacher
            const allUsers = await getAllUsers();
            const normalizedTeacherCode = tData.teacherCode.toLowerCase().trim();
            const myStudents = allUsers.filter(u => {
              if (u.role !== 'student') return false;
              const uTeacherCode = u.teacherCode?.toLowerCase().trim();
              const uReferredBy = (u as any).referredBy?.toLowerCase().trim();
              const uTeacherCodes = u.teacherCodes?.map(c => c.toLowerCase().trim()) || [];
              
              return uTeacherCodes.includes(normalizedTeacherCode) ||
                     uTeacherCode === normalizedTeacherCode ||
                     uReferredBy === normalizedTeacherCode;
            });
            setStudents(myStudents);

            // Get all results for these students
            if (myStudents.length > 0) {
              const r = await getResultsForUsers(myStudents.map(s => s.uid));
              setResults(r);
            }

            // Fetch extra teacher content
            const tb = await getTestBanks(uid, 'teacher');
            setTestBanks(tb);

            const mq = await getMiniQuizzes(uid);
            setQuizzes(mq);

            const fc = await getFlashcardSets(uid);
            setFlashcards(fc);

            const eb = await getEbooks(uid, 'teacher');
            setEbooks(eb);

            const sr = await getSharedResources(uid);
            setResources(sr);

            const cls = await getTeacherClasses(uid);
            setClasses(cls);

            const fcs: Record<string, FeatureControls> = {};
            for (const c of cls) {
              const f = await getFeatureControls(uid, c.id);
              if (f) fcs[c.id] = f;
            }
            setFeatureControls(fcs);
          }
        }
      } catch (err) {
        console.error("Error loading teacher profile", err);
      } finally {
        setLoading(false);
      }
    }
    if (uid) loadData();
  }, [uid]);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading teacher profile...</div>;
  }

  if (!teacher) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Teacher not found.</div>;
  }

  // Calculations
  const teacherTestIds = new Set([...testBanks.map(t => t.id), ...quizzes.map(q => q.id)]);
  const teacherResults = results.filter(r => teacherTestIds.has(r.testId));

  const totalScores = teacherResults.map(r => r.totalScore).filter(s => s !== undefined);
  const avgTotal = totalScores.length ? Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) / 10) * 10 : 0;
  const totalTestsSolved = teacherResults.length;

  return (
    <div style={{ maxWidth: '1200px', paddingBottom: '3rem' }}>
      <button onClick={() => router.push('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Users
      </button>

      {/* Header Profile Card */}
      <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '2.5rem', overflow: 'hidden', flexShrink: 0 }}>
          {teacher.photoURL ? (
            <img src={teacher.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (teacher.displayName || 'T')[0].toUpperCase()
          )}
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>{teacher.displayName || 'Unknown Teacher'}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}><Mail size={16} /> {teacher.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
              <Phone size={16} />
              {teacher.phone ? <a href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontWeight: 'bold', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{teacher.phone}</a> : 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}><BookOpen size={16} /> Subject: {teacher.teacherSubject || 'Both'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}><Shield size={16} /> Code: <span style={{ fontWeight: '800', background: '#f1f5f9', padding: '0.1rem 0.5rem', borderRadius: '0.5rem', color: '#6d28d9' }}>{teacher.teacherCode || 'N/A'}</span></div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <a href={`https://wa.me/${(teacher.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: '#25d366', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} /> WhatsApp
            </a>
            <a href={`mailto:${teacher.email}`} style={{ textDecoration: 'none', background: '#0f172a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} /> Email
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', opacity: 0.9 }}><Users size={18} /> Total Enrolled Students</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{students.length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(59,130,246,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', opacity: 0.9 }}><Target size={18} /> Avg Student Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{avgTotal}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(245,158,11,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', opacity: 0.9 }}><BookOpen size={18} /> Total Tests Solved by Students</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{totalTestsSolved}</div>
        </div>
      </div>

      {/* Students Table */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="#6366f1" /> Assigned Students
        </div>
        <div style={{ overflowX: 'auto' }}>
          {students.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No students assigned to this teacher.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>Phone</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>Tests Solved</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const sResults = teacherResults.filter(r => r.userId === s.uid);
                  const sScores = sResults.map(r => r.totalScore).filter(score => score !== undefined);
                  const sAvg = sScores.length ? Math.round((sScores.reduce((a, b) => a + b, 0) / sScores.length) / 10) * 10 : 0;
                  
                  return (
                    <tr key={s.uid} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem', fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>
                        <Link href={`/admin/student/${s.uid}`} style={{ color: '#0f172a', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                          {s.displayName || 'Unknown'}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>{s.email}</td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>{s.phone || 'N/A'}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '800', color: '#10b981', fontSize: '0.85rem' }}>{sResults.length}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '800', color: '#3b82f6', fontSize: '0.85rem' }}>{sAvg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Content Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Uploaded Content Summary */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#f59e0b" /> Uploaded Content
          </div>
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '0.75rem' }}>
              <div style={{ background: '#3b82f6', color: '#fff', padding: '0.5rem', borderRadius: '0.5rem' }}><FileText size={18} /></div>
              <div><div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>{testBanks.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Tests</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '0.75rem' }}>
              <div style={{ background: '#10b981', color: '#fff', padding: '0.5rem', borderRadius: '0.5rem' }}><FileQuestion size={18} /></div>
              <div><div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>{quizzes.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Mini Quizzes</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '0.75rem' }}>
              <div style={{ background: '#8b5cf6', color: '#fff', padding: '0.5rem', borderRadius: '0.5rem' }}><BookMarked size={18} /></div>
              <div><div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>{flashcards.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Flashcards</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '0.75rem' }}>
              <div style={{ background: '#f59e0b', color: '#fff', padding: '0.5rem', borderRadius: '0.5rem' }}><BookOpen size={18} /></div>
              <div><div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>{ebooks.length + resources.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Books & Notes</div></div>
            </div>
          </div>

          {/* Details Lists */}
          <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {testBanks.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tests</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {testBanks.map(t => <div key={t.id} style={{ fontSize: '0.85rem', color: '#0f172a', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}><span>{t.name}</span> <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>{t.subject}</span></div>)}
                </div>
              </div>
            )}
            {quizzes.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mini Quizzes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {quizzes.map(q => <div key={q.id} style={{ fontSize: '0.85rem', color: '#0f172a', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}><span>{q.title}</span> <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>{q.difficulty || 'General'}</span></div>)}
                </div>
              </div>
            )}
            {flashcards.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flashcards</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {flashcards.map(f => <div key={f.id} style={{ fontSize: '0.85rem', color: '#0f172a', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}><span>{f.title}</span> <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>{f.cards?.length || 0} cards</span></div>)}
                </div>
              </div>
            )}
            {(ebooks.length > 0 || resources.length > 0) && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Books & Notes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {ebooks.map(e => <div key={e.id} style={{ fontSize: '0.85rem', color: '#0f172a', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>📚 {e.title}</div>)}
                  {resources.map(r => <div key={r.id} style={{ fontSize: '0.85rem', color: '#0f172a', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>📄 {r.title}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Class Settings */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} color="#64748b" /> Classes & Settings
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {classes.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No classes created.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
                {classes.map(c => {
                  const fc = featureControls[c.id];
                  return (
                    <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>{c.name}</div>
                      {fc ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: fc.aiTutor ? '#dcfce7' : '#fee2e2', color: fc.aiTutor ? '#166534' : '#991b1b', fontWeight: '600' }}>AI Tutor: {fc.aiTutor ? 'ON' : 'OFF'}</span>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: fc.leaderboard ? '#dcfce7' : '#fee2e2', color: fc.leaderboard ? '#166534' : '#991b1b', fontWeight: '600' }}>Leaderboard: {fc.leaderboard ? 'ON' : 'OFF'}</span>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: fc.miniQuizzes ? '#dcfce7' : '#fee2e2', color: fc.miniQuizzes ? '#166534' : '#991b1b', fontWeight: '600' }}>Quizzes: {fc.miniQuizzes ? 'ON' : 'OFF'}</span>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: fc.flashcards ? '#dcfce7' : '#fee2e2', color: fc.flashcards ? '#166534' : '#991b1b', fontWeight: '600' }}>Flashcards: {fc.flashcards ? 'ON' : 'OFF'}</span>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: fc.strictExamMode ? '#dcfce7' : '#fee2e2', color: fc.strictExamMode ? '#166534' : '#991b1b', fontWeight: '600' }}>Strict Exam: {fc.strictExamMode ? 'ON' : 'OFF'}</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No settings configured.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
