"use client";

import React, { useEffect, useState } from 'react';
import { Flame, Share2, Trophy, Target, Clock, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getUserStats } from '@/lib/db';

export default function StreakPage() {
  const { appUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appUser?.uid) {
      getUserStats(appUser.uid).then(data => {
        setStats(data || { streak: 0, longestStreak: 0 });
        setLoading(false);
      });
    }
  }, [appUser]);

  const currentStreak = stats?.streak || 0;
  const bestStreak = stats?.longestStreak || 0;
  
  // Calculate time until midnight
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate heatmap data (last 30 days)
  const heatmapData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    // Mocking intensity based on current streak
    const isActive = (29 - i) < currentStreak;
    const intensity = isActive ? Math.floor(Math.random() * 3) + 1 : 0; // 0-3
    return { date, intensity };
  });

  const getHeatmapColor = (intensity: number) => {
    switch(intensity) {
      case 3: return '#16a34a'; // intense green
      case 2: return '#4ade80'; // mid green
      case 1: return '#bbf7d0'; // light green
      default: return '#f1f5f9'; // empty
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '70px', height: '70px', backgroundColor: '#0f172a', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Flame size={32} color={currentStreak > 0 ? "#f59e0b" : "#fff"} fill={currentStreak > 0 ? "#f59e0b" : "none"} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Your Daily Streak</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '0.75rem' }}>
              {currentStreak > 0 ? "Great job! You've been active." : "Time to start a new streak!"}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
              <Star size={14} /> Consistency builds mastery
            </div>
          </div>
        </div>
        <button style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Share2 size={16} /> Share streak
        </button>
      </div>

      {/* Tabs & Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.5rem 1.25rem', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>Overview</div>
          <div style={{ padding: '0.5rem 1.25rem', fontWeight: '600', fontSize: '0.875rem', color: '#64748b', cursor: 'pointer' }}>Calendar</div>
          <div style={{ padding: '0.5rem 1.25rem', fontWeight: '600', fontSize: '0.875rem', color: '#64748b', cursor: 'pointer' }}>Achievements</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
          <Clock size={16} /> Time left today: <span style={{ color: '#0f172a', fontWeight: '700' }}>{timeLeft}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Current Streak */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#0f172a', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Flame size={24} color={currentStreak > 0 ? "#f59e0b" : "#fff"} fill={currentStreak > 0 ? "#f59e0b" : "none"} />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>Current Streak</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Days in a row</div>
            </div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', lineHeight: '1' }}>{currentStreak}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
            {currentStreak > 0 ? (
              <>💫 Active today! <span style={{ color: '#22c55e' }}>✔</span></>
            ) : (
              <>Complete a lesson to start! 🚀</>
            )}
          </div>
        </div>

        {/* Best Streak */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#0f172a', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Trophy size={24} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>Best Streak</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Personal record</div>
            </div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', lineHeight: '1' }}>{bestStreak}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
            {currentStreak === bestStreak && bestStreak > 0 ? "🎉 New record!" : "Keep pushing!"}
          </div>
        </div>

        {/* Today's Goal */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#0f172a', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Target size={24} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>Today's Goal</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Stay active</div>
            </div>
          </div>
          {currentStreak > 0 ? (
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ backgroundColor: '#22c55e', color: '#ffffff', width: '28px', height: '28px', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✔</div> Complete
            </div>
          ) : (
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ backgroundColor: '#e2e8f0', color: '#94a3b8', width: '28px', height: '28px', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div> Pending
            </div>
          )}
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {currentStreak > 0 ? "Great job today!" : "1 practice session left"}
          </div>
        </div>
      </div>

      {/* NEW FEATURE: Daily Performance Heatmap */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.125rem' }}>Performance Heatmap</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Your study intensity over the last 30 days</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            Less 
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(0) }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(1) }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(2) }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(3) }} />
            More
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {heatmapData.map((day, i) => (
            <div 
              key={i}
              title={`${day.date.toLocaleDateString()}: ${day.intensity === 0 ? 'No activity' : 'Active'}`}
              style={{
                width: '18px', 
                height: '18px', 
                borderRadius: '4px', 
                background: getHeatmapColor(day.intensity),
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
