"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, AlertCircle, Loader2, BookOpen, GraduationCap, Shield } from 'lucide-react';
import { useAuth, UserRole } from '@/lib/auth-context';

const roles: { id: UserRole; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { id: 'student', label: 'Student', desc: 'Take tests & track progress', icon: <BookOpen size={18} />, color: '#6366f1' },
  { id: 'teacher', label: 'Teacher', desc: 'Manage students & create tests', icon: <GraduationCap size={18} />, color: '#22c55e' },
];

export default function SignupPage() {
  const { signup, loginWithGoogle, loading, error } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<UserRole>('student');

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const parentPhoneRef = useRef<HTMLInputElement>(null);
  const teacherSubjectRef = useRef<HTMLSelectElement>(null);
  const studentSubjectRef = useRef<HTMLSelectElement>(null);
  const referredByRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value.trim() ?? '';
    const email = emailRef.current?.value.trim() ?? '';
    const password = passRef.current?.value ?? '';
    if (!name || !email || !password) return;

    const extra: any = {};
    if (phoneRef.current?.value.trim()) extra.phone = phoneRef.current.value.trim();
    if (referredByRef.current?.value.trim()) {
      extra.referredBy = referredByRef.current.value.trim();
      extra.teacherCode = extra.referredBy; // Keep backward compatibility for teacherCode
    }

    if (role === 'student') {
      if (parentPhoneRef.current?.value.trim()) extra.parentPhone = parentPhoneRef.current.value.trim();
      if (studentSubjectRef.current?.value) extra.subject = studentSubjectRef.current.value;
    } else if (role === 'teacher') {
      if (teacherSubjectRef.current?.value) extra.teacherSubject = teacherSubjectRef.current.value;
    }

    await signup(email, password, name, role, extra);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 50%, #faf5ff 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226,232,240,0.8)',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        zIndex: 10,
        animation: 'fadeInUp 0.4s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '52px', height: '52px', background: '#0f172a', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>
            <span style={{ color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: '1.375rem' }}>D</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>Create your account</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Join DSAT.JO and start your SAT journey</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.625rem', display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '0.8rem', color: '#dc2626', lineHeight: '1.5' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Role selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>I AM A</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {roles.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '0.75rem',
                    border: `2px solid ${role === r.id ? r.color : '#e2e8f0'}`,
                    borderRadius: '0.625rem',
                    background: role === r.id ? `${r.color}10` : '#fafafa',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: role === r.id ? r.color : '#475569', marginBottom: '0.25rem' }}>
                    {r.icon}
                    <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{r.label}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.4' }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Full name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>FULL NAME</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input ref={nameRef} type="text" id="signup-name" placeholder="Ahmed Mohamed" required autoComplete="name" className="input-field" style={{ paddingLeft: '2.75rem' }} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input ref={emailRef} type="email" id="signup-email" placeholder="you@example.com" required autoComplete="email" className="input-field" style={{ paddingLeft: '2.75rem' }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input ref={passRef} type={showPass ? 'text' : 'password'} id="signup-password" placeholder="Min. 8 characters" required autoComplete="new-password" minLength={8} className="input-field" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>PHONE NUMBER <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input ref={phoneRef} type="tel" id="signup-phone" placeholder="+20 100 000 0000" autoComplete="tel" className="input-field" style={{ paddingLeft: '2.75rem' }} />
            </div>
          </div>

          {/* Student-only fields */}
          {role === 'student' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>SUBJECT <span style={{ color: '#ef4444' }}>*</span></label>
                <select ref={studentSubjectRef} required className="input-field" style={{ cursor: 'pointer' }}>
                  <option value="math">📐 Math</option>
                  <option value="english">📖 English</option>
                  <option value="both">📚 Both (Math &amp; English)</option>
                </select>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.375rem' }}>Choose the subject your teacher teaches you.</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>PARENT PHONE <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input ref={parentPhoneRef} type="tel" id="signup-parent-phone" placeholder="+20 100 000 0000" className="input-field" style={{ paddingLeft: '2.75rem' }} />
                </div>
              </div>
            </>
          )}

          {/* Teacher-only fields */}
          {role === 'teacher' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>SUBJECT <span style={{ color: '#ef4444' }}>*</span></label>
              <select ref={teacherSubjectRef} required className="input-field" style={{ cursor: 'pointer' }}>
                <option value="Math">Math</option>
                <option value="English">English</option>
                <option value="Both">Both (Math & English)</option>
              </select>
            </div>
          )}

          {/* Referral Code / Teacher Code */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>REFERRAL / TEACHER CODE <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span></label>
            <input ref={referredByRef} type="text" id="signup-referral" placeholder="e.g. TCH-ABC123" className="input-field" />
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.375rem' }}>If someone invited you, enter their code here.</p>
          </div>

          {/* Note about approval */}
          <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Shield size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '0.75rem', color: '#166534', lineHeight: '1.5' }}>
              Your account will be reviewed and approved by {role === 'student' ? 'your teacher' : 'an admin'} before you can access the platform.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem',
              background: loading ? '#475569' : '#0f172a', color: '#fff',
              borderRadius: '0.625rem', fontWeight: '700',
              fontSize: '0.95rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
            }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : <>Create account <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#94a3b8' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ padding: '0 1rem', fontSize: '0.8rem', fontWeight: '600' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <button
          type="button"
          onClick={() => loginWithGoogle(role)}
          disabled={loading}
          style={{
            width: '100%', padding: '0.875rem',
            background: '#ffffff', color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '0.625rem', fontWeight: '600',
            fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.18-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#0f172a', fontWeight: '700' }}>Sign in</Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
