'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth-context';
import { getUserResults, TestResult } from '../db';

export interface ComputedStats {
  results: TestResult[];
  loading: boolean;
  latestScore: number | null;
  bestScore: number | null;
  bestMathScore: number | null;
  bestRWScore: number | null;
  avgScore: number | null;
  totalTests: number;
  latestRW: number | null;
  latestMath: number | null;
  improvement: number | null; // latest - previous
}

export function useResults(): ComputedStats {
  const { appUser } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser?.uid) { setLoading(false); return; }
    getUserResults(appUser.uid).then(async r => {
      const { filterResultsBySubject } = await import('../subject-filter');
      const filtered = filterResultsBySubject(r, appUser.subject);
      setResults(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [appUser?.uid]);

  const totalTests = results.length;
  const latestScore = results[0]?.totalScore ?? null;
  const bestScore = results.length > 0 ? Math.max(...results.map(r => r.totalScore)) : null;
  
  const mathResults = results.filter(r => r.subject === 'math');
  const bestMathScore = mathResults.length > 0 ? Math.max(...mathResults.map(r => r.totalScore)) : null;

  const rwResults = results.filter(r => r.subject === 'reading_writing');
  const bestRWScore = rwResults.length > 0 ? Math.max(...rwResults.map(r => r.totalScore)) : null;

  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length) : null;
  const latestRW = rwResults[0]?.totalScore ?? null;
  const latestMath = mathResults[0]?.totalScore ?? null;
  const improvement = results.length >= 2 ? (results[0].totalScore - results[1].totalScore) : null;

  return { results, loading, latestScore, bestScore, bestMathScore, bestRWScore, avgScore, totalTests, latestRW, latestMath, improvement };
}
