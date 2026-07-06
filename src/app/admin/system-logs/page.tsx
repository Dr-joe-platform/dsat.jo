"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Download, Trash2, ShieldAlert } from 'lucide-react';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate some dummy logs for visual effect
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { getActivityLogs } = await import('@/lib/db');
      const allLogs = await getActivityLogs();
      const sysLogs = allLogs
        .map(l => ({
          id: l.id!,
          timestamp: l.timestamp?.toDate ? l.timestamp.toDate().toISOString() : new Date().toISOString(),
          level: l.severity === 'error' ? 'ERROR' : l.severity === 'warn' ? 'WARN' : 'INFO',
          message: `${l.action}: ${l.details}`,
          source: l.user || 'System',
        })) as SystemLog[];
      setLogs(sysLogs);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return '#3b82f6';
      case 'WARN': return '#f59e0b';
      case 'ERROR': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Terminal size={22} color="#6366f1" /> System Logs
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Raw system-level events and API debugging information.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setLogs([])} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <div style={{ background: '#0f172a', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>bash -- server-logs</div>
        </div>

        <div style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1rem', flex: 1, minHeight: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0' }}>
          {loading ? (
            <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Fetching logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ color: '#64748b' }}>No logs found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span style={{ color: getLevelColor(log.level), fontWeight: '700', width: '50px' }}>{log.level}</span>
                  <span style={{ color: '#38bdf8', whiteSpace: 'nowrap' }}>[{log.source}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
