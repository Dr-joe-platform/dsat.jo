"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Settings, User, Phone, Shield, Lock, Loader2, Mail } from 'lucide-react';
import { updateUser } from '@/lib/db';

export default function AdminSettingsPage() {
  const { appUser, resetPassword } = useAuth();
  const [name, setName] = useState(appUser?.displayName || '');
  const [phone, setPhone] = useState(appUser?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!appUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateUser(appUser.uid, { displayName: name, phone });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Failed to update profile.");
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={22} color="#6366f1" /> Account Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your personal admin profile and security preferences.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="#64748b" /> Profile Details
        </h2>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input value={name} onChange={e => setName(e.target.value)} required className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="Your Name" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="+1 234 567 890" />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Email Address (Read-only)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={appUser.email || ''} disabled className="input-field" style={{ paddingLeft: '2.5rem', opacity: 0.6 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Account Role</label>
            <div style={{ position: 'relative' }}>
              <Shield size={14} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={appUser.role.toUpperCase()} disabled className="input-field" style={{ paddingLeft: '2.5rem', opacity: 0.6, fontWeight: '700', color: '#ef4444' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', alignItems: 'center', gap: '1rem' }}>
            {success && <span style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: '600' }}>Profile saved successfully!</span>}
            <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', cursor: 'pointer' }}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div style={{ marginTop: '2rem', background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="#64748b" /> Security
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Need to change your password? A password reset link will be sent to your email.</p>
        
        <button onClick={async () => {
          try {
            await resetPassword(appUser.email!);
            alert("Password reset email sent!");
          } catch(e) {
            alert("Error sending reset email.");
          }
        }} style={{ padding: '0.625rem 1.25rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>
          Send Password Reset Email
        </button>
      </div>
    </div>
  );
}
