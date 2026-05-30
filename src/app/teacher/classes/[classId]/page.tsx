"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getClassDetails, ClassModel, removeStudentFromClass } from '@/lib/db';
import { ArrowLeft, Users, Copy, Trash2, CheckCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function ClassDetailsPage() {
  const { classId } = useParams() as { classId: string };
  const router = useRouter();
  const { appUser } = useAuth();
  
  const [classData, setClassData] = useState<ClassModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // UID of student being removed

  const isTeacher = appUser?.role === 'teacher' || appUser?.role === 'admin' || appUser?.role === 'super_admin';

  useEffect(() => {
    if (!appUser?.uid) return;
    loadClass();
  }, [classId, appUser?.uid]);

  const loadClass = async () => {
    setLoading(true);
    try {
      const c = await getClassDetails(classId);
      if (c) {
        const isAdmin = appUser?.role === 'admin' || appUser?.role === 'super_admin';
        if (isTeacher && !isAdmin && c.teacherId !== appUser!.uid) {
          router.push('/teacher/classes');
          return;
        }
        if (!isTeacher && !c.studentIds?.includes(appUser!.uid)) {
          router.push('/teacher/classes');
          return;
        }
        setClassData(c);
      } else {
        router.push('/teacher/classes');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!classData?.code) return;
    navigator.clipboard.writeText(classData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) return;
    setActionLoading(studentId);
    try {
      await removeStudentFromClass(classId, studentId);
      await loadClass(); // reload to get updated list
    } catch (e) {
      console.error(e);
      alert('Failed to remove student.');
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!classData) return null;

  const isMyClass = isTeacher && classData.teacherId === appUser?.uid;

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/teacher/classes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Back to Classes
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>{classData.name}</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              {isTeacher ? `Teacher: You` : `Teacher: ${classData.teacherName}`} · {classData.studentIds?.length || 0} students
            </p>
          </div>
          
          {isMyClass && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>CLASS CODE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4f46e5', letterSpacing: '0.1em' }}>{classData.code}</span>
                <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#22c55e' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Copy Code">
                  {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Students List */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Users size={20} color="#4f46e5" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a' }}>Enrolled Students</h3>
          </div>

          {(!classData.studentIds || classData.studentIds.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <GraduationCap size={24} color="#94a3b8" />
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>No students have joined yet.</p>
              {isMyClass && <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Share the code <strong style={{ color: '#4f46e5' }}>{classData.code}</strong> with your students.</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {classData.studentIds.map((studentId, i) => (
                <div key={studentId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#475569', fontSize: '0.875rem' }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>Student ID: {studentId.substring(0, 8)}...</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Enrolled Student</div>
                    </div>
                  </div>
                  {isMyClass && (
                    <button 
                      onClick={() => handleRemoveStudent(studentId)}
                      disabled={actionLoading === studentId}
                      style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.375rem', cursor: actionLoading === studentId ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: actionLoading === studentId ? 0.5 : 1, transition: 'background 0.2s' }}
                      title="Remove Student"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions / Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isTeacher ? (
            <>
              <div className="stat-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Assign Practice</h3>
                <p style={{ fontSize: '0.85rem', color: '#e0e7ff', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Create custom assignments and tests specifically for this class.
                </p>
                <Link href="/teacher/create-test" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', background: '#fff', color: '#4f46e5', fontWeight: '700', borderRadius: '0.5rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                  Go to Test Builder
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Class Assignments</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Tests and practice materials assigned by your teacher will appear in your Practice dashboard.
                </p>
                <Link href="/dashboard/practice" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', background: '#0f172a', color: '#fff', fontWeight: '700', borderRadius: '0.5rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                  View Assignments
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
