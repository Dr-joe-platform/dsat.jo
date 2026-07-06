'use client';

import React, { useMemo } from 'react';
import { FocusDataPoint } from './FocusTracker';
import { Brain, EyeOff, Activity, Clock } from 'lucide-react';

interface FocusReportProps {
  data: FocusDataPoint[];
}

export function FocusReport({ data }: FocusReportProps) {
  const analytics = useMemo(() => {
    if (data.length === 0) return null;

    const totalPoints = data.length;
    const focusedPoints = data.filter(d => d.focused).length;
    const distractedPoints = totalPoints - focusedPoints;
    const focusPercentage = Math.round((focusedPoints / totalPoints) * 100);

    const stressPoints = data.filter(d => ['angry', 'fear', 'sad', 'disgusted'].includes(d.emotion)).length;
    const stressPercentage = Math.round((stressPoints / totalPoints) * 100);

    // Calculate longest distraction streak
    let currentStreak = 0;
    let maxDistractionStreak = 0;
    data.forEach(d => {
      if (!d.focused) {
        currentStreak++;
        maxDistractionStreak = Math.max(maxDistractionStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    // Since points are every 2s, streak * 2 = seconds
    const maxDistractionSeconds = maxDistractionStreak * 2;

    return {
      focusPercentage,
      distractedPoints,
      stressPercentage,
      maxDistractionSeconds
    };
  }, [data]);

  if (!analytics) {
    return (
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
        No focus data recorded during this session.
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: '1.5rem', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Brain color="#6366f1" /> AI Focus & Emotion Report
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
            <Activity size={18} /> Focus Score
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#4f46e5' }}>{analytics.focusPercentage}%</div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>Overall attention to screen</div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
            <EyeOff size={18} /> Max Distraction
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#f59e0b' }}>{analytics.maxDistractionSeconds}s</div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>Longest time looking away</div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
            <Activity size={18} /> Stress Level
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#f43f5e' }}>{analytics.stressPercentage}%</div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>Time showing frustration/stress</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Focus Timeline</h4>
        <div style={{ height: '2rem', width: '100%', background: '#f1f5f9', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex' }}>
          {data.map((point, i) => (
            <div 
              key={i}
              title={`Time: ${new Date(point.timestamp).toLocaleTimeString()}\nEmotion: ${point.emotion}`}
              style={{
                height: '100%',
                flex: 1,
                backgroundColor: point.focused ? '#4f46e5' : '#f59e0b',
                opacity: point.focused ? 1 : 0.8
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          <span>Start</span>
          <span>End</span>
        </div>
      </div>
      
      <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1.5rem', background: '#eff6ff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #dbeafe' }}>
        <strong>Tip:</strong> Maintaining a focus score above 85% strongly correlates with higher actual SAT performance. The timeline above shows blue when you were focused, and orange when you looked away.
      </p>
    </div>
  );
}
