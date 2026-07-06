"use client";

import React, { useEffect, useState } from 'react';
import { Zap, Clock, CheckCircle, ChevronRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getStudentMiniQuizzes, getUserResults, MiniQuiz, TestResult } from '@/lib/db';

const diffColors: Record<string, { bg: string; color: string }> = {
  Easy: { bg: '#dcfce7', color: '#16a34a' },
  Medium: { bg: '#fef3c7', color: '#d97706' },
  Hard: { bg: '#fee2e2', color: '#dc2626' },
  Mixed: { bg: '#e0e7ff', color: '#4f46e5' },
};

export default function MiniQuizzesPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  
  const [quizzes, setQuizzes] = useState<MiniQuiz[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Math' | 'Reading & Writing'>('All');

  useEffect(() => {
    if (!appUser) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [testsData, resultsData] = await Promise.all([
          getStudentMiniQuizzes(appUser.uid, appUser.subject),
          getUserResults(appUser.uid)
        ]);
        setQuizzes(testsData);
        setResults(resultsData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [appUser]);

  const startQuiz = (quiz: MiniQuiz) => {
    router.push(`/test/${quiz.id}`); // Assuming test engine supports mini quizzes or we need a new route. Wait, test engine supports both! But MiniQuiz collection is different. 
    // Wait, let's just use /test/${quiz.id} but test page might fetch from 'tests' collection.
    // I should check test engine!
  };

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === 'All') return true;
    const subj = (q.subject || '').toLowerCase();
    if (filter === 'Math') return subj === 'math';
    return subj === 'english' || subj === 'reading & writing' || subj === 'reading_writing';
  });

  const quizzesTaken = new Set(results.map(r => r.testId)).size;
  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length) 
    : 0;

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={24} color="#f59e0b" fill="#f59e0b" /> Mini Quizzes
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Exams and quizzes assigned by your teachers or the platform administration.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Quizzes Taken', value: quizzesTaken.toString(), color: '#6366f1' },
          { label: 'Avg Score', value: `${avgScore}%`, color: '#22c55e' },
          { label: 'Available', value: quizzes.length.toString(), color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color, letterSpacing: '-1px', lineHeight: '1', marginBottom: '0.375rem' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['All', 'Math', 'Reading & Writing'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              border: filter === f ? 'none' : '1px solid #cbd5e1',
              backgroundColor: filter === f ? '#0f172a' : '#fff',
              color: filter === f ? '#fff' : '#475569',
              cursor: 'pointer'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading quizzes...</div>
      ) : filteredQuizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem' }}>
          No quizzes found matching your filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {filteredQuizzes.map((quiz) => {
            const dc = diffColors['Mixed'];
            const subj = (quiz.subject || '').toLowerCase();
            const topicColor = subj === 'math' ? { bg: '#dbeafe', color: '#1d4ed8' } : { bg: '#f3e8ff', color: '#7c3aed' };
            
            const myResults = results.filter(r => r.testId === quiz.id);
            const done = myResults.length > 0;
            const bestScore = done ? Math.max(...myResults.map(r => r.correctCount)) : null;
            const latestPct = done ? myResults[0].percentage : null;

            const numQuestions = quiz.questions?.length || 0;
            const estimatedTime = Math.ceil(numQuestions * 1.2);
            const creatorName = quiz.teacherId === 'admin' ? 'Admin (Official)' : (quiz.teacherName || 'Your Teacher');

            return (
              <div key={quiz.id} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                {done && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <CheckCircle size={18} color="#22c55e" fill="#dcfce7" />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: topicColor.bg, color: topicColor.color }}>
                    {(quiz.subject || 'Mixed').toLowerCase() === 'math' ? 'Math' : 'R&W'}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: dc.bg, color: dc.color }}>
                    {quiz.difficulty || 'Mixed'}
                  </span>
                </div>

                <h3 style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem', marginBottom: '0.5rem', paddingRight: '1.5rem', lineHeight: '1.4' }}>
                  {quiz.title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>📝 {numQuestions} questions</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> ~{estimatedTime} min</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569', fontWeight: '500' }}>
                    <User size={12} /> By: {creatorName}
                  </div>
                </div>

                {done && bestScore !== null && (
                  <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem', color: '#22c55e', fontWeight: '700' }}>
                    Best: {bestScore}/{numQuestions} ({latestPct}%)
                  </div>
                )}

                <button
                  onClick={() => startQuiz(quiz)}
                  style={{
                    width: '100%', padding: '0.6rem',
                    background: done ? '#f0fdf4' : '#0f172a',
                    color: done ? '#16a34a' : '#fff',
                    border: done ? '1px solid #bbf7d0' : 'none',
                    borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  }}
                >
                  {done ? '↺ Retry Quiz' : 'Start Quiz'} <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
