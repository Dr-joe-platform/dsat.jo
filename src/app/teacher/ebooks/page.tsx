"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Library, Upload, Trash2, Download, Eye, Plus, X, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ImageUploader from '@/components/ImageUploader';

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
  coverUrl?: string;
}

export default function TeacherEbooksPage() {
  const { appUser } = useAuth();
  const [books, setBooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({ title: '', author: '', subject: 'Math', emoji: '📚', pages: '', coverUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appUser?.uid) loadBooks();
  }, [appUser]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'ebooks'),
        where('teacherId', '==', appUser!.uid)
      );
      const snap = await getDocs(q);
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
        author: form.author || appUser!.displayName || 'Teacher',
        subject: form.subject,
        pages: +form.pages || 0,
        emoji: form.emoji || '📚',
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        downloadUrl,
        storagePath: path,
        teacherId: appUser!.uid,
        coverUrl: form.coverUrl || '',
        createdAt: serverTimestamp()
      });

      setForm({ title: '', author: '', subject: 'Math', emoji: '📚', pages: '', coverUrl: '' });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
      loadBooks();
    } catch (err: any) {
      console.error(err);
      alert('Error uploading: ' + err.message);
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleDelete = async (book: Ebook) => {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      // Delete from Storage if path exists
      if (book.storagePath) {
        try {
          await deleteObject(storageRef(storage, book.storagePath));
        } catch (e) { /* file may already be deleted */ }
      }
      // Delete from Firestore
      await deleteDoc(doc(db, 'ebooks', book.id));
      loadBooks();
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Library size={22} color="#6366f1" /> E-Book Manager
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upload and manage e-books for your students. Files are stored in Firebase Storage.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={15} /> Upload E-Book
        </button>
      </div>

      {showForm && (
        <div className="stat-card" style={{ marginBottom: '1.5rem', border: '1px solid #c4b5fd', background: '#faf5ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: '700', color: '#4c1d95' }}>Add New E-Book</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Book Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="SAT Math — Chapter 3" className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Author</label>
              <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Your name" className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Subject</label>
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field">
                {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both' || appUser.teacherSubject === 'Math') && <option>Math</option>}
                {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both' || appUser.teacherSubject === 'English') && <option>English</option>}
                {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both') && <option>Both</option>}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Pages</label>
              <input type="number" value={form.pages} onChange={e => setForm(f => ({ ...f, pages: e.target.value }))} placeholder="0" className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Emoji Icon</label>
              <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="📚" className="input-field" />
            </div>

            {/* PDF Upload area */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>PDF File *</label>
              <div
                style={{ border: '2px dashed #c4b5fd', borderRadius: '0.625rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#fff', transition: 'border-color 0.2s' }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#7c3aed'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = '#c4b5fd'; }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setSelectedFile(f); }}
              >
                <Upload size={20} color="#8b5cf6" style={{ margin: '0 auto 0.5rem' }} />
                {selectedFile ? (
                  <p style={{ fontSize: '0.85rem', color: '#4c1d95', fontWeight: '700' }}>✅ {selectedFile.name} ({(selectedFile.size / (1024*1024)).toFixed(1)} MB)</p>
                ) : (
                  <>
                    <p style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: '600' }}>Drop PDF here or click to upload</p>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>Max 25MB — PDF files only</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </div>

          {uploading && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6d28d9', fontWeight: '600', marginBottom: '0.25rem' }}>
                <span>Uploading to Firebase Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ background: '#ede9fe', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{ background: '#7c3aed', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Cover Image (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {form.coverUrl && (
                    <img src={form.coverUrl} alt="Cover Preview" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }} />
                  )}
                  <ImageUploader 
                    onUpload={(url) => setForm({ ...form, coverUrl: url })}
                    buttonText="Upload Cover"
                  />
                </div>
              </div>
            </div>
          )}

          <button onClick={addBook} disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
            {uploading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Uploading {uploadProgress}%</> : <><Upload size={14} /> Upload E-Book</>}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading e-books...</div>
      ) : books.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          <Library size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <p>No e-books uploaded yet. Click "Upload E-Book" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {books.map(book => (
            <div key={book.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #cbd5e1', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '48px', height: '60px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                    {book.emoji}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem', lineHeight: '1.3', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>{book.author}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: '#ede9fe', color: '#6d28d9' }}>{book.subject}</span>
                {book.pages > 0 && <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{book.pages} pages</span>}
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{book.size}</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{book.uploadedAt}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <a href={book.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.5rem', background: '#f0f4ff', color: '#4f46e5', borderRadius: '0.375rem', fontWeight: '600', fontSize: '0.75rem', textDecoration: 'none' }}>
                  <Eye size={13} /> View PDF
                </a>
                <a href={book.downloadUrl} download style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: '#f0fdf4', color: '#16a34a', borderRadius: '0.375rem', border: 'none' }}>
                  <Download size={13} />
                </a>
                <button onClick={() => handleDelete(book)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', background: '#fff0f0', color: '#ef4444', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
