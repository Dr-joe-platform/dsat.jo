"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { updateUserProfile } from '@/lib/db';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Save, Check, User, Phone, Key, BookOpen, Camera } from 'lucide-react';

export default function SettingsPage() {
  const { appUser } = useAuth();
  const [form, setForm] = useState({ displayName: '', phone: '', parentPhone: '', teacherCode: '', photoURL: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appUser) {
      setForm({
        displayName: appUser.displayName ?? '',
        phone: appUser.phone ?? '',
        parentPhone: appUser.parentPhone ?? '',
        teacherCode: appUser.teacherCode ?? '',
        photoURL: appUser.photoURL ?? '',
      });
    }
  }, [appUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !appUser?.uid) return;

    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Unknown Error");
      }

      const url = data.url;
      setForm(prev => ({ ...prev, photoURL: url }));
      
      await updateUserProfile(appUser.uid, { photoURL: url });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
    } catch (err: any) {
      console.error("Failed to upload image", err);
      setError(err.message || "Failed to upload image. Please try again.");
    }
    setUploadingImage(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser?.uid) return;
    setSaving(true);
    setError('');
    try {
      await updateUserProfile(appUser.uid, {
        displayName: form.displayName,
        phone: form.phone,
        parentPhone: form.parentPhone,
        teacherCode: form.teacherCode,
        photoURL: form.photoURL,
      });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: form.displayName, photoURL: form.photoURL });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save changes. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your account and profile</p>
      </div>

      {/* Profile card */}
      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.375rem', overflow: 'hidden' }}>
            {form.photoURL || appUser?.photoURL ? (
              <img src={form.photoURL || appUser?.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (appUser?.displayName || 'S')[0].toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{appUser?.displayName}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{appUser?.email}</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.1rem 0.5rem', borderRadius: '1rem',
                background: appUser?.role === 'admin' ? '#fee2e2' : appUser?.role === 'teacher' ? '#fef3c7' : '#dcfce7',
                color: appUser?.role === 'admin' ? '#dc2626' : appUser?.role === 'teacher' ? '#d97706' : '#16a34a',
              }}>
                {appUser?.role?.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.1rem 0.5rem', borderRadius: '1rem', background: '#dcfce7', color: '#16a34a' }}>
                {appUser?.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Display Name */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
              <User size={13} /> Full Name
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = '#6366f1'}
              onBlur={e => (e.target as HTMLElement).style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
              <Camera size={13} /> Profile Image
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ cursor: uploadingImage ? 'wait' : 'pointer', padding: '0.5rem 1rem', background: '#f1f5f9', color: '#0f172a', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', border: '1px solid #e2e8f0', transition: 'background 0.2s', opacity: uploadingImage ? 0.5 : 1 }}
                     onMouseOver={e => !uploadingImage && (e.currentTarget.style.background = '#e2e8f0')}
                     onMouseOut={e => !uploadingImage && (e.currentTarget.style.background = '#f1f5f9')}>
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
              {form.photoURL && !uploadingImage && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Image uploaded!</span>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
              <Phone size={13} /> Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+20 1XX XXX XXXX"
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = '#6366f1'}
              onBlur={e => (e.target as HTMLElement).style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Parent Phone */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
              <Phone size={13} /> Parent Phone
            </label>
            <input
              type="tel"
              value={form.parentPhone}
              onChange={e => setForm({ ...form, parentPhone: e.target.value })}
              placeholder="Parent's phone number"
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = '#6366f1'}
              onBlur={e => (e.target as HTMLElement).style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Teacher Code */}
          {appUser?.role === 'student' && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
                <Key size={13} /> Teacher Code
              </label>
              <input
                type="text"
                value={form.teacherCode}
                onChange={e => setForm({ ...form, teacherCode: e.target.value })}
                placeholder="Enter your teacher's code"
                style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target as HTMLElement).style.borderColor = '#6366f1'}
                onBlur={e => (e.target as HTMLElement).style.borderColor = '#e2e8f0'}
              />
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.375rem' }}>Ask your teacher for their code to link your account</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '0.625rem 0.875rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.82rem', fontWeight: '600' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: saved ? '#22c55e' : '#0f172a', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.3s' }}
          >
            {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Account info (read-only) */}
      <div className="stat-card">
        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Account Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #f8fafc' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Email</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>{appUser?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #f8fafc' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Role</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>{appUser?.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: appUser?.status === 'approved' ? '#16a34a' : '#d97706' }}>
              {appUser?.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
