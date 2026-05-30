"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Play, Check, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getStudentAssignments, Assignment, completeAssignment } from '@/lib/db';

export default function AssignmentsPage() {
  const { appUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser?.uid) return;
    getStudentAssignments(appUser.uid).then(a => {
      setAssignments(a);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [appUser?.uid]);

  const pending = assignments.filter(a => a.status === 'pending');
  const completed = assignments.filter(a => a.status === 'completed');

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Assignments</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Tests assigned by your teacher</p>
      </div>

      {/* Pending */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
          📋 Pending ({pending.length})
        </h3>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : pending.length === 0 ? (
          <div className="stat-card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            <ClipboardList size={32} color="#e2e8f0" style={{ margin: '0 auto 0.75rem' }} />
            No pending assignments
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pending.map(a => {
              const dueDate = a.dueDate?.toDate?.()?.toLocaleDateString?.('en', { month: 'long', day: 'numeric', year: 'numeric' }) ?? '';
              const isPastDue = a.dueDate?.toDate?.() ? new Date() > a.dueDate.toDate() : false;
              
              // Handle appending assignmentId safely
              let testUrl = `/test/${a.testId}`;
              if (a.testId.includes('?')) {
                testUrl += `&assignmentId=${a.id}`;
              } else {
                testUrl += `?assignmentId=${a.id}`;
              }

              return (
                <div key={a.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', border: isPastDue ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '0.625rem', background: isPastDue ? '#fee2e2' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ClipboardList size={18} color={isPastDue ? '#dc2626' : '#d97706'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{a.testName}</div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>From: {a.teacherName}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isPastDue ? '#dc2626' : '#64748b', fontWeight: isPastDue ? '700' : '400' }}>
                        <Calendar size={11} /> Due: {dueDate} {isPastDue && '(Overdue!)'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={testUrl}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.125rem', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none', flexShrink: 0 }}
                  >
                    <Play size={12} fill="white" /> Start
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
            ✅ Completed ({completed.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {completed.map(a => (
              <div key={a.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.5rem', opacity: 0.75 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={16} color="#16a34a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>{a.testName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Completed · Score: {a.score ?? '—'} · From {a.teacherName}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '0.25rem 0.625rem', borderRadius: '1rem' }}>Done</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
