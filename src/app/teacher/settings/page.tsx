"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Settings, User, Phone, Shield, Lock, Loader2, Mail, Camera } from 'lucide-react';
import { updateUser } from '@/lib/db';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function TeacherSettingsPage() {
  const { appUser, resetPassword } = useAuth();
  const [name, setName] = useState(appUser?.displayName || '');
  const [phone, setPhone] = useState(appUser?.phone || '');
  const [photoURL, setPhotoURL] = useState(appUser?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!appUser) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !appUser?.uid) return;

    setUploadingImage(true);
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
      setPhotoURL(url);
      
      await updateUser(appUser.uid, { photoURL: url });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
    } catch (err: any) {
      console.error("Failed to upload image", err);
      alert(err.message || "Failed to upload image. Please try again.");
    }
    setUploadingImage(false);
  };

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
          <Settings size={22} color="#6d28d9" /> Account Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your personal teacher profile and security preferences.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="#64748b" /> Profile Details
        </h2>

        {/* Profile card preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6d28d9, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.5rem', overflow: 'hidden' }}>
            {photoURL || appUser?.photoURL ? (
              <img src={photoURL || appUser?.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (appUser?.displayName || 'T')[0].toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.125rem' }}>{name || appUser?.displayName}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{appUser?.email}</div>
          </div>
        </div>

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

          {/* Photo Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Profile Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ cursor: uploadingImage ? 'wait' : 'pointer', padding: '0.625rem 1.25rem', background: '#f1f5f9', color: '#0f172a', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', border: '1px solid #e2e8f0', transition: 'background 0.2s', opacity: uploadingImage ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                     onMouseOver={e => !uploadingImage && (e.currentTarget.style.background = '#e2e8f0')}
                     onMouseOut={e => !uploadingImage && (e.currentTarget.style.background = '#f1f5f9')}>
                <Camera size={14} />
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
              {photoURL && !uploadingImage && <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>Image uploaded!</span>}
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
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Account Role & Subject</label>
            <div style={{ position: 'relative' }}>
              <Shield size={14} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={`${appUser.role.toUpperCase()} - ${appUser.teacherSubject || 'All Subjects'}`} disabled className="input-field" style={{ paddingLeft: '2.5rem', opacity: 0.6, fontWeight: '700', color: '#6d28d9' }} />
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
