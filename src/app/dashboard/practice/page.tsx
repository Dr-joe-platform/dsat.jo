"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Clock, BarChart2, Target, BookOpen, Lock, ChevronRight, Calendar, TrendingUp, Zap } from 'lucide-react';
import { useResults } from '@/lib/hooks/useResults';
import { useAuth } from '@/lib/auth-context';
import { getTestBanks, AdminTestBank } from '@/lib/db';

const COMPLETE_TESTS = [
  { id: 'FULL_TEST_1', num: 1, name: 'DSAT Complete Mock 1', duration: '134 min', durationMins: 134 },
  { id: 'FULL_TEST_2', num: 2, name: 'DSAT Complete Mock 2', duration: '134 min', durationMins: 134 },
  { id: 'FULL_TEST_3', num: 3, name: 'DSAT Complete Mock 3', duration: '134 min', durationMins: 134 },
  { id: 'FULL_TEST_4', num: 4, name: 'DSAT Complete Mock 4', duration: '134 min', durationMins: 134 },
];

const MATH_TESTS = [
  { id: 'MATH_TEST_1', num: 1, name: 'Math Mock Test 1', duration: '70 min', durationMins: 70 },
  { id: 'MATH_TEST_2', num: 2, name: 'Math Mock Test 2', duration: '70 min', durationMins: 70 },
  { id: 'MATH_TEST_3', num: 3, name: 'Math Mock Test 3', duration: '70 min', durationMins: 70 },
  { id: 'MATH_TEST_4', num: 4, name: 'Math Mock Test 4', duration: '70 min', durationMins: 70 },
];

const ENGLISH_TESTS = [
  { id: 'ENG_TEST_1', num: 1, name: 'English Mock Test 1', duration: '64 min', durationMins: 64 },
  { id: 'ENG_TEST_2', num: 2, name: 'English Mock Test 2', duration: '64 min', durationMins: 64 },
  { id: 'ENG_TEST_3', num: 3, name: 'English Mock Test 3', duration: '64 min', durationMins: 64 },
  { id: 'ENG_TEST_4', num: 4, name: 'English Mock Test 4', duration: '64 min', durationMins: 64 },
];

const ALL_SYSTEM_TESTS = [...COMPLETE_TESTS, ...MATH_TESTS, ...ENGLISH_TESTS];

function ScorePredictor({ results }: { results: { totalScore: number; subject: string }[] }) {
  if (results.length < 1) return null;
  
  const mathScores = results.filter(r => r.subject === 'math').map(r => r.totalScore);
  const rwScores = results.filter(r => r.subject === 'reading_writing').map(r => r.totalScore);
  
  const predict = (scores: number[]) => {
    if (scores.length === 0) return 400; // Fallback base score
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const trend = scores.length >= 2 ? scores[0] - scores[1] : 0;
    return Math.min(800, Math.max(200, avg + Math.round(trend * 0.6) + 10));
  };

  const predMath = predict(mathScores);
  const predRW = predict(rwScores);
  
  const predicted = predMath + predRW;
  
  const trend = (mathScores.length >= 2 ? mathScores[0] - mathScores[1] : 0) + (rwScores.length >= 2 ? rwScores[0] - rwScores[1] : 0);
  
  const lo = Math.max(400, predicted - 40);
  const hi = Math.min(1600, predicted + 40);
  const pct = Math.round(((predicted - 400) / 1200) * 100);

  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '1rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '100%', background: 'radial-gradient(circle at 80% 50%, rgba(139,92,246,0.3), transparent 70%)' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Zap size={15} color="#fbbf24" fill="#fbbf24" />
            <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', color: '#a5b4fc', textTransform: 'uppercase' }}>AI Score Predictor</span>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Your Next Test Prediction</h3>
          <p style={{ fontSize: '0.78rem', color: '#a5b4fc' }}>Based on your performance trend and {results.length} test{results.length > 1 ? 's' : ''} taken</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: '#a5b4fc', fontWeight: '700', marginBottom: '0.25rem' }}>PREDICTED RANGE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-1px' }}>{lo}–{hi}</div>
        </div>
      </div>
      {/* Gauge bar */}
      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #a78bfa, #f59e0b)', borderRadius: '4px', transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#a5b4fc' }}>
          <span>400</span>
          <span style={{ color: '#fbbf24', fontWeight: '700' }}>~{predicted} predicted</span>
          <span>1600</span>
        </div>
      </div>
      {trend > 0 && <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#86efac', fontWeight: '700' }}>📈 +{trend} pts improvement trend — keep going!</div>}
      {trend < 0 && <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#fca5a5', fontWeight: '700' }}>📉 Slight dip — practice more to reverse the trend.</div>}
    </div>
  );
}

export default function PracticePage() {
  const { results, loading: resultsLoading, bestMathScore, bestRWScore, avgScore, totalTests } = useResults();
  const { appUser, loading: authLoading } = useAuth();
  
  const [dbTests, setDbTests] = useState<AdminTestBank[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (!appUser?.uid) return;
    getTestBanks(appUser.uid, appUser.role).then(async tests => {
      const { filterItemsBySubject } = await import('@/lib/subject-filter');
      
      const filteredByVisibility = tests.filter(t => {
        if (!t.visibleTo || t.visibleTo === 'all') return true;
        if (Array.isArray(t.visibleTo) && t.visibleTo.includes(appUser.uid)) return true;
        return false;
      });

      setDbTests(filterItemsBySubject(filteredByVisibility, appUser.subject));
      setDbLoading(false);
    }).catch(() => setDbLoading(false));
  }, [appUser?.uid, appUser?.role, appUser?.subject]);

  const loading = resultsLoading || authLoading || dbLoading;

  // Determine which tests are completed from real results
  const completedTestIds = new Set(results.map(r => r.testId));

  const getTestResult = (testId: string) => results.find(r => r.testId === testId);

  let totalMinutes = 0;
  results.forEach(r => {
    const test = ALL_SYSTEM_TESTS.find(t => t.id === r.testId);
    if (test) {
      totalMinutes += test.durationMins;
    } else {
      const dbTest = dbTests.find(t => t.id === r.testId);
      if (dbTest) {
        totalMinutes += dbTest.questions ? Math.round(dbTest.questions * 1.5) : 70;
      } else {
        totalMinutes += 70;
      }
    }
  });

  const timeStr = totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60 > 0 ? (totalMinutes % 60) + 'm' : ''}`.trim() : `${totalMinutes}m`;

  const renderTestCategory = (title: string, tests: typeof COMPLETE_TESTS) => {
    return (
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tests.map((test, idx) => {
            const result = getTestResult(test.id);
            const isCompleted = completedTestIds.has(test.id);
            const isPendingUser = appUser?.status === 'pending';
            const isTrialTest = isPendingUser && (test.id === 'FULL_TEST_1' || test.id === 'MATH_TEST_1' || test.id === 'ENG_TEST_1');
            
            // To unlock sequentially for normal users, we count how many of THIS category are completed
            const categoryCompletedCount = tests.filter(t => completedTestIds.has(t.id)).length;
            const isAvailable = isPendingUser ? isTrialTest : idx <= Math.max(0, categoryCompletedCount);
            const isLocked = !isAvailable && !isCompleted;

            return (
              <div key={test.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', opacity: isLocked ? 0.6 : 1 }}>
                {/* Number */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '0.625rem',
                  background: isCompleted ? '#0f172a' : isAvailable ? '#f1f5f9' : '#f8fafc',
                  color: isCompleted ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '0.875rem', flexShrink: 0,
                }}>
                  {isLocked ? <Lock size={16} /> : test.num}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: isLocked ? '#94a3b8' : '#0f172a', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {test.name}
                    {isLocked && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: '700', background: '#fef3c7', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>PRO</span>}
                    {isTrialTest && !isCompleted && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: '700', background: '#dcfce7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>TRIAL</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {test.duration}</span>
                    {result && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={11} /> {result.completedAt?.toDate?.()?.toLocaleDateString?.() ?? ''}</span>}
                    {isCompleted && !result && <span style={{ color: '#22c55e', fontWeight: '600' }}>✓ Completed</span>}
                  </div>
                </div>

                {/* Score (completed) */}
                {result && (
                  <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.25rem' }}>SCORE</div>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.125rem', letterSpacing: '-0.5px' }}>{result.totalScore}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.25rem' }}>ACC</div>
                      <div style={{ fontWeight: '700', color: '#6366f1', fontSize: '1rem' }}>{result.percentage}%</div>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div style={{ flexShrink: 0 }}>
                  {isCompleted ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href="/dashboard/results" style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}>
                        <BarChart2 size={13} /> Review Test
                      </Link>
                      <Link href={`/test/${test.id}`} style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: 'none', background: '#f1f5f9', color: '#0f172a', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}>
                        Retake
                      </Link>
                    </div>
                  ) : isAvailable ? (
                    <Link href={`/test/${test.id}`} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', color: '#fff', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                      <Play size={13} fill="white" /> Start Test
                    </Link>
                  ) : (
                    <Link href="/dashboard/upgrade" style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#fff', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Practice Tests</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Full-length adaptive Digital SAT practice tests — Bluebook accurate</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Tests Completed', value: loading ? '...' : `${totalTests}`, icon: BookOpen, color: '#0f172a' },
          { label: 'Best Math/RW', value: loading ? '...' : (bestMathScore || bestRWScore) ? `${bestMathScore || '-'} / ${bestRWScore || '-'}` : '—', icon: Target, color: '#6366f1' },
          { label: 'Avg. Score', value: loading ? '...' : avgScore ? `${avgScore}` : '—', icon: BarChart2, color: '#0891b2' },
          { label: 'Time Practiced', value: loading ? '...' : totalTests > 0 ? timeStr : '0h', icon: Clock, color: '#7c3aed' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '0.5rem', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={14} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', lineHeight: '1' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* AI Score Predictor — NEW FEATURE */}
      {!loading && results.length > 0 && <ScorePredictor results={results} />}

      {/* Score trend */}
      {!loading && results.length > 1 && (
        <div className="stat-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Score Progression</h3>
            <Link href="/dashboard/results" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
              Full analytics <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '80px' }}>
            {[...results].reverse().slice(0, 6).map((r, i, arr) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#0f172a' }}>{r.totalScore}</span>
                <div style={{
                  width: '100%',
                  height: `${Math.max(((r.totalScore - 400) / 1200) * 80, 8)}px`,
                  background: i === arr.length - 1 ? '#6366f1' : '#e2e8f0',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease',
                  minHeight: '8px',
                }} />
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{r.testName?.replace('DSAT Mock Test ', 'T')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tests lists */}
      <div>
        {renderTestCategory('Complete Mock Tests', COMPLETE_TESTS)}
        {(!appUser?.subject || appUser?.subject === 'math' || appUser?.subject === 'both') && renderTestCategory('Math Mock Tests', MATH_TESTS)}
        {(!appUser?.subject || appUser?.subject === 'english' || appUser?.subject === 'reading_writing' || appUser?.subject === 'both') && renderTestCategory('English Mock Tests', ENGLISH_TESTS)}
        
        {/* Dynamically Loaded Teacher/Admin Tests */}
        {dbTests.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Assignments & Custom Tests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dbTests.map((test, idx) => {
                const result = getTestResult(test.id!);
                const isCompleted = completedTestIds.has(test.id!);
                
                return (
                  <div key={test.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '0.625rem',
                      background: isCompleted ? '#0f172a' : '#f1f5f9',
                      color: isCompleted ? '#fff' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '0.875rem', flexShrink: 0,
                    }}>
                      <BookOpen size={16} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {test.name}
                        {test.subject === 'Full' && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: '700', background: '#e0e7ff', color: '#4338ca', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>FULL EXAM</span>}
                        {!test.isPublic && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: '700', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>CLASS ASSIGNMENT</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {test.questions} Qs</span>
                        {result && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={11} /> {result.completedAt?.toDate?.()?.toLocaleDateString?.() ?? ''}</span>}
                        {isCompleted && !result && <span style={{ color: '#22c55e', fontWeight: '600' }}>✓ Completed</span>}
                      </div>
                    </div>

                    {/* Score */}
                    {result && (
                      <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.25rem' }}>SCORE</div>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.125rem', letterSpacing: '-0.5px' }}>{result.totalScore}</div>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div style={{ flexShrink: 0 }}>
                      {isCompleted ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link href="/dashboard/results" style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}>
                            <BarChart2 size={13} /> Review Test
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/test/${test.id}`} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', color: '#fff', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                          <Play size={13} fill="white" /> Start
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
