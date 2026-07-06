"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart2, TrendingUp, Target, Clock, CheckCircle, XCircle,
  ChevronRight, BookOpen, Flame, ArrowLeft, Trophy, Sparkles, X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getUserResults, TestResult, computeWeakPoints, getTestById } from '@/lib/db';
import { explainQuestionAction } from '@/app/actions/ai-tutor';
import { ALL_TEST_QUESTIONS } from '@/lib/questions-data';
import Latex from 'react-latex-next';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';

export default function ResultsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TestResult | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [currentAiQuestion, setCurrentAiQuestion] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !appUser) { router.push('/login'); return; }
    if (!appUser?.uid) return;
    getUserResults(appUser.uid).then(r => {
      setResults(r);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [appUser?.uid, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleAskAI = async (questionId: string, testId: string) => {
    setAiLoading(true);
    setAiExplanation(null);
    setShowAiModal(true);
    setCurrentAiQuestion(questionId);

    try {
      let qData: any = null;
      
      if (ALL_TEST_QUESTIONS[testId as keyof typeof ALL_TEST_QUESTIONS]) {
        const test = ALL_TEST_QUESTIONS[testId as keyof typeof ALL_TEST_QUESTIONS];
        for (const mod of Object.values(test)) {
          if (Array.isArray(mod)) {
            const found = mod.find(q => q.id === questionId);
            if (found) { qData = found; break; }
          }
        }
      } else {
        const doc = await getTestById(testId);
        if (doc && (doc as any).content) {
          const parsed = JSON.parse((doc as any).content);
          qData = parsed.find((q: any) => q.id === questionId);
        }
      }

      if (!qData) throw new Error("Could not find the question text to explain. Please review it manually.");

      const groqKey = localStorage.getItem('groq_api_key') || undefined;
      const optionsText = qData.options ? qData.options.map((o:any, i:number) => `${String.fromCharCode(65+i)}) ${o}`).join('\n') : "Student Produced Response";

      const res = await explainQuestionAction(qData.question || qData.text || "", optionsText, groqKey || "");
      if (!res.success) throw new Error(res.error);

      setAiExplanation(res.data);
    } catch (err: any) {
      setAiExplanation("Error: " + err.message);
    }
    setAiLoading(false);
  };

  const totalTests = results.length;
  const bestScore = totalTests > 0 ? Math.max(...results.map(r => r.totalScore)) : 0;
  const avgScore = totalTests > 0 ? Math.round((results.reduce((s, r) => s + r.totalScore, 0) / totalTests) / 10) * 10 : 0;
  const totalCorrect = results.reduce((s, r) => s + r.correctCount, 0);
  const totalQs = results.reduce((s, r) => s + r.correctCount + r.wrongCount, 0);
  const accuracy = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
  
  const weakPoints = computeWeakPoints(results).filter(wp => wp.pct <= 70); // Show topics with <= 70% accuracy

  if (selected) {
    const pct = Math.round((selected.correctCount / (selected.correctCount + selected.wrongCount)) * 100);
    return (
      <div style={{ maxWidth: '900px' }}>
        <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', fontWeight: '700', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
          <ArrowLeft size={16} /> Back to Results
        </button>

        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>{selected.testName}</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Completed: {selected.completedAt?.toDate?.()?.toLocaleDateString?.('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) ?? ''}
        </p>

        {/* Score breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Score', value: `${selected.totalScore}`, sub: `/ ${selected.subject === 'full' ? '1600' : '800'}`, color: '#6366f1' },
            { label: 'Correct', value: `${selected.correctCount}`, sub: `/ ${selected.correctCount + selected.wrongCount}`, color: '#22c55e' },
            { label: 'Wrong', value: `${selected.wrongCount}`, sub: 'questions', color: '#ef4444' },
            { label: 'Accuracy', value: `${pct}%`, sub: 'overall', color: '#0891b2' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{s.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.125rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Score bar */}
        <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Score Visualization</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>{selected.subject === 'full' ? '400' : '200'}</span>
            <div style={{ flex: 1, height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((selected.totalScore - (selected.subject === 'full' ? 400 : 200)) / (selected.subject === 'full' ? 1200 : 600) * 100)}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '6px', transition: 'width 1s ease' }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>{selected.subject === 'full' ? '1600' : '800'}</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#6366f1', flexShrink: 0 }}>{selected.totalScore}</span>
          </div>
        </div>

        {/* Wrong answers */}
        {(selected.wrongQuestionIds || []).length > 0 && (
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' }}>Questions to Review ({(selected.wrongQuestionIds || []).length})</h3>
              <Link href="/dashboard/wrong-answers" style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>
                Practice Wrong Answers →
              </Link>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(selected.wrongQuestionIds || []).slice(0, 20).map(id => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', background: '#fee2e2', borderRadius: '0.375rem', overflow: 'hidden' }}>
                  <span style={{ padding: '0.25rem 0.625rem', color: '#dc2626', fontSize: '0.75rem', fontWeight: '600', borderRight: '1px solid #fca5a5' }}>{id}</span>
                  <button 
                    onClick={() => handleAskAI(id, selected.testId)} 
                    style={{ padding: '0.25rem 0.5rem', background: '#fef2f2', color: '#b91c1c', fontSize: '0.7rem', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    title="Ask AI Tutor about this question"
                  >
                    <Sparkles size={12} /> Ask AI
                  </button>
                </div>
              ))}
              {(selected.wrongQuestionIds || []).length > 20 && (
                <span style={{ padding: '0.25rem 0.625rem', background: '#f1f5f9', color: '#64748b', borderRadius: '0.375rem', fontSize: '0.75rem' }}>+{(selected.wrongQuestionIds || []).length - 20} more</span>
              )}
            </div>
          </div>
        )}

        {/* AI Tutor Modal */}
        {showAiModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} color="#6366f1" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a' }}>AI Tutor Explanation</h3>
                </div>
                <button onClick={() => setShowAiModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '1rem' }}>Question ID: {currentAiQuestion}</div>
                {aiLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>AI Tutor is analyzing your question...</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#334155' }}>
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p style={{ marginBottom: '1rem' }} {...props} />,
                        h3: ({node, ...props}) => <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '1.5rem 0 0.5rem' }} {...props} />,
                        ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                        li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                        code: ({node, ...props}) => <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.85em', color: '#ef4444' }} {...props} />,
                      }}
                    >
                      {aiExplanation || ''}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Analytics</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {totalTests === 0 ? 'Complete a test to see your analytics.' : `Your performance across ${totalTests} completed test${totalTests > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Tests Completed', value: `${totalTests}`, icon: BookOpen, color: '#0f172a' },
          { label: 'Best Score', value: bestScore || '—', icon: Trophy, color: '#6366f1' },
          { label: 'Average Score', value: avgScore || '—', icon: BarChart2, color: '#0891b2' },
          { label: 'Overall Accuracy', value: `${accuracy}%`, icon: Target, color: '#7c3aed' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '0.5rem', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={13} color={s.color} />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Score progression chart */}
      {results.length > 1 && (
        <div className="stat-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem' }}>Score Progression</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '100px' }}>
            {[...results].reverse().map((r, i, arr) => {
              const base = r.subject === 'full' ? 400 : 200;
              const range = r.subject === 'full' ? 1200 : 600;
              const heightPct = Math.max(((r.totalScore - base) / range), 0.05); // min 5%
              
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#0f172a' }}>{r.totalScore}</span>
                  <div style={{
                    width: '100%',
                    height: `${heightPct * 80}px`,
                    background: i === arr.length - 1 ? 'linear-gradient(180deg, #6366f1, #8b5cf6)' : '#e2e8f0',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '8px',
                    transition: 'all 0.5s ease'
                  }} />
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textOverflow: 'ellipsis' }} title={r.completedAt?.toDate?.()?.toLocaleDateString?.('en', { month: 'short', day: 'numeric' }) ?? `Test ${i+1}`}>
                    {r.subject === 'math' ? 'M' : r.subject === 'reading_writing' ? 'R&W' : 'Full'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weak Points section */}
      {weakPoints.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="#ef4444" /> Weak Points
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {weakPoints.slice(0, 6).map((wp, i) => (
              <div key={i} className="stat-card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>{wp.topic}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{wp.correct} / {wp.total} correct</p>
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '800', color: wp.pct <= 40 ? '#ef4444' : '#f59e0b' }}>
                    {wp.pct}%
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginRight: '1rem' }}>
                    <div style={{ height: '100%', width: `${wp.pct}%`, background: wp.pct <= 40 ? '#ef4444' : '#f59e0b', borderRadius: '3px' }} />
                  </div>
                  <Link 
                    href={`/test/question_bank?mode=blitz&topic=${encodeURIComponent(wp.topic)}&limit=10&time=15&title=Practice+${encodeURIComponent(wp.topic)}`}
                    style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.375rem 0.75rem', background: '#0f172a', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none' }}
                  >
                    Practice Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tests list */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>All Tests</h3>
        {totalTests === 0 ? (
          <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <BarChart2 size={36} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>No test results yet.</p>
            <Link href="/dashboard/practice" style={{ padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' }}>
              Take a Practice Test
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map((r, i) => {
              const pct = Math.round((r.correctCount / (r.correctCount + r.wrongCount)) * 100);
              return (
                <div
                  key={i}
                  onClick={() => setSelected(r)}
                  className="stat-card"
                  style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.125rem 1.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}
                >
                  {/* Score circle */}
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: pct >= 80 ? '#dcfce7' : pct >= 60 ? '#fef3c7' : '#fee2e2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626' }}>{r.totalScore}</span>
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem' }}>{r.testName}</div>
                      <span style={{ 
                        fontSize: '0.6rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase',
                        background: r.subject === 'math' ? '#dbeafe' : r.subject === 'reading_writing' ? '#f3e8ff' : '#dcfce7',
                        color: r.subject === 'math' ? '#1d4ed8' : r.subject === 'reading_writing' ? '#7c3aed' : '#166534'
                      }}>
                        {r.subject === 'math' ? 'Math' : r.subject === 'reading_writing' ? 'R&W' : 'Full Test'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={11} color="#22c55e" /> {r.correctCount} correct</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={11} color="#ef4444" /> {r.wrongCount} wrong</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {r.completedAt?.toDate?.()?.toLocaleDateString?.() ?? ''}</span>
                    </div>
                  </div>
                  {/* Accuracy bar */}
                  <div style={{ width: '80px', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem', textAlign: 'right' }}>{pct}%</div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }} />
                    </div>
                  </div>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
