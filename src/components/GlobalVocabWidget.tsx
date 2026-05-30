"use client";

import React, { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { addVocabWord } from '@/lib/db';

export default function GlobalVocabWidget() {
  const { appUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [adding, setAdding] = useState(false);

  if (!appUser) return null;

  const handleManualAdd = async () => {
    if (!newWord.trim() || !appUser?.uid) return;
    setAdding(true);
    try {
      const res = await fetch('/api/define-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await addVocabWord(appUser.uid, newWord.trim(), data.definition, data.example);
      
      setShowAddModal(false);
      setNewWord('');
      
      // Optionally trigger an event to refresh vocabulary page if the user is currently on it
      window.dispatchEvent(new Event('vocab-updated'));
    } catch (err) {
      alert("Failed to fetch definition or add word.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div 
        onClick={() => setShowAddModal(true)}
        className="no-print"
        style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          right: '2rem', 
          width: '56px', 
          height: '56px', 
          backgroundColor: '#0f172a', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#ffffff', 
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.4)', 
          cursor: 'pointer', 
          zIndex: 40, 
          transition: 'transform 0.2s' 
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <BookOpen size={24} />
      </div>

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#0f172a' }}>Add Word Manually</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>Enter an English word and the AI will fetch the Arabic definition and an example sentence.</p>
            
            <input 
              type="text" 
              placeholder="e.g. Meticulous" 
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              disabled={adding}
              onKeyDown={(e) => { if (e.key === 'Enter') handleManualAdd(); }}
              style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1.5rem', fontSize: '1rem', outline: 'none' }}
              autoFocus
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                disabled={adding}
                style={{ padding: '0.625rem 1rem', border: 'none', background: 'transparent', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleManualAdd}
                disabled={adding || !newWord.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', color: '#fff', fontWeight: '600', cursor: adding || !newWord.trim() ? 'not-allowed' : 'pointer', opacity: adding || !newWord.trim() ? 0.7 : 1 }}
              >
                {adding && <Loader2 size={16} className="animate-spin" />}
                {adding ? 'Fetching AI...' : 'Generate & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
