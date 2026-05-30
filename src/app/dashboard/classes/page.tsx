"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, BookOpen, GraduationCap, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ClassModel, getStudentClasses, getTeacherClasses, createClass, joinClass } from '@/lib/db';

export default function ClassesPage() {
  const { appUser } = useAuth();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isTeacher = appUser?.role === 'teacher' || appUser?.role === 'admin' || appUser?.role === 'super_admin';

  useEffect(() => {
    if (!appUser?.uid) return;
    loadClasses();
  }, [appUser?.uid, isTeacher]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      if (isTeacher) {
        const c = await getTeacherClasses(appUser!.uid);
        setClasses(c);
      } else {
        const c = await getStudentClasses(appUser!.uid);
        setClasses(c);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    setActionLoading(true);
    try {
      await createClass(className, appUser!.uid, appUser!.displayName, appUser!.teacherSubject || 'Both');
      setClassName('');
      setShowCreateModal(false);
      loadClasses();
    } catch (err) {
      setErrorMsg('Failed to create class.');
    }
    setActionLoading(false);
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || joinCode.length !== 6) {
      setErrorMsg('Invalid code. Must be 6 characters.');
      return;
    }
    setActionLoading(true);
    setErrorMsg('');
    try {
      await joinClass(appUser!.uid, joinCode);
      setJoinCode('');
      setShowJoinModal(false);
      setSuccessMsg('Successfully joined the class!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadClasses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Class not found or an error occurred.');
    }
    setActionLoading(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>{isTeacher ? 'My Classes' : 'Classes'}</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {isTeacher ? 'Manage your students and assign practice tests.' : 'Join classes to get assignments from your teachers.'}
          </p>
        </div>
        
        <button 
          onClick={() => isTeacher ? setShowCreateModal(true) : setShowJoinModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: isTeacher ? '#4f46e5' : '#0f172a', color: '#fff', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Plus size={16} /> {isTeacher ? 'Create Class' : 'Join Class'}
        </button>
      </div>

      {successMsg && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: isTeacher ? '#4f46e5' : '#0f172a', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : classes.length === 0 ? (
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#94a3b8' }}>
            <GraduationCap size={36} strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>{isTeacher ? 'No classes yet' : 'You are not in any classes'}</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '380px', lineHeight: '1.6', marginBottom: '2rem' }}>
            {isTeacher 
              ? 'Create a class to start inviting students and assigning materials.' 
              : 'Ask your teacher to share a class code to join and get personalized assignments.'}
          </p>
          <button 
            onClick={() => isTeacher ? setShowCreateModal(true) : setShowJoinModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: isTeacher ? '#4f46e5' : '#0f172a', color: '#fff', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={15} /> {isTeacher ? 'Create a Class' : 'Join a Class'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {classes.map(c => (
            <Link key={c.id} href={`/dashboard/classes/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="stat-card hover-lift" style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: isTeacher ? 'linear-gradient(135deg, #eef2ff, #c7d2fe)' : '#f8fafc', color: isTeacher ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isTeacher ? <Users size={24} /> : <BookOpen size={24} />}
                  </div>
                  {isTeacher && (
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '1rem', letterSpacing: '0.05em' }}>
                      CODE: {c.code}
                    </div>
                  )}
                </div>
                
                <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>{c.name}</h3>
                
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  {isTeacher ? `${c.studentIds?.length || 0} students enrolled` : `Teacher: ${c.teacherName}`}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: isTeacher ? '#4f46e5' : '#0f172a' }}>
                  {isTeacher ? 'Manage Class →' : 'View Class →'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Teacher Info box for students */}
      {!isTeacher && classes.length === 0 && !loading && (
        <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.875rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <BookOpen size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '700', color: '#0c4a6e', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Are you a teacher?</div>
            <div style={{ color: '#0369a1', fontSize: '0.825rem', lineHeight: '1.6' }}>
              We've noticed you are registered as a student. If you are a teacher looking to create classes, please contact support to upgrade your account role to Teacher.
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {(showCreateModal || showJoinModal) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
              {showCreateModal ? 'Create a New Class' : 'Join a Class'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {showCreateModal ? 'Enter a name for your class. You will get a 6-digit code to share with students.' : 'Ask your teacher for the 6-character class code and enter it below.'}
            </p>

            {errorMsg && <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', fontSize: '0.8rem', borderRadius: '0.5rem', marginBottom: '1rem', fontWeight: '600' }}>{errorMsg}</div>}

            <form onSubmit={showCreateModal ? handleCreateClass : handleJoinClass}>
              {showCreateModal ? (
                <input 
                  type="text" autoFocus required placeholder="e.g. SAT Math Prep 2026"
                  value={className} onChange={e => setClassName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', marginBottom: '1.5rem', outline: 'none' }}
                />
              ) : (
                <input 
                  type="text" autoFocus required placeholder="e.g. A7X9P2" maxLength={6}
                  value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '1.2rem', letterSpacing: '0.1em', textAlign: 'center', textTransform: 'uppercase', marginBottom: '1.5rem', outline: 'none', fontWeight: '700' }}
                />
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowCreateModal(false); setShowJoinModal(false); setErrorMsg(''); }} style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '0.625rem 1.25rem', background: showCreateModal ? '#4f46e5' : '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}>
                  {actionLoading ? 'Please wait...' : showCreateModal ? 'Create Class' : 'Join Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}
