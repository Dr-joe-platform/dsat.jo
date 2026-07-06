"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Make sure the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 50%, #faf5ff 100%)',
      padding: '2rem', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div style={{
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226,232,240,0.8)', borderRadius: '1.5rem',
        padding: '2.5rem', width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)', zIndex: 10,
        animation: 'fadeInUp 0.4s ease forwards'
      }}>
        
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: '600', transition: 'color 0.2s' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '52px', height: '52px', background: '#0f172a', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>
            <Mail style={{ color: '#fff' }} size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>Reset Password</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.625rem', display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '0.8rem', color: '#dc2626', lineHeight: '1.5' }}>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.625rem' }}>
            <CheckCircle size={32} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#166534', marginBottom: '0.25rem' }}>Email Sent!</h3>
            <p style={{ fontSize: '0.85rem', color: '#15803d', lineHeight: '1.5' }}>
              We've sent a secure password reset link to your email. Please check your inbox (and spam folder) to set a new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input ref={emailRef} type="email" placeholder="you@example.com" required className="input-field" style={{ paddingLeft: '2.75rem', width: '100%', boxSizing: 'border-box' }} />
              </div>
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
                boxShadow: '0 4px 12px rgba(15,23,42,0.2)', transition: 'all 0.2s'
              }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <>Send Reset Link <ArrowRight size={16} /></>}
            </button>
          </form>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .input-field {
          padding: 0.875rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.625rem;
          font-size: 0.95rem;
          color: #0f172a;
          background: #f8fafc;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
      `}</style>
    </div>
  );
}
