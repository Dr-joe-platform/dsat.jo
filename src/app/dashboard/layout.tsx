"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, PenTool, BookOpen, Users, BookType,
  Sparkles, Flame, LogOut, BarChart2, LifeBuoy,
  Settings, ChevronLeft, ChevronRight, AlertTriangle,
  Bot, BookMarked, Zap, ClipboardList, Trophy,
  Library, Calculator, FileText, TrendingDown,
  ChevronDown, ChevronUp, Star, Bell, X, Check, CheckCheck, Lock, MessageCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { getUserStats, getUsersByTeacherCode, getFeatureControls } from '@/lib/db';
import TextSelectionTooltip from '@/components/TextSelectionTooltip';
import GlobalVocabWidget from '@/components/GlobalVocabWidget';

const studentNav = [
  {
    section: 'Study',
    items: [
      { href: '/dashboard', icon: Home, label: 'Home' },
      { href: '/dashboard/practice', icon: PenTool, label: 'Practice Tests' },
      { href: '/dashboard/question-bank', icon: BookOpen, label: 'Question Bank', badge: 'Free' },
      { href: '/dashboard/mini-quizzes', icon: Zap, label: 'Mini-Quizzes' },
      { href: '/dashboard/assignments', icon: ClipboardList, label: 'Assignments' },
      { href: '/dashboard/vocabulary', icon: BookType, label: 'Vocabulary' },
    ],
  },
  {
    section: 'Review',
    items: [
      { href: '/dashboard/wrong-answers', icon: AlertTriangle, label: 'Wrong Answers' },
      { href: '/dashboard/flashcards', icon: Star, label: 'Flashcards' },
      { href: '/dashboard/bookmarks', icon: BookMarked, label: 'Bookmarks' },
      { href: '/dashboard/weak-points', icon: TrendingDown, label: 'Weak Points' },
    ],
  },
  {
    section: 'AI Tools',
    items: [
      { href: '/dashboard/ai-tutor', icon: Bot, label: 'AI Tutor', badge: 'AI' },
      { href: '/dashboard/ai-analysis', icon: BarChart2, label: 'AI Score Analysis', badge: 'AI' },
      { href: '/dashboard/ai-notes', icon: FileText, label: 'AI Study Notes', badge: 'AI' },
      { href: '/dashboard/study-plan', icon: Sparkles, label: 'Study Plan', badge: 'AI' },
    ],
  },
  {
    section: 'Progress',
    items: [
      { href: '/dashboard/results', icon: BarChart2, label: 'Analytics' },
      { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { href: '/dashboard/classes', icon: Users, label: 'Classes' },
    ],
  },
  {
    section: 'More',
    items: [
      { href: '/dashboard/sat-calculator', icon: Calculator, label: 'SAT Calculator' },
      { href: '/dashboard/ebooks', icon: Library, label: 'E-Books' },
      { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
    ],
  },
];

const bottomNav = [
  { href: '/dashboard/support', icon: LifeBuoy, label: 'Support' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showNotifs, setShowNotifs] = useState(false);
  const [streak, setStreak] = useState(0);
  const [disabledFeatures, setDisabledFeatures] = useState<string[]>([]);
  const notifsRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  // Auth guard
  useEffect(() => {
    if (!loading && !appUser) router.push('/login');
    if (!loading && appUser && (appUser.role === 'admin' || appUser.role === 'super_admin')) router.push('/admin');
    if (!loading && appUser && appUser.role === 'teacher') router.push('/teacher');
  }, [loading, appUser, router]);

  // Load streak
  useEffect(() => {
    if (!appUser?.uid) return;
    getUserStats(appUser.uid).then(s => s && setStreak(s.streak));
  }, [appUser?.uid]);

  // Load feature controls
  useEffect(() => {
    if (!appUser?.teacherCode) return;
    const fetchControls = async () => {
      try {
        const teachers = await getUsersByTeacherCode(appUser.teacherCode!);
        if (teachers.length > 0) {
          const controls = await getFeatureControls(teachers[0].uid, 'all');
          if (controls) {
            const disabled: string[] = [];
            if (controls.aiTutor === false) disabled.push('/dashboard/ai-tutor');
            if (controls.aiNotes === false) disabled.push('/dashboard/ai-notes');
            if (controls.leaderboard === false) disabled.push('/dashboard/leaderboard');
            if (controls.miniQuizzes === false) disabled.push('/dashboard/mini-quizzes');
            if (controls.flashcards === false) {
              disabled.push('/dashboard/flashcards');
              disabled.push('/dashboard/vocabulary');
            }
            setDisabledFeatures(disabled);
          }
        }
      } catch (err) {
        console.error("Failed to load feature controls", err);
      }
    };
    fetchControls();
  }, [appUser?.teacherCode]);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading || !appUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const ALLOWED_TRIAL_ROUTES = ['/dashboard', '/dashboard/practice', '/dashboard/settings', '/dashboard/upgrade'];
  const isFeatureLocked = (href: string) => {
    // 1. Check if teacher explicitly disabled it
    if (disabledFeatures.includes(href)) return 'teacher_locked';
    
    // 2. Check trial mode locking
    if (appUser?.status === 'pending') {
      if (href.startsWith('/dashboard/checkout')) return false;
      if (!ALLOWED_TRIAL_ROUTES.includes(href)) return 'trial_locked';
    }
    return false;
  };

  const getLockReason = (href: string) => {
    const locked = isFeatureLocked(href);
    if (locked === 'teacher_locked') return 'Disabled by your teacher';
    if (locked === 'trial_locked') return 'Locked in Trial Mode';
    return null;
  };

  // ── Locked UI ──
  const LockedUI = () => (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '400px', textAlign: 'center', background: '#fff', padding: '3rem 2rem', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <div style={{ width: '64px', height: '64px', background: '#fef3c7', color: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>Feature Locked</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {isFeatureLocked(pathname) === 'teacher_locked' 
            ? 'This feature has been temporarily disabled by your teacher for your class.'
            : 'Your account is currently in Trial Mode pending teacher approval. You have limited access to features.'}
        </p>
        <Link href="/dashboard" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', background: '#0f172a', color: '#fff', borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <TextSelectionTooltip />
      <GlobalVocabWidget />
      {/* ── SIDEBAR ── */}
      <aside className="sidebar no-print" style={{
        width: collapsed ? '68px' : '256px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e8ecf0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        zIndex: 50,
        flexShrink: 0,
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '1rem 0' : '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
          minHeight: '60px',
        }}>
          {!collapsed && (
            <Link href="/dashboard" style={{ fontSize: '1.25rem', fontWeight: '900', fontStyle: 'italic', color: '#0f172a', letterSpacing: '-0.5px', textDecoration: 'none' }}>
              DSAT.JO
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '26px', height: '26px', borderRadius: '0.5rem',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Scrollable nav */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0.5rem 0' }}>
          {studentNav.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <div
                  onClick={() => toggleSection(group.section)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.625rem 1.25rem 0.25rem',
                    fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: 'pointer', userSelect: 'none',
                  }}
                >
                  <span>{group.section}</span>
                  {collapsedSections[group.section]
                    ? <ChevronDown size={10} />
                    : <ChevronUp size={10} />}
                </div>
              )}

              {!collapsedSections[group.section] && (
                <nav style={{ padding: '0.125rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const lockedReason = getLockReason(item.href);
                    const locked = !!lockedReason;
                    return (
                      <Link
                        key={item.href}
                        href={locked ? '#' : item.href}
                        title={collapsed ? (lockedReason || item.label) : lockedReason || undefined}
                        style={{
                          display: 'flex', alignItems: 'center',
                          gap: collapsed ? '0' : '0.625rem',
                          padding: collapsed ? '0.5rem' : '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          backgroundColor: active ? '#0f172a' : 'transparent',
                          color: active ? '#ffffff' : locked ? '#94a3b8' : '#475569',
                          fontWeight: active ? '600' : '500',
                          fontSize: '0.825rem',
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          minHeight: '34px',
                          cursor: locked ? 'not-allowed' : 'pointer',
                          opacity: locked ? 0.7 : 1,
                        }}
                        onMouseEnter={e => { if (!active && !locked) { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#0f172a'; } }}
                        onMouseLeave={e => { if (!active && !locked) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; } }}
                      >
                        {locked ? <Lock size={15} style={{ flexShrink: 0 }} /> : <item.icon size={15} style={{ flexShrink: 0 }} />}
                        {!collapsed && (
                          <>
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                            {item.badge && !locked && (
                              <span style={{
                                fontSize: '0.55rem', fontWeight: '800',
                                padding: '0.1rem 0.375rem', borderRadius: '1rem',
                                background: active ? 'rgba(255,255,255,0.2)' : item.badge === 'AI' ? '#ede9fe' : '#dcfce7',
                                color: active ? '#fff' : item.badge === 'AI' ? '#6d28d9' : '#166534',
                                flexShrink: 0,
                              }}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
          ))}

          {/* Streak widget */}
          {!collapsed && (
            <Link href="/dashboard/streak" style={{ display: 'block', margin: '0.5rem 0.5rem 0', textDecoration: 'none' }}>
              <div style={{ padding: '0.875rem', border: '1px solid #e8ecf0', borderRadius: '0.75rem', background: '#fafafa', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>
                    <Flame size={13} color="#f97316" /> Daily Streak
                  </div>
                  {streak > 0
                    ? <span style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: '700', background: '#dcfce7', padding: '0.1rem 0.375rem', borderRadius: '1rem' }}>{streak}🔥</span>
                    : <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '700', background: '#f1f5f9', padding: '0.1rem 0.375rem', borderRadius: '1rem' }}>START</span>
                  }
                </div>
                <div className="progress-bar" style={{ height: '5px' }}>
                  <div className="progress-fill" style={{ width: `${Math.min(streak * 10, 100)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.375rem' }}>
                  <span>{streak > 0 ? `${streak} day${streak > 1 ? 's' : ''} active ✓` : 'No streak yet'}</span>
                  <span>→ Goal: 7</span>
                </div>
              </div>
            </Link>
          )}

          {/* Upgrade */}
          {!collapsed && (
            <Link href="/dashboard/upgrade" style={{ display: 'block', margin: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#fff', fontWeight: '700', fontSize: '0.75rem', textDecoration: 'none', textAlign: 'center' }}>
              {(() => {
                const planName = (appUser?.planName || '').toLowerCase();
                if (planName.includes('elite')) return '⭐ Manage Subscription';
                if (planName.includes('pro')) return '⚡ Upgrade to Elite';
                return '⚡ Upgrade to Pro';
              })()}
            </Link>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.5rem' }}>
          {bottomNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? '0' : '0.625rem',
                  padding: collapsed ? '0.5rem' : '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: active ? '#f1f5f9' : 'transparent',
                  color: active ? '#0f172a' : '#94a3b8',
                  fontWeight: '500', fontSize: '0.825rem',
                  textDecoration: 'none', transition: 'all 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  minHeight: '34px',
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#475569'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; } }}
              >
                <item.icon size={15} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
          {/* User info */}
          {!collapsed && appUser && (
            <div style={{ padding: '0.5rem 0.75rem', marginBottom: '2px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {appUser.displayName || 'Student'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {appUser.email}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? 'Log out' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              gap: collapsed ? '0' : '0.625rem',
              padding: collapsed ? '0.5rem' : '0.5rem 0.75rem',
              borderRadius: '0.5rem', color: '#ef4444',
              fontWeight: '500', fontSize: '0.825rem',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'all 0.15s ease',
              justifyContent: collapsed ? 'center' : 'flex-start',
              minHeight: '34px', width: '100%',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff1f2'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>

      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar with notification bell */}
        <div className="top-nav no-print" style={{ height: '52px', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 1.5rem', flexShrink: 0, gap: '0.625rem', position: 'relative', zIndex: 40 }}>
          {/* Notification bell */}
          <div ref={notifsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '0.625rem', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifs && (
              <div style={{ position: 'absolute', top: '42px', right: 0, width: '340px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.875rem', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100 }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>Notifications {unreadCount > 0 && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: '800' }}>{unreadCount} new</span>}</span>
                  {unreadCount > 0 && (
                    <button onClick={() => markAllRead()} style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <Bell size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                      No notifications yet
                    </div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={async () => { await markRead(n.id); if (n.link) router.push(n.link); setShowNotifs(false); }}
                      style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: n.isRead ? '#fff' : '#f0f4ff', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.isRead ? '#fff' : '#f0f4ff'}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? 'transparent' : '#6366f1', flexShrink: 0, marginTop: '5px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0f172a', marginBottom: '0.125rem' }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>{n.message}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '0.75rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <button onClick={() => setShowNotifs(false)} style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => router.push('/dashboard/settings')}>
            {appUser.photoURL ? (
              <img src={appUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (appUser.displayName || 'S')[0].toUpperCase()
            )}
          </div>
        </div>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'auto', overflowY: 'auto' }}>
          {appUser.status === 'pending' && (
            <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#92400e', fontSize: '0.875rem', flexShrink: 0 }}>
              <AlertTriangle size={18} />
              <div>
                <strong>Trial Mode:</strong> Your account is pending teacher approval. You have limited access to practice tests.
              </div>
            </div>
          )}
          <div style={{ flex: 1, padding: '2rem' }}>
            {isFeatureLocked(pathname) ? <LockedUI /> : children}
          </div>
        </main>
      </div>
    </div>
  );
}
