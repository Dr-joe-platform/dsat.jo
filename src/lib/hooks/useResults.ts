'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth-context';
import { getUserResults, TestResult } from '../db';
import { filterResultsBySubject, normalizeSubject } from '../subject-filter';

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
      const filtered = filterResultsBySubject(r, appUser.subject);
      setResults(filtered);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [appUser?.uid]);

  const totalTests = results.length;
  const latestScore = results[0]?.totalScore ?? null;
  const bestScore = results.length > 0 ? Math.max(...results.map(r => r.totalScore)) : null;
  
  const mathResults = results.filter(r => normalizeSubject(r.subject) === 'math' || normalizeSubject(r.subject) === 'both');
  const bestMathScore = mathResults.length > 0 
    ? Math.max(...mathResults.map(r => normalizeSubject(r.subject) === 'both' && r.totalMathScore !== undefined ? r.totalMathScore : r.totalScore)) 
    : null;

  const rwResults = results.filter(r => normalizeSubject(r.subject) === 'english' || normalizeSubject(r.subject) === 'both');
  const bestRWScore = rwResults.length > 0 
    ? Math.max(...rwResults.map(r => normalizeSubject(r.subject) === 'both' && r.totalEnglishScore !== undefined ? r.totalEnglishScore : r.totalScore)) 
    : null;

  const rawAvg = results.length > 0 ? results.reduce((s, r) => s + r.totalScore, 0) / results.length : null;
  const avgScore = rawAvg !== null ? Math.round(rawAvg / 10) * 10 : null;
  const latestRW = rwResults[0] ? (normalizeSubject(rwResults[0].subject) === 'both' && rwResults[0].totalEnglishScore !== undefined ? rwResults[0].totalEnglishScore : rwResults[0].totalScore) : null;
  const latestMath = mathResults[0] ? (normalizeSubject(mathResults[0].subject) === 'both' && mathResults[0].totalMathScore !== undefined ? mathResults[0].totalMathScore : mathResults[0].totalScore) : null;
  const improvement = results.length >= 2 ? (results[0].totalScore - results[1].totalScore) : null;

  return { results, loading, latestScore, bestScore, bestMathScore, bestRWScore, avgScore, totalTests, latestRW, latestMath, improvement };
}
