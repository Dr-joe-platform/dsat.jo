"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { SharedResource, getSharedResources, addSharedResource, deleteSharedResource } from '@/lib/db';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileText, Plus, Share2, Eye, Trash2, Edit2, UploadCloud, X, Loader2 } from 'lucide-react';

export default function TeacherNotesPage() {
  const { appUser } = useAuth();
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [loading, setLoading] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appUser?.uid) loadData();
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSharedResources(appUser!.uid);
      setResources(res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Please enter a title");
    
    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert("Please select a file to upload");

    setIsUploading(true);
    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `resources/${appUser!.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // 2. Save to Firestore
      await addSharedResource({
        teacherId: appUser!.uid,
        title,
        subject: appUser!.teacherSubject || 'General',
        fileUrl: downloadUrl,
        fileName: file.name
      });

      setShowModal(false);
      setTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadData();
    } catch (err: any) {
      console.error(err);
      alert("Error uploading file: " + err.message);
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource? Students will no longer be able to access it.")) return;
    try {
      await deleteSharedResource(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error deleting resource");
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Shared Notes & Resources</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upload PDFs, Books, and notes directly to your students' dashboard.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#4f46e5', color: '#fff', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          <UploadCloud size={16} /> Upload Book / Note
        </button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', maxWidth: '420px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a' }}>Upload Resource</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Title *</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} placeholder="e.g. Advanced Math Formulas" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>File (PDF, Image, etc.) *</label>
                <div
                  style={{ border: '2px dashed #c7d2fe', borderRadius: '0.625rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={22} color="#6366f1" style={{ margin: '0 auto 0.5rem' }} />
                  {fileInputRef.current?.files?.[0] ? (
                    <p style={{ fontSize: '0.8rem', color: '#4338ca', fontWeight: '700' }}>
                      ✅ {fileInputRef.current.files[0].name}
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '600' }}>Click to select a file</p>
                  )}
                  <input ref={fileInputRef} type="file" required style={{ display: 'none' }} onChange={() => {}} />
                </div>
              </div>

              {isUploading && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#4338ca', fontWeight: '600', marginBottom: '0.25rem' }}>
                    <span>Uploading to Firebase Storage...</span>
                  </div>
                  <div style={{ background: '#e0e7ff', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ background: '#4f46e5', height: '100%', width: '100%', animation: 'progressIndeterminate 1.5s ease-in-out infinite' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.625rem', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} style={{ flex: 1, padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: isUploading ? 0.7 : 1 }}>
                  {isUploading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</> : 'Upload File'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading resources...</div>
      ) : resources.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          No resources uploaded yet. Click the button above to share your first book or note.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {resources.map(res => (
            <div key={res.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {res.subject}
                </div>
                <button onClick={() => res.id && handleDelete(res.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.3' }}>{res.title}</h3>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  File: {res.fileName}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={res.fileUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none', padding: '0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                    <Eye size={14} /> View / Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
