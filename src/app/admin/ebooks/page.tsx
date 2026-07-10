"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Library, Upload, Trash2, Download, Eye, Plus, X, Loader2, FileText, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { notifyStudentsForNewEbook } from '@/lib/db';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PdfViewer from '@/components/PdfViewer';

interface Ebook {
  id: string;
  title: string;
  author: string;
  subject: string;
  pages: number;
  link: string;
  downloadUrl?: string;
  size: string;
  emoji: string;
  uploadedAt: string;
  teacherId: string;
  teacherName?: string;
  storagePath?: string;
  settings?: {
    allowDownload: boolean;
    saveProgress: boolean;
    allowAnnotations: boolean;
  };
  classIds?: string[];
  allowedPlans?: string[];
}

export default function AdminEbooksPage() {
  const { appUser } = useAuth();
  const [books, setBooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<Ebook | null>(null);
  const [editingSettings, setEditingSettings] = useState<Ebook | null>(null);
  const [pricingPlans, setPricingPlans] = useState<{id: string, name: string}[]>([]);
  const [form, setForm] = useState({ title: '', author: '', subject: 'Both', emoji: '📚', link: '', allowDownload: false, saveProgress: true, allowAnnotations: true, allowedPlans: [] as string[] });

  useEffect(() => {
    if (appUser?.uid) {
      loadBooks();
      loadPricingPlans();
    }
  }, [appUser]);

  const loadPricingPlans = async () => {
    try {
      const snap = await getDocs(collection(db, 'pricing'));
      const plans = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
      setPricingPlans(plans);
    } catch (err) {
      console.error('Error loading pricing plans:', err);
    }
  };

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

  const addBook = async () => {
    if (!form.title.trim()) return alert('Please enter a title');
    if (!form.link.trim()) return alert('Please enter a link');

    setUploading(true);

    try {
      let downloadUrl = form.link.trim();
      if (downloadUrl.includes('drive.google.com/file/d/')) {
        downloadUrl = downloadUrl.replace(/\/view.*$/, '/preview');
      } else if (downloadUrl.includes('dropbox.com/')) {
        downloadUrl = downloadUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/\?dl=0$/, '');
      }

      await addDoc(collection(db, 'ebooks'), {
        title: form.title,
        author: form.author || 'Admin',
        subject: form.subject,
        emoji: form.emoji || '📚',
        size: 'Link',
        pages: 0,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        downloadUrl,
        teacherId: 'admin_global',
        teacherName: 'Admin',
        allowedPlans: form.allowedPlans,
        settings: {
          allowDownload: form.allowDownload,
          saveProgress: form.saveProgress,
          allowAnnotations: form.allowAnnotations
        },
        createdAt: serverTimestamp()
      });

      // Trigger notifications for all students
      await notifyStudentsForNewEbook(form.title, 'all');

      setShowForm(false);
      setForm({ title: '', author: '', subject: 'Math', emoji: '📚', link: '', allowDownload: false, saveProgress: true, allowAnnotations: true, allowedPlans: [] });
      await loadBooks();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  const deleteBook = async (id: string, storagePath?: string) => {
    if (!confirm('Delete this E-Book permanently?')) return;
    try {
      await deleteDoc(doc(db, 'ebooks', id));
      setBooks(books.filter(b => b.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const saveSettings = async (bookId: string, newSettings: any) => {
    try {
      await updateDoc(doc(db, 'ebooks', bookId), { settings: newSettings });
      setBooks(books.map(b => b.id === bookId ? { ...b, settings: newSettings } : b));
      setEditingSettings(null);
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Author</label>
                  <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="input-field" placeholder="Default: Admin" />
                </div>
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Subject</label>
                  <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field">
                    <option value="Math">Math</option>
                    <option value="R&W">Reading & Writing</option>
                    <option value="Both">Both</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Icon (Emoji)</label>
                  <input value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} className="input-field" placeholder="📚" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Google Drive Link *</label>
                <input type="url" value={form.link} onChange={e => setForm({...form, link: e.target.value})} className="input-field" placeholder="https://drive.google.com/file/d/..." />
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>Restrict to Subscription Plans</label>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>If no plans are selected, this book will be accessible to all users.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  {pricingPlans.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No pricing plans found.</div>
                  ) : pricingPlans.map(plan => (
                    <label key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={form.allowedPlans.includes(plan.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({...form, allowedPlans: [...form.allowedPlans, plan.id]});
                          } else {
                            setForm({...form, allowedPlans: form.allowedPlans.filter(p => p !== plan.id)});
                          }
                        }}
                        style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>{plan.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>E-Book Features & Settings</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.allowDownload} onChange={e => setForm({...form, allowDownload: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Allow Download</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Students can download the PDF file directly.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.saveProgress} onChange={e => setForm({...form, saveProgress: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Save Reading Progress</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Automatically resume from the last read page.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.allowAnnotations} onChange={e => setForm({...form, allowAnnotations: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Allow Drawing & Annotations</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Students can draw with a pen on pages.</div>
                    </div>
                  </label>
                </div>
              </div>

              <button 
                onClick={addBook}
                disabled={uploading || !form.title || !form.link}
                style={{ width: '100%', padding: '0.75rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: uploading || !form.title || !form.link ? 'not-allowed' : 'pointer', marginTop: '1rem', opacity: uploading || !form.title || !form.link ? 0.6 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />} 
                {uploading ? 'Saving...' : 'Add Link'}
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
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
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
                <span style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '0.25rem' }}>External Link</span>
                {book.teacherId === 'admin_global' ? (
                  <span style={{ padding: '0.2rem 0.5rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Globe size={10} /> Global (Admin)
                  </span>
                ) : (
                  <span style={{ padding: '0.2rem 0.5rem', background: '#fef08a', color: '#854d0e', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FileText size={10} /> {book.teacherName || 'Teacher'}
                  </span>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setViewingPdf(book)}
                  style={{ flex: 1, padding: '0.625rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Eye size={14} /> Preview
                </button>
                <button 
                  onClick={() => setEditingSettings(book)}
                  style={{ flex: 1, padding: '0.625rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Edit Settings
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="responsive-modal" style={{ width: '90%', maxWidth: '1200px', height: '90vh', background: '#fff', borderRadius: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#6366f1" /> Admin Preview
              </h3>
              <button onClick={() => setViewingPdf(null)} style={{ background: '#e2e8f0', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
              <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <PdfViewer 
                  url={viewingPdf.downloadUrl || ''} 
                  ebookId={viewingPdf.id}
                  studentId="admin_preview"
                  allowAnnotations={viewingPdf.settings?.allowAnnotations ?? true}
                  saveProgress={false}
                />
              </div>
          </div>
        </div>
      )}

      {/* Edit Settings Modal */}
      {editingSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)' }}>
          <div style={{ width: '100%', maxWidth: '500px', background: '#fff', borderRadius: '1rem', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Edit Features</h3>
              <button onClick={() => setEditingSettings(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editingSettings.settings?.allowDownload ?? true} onChange={e => setEditingSettings({...editingSettings, settings: {...(editingSettings.settings as any), allowDownload: e.target.checked}})} style={{ width: '18px', height: '18px' }} />
                <div><div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>Allow Download</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>Students can download the PDF file directly.</div></div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editingSettings.settings?.saveProgress ?? true} onChange={e => setEditingSettings({...editingSettings, settings: {...(editingSettings.settings as any), saveProgress: e.target.checked}})} style={{ width: '18px', height: '18px' }} />
                <div><div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>Save Progress</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>Automatically resume from the last read page.</div></div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editingSettings.settings?.allowAnnotations ?? true} onChange={e => setEditingSettings({...editingSettings, settings: {...(editingSettings.settings as any), allowAnnotations: e.target.checked}})} style={{ width: '18px', height: '18px' }} />
                <div><div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>Allow Annotations</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>Students can draw with a pen on pages.</div></div>
              </label>
            </div>
            <button 
              onClick={() => saveSettings(editingSettings.id, editingSettings.settings)}
              style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', marginTop: '2rem', cursor: 'pointer' }}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
