"use client";

import React, { useMemo } from 'react';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import { TestResult } from '@/lib/db';

interface Props {
  results: TestResult[];
}

export default function ScorePredictor({ results }: Props) {
  const prediction = useMemo(() => {
    // Need at least 3 tests for a somewhat meaningful linear regression
    if (results.length < 3) return null;

    // Sort chronologically (oldest to newest)
    const sorted = [...results].sort((a, b) => {
      const timeA = a.completedAt?.toMillis?.() || 0;
      const timeB = b.completedAt?.toMillis?.() || 0;
      return timeA - timeB;
    });

    const xValues = sorted.map((_, i) => i + 1);
    const yValues = sorted.map(r => r.totalScore);

    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next score (n + 1)
    let nextPredicted = slope * (n + 1) + intercept;
    
    // Clamp to valid SAT scores (400 - 1600)
    nextPredicted = Math.max(400, Math.min(1600, nextPredicted));
    
    // Round to nearest 10
    nextPredicted = Math.round(nextPredicted / 10) * 10;

    return {
      score: nextPredicted,
      slope: slope
    };
  }, [results]);

  if (!prediction) {
    return (
      <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={16} color="#6366f1" /> Score Predictor
        </h3>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
          <AlertCircle size={28} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Complete at least 3 practice tests to unlock your AI Score Prediction.
          </p>
        </div>
      </div>
    );
  }

  const isImproving = prediction.slope > 0;

  return (
    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Target size={16} color="#6366f1" /> AI Score Predictor
      </h3>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Projected Next Score
        </div>
        <div style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', lineHeight: '1', letterSpacing: '-1px', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          {prediction.score}
          <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '600' }}>/ 1600</span>
        </div>
        
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: isImproving ? '#f0fdf4' : '#fef2f2', color: isImproving ? '#16a34a' : '#ef4444', fontSize: '0.85rem', fontWeight: '600' }}>
          <TrendingUp size={16} style={{ transform: isImproving ? 'none' : 'scaleY(-1)' }} />
          {isImproving ? 'You are on an upward trend!' : 'Your scores are plateauing. Keep reviewing!'}
        </div>
      </div>
    </div>
  );
}
