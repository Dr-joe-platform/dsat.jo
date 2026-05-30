"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Library, Upload, Trash2, Download, Eye, Plus, X, Loader2, FileText, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Ebook {
  id: string;
  title: string;
  author: string;
  subject: string;
  pages: number;
  size: string;
  emoji: string;
  uploadedAt: string;
  downloadUrl: string;
  storagePath?: string;
  teacherId: string;
}

export default function AdminEbooksPage() {
  const { appUser } = useAuth();
  const [books, setBooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({ title: '', author: '', subject: 'Math', emoji: '📚', pages: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appUser?.uid) loadBooks();
  }, [appUser]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'ebooks'));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Ebook))
        .sort((a: any, b: any) => {
          const ta = a.createdAt?.seconds || 0;
          const tb = b.createdAt?.seconds || 0;
          return tb - ta;
        });
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
  };

  const addBook = async () => {
    if (!form.title.trim()) return alert('Please enter a title');
    if (!selectedFile) return alert('Please select a PDF file to upload');

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload PDF to Firebase Storage
      const path = `ebooks/${appUser!.uid}/${Date.now()}_${selectedFile.name}`;
      const sRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(sRef, selectedFile);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          err => reject(err),
          () => resolve()
        );
      });

      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

      // 2. Save metadata to Firestore
      await addDoc(collection(db, 'ebooks'), {
        title: form.title,
        author: form.author || 'Admin',
        subject: form.subject,
        pages: +form.pages || 0,
        emoji: form.emoji || '📚',
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        downloadUrl,
        storagePath: path,
        teacherId: 'admin_global',
        createdAt: serverTimestamp()
      });

      setShowForm(false);
      setForm({ title: '', author: '', subject: 'Math', emoji: '📚', pages: '' });
      setSelectedFile(null);
      await loadBooks();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  const deleteBook = async (id: string, storagePath?: string) => {
    if (!confirm('Delete this E-Book permanently?')) return;
    try {
      if (storagePath) {
        await deleteObject(storageRef(storage, storagePath)).catch(() => {});
      }
      await deleteDoc(doc(db, 'ebooks', id));
      setBooks(books.filter(b => b.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Library size={22} color="#6366f1" /> Global E-Books
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage all E-Books across the platform.</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
          <Upload size={16} /> Upload Book
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Upload E-Book</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Book Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="e.g. SAT Math Prep Guide" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Author</label>
                  <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="input-field" placeholder="Default: Admin" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Pages</label>
                  <input type="number" value={form.pages} onChange={e => setForm({...form, pages: e.target.value})} className="input-field" placeholder="e.g. 150" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Subject</label>
                  <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field">
                    <option value="Math">Math</option>
                    <option value="Reading & Writing">Reading & Writing</option>
                    <option value="General">General SAT</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Icon (Emoji)</label>
                  <input value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} className="input-field" placeholder="📚" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>PDF File *</label>
                <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <FileText size={16} /> {selectedFile ? selectedFile.name : 'Select PDF Document'}
                </button>
              </div>

              {uploading && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#6366f1', transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}

              <button 
                onClick={addBook}
                disabled={uploading || !form.title || !selectedFile}
                style={{ width: '100%', padding: '0.75rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: uploading || !form.title || !selectedFile ? 'not-allowed' : 'pointer', marginTop: '1rem', opacity: uploading || !form.title || !selectedFile ? 0.6 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />} 
                {uploading ? 'Uploading...' : 'Upload Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 size={32} style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <p>Loading E-Books...</p>
        </div>
      ) : books.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
          <Library size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>No E-Books Yet</h3>
          <p>Click "Upload Book" to add the first study material.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {books.map(book => (
            <div key={book.id} className="stat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {book.emoji}
                </div>
                <button onClick={() => deleteBook(book.id, book.storagePath)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem', lineHeight: '1.3' }}>{book.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>By {book.author}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.7rem', fontWeight: '600', color: '#475569' }}>
                <span style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '0.25rem' }}>{book.subject}</span>
                <span style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '0.25rem' }}>{book.pages} pages</span>
                <span style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '0.25rem' }}>{book.size}</span>
                {book.teacherId === 'admin_global' && (
                  <span style={{ padding: '0.2rem 0.5rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Globe size={10} /> Global (Admin)
                  </span>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                <a href={book.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '0.625rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                  <Eye size={14} /> View
                </a>
                <a href={book.downloadUrl} download style={{ flex: 1, padding: '0.625rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                  <Download size={14} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
