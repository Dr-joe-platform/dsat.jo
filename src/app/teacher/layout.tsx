"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, PenTool, Calendar, Lock, Zap, Settings, LogOut, Library, ChevronLeft, ChevronRight, Users, BookA, Target, FileText, LayoutDashboard, BrainCircuit, MessageCircle, Database } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const teacherNav = [
  { href: '/teacher', icon: BarChart2, label: 'Dashboard' },
  { href: '/teacher/classes', icon: Users, label: 'My Classes' },
  { href: '/teacher/analytics', icon: Target, label: 'Student Analytics' },
  { href: '/teacher/study-plan', icon: LayoutDashboard, label: 'Study Plans' },
  { href: '/teacher/flashcards', icon: Library, label: 'Flashcards' },
  { href: '/teacher/vocabulary', icon: BookA, label: 'Vocabulary' },
  { href: '/teacher/notes', icon: FileText, label: 'Shared Notes' },
  { href: '/teacher/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/teacher/create-test', icon: PenTool, label: 'Create Test' },
  { href: '/teacher/custom-quiz', icon: Database, label: 'Custom Quiz' },
  { href: '/teacher/schedule', icon: Calendar, label: 'Schedule Tests' },
  { href: '/teacher/mini-quizzes', icon: Zap, label: 'Mini-Quizzes' },
  { href: '/teacher/ebooks', icon: Library, label: 'E-Books' },
  { href: '/teacher/test-access', icon: Lock, label: 'Test Access' },
  { href: '/teacher/feature-controls', icon: BrainCircuit, label: 'Feature Controls' },
  { href: '/teacher/settings', icon: Settings, label: 'Settings' },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const teacherSubject = appUser?.teacherSubject || 'Both';

  useEffect(() => {
    if (!loading && !appUser) router.push('/login');
    if (!loading && appUser && appUser.role === 'student') router.push('/dashboard');
    if (!loading && appUser && (appUser.role === 'admin' || appUser.role === 'super_admin')) router.push('/admin');
  }, [loading, appUser, router]);

  if (loading || !appUser) return null;

  const isActive = (href: string) => href === '/teacher' ? pathname === '/teacher' : pathname.startsWith(href);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{
        width: collapsed ? '68px' : '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e8ecf0',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
        transition: 'width 0.25s ease', overflow: 'hidden',
        zIndex: 50, flexShrink: 0,
      }}>
        <div style={{ padding: collapsed ? '1rem 0' : '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid #f1f5f9', minHeight: '60px' }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Teacher Panel</div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>DSAT.JO</div>
              <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#3b82f6', marginTop: '0.125rem' }}>{teacherSubject} Teacher</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ width: '26px', height: '26px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1px', overflowY: 'auto' }}>
          {teacherNav
            .filter(item => {
              if (item.href === '/teacher/vocabulary' && teacherSubject === 'Math') return false;
              // we can add more subject-specific filtering here if needed
              return true;
            })
            .map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '0.625rem', padding: collapsed ? '0.5rem' : '0.5rem 0.75rem', borderRadius: '0.5rem', backgroundColor: active ? '#0f172a' : 'transparent', color: active ? '#ffffff' : '#475569', fontWeight: active ? '600' : '500', fontSize: '0.825rem', textDecoration: 'none', transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: '34px' }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#0f172a'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; } }}
              >
                <item.icon size={15} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.5rem' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '0.625rem', padding: collapsed ? '0.5rem' : '0.5rem 0.75rem', borderRadius: '0.5rem', color: '#ef4444', fontWeight: '500', fontSize: '0.825rem', background: 'none', border: 'none', cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: '34px', width: '100%' }}>
            <LogOut size={15} /> {!collapsed && 'Log out'}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
