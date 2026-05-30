"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingDown, AlertTriangle, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getUserResults, TestResult, computeWeakPoints } from '@/lib/db';

export default function WeakPointsPage() {
  const { appUser } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser?.uid) return;
    getUserResults(appUser.uid).then(r => {
      setResults(r);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [appUser?.uid]);

  // Use our new accurate Weak Points calculator
  const weakPoints = computeWeakPoints(results).filter(wp => wp.pct <= 70); // Show topics with <= 70% accuracy

  // Analyze overall areas from results
  const totalCorrect = results.reduce((s, r) => s + r.correctCount, 0);
  const totalWrong = results.reduce((s, r) => s + r.wrongCount, 0);
  const totalQs = totalCorrect + totalWrong;
  const overallAccuracy = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

  // Compute per-test performance trend
  const trend = results.map(r => ({
    name: r.testName,
    date: r.completedAt?.toDate?.()?.toLocaleDateString?.() ?? '',
    score: r.totalScore,
    accuracy: r.correctCount + r.wrongCount > 0 ? Math.round(r.correctCount / (r.correctCount + r.wrongCount) * 100) : 0,
  }));

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Weak Points</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Specific topics and skills that need improvement based on your performance</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#ef4444', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : results.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <TrendingDown size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#475569', fontWeight: '700', marginBottom: '0.5rem' }}>No data yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Complete at least one test to see your weak points.
          </p>
          <Link href="/dashboard/practice" style={{ padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
            Take a Practice Test
          </Link>
        </div>
      ) : weakPoints.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#475569', fontWeight: '700', marginBottom: '0.5rem' }}>You're doing great!</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            You don't have any significant weak points yet. Keep up the good work!
          </p>
          <Link href="/dashboard/practice" style={{ padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
            Keep Practicing
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {weakPoints.map((wp, i) => (
              <div key={i} className="stat-card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>{wp.topic}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{wp.correct} correct out of {wp.total} attempts</p>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: wp.pct <= 40 ? '#ef4444' : '#f59e0b' }}>
                    {wp.pct}%
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                  <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginRight: '1.5rem' }}>
                    <div style={{ height: '100%', width: `${wp.pct}%`, background: wp.pct <= 40 ? '#ef4444' : '#f59e0b', borderRadius: '4px' }} />
                  </div>
                  <Link 
                    href={`/test/question_bank?mode=blitz&topic=${encodeURIComponent(wp.topic)}&limit=10&time=15&title=Practice+${encodeURIComponent(wp.topic)}`}
                    style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Practice Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>Historical Performance</h2>
          
          {/* Overall stat */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Overall Accuracy', value: `${overallAccuracy}%`, color: overallAccuracy >= 80 ? '#22c55e' : overallAccuracy >= 60 ? '#f59e0b' : '#ef4444', bg: overallAccuracy >= 80 ? '#dcfce7' : overallAccuracy >= 60 ? '#fef3c7' : '#fee2e2' },
              { label: 'Total Correct', value: `${totalCorrect}`, color: '#22c55e', bg: '#dcfce7' },
              { label: 'Total Wrong', value: `${totalWrong}`, color: '#ef4444', bg: '#fee2e2' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '1.25rem', background: s.bg, borderRadius: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{s.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Accuracy bar */}
          <div className="stat-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Overall Performance</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${overallAccuracy}%`, background: overallAccuracy >= 80 ? '#22c55e' : overallAccuracy >= 60 ? '#f59e0b' : '#ef4444', borderRadius: '6px', transition: 'width 1s ease' }} />
              </div>
              <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem', flexShrink: 0 }}>{overallAccuracy}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.375rem' }}>
              <span>0%</span>
              <span style={{ color: '#ef4444' }}>60% (Pass)</span>
              <span style={{ color: '#22c55e' }}>80% (Good)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Score progression table */}
          <div className="stat-card">
            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>All Test Performance</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Test', 'Date', 'Score', 'Accuracy', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trend.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#0f172a' }}>{t.name}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{t.date}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '700', color: '#6366f1' }}>{t.score}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '700',
                        background: t.accuracy >= 80 ? '#dcfce7' : t.accuracy >= 60 ? '#fef3c7' : '#fee2e2',
                        color: t.accuracy >= 80 ? '#16a34a' : t.accuracy >= 60 ? '#d97706' : '#dc2626',
                      }}>{t.accuracy}%</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: t.accuracy >= 80 ? '#16a34a' : t.accuracy >= 60 ? '#d97706' : '#dc2626' }}>
                        {t.accuracy >= 80 ? '✓ Good' : t.accuracy >= 60 ? '⚠ Review' : '✗ Retry'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
