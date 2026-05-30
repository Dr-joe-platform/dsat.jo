"use client";

import React, { useState, useEffect } from 'react';
import { Library, Download, Eye, FileText, BookOpen, Search, Filter } from 'lucide-react';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

interface Ebook {
  id: string;
  title: string;
  author: string;
  subject: string;
  pages: number;
  size: string;
  emoji: string;
  downloadUrl: string;
}

const subjectColor = (s: string) => {
  if (s === 'Math') return { bg: '#dbeafe', color: '#1d4ed8' };
  if (s === 'R&W') return { bg: '#f3e8ff', color: '#7c3aed' };
  if (s === 'Both') return { bg: '#dcfce7', color: '#166534' };
  return { bg: '#f1f5f9', color: '#475569' };
};

const coverGradient = (s: string) => {
  if (s === 'Math') return 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
  if (s === 'R&W') return 'linear-gradient(135deg, #4c1d95, #8b5cf6)';
  if (s === 'Both') return 'linear-gradient(135deg, #064e3b, #10b981)';
  return 'linear-gradient(135deg, #0f172a, #475569)';
};

export default function EbooksPage() {
  const { appUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'ebooks'));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ebook));
        
        // Filter out ebooks not matching student's subject if needed
        const filtered = data.filter(b => {
          if (!appUser?.subject || appUser.subject === 'both') return true;
          if (b.subject === 'General' || b.subject === 'Both') return true;
          if (appUser.subject === 'math') return b.subject === 'Math';
          if (appUser.subject === 'english') return b.subject === 'R&W' || b.subject === 'Reading & Writing' || b.subject === 'English';
          return true;
        });
        setEbooks(filtered);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    if (appUser) loadData();
  }, [appUser]);

  const filteredBooks = ebooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || book.subject === category;
    return matchesSearch && matchesCategory;
  });

  const handleAction = (action: string, title: string) => {
    alert(`${action} feature for "${title}" is coming soon!`);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Library size={28} color="#6366f1" /> E-Book Library
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Browse, preview, and download premium study materials.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: '#fff', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search books by title, author, or keyword..." 
            className="input-field" 
            style={{ paddingLeft: '3rem', width: '100%', height: '3rem', fontSize: '0.95rem' }} 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', width: '200px' }}>
          <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <select 
            className="input-field" 
            style={{ width: '100%', height: '3rem', paddingLeft: '2.5rem', cursor: 'pointer', appearance: 'none', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="All">All Subjects</option>
            <option value="Math">Math Only</option>
            <option value="R&W">R&W Only</option>
            <option value="Both">Full Tests</option>
            <option value="General">General Guides</option>
          </select>
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Books grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading E-Books...</div>
      ) : filteredBooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>No books found</h3>
          <p style={{ color: '#64748b' }}>Try adjusting your search terms or category filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredBooks.map((book) => {
            const sc = subjectColor(book.subject);
            return (
              <div key={book.id} className="stat-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Cover */}
                <div style={{
                  background: coverGradient(book.subject),
                  height: '180px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '1.5rem', position: 'relative', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>{book.emoji || '📘'}</div>
                  <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', lineHeight: '1.3', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {book.title}
                  </div>
                  {/* Decorative faint icon */}
                  <BookOpen size={100} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', bottom: '-20px', right: '-20px', transform: 'rotate(-15deg)' }} />
                </div>
                
                {/* Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: sc.bg, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{book.subject}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}><FileText size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>{book.pages} pages</span>
                  </div>
                  
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem' }}>By {book.author}</p>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>{book.description}</p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <a 
                      href={book.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ flex: 1, padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', textDecoration: 'none', transition: 'all 0.2s' }}
                    >
                      <Eye size={14} /> View
                    </a>
                    <a 
                      href={book.downloadUrl}
                      download
                      style={{ flex: 1, padding: '0.625rem', background: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', textDecoration: 'none', transition: 'all 0.2s' }}
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
