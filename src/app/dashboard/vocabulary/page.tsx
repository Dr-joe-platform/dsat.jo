"use client";

import React, { useEffect, useState } from 'react';
import { Book, Trophy, BookOpen, Settings, Eye, Search, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getUserVocabulary, deleteVocabWord, VocabWord } from '@/lib/db';
import Link from 'next/link';

export default function VocabularyPage() {
  const { appUser } = useAuth();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchWords = async () => {
    if (!appUser?.uid) return;
    try {
      const fetched = await getUserVocabulary(appUser.uid);
      setWords(fetched);
    } catch (err) {
      console.error("Failed to load vocabulary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
    const handleUpdate = () => fetchWords();
    window.addEventListener('vocab-updated', handleUpdate);
    return () => window.removeEventListener('vocab-updated', handleUpdate);
  }, [appUser]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteVocabWord(id);
      setWords(words.filter(w => w.id !== id));
    } catch (err) {
      console.error("Failed to delete word", err);
    }
  };

  const filteredWords = words.filter(w => w.word.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Book size={28} /> Vocabulary
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Build your vocabulary by selecting any word while practicing!
        </p>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', backgroundColor: '#ffffff', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Trophy size={20} color="#0f172a" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>Offered by Admins</h2>
          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: '600', padding: '0.125rem 0.5rem', borderRadius: '1rem' }}>1 lists</span>
        </div>

        <div style={{ display: 'inline-flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>SAT Core Vocabulary</span>
            <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.7rem', fontWeight: '600', padding: '0.125rem 0.5rem', borderRadius: '1rem' }}>5 words</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>The most important words for the SAT</p>
          <Link href="/dashboard/flashcards" style={{ textDecoration: 'none' }}>
            <button style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#0f172a', border: 'none', borderRadius: '0.5rem', color: '#ffffff', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.2s' }}>
              <BookOpen size={16} /> Study
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <div style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={18} color="#6366f1" /> My Vocabulary ({words.length})
        </div>
        {words.length > 0 && (
          <Link href="/dashboard/flashcards?deck=my-vocabulary" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              Study Flashcards
            </button>
          </Link>
        )}
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your vocabulary..." 
          style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#0f172a', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem', color: '#6366f1' }} />
          Loading your vocabulary...
        </div>
      ) : filteredWords.length === 0 ? (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', backgroundColor: '#ffffff', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
            <BookOpen size={64} strokeWidth={1} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
            {search ? 'No matches found' : 'Your Vocabulary is Empty'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '400px' }}>
            {search ? 'Try searching for a different word.' : 'Highlight any word in the dashboard to instantly add it to your personal vocabulary using AI!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filteredWords.map((w) => (
            <div key={w.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => handleDelete(w.id)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
              >
                <Trash2 size={16} />
              </button>
              
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', paddingRight: '2rem' }}>
                {w.word}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: '600', padding: '0.5rem', background: '#dcfce7', borderRadius: '0.375rem', display: 'inline-block', width: 'fit-content' }}>
                {w.definition}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', borderLeft: '3px solid #6366f1' }}>
                "{w.example}"
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
