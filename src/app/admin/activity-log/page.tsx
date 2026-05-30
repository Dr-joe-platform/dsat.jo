"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, Filter, Search, User, Shield, BookOpen, Loader2, Trash2 } from 'lucide-react';
import { getActivityLogs, ActivityLog, clearActivityLogs } from '@/lib/db';

const typeIcon: Record<ActivityLog['type'], React.ReactNode> = {
  auth: <User size={13} />,
  admin: <Shield size={13} />,
  test: <BookOpen size={13} />,
  system: <Terminal size={13} />,
};
const typeColor: Record<ActivityLog['type'], string> = { auth: '#3b82f6', admin: '#ef4444', test: '#22c55e', system: '#94a3b8' };
const severityColor: Record<string, { bg: string; color: string }> = {
  info: { bg: '#dbeafe', color: '#1d4ed8' },
  warn: { bg: '#fef3c7', color: '#d97706' },
  error: { bg: '#fee2e2', color: '#dc2626' },
};

export default function ActivityLogPage() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    getActivityLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to permanently delete ALL activity logs?')) return;
    setClearing(true);
    await clearActivityLogs();
    setLogs([]);
    setClearing(false);
  };

  const filtered = logs.filter(l =>
    (!filter || l.type === filter) &&
    (!search || l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Terminal size={22} color="#6366f1" /> Activity Log
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Audit trail of all platform actions and events.</p>
        </div>
        <button onClick={handleClearLogs} disabled={clearing || logs.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', cursor: (clearing || logs.length === 0) ? 'not-allowed' : 'pointer', opacity: (clearing || logs.length === 0) ? 0.5 : 1 }}>
          {clearing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
          Clear Logs
        </button>
      </div>

      {/* Severity badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {(['info', 'warn', 'error'] as const).map(s => {
          const sc = severityColor[s];
          const count = logs.filter(l => l.severity === s).length;
          return (
            <div key={s} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1rem' }}>{s === 'info' ? 'ℹ️' : s === 'warn' ? '⚠️' : '🚨'}</span>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: sc.color }}>
                  {loading ? '—' : count}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>{s === 'info' ? 'Info' : s === 'warn' ? 'Warnings' : 'Errors'}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.625rem', flexWrap: 'wrap', background: '#fafafa' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem' }} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field" style={{ width: 'auto' }}>
            <option value="">All Types</option>
            <option value="auth">Auth</option>
            <option value="admin">Admin</option>
            <option value="test">Test</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Log entries */}
        <div style={{ fontFamily: 'monospace' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Fetching logs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
              <Terminal size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>No logs found</p>
            </div>
          ) : (
            filtered.map((log, i) => {
              const sc = severityColor[log.severity];
              const timeString = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now';
              return (
                <div key={log.id || i} style={{ padding: '0.875rem 1.25rem', borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '0.375rem', background: `${typeColor[log.type]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColor[log.type], flexShrink: 0, marginTop: '2px' }}>
                    {typeIcon[log.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0f172a' }}>{log.action}</span>
                      <span style={{ padding: '0.05rem 0.375rem', borderRadius: '0.25rem', fontSize: '0.6rem', fontWeight: '700', background: sc.bg, color: sc.color }}>
                        {log.severity.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem', wordBreak: 'break-word' }}>
                      <strong style={{ color: '#0f172a' }}>{log.user}</strong> — {log.details}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{timeString}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
