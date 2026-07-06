'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Activity, Clock, MonitorPlay, Users, FileText, AlertTriangle } from 'lucide-react';

interface LiveSession {
  uid: string;
  displayName: string;
  testId: string;
  phase: string;
  currentQuestion: number;
  totalQuestions: number;
  lastActive: any;
  currentFrame?: string;
  cheatWarnings?: number;
}

export default function LiveClassroom() {
  const { appUser } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);

  useEffect(() => {
    if (!appUser?.uid) return;

    // Listen to all live sessions. In a real app, you'd filter by students linked to this teacher.
    const q = query(collection(db, 'live_sessions'), orderBy('lastActive', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeSessions: LiveSession[] = [];
      const now = new Date();
      snapshot.forEach((doc) => {
        const data = doc.data() as LiveSession;
        // Only show sessions active in the last 60 minutes
        if (data.lastActive) {
          const lastActiveDate = data.lastActive.toDate();
          const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60);
          if (diffMinutes < 60) {
            activeSessions.push(data);
          }
        }
      });
      setSessions(activeSessions);
    });

    return () => unsubscribe();
  }, [appUser?.uid]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
          <Activity size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Live Classroom</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Monitor your students in real-time as they take exams.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {sessions.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', background: '#fff', borderRadius: '1rem', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <MonitorPlay size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#334155', margin: '0 0 0.5rem 0' }}>No Active Students</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>There are no students currently taking a test.</p>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.uid} style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: session.phase === 'testing' ? '#22c55e' : '#eab308' }} />
              
              {/* Snapshot / Camera View */}
              <div style={{ marginBottom: '1rem', width: '100%', height: '140px', background: '#1e293b', borderRadius: '0.75rem', overflow: 'hidden', position: 'relative' }}>
                {session.currentFrame ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.currentFrame} alt={`${session.displayName} camera`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                    No Camera Feed
                  </div>
                )}
                {session.cheatWarnings && session.cheatWarnings > 0 ? (
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={12} /> {session.cheatWarnings} Warnings
                  </div>
                ) : null}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0f172a' }}>{session.displayName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: session.phase === 'testing' ? '#22c55e' : '#eab308', background: session.phase === 'testing' ? '#dcfce7' : '#fef08a', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontWeight: '700' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: session.phase === 'testing' ? 'pulse 2s infinite' : 'none' }} />
                  {session.phase.toUpperCase()}
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={14} /> Test ID: <strong>{session.testId}</strong>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{session.currentQuestion} / {session.totalQuestions}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#6366f1', width: `${(session.currentQuestion / session.totalQuestions) * 100}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                <Clock size={12} /> Last active: {session.lastActive ? new Date(session.lastActive.toDate()).toLocaleTimeString() : 'Just now'}
              </div>

              <style>{`
                @keyframes pulse {
                  0% { opacity: 1; }
                  50% { opacity: 0.3; }
                  100% { opacity: 1; }
                }
              `}</style>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
