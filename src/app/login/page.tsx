"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login, loginWithGoogle, loading, error } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim() ?? '';
    const password = passRef.current?.value ?? '';
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 50%, #faf5ff 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem',
    }}>
      {/* Bg blobs */}
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226,232,240,0.8)',
        borderRadius: '1.5rem',
        padding: '2.75rem 2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5)',
        zIndex: 10,
        animation: 'fadeInUp 0.4s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px',
            background: '#0f172a',
            borderRadius: '0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
          }}>
            <span style={{ color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: '1.375rem', letterSpacing: '-1px' }}>JO</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.375rem', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sign in to your DSAT.JO account</p>
        </div>

        {/* Error box */}
        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.625rem', display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '0.8rem', color: '#dc2626', lineHeight: '1.5' }}>{error}</span>
          </div>
        )}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }} onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                ref={emailRef}
                type="email"
                id="login-email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="input-field"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', letterSpacing: '0.02em' }}>PASSWORD</label>
              <a href="#" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6366f1' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                ref={passRef}
                type={showPass ? 'text' : 'password'}
                id="login-password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="input-field"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sign in */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem',
              background: loading ? '#475569' : '#0f172a', color: '#fff',
              borderRadius: '0.625rem', fontWeight: '700',
              fontSize: '0.95rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
            }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : <>Sign in <ArrowRight size={16} /></>}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Google */}
          <button 
            type="button" 
            onClick={() => loginWithGoogle()}
            disabled={loading}
            style={{
            width: '100%', padding: '0.875rem',
            background: '#ffffff', color: '#334155',
            borderRadius: '0.625rem', fontWeight: '600',
            fontSize: '0.875rem', border: '1.5px solid #e2e8f0',
            cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.625rem',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { if(!loading) { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1'; } }}
            onMouseLeave={e => { if(!loading) { (e.currentTarget as HTMLElement).style.background = '#ffffff'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; } }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#0f172a', fontWeight: '700' }}>Sign up free</Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
