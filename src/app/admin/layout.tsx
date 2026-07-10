"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, Users, Database, Lock, ClipboardList, Terminal, Bot, Settings, LogOut, ChevronLeft, ChevronRight, MessageSquare, Library, CreditCard, MessageCircle, PenTool, Zap, Shield, Home, BookOpen } from 'lucide-react';
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
  { href: '/admin/trial-settings', icon: Shield, label: 'Trial Mode Settings' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      
      <div className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      <aside className={`desktop-sidebar no-print ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{
        width: collapsed ? '68px' : '240px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
        transition: 'width 0.25s ease', overflow: 'hidden',
        zIndex: 50, flexShrink: 0,
      }}>
        <div style={{ padding: collapsed ? '1rem 0' : '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: '60px' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '0.9rem', fontStyle: 'italic', flexShrink: 0 }}>
              JO
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Panel</div>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#ffffff' }}>DSAT.JO</div>
              </div>
            )}
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1px', overflowY: 'auto' }}>
          {adminNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} title={collapsed ? item.label : undefined} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '0.625rem', padding: collapsed ? '0.5rem' : '0.5rem 0.75rem', borderRadius: '0.5rem', backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent', color: active ? '#ffffff' : 'rgba(255,255,255,0.55)', fontWeight: active ? '700' : '500', fontSize: '0.825rem', textDecoration: 'none', transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: '34px', borderLeft: active ? '2px solid #6366f1' : '2px solid transparent' }}
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

      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar with hamburger menu for mobile */}
        <div className="top-nav no-print" style={{ height: '52px', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 1.5rem', flexShrink: 0 }}>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', padding: '0.5rem', marginLeft: '-0.5rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
              <div style={{ width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
              <div style={{ width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
            </div>
          </button>
        </div>

        <div style={{ flex: 1, padding: '2rem', minWidth: 0, overflowX: 'auto', overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
