"use client";

import React, { useState, useEffect } from 'react';
import { Library, Upload, Trash2, Download, Eye, Plus, X, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTeacherClasses, ClassModel, EbookSettings, notifyStudentsForNewEbook } from '@/lib/db';
import ImageUploader from '@/components/ImageUploader';
import PdfViewer from '@/components/PdfViewer';

interface Ebook {
  id: string;
  title: string;
  author: string;
  subject: string;
  link: string;
  size: string;
  emoji: string;
  uploadedAt: string;
  downloadUrl: string;
  storagePath?: string;
  teacherId: string;
  coverUrl?: string;
  settings?: EbookSettings;
  classIds?: string[];
}

export default function TeacherEbooksPage() {
  const { appUser } = useAuth();
  const [books, setBooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<Ebook | null>(null);
  const [editingSettings, setEditingSettings] = useState<Ebook | null>(null);
  const [editSelectedClasses, setEditSelectedClasses] = useState<string[]>([]);
  const [form, setForm] = useState({ title: '', author: '', subject: 'Math', emoji: '📚', link: '', coverUrl: '', allowDownload: false, saveProgress: true, allowAnnotations: true });
  const [teacherClasses, setTeacherClasses] = useState<ClassModel[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  useEffect(() => {
    if (appUser?.uid) {
      loadBooks();
      getTeacherClasses(appUser.uid).then(setTeacherClasses).catch(console.error);
    }
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
        author: form.author || appUser!.displayName || 'Teacher',
        subject: form.subject,
        emoji: form.emoji || '📚',
        size: 'Link',
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        downloadUrl,
        teacherId: appUser!.uid,
        coverUrl: form.coverUrl || '',
        classIds: selectedClasses,
        settings: {
          allowDownload: form.allowDownload,
          saveProgress: form.saveProgress,
          allowAnnotations: form.allowAnnotations
        },
        createdAt: serverTimestamp()
      });

      // Notify selected classes
      await notifyStudentsForNewEbook(form.title, selectedClasses, appUser?.displayName || 'Your Teacher', true);

      setForm({ title: '', author: '', subject: 'Math', emoji: '📚', link: '', coverUrl: '', allowDownload: false, saveProgress: true, allowAnnotations: true });
      setSelectedClasses([]);
      setShowForm(false);
      loadBooks();
    } catch (err: any) {
      console.error(err);
      alert('Error saving link: ' + err.message);
    }
    setUploading(false);
  };

  const handleDelete = async (book: Ebook) => {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'ebooks', book.id));
      loadBooks();
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  const saveSettings = async (bookId: string, newSettings: any, newClasses: string[]) => {
    try {
      await updateDoc(doc(db, 'ebooks', bookId), { settings: newSettings, classIds: newClasses });
      setBooks(books.map(b => b.id === bookId ? { ...b, settings: newSettings, classIds: newClasses } : b));
      setEditingSettings(null);
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Library size={22} color="#6366f1" /> E-Book Manager
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Add external PDF links (e.g., Google Drive) for your students.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={15} /> Add E-Book
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
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Author / Source</label>
              <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="input-field" placeholder={`Default: ${appUser?.displayName || 'Teacher'}`} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Subject</label>
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field">
                {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both' || appUser.teacherSubject === 'Math') && <option>Math</option>}
                {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both' || appUser.teacherSubject === 'English') && <option>English</option>}
                {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both') && <option>Both</option>}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Google Drive Link *</label>
              <input type="url" value={form.link} onChange={e => setForm({...form, link: e.target.value})} className="input-field" placeholder="https://drive.google.com/file/d/..." />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
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

            <div style={{ gridColumn: '1/-1', marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>Assign to Classes</label>
              {teacherClasses.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                  You don't have any classes yet. Book will be hidden until assigned.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {teacherClasses.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: selectedClasses.includes(c.id) ? '#eff6ff' : '#fff', border: selectedClasses.includes(c.id) ? '1px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedClasses.includes(c.id)} 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedClasses(prev => [...prev, c.id]);
                          else setSelectedClasses(prev => prev.filter(id => id !== c.id));
                        }}
                        style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{c.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ gridColumn: '1/-1', marginTop: '1rem' }}>
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
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Automatically resume from the last read page (requires direct PDF link).</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.allowAnnotations} onChange={e => setForm({...form, allowAnnotations: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Allow Drawing & Annotations</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Students can draw with a pen on pages (requires direct PDF link).</div>
                  </div>
                </label>
              </div>
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
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading e-books...</div>
      ) : books.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          <Library size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <p>No e-books added yet. Click "Add E-Book" to get started.</p>
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
                <span style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: '700', color: '#475569' }}>{book.subject}</span>
                <span style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: '700', color: '#475569' }}>External Link</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{book.uploadedAt}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setViewingPdf(book)}
                  style={{ flex: 1, padding: '0.5rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                  <Eye size={13} /> View
                </button>
                <button 
                  onClick={() => {
                    setEditingSettings(book);
                    setEditSelectedClasses(book.classIds || []);
                  }}
                  style={{ flex: 1, padding: '0.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Settings
                </button>
                <button onClick={() => handleDelete(book)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', background: '#fff0f0', color: '#ef4444', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '90%', maxWidth: '1200px', height: '90vh', background: '#fff', borderRadius: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#6366f1" /> Teacher Preview
              </h3>
              <button onClick={() => setViewingPdf(null)} style={{ background: '#e2e8f0', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <PdfViewer 
                url={viewingPdf.downloadUrl || ''} 
                ebookId={viewingPdf.id}
                studentId="teacher_preview"
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
          <div style={{ width: '100%', maxWidth: '500px', background: '#fff', borderRadius: '1rem', padding: '2rem', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Edit Features</h3>
              <button onClick={() => setEditingSettings(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
            </div>

            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>Assign to Classes</label>
            {teacherClasses.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1', marginBottom: '1.5rem' }}>
                You don't have any classes yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {teacherClasses.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: editSelectedClasses.includes(c.id) ? '#eff6ff' : '#fff', border: editSelectedClasses.includes(c.id) ? '1px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input 
                      type="checkbox" 
                      checked={editSelectedClasses.includes(c.id)} 
                      onChange={(e) => {
                        if (e.target.checked) setEditSelectedClasses(prev => [...prev, c.id]);
                        else setEditSelectedClasses(prev => prev.filter(id => id !== c.id));
                      }}
                      style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{c.name}</span>
                  </label>
                ))}
              </div>
            )}

            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>Settings</label>
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
              onClick={() => saveSettings(editingSettings.id, editingSettings.settings, editSelectedClasses)}
              style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', marginTop: '2rem', cursor: 'pointer' }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
