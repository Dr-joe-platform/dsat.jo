"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, Users, Database, Lock, ClipboardList, Terminal, Bot, Settings, LogOut, ChevronLeft, ChevronRight, MessageSquare, Library, CreditCard, MessageCircle, PenTool, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const adminNav = [
  { href: '/admin', icon: BarChart2, label: 'Dashboard' },
  { href: '/admin/create-complete-test', icon: PenTool, label: 'Create Full Exam' },
  { href: '/admin/test-bank', icon: Database, label: 'Test Bank' },
  { href: '/admin/mini-quizzes', icon: Zap, label: 'Mini Quizzes' },
  { href: '/admin/test-access', icon: Lock, label: 'Test Access' },
  { href: '/admin/activity-log', icon: ClipboardList, label: 'Activity Log' },
  { href: '/admin/system-logs', icon: Terminal, label: 'System Logs' },
  { href: '/admin/support', icon: MessageSquare, label: 'Support Tickets' },
  { href: '/admin/messages', icon: MessageCircle, label: 'Platform Chat' },
  { href: '/admin/ai-settings', icon: Bot, label: 'AI Settings' },
  { href: '/admin/ebooks', icon: Library, label: 'Global E-Books' },
  { href: '/admin/pricing', icon: CreditCard, label: 'Pricing Plans' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !appUser) router.push('/login');
    if (!loading && appUser && appUser.role !== 'admin' && appUser.role !== 'super_admin') {
      if (appUser.role === 'teacher') router.push('/teacher');
      else router.push('/dashboard');
    }
  }, [loading, appUser, router]);

  if (loading || !appUser) return null;

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{
        width: collapsed ? '68px' : '240px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
        transition: 'width 0.25s ease', overflow: 'hidden',
        zIndex: 50, flexShrink: 0,
      }}>
        <div style={{ padding: collapsed ? '1rem 0' : '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: '60px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0, overflow: 'hidden' }}>
                {appUser.photoURL ? (
                  <img src={appUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (appUser.displayName || 'A')[0].toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Panel</div>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#ffffff' }}>DSAT.JO</div>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ width: '26px', height: '26px', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1px', overflowY: 'auto' }}>
          {adminNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '0.625rem', padding: collapsed ? '0.5rem' : '0.5rem 0.75rem', borderRadius: '0.5rem', backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent', color: active ? '#ffffff' : 'rgba(255,255,255,0.55)', fontWeight: active ? '700' : '500', fontSize: '0.825rem', textDecoration: 'none', transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: '34px', borderLeft: active ? '2px solid #6366f1' : '2px solid transparent' }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#fff'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; } }}
              >
                <item.icon size={15} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.5rem' }}>
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
