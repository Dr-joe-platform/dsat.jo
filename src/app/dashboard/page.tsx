"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, TrendingUp, Sparkles, Calendar, Target,
  ArrowRight, BarChart2, PenTool, Clock, Flame,
  CheckCircle, ChevronRight, Zap, Trophy, AlertTriangle,
  BookMarked, Bot, Shield, Star, Award
} from 'lucide-react';
import { filterItemsBySubject } from '@/lib/subject-filter';
import { useAuth } from '@/lib/auth-context';
import { useResults } from '@/lib/hooks/useResults';
import { getUserStats, UserStats, getStudentAssignments, Assignment } from '@/lib/db';
import ScorePredictor from '@/components/ScorePredictor';

const quickActions = [
  { icon: PenTool, label: 'Practice Tests', desc: 'Full-length adaptive tests', href: '/dashboard/practice', color: '#0f172a', bg: '#f8fafc' },
  { icon: BookOpen, label: 'Question Bank', desc: 'Practice by skill area', href: '/dashboard/question-bank', color: '#6366f1', bg: '#f0f0ff' },
  { icon: Bot, label: 'AI Tutor', desc: 'Get instant help', href: '/dashboard/ai-tutor', color: '#7c3aed', bg: '#f5f0ff' },
  { icon: Sparkles, label: 'Study Plan', desc: 'AI recommendations', href: '/dashboard/study-plan', color: '#0891b2', bg: '#f0fbff' },
  { icon: BookMarked, label: 'Bookmarks', desc: 'Review saved questions', href: '/dashboard/bookmarks', color: '#f59e0b', bg: '#fffbeb' },
  { icon: Trophy, label: 'Leaderboard', desc: 'See your ranking', href: '/dashboard/leaderboard', color: '#16a34a', bg: '#f0fdf4' },
];

export default function Dashboard() {
  const { appUser } = useAuth();
  const router = useRouter();
  const { results, loading, latestScore, bestMathScore, bestRWScore, avgScore, totalTests, improvement } = useResults();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!appUser?.uid) return;
    Promise.all([
      getUserStats(appUser.uid),
      getStudentAssignments(appUser.uid),
    ]).then(async ([s, a]) => {
      setStats(s);
      const filteredAssignments = filterItemsBySubject(a, appUser.subject);
      setAssignments(filteredAssignments.filter(x => x.status === 'pending'));
      setStatsLoading(false);
    }).catch(() => setStatsLoading(false));
  }, [appUser?.uid]);

  const firstName = appUser?.displayName?.split(' ')[0] ?? 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const recentTests = results.slice(0, 5);

  const scoreStatCards = [
    { label: 'Latest Score', value: latestScore ? `${latestScore}` : '—', sub: latestScore ? '/ 800' : 'No tests yet', color: '#0f172a', change: improvement },
    { label: 'Best Math Score', value: bestMathScore ? `${bestMathScore}` : '—', sub: '/ 800', color: '#6366f1', change: null },
    { label: 'Best R&W Score', value: bestRWScore ? `${bestRWScore}` : '—', sub: '/ 800', color: '#0891b2', change: null },
    { label: 'Tests Taken', value: `${totalTests}`, sub: 'total', color: '#7c3aed', change: null },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {totalTests === 0
              ? "Welcome! Take your first practice test to get started."
              : `You've completed ${totalTests} test${totalTests > 1 ? 's' : ''}. Keep pushing!`}
          </p>
        </div>
        {stats && stats.streak > 0 && (
          <Link href="/dashboard/streak" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '2rem', cursor: 'pointer' }}>
              <Flame size={16} color="#f97316" />
              <span style={{ fontWeight: '800', color: '#c2410c', fontSize: '0.875rem' }}>{stats.streak} day streak!</span>
            </div>
          </Link>
        )}
      </div>

      {/* ── Score overview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {scoreStatCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {stat.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: stat.color, letterSpacing: '-1px', lineHeight: '1' }}>
                {loading ? '...' : stat.value}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>{stat.sub}</span>
            </div>
            {stat.change !== null && stat.change !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: stat.change >= 0 ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)} pts vs last test
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Pending Assignments banner ── */}
      {assignments.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <AlertTriangle size={18} color="#d97706" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', color: '#92400e', fontSize: '0.875rem' }}>
              {assignments.length} Pending Assignment{assignments.length > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#b45309' }}>
              {assignments[0]?.testName} — due {assignments[0]?.dueDate?.toDate?.()?.toLocaleDateString?.() ?? ''}
            </div>
          </div>
          <Link href="/dashboard/assignments" style={{ padding: '0.375rem 0.875rem', background: '#d97706', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.78rem', textDecoration: 'none' }}>
            View
          </Link>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href} style={{ textDecoration: 'none' }}>
              <div
                className="stat-card"
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '0.625rem', background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <action.icon size={16} color={action.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.825rem', marginBottom: '0.125rem' }}>{action.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{action.desc}</div>
                </div>
                <ChevronRight size={14} color="#cbd5e1" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Tests & Predictor ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem' }}>

        {/* Recent activity */}
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Recent Tests</h3>
            <Link href="/dashboard/results" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontSize: '0.85rem' }}>Loading...</div>
          ) : recentTests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <PenTool size={28} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>No tests taken yet.</p>
              <Link href="/dashboard/practice" style={{ padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none' }}>
                Take First Test
              </Link>
            </div>
          ) : recentTests.map((r, i) => {
            const pct = Math.round((r.totalScore / r.maxScore) * 100);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: i < recentTests.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: pct >= 80 ? '#dcfce7' : pct >= 60 ? '#fef3c7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={14} color={pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.testName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {r.completedAt?.toDate?.()?.toLocaleDateString?.() ?? ''} · {r.correctCount}/{r.maxScore} correct
                  </div>
                </div>
                <div style={{ fontWeight: '800', color: pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626', fontSize: '0.9rem' }}>
                  {r.totalScore}
                </div>
              </div>
            );
          })}
        </div>

        {/* Score progression + start test CTA */}
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Score Progression</h3>
          {results.length > 1 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '100px', paddingBottom: '0.25rem' }}>
              {results.slice(0, 6).reverse().map((r, i, arr) => {
                const pct = ((r.totalScore - 200) / 600) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#0f172a' }}>{r.totalScore}</span>
                    <div style={{ width: '100%', height: `${Math.max(pct, 10)}px`, background: i === arr.length - 1 ? '#0f172a' : '#e2e8f0', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', minHeight: '8px' }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem' }}>
              <TrendingUp size={32} color="#e2e8f0" />
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                Complete 2+ tests to see your score progression
              </p>
            </div>
          )}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <Link href="/dashboard/practice" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#fff', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
              <PenTool size={14} /> {totalTests === 0 ? 'Start First Test' : 'Take Next Test'}
            </Link>
          </div>
        </div>

        {/* Score Predictor */}
        <ScorePredictor results={results} />
      </div>
      {/* ── Gamification: Badges ── */}
      <div style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={18} color="#f59e0b" /> Your Badges
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', opacity: totalTests >= 1 ? 1 : 0.5, filter: totalTests >= 1 ? 'none' : 'grayscale(100%)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Star size={24} color="#d97706" />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>First Step</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Complete 1 Test</div>
            </div>
          </div>

          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', opacity: totalTests >= 5 ? 1 : 0.5, filter: totalTests >= 5 ? 'none' : 'grayscale(100%)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={24} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>Dedicated</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Complete 5 Tests</div>
            </div>
          </div>

          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', opacity: (stats?.streak || 0) >= 3 ? 1 : 0.5, filter: (stats?.streak || 0) >= 3 ? 'none' : 'grayscale(100%)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Flame size={24} color="#ea580c" />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>On Fire</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>3-Day Streak</div>
            </div>
          </div>

          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', opacity: (bestMathScore || 0) >= 750 || (bestRWScore || 0) >= 750 ? 1 : 0.5, filter: (bestMathScore || 0) >= 750 || (bestRWScore || 0) >= 750 ? 'none' : 'grayscale(100%)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={24} color="#db2777" />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>High Achiever</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Score 750+ on a section</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
