"use client";

import React from 'react';
import { Zap, Clock, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const quizzes = [
  { id: 1, title: 'Words in Context — Quick Fire', questions: 10, duration: '8 min', difficulty: 'Medium', topic: 'R&W', status: 'available', bestScore: null },
  { id: 2, title: 'Algebra Basics', questions: 8, duration: '6 min', difficulty: 'Easy', topic: 'Math', status: 'completed', bestScore: 7 },
  { id: 3, title: 'Evidence-Based Questions', questions: 12, duration: '10 min', difficulty: 'Hard', topic: 'R&W', status: 'available', bestScore: null },
  { id: 4, title: 'Geometry Challenge', questions: 10, duration: '8 min', difficulty: 'Hard', topic: 'Math', status: 'available', bestScore: null },
  { id: 5, title: 'Grammar & Punctuation', questions: 15, duration: '12 min', difficulty: 'Medium', topic: 'R&W', status: 'completed', bestScore: 12 },
  { id: 6, title: 'Advanced Functions', questions: 8, duration: '7 min', difficulty: 'Hard', topic: 'Math', status: 'locked', bestScore: null },
];

const diffColors: Record<string, { bg: string; color: string }> = {
  Easy: { bg: '#dcfce7', color: '#16a34a' },
  Medium: { bg: '#fef3c7', color: '#d97706' },
  Hard: { bg: '#fee2e2', color: '#dc2626' },
};

import { useAuth } from '@/lib/auth-context';

export default function MiniQuizzesPage() {
  const router = useRouter();
  const { appUser } = useAuth();

  const startQuiz = (quiz: any) => {
    if (quiz.status === 'locked') return;
    const timeNum = parseInt(quiz.duration);
    const params = new URLSearchParams({
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      limit: quiz.questions.toString(),
      time: timeNum.toString(),
      title: quiz.title
    });
    router.push(`/test/question_bank?${params.toString()}`);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={24} color="#f59e0b" fill="#f59e0b" /> Mini-Quizzes
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Short, focused practice sessions — 5 to 15 questions each.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Quizzes Taken', value: '2', color: '#6366f1' },
          { label: 'Avg Score', value: '86%', color: '#22c55e' },
          { label: 'Available', value: '4', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color, letterSpacing: '-1px', lineHeight: '1', marginBottom: '0.375rem' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quiz grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {quizzes.filter(q => {
          if (!appUser?.subject || appUser.subject === 'both') return true;
          if (appUser.subject === 'math') return q.topic === 'Math';
          return q.topic === 'R&W';
        }).map((quiz) => {
          const dc = diffColors[quiz.difficulty];
          const locked = quiz.status === 'locked';
          const done = quiz.status === 'completed';
          const topicColor = quiz.topic === 'Math' ? { bg: '#dbeafe', color: '#1d4ed8' } : { bg: '#f3e8ff', color: '#7c3aed' };

          return (
            <div key={quiz.id} className="stat-card" style={{ opacity: locked ? 0.6 : 1, position: 'relative', overflow: 'hidden' }}>
              {done && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <CheckCircle size={18} color="#22c55e" fill="#dcfce7" />
                </div>
              )}
              {locked && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <Lock size={16} color="#94a3b8" />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: topicColor.bg, color: topicColor.color }}>{quiz.topic}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: dc.bg, color: dc.color }}>{quiz.difficulty}</span>
              </div>

              <h3 style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.5rem', paddingRight: '1.5rem', lineHeight: '1.4' }}>{quiz.title}</h3>

              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>📝 {quiz.questions} questions</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {quiz.duration}</span>
              </div>

              {done && quiz.bestScore !== null && (
                <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem', color: '#22c55e', fontWeight: '700' }}>
                  Best: {quiz.bestScore}/{quiz.questions} ({Math.round((quiz.bestScore / quiz.questions) * 100)}%)
                </div>
              )}

              <button
                disabled={locked}
                onClick={() => startQuiz(quiz)}
                style={{
                  width: '100%', padding: '0.5rem',
                  background: locked ? '#f1f5f9' : done ? '#f0fdf4' : '#0f172a',
                  color: locked ? '#94a3b8' : done ? '#16a34a' : '#fff',
                  border: done ? '1px solid #bbf7d0' : 'none',
                  borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                }}
              >
                {locked ? '🔒 Locked' : done ? '↺ Retry Quiz' : 'Start Quiz'} {!locked && <ChevronRight size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
