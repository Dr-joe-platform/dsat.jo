"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { addVocabWord } from '@/lib/db';

export default function TextSelectionTooltip() {
  const { appUser } = useAuth();
  const [selection, setSelection] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Don't hide if clicking on the tooltip itself
      if ((e.target as HTMLElement).closest('#vocab-tooltip')) {
        return;
      }

      const sel = window.getSelection();
      const text = sel?.toString().trim();

      // Only show if text is selected, not too long (e.g. max 5 words / 40 chars), and is alphabetic
      if (text && text.length > 0 && text.length < 40 && /^[a-zA-Z\s\-]+$/.test(text)) {
        const range = sel!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelection(text);
        setPosition({
          top: rect.top + window.scrollY - 45, // above the selection
          left: rect.left + window.scrollX + (rect.width / 2)
        });
        setShow(true);
        setSuccess(false);
      } else {
        setShow(false);
      }
    };

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setShow(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleAddWord = async () => {
    if (!appUser?.uid || !selection) return;
    
    setLoading(true);
    try {
      // 1. Fetch AI definition
      const res = await fetch('/api/define-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: selection })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Add to database
      await addVocabWord(appUser.uid, selection, data.definition, data.example);
      
      setSuccess(true);
      setTimeout(() => {
        setShow(false);
        setSuccess(false);
        window.getSelection()?.removeAllRanges();
      }, 2000);
      
    } catch (err) {
      console.error("Failed to add word", err);
      alert("Failed to fetch definition or add word.");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !appUser) return null;

  return (
    <div
      id="vocab-tooltip"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#0f172a',
        color: '#fff',
        padding: '0.4rem 0.75rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem',
        fontWeight: '600',
        animation: 'fadeInUp 0.2s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
      
      {success ? (
        <>
          <Check size={14} color="#4ade80" /> Added to Vocab!
        </>
      ) : (
        <>
          <BookOpen size={14} color="#94a3b8" />
          <span>Add <strong>"{selection}"</strong></span>
          <button
            onClick={handleAddWord}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : '+'}
          </button>
        </>
      )}
    </div>
  );
}
