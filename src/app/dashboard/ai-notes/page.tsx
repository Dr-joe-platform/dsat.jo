"use client";

import React, { useState, useEffect } from 'react';
import { LATEX_DELIMITERS } from '@/components/AnnotatableText';
import { FileText, Sparkles, Plus, Trash2, Download, Copy, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Latex from 'react-latex-next';

export default function AiNotesPage() {
  const { appUser } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [printingNoteId, setPrintingNoteId] = useState<number | null>(null);
  const printingNote = notes.find(n => n.id === printingNoteId);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dsat_ai_notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved notes', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dsat_ai_notes', JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const generateNote = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    
    try {
      const res = await fetch('/api/ai-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      const newNote = {
        id: Date.now(),
        topic,
        subject: data.subject || 'General',
        generated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        content: data.content || 'Failed to generate content.'
      };
      
      setNotes(prev => [newNote, ...prev]);
      setExpanded(newNote.id);
      setTopic('');
    } catch (err) {
      console.error(err);
      alert('Failed to generate study notes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Notes copied to clipboard!');
  };

  const handleDownload = (note: any) => {
    setPrintingNoteId(note.id);
    setExpanded(note.id);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintingNoteId(null), 500);
    }, 300);
  };

  if (!isLoaded) return null;

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sidebar, .top-nav { display: none !important; }
          .main-content { height: auto !important; overflow: visible !important; }
          main { padding: 0 !important; overflow: visible !important; }
          .no-print { display: none !important; }
          .print-header { display: flex !important; }
          
          /* Hide the generate card and header */
          .page-header, .generate-card { display: none !important; }
          
          /* Hide notes that are NOT being printed */
          .note-card { display: none !important; }
          .note-card.printing { display: block !important; border: none !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          
          /* Hide the copy/download buttons inside the printed note */
          .note-actions { display: none !important; }
          .note-header-actions { display: none !important; }
          
          /* Hide the accordion header during print to keep it clean */
          .note-accordion-header { display: none !important; }
          
          /* Style the actual note text beautifully for print */
          .note-content { 
            background: white !important; 
            color: black !important; 
            font-size: 11pt !important; 
            line-height: 1.8 !important; 
            padding: 0 !important; 
            border: none !important; 
            font-family: Georgia, "Times New Roman", Times, serif !important;
          }
        }
        .print-header { display: none; }
      `}</style>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Print-only Header */}
        <div className="print-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid #000' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: '#000', borderRadius: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>D</div>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#000', letterSpacing: '-0.5px' }}>DSAT.JO</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#000', marginTop: '1rem', lineHeight: '1.2' }}>
              {printingNote?.topic || 'AI Study Notes'}
            </h1>
            {printingNote && (
              <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                Subject: {printingNote.subject}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', color: '#000', fontSize: '1rem' }}>{appUser?.displayName || 'Student'}</div>
            <div style={{ fontSize: '0.875rem', color: '#475569' }}>{appUser?.email}</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} color="#6366f1" /> AI Study Notes
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Auto-generated study notes for any SAT topic.</p>
        </div>

        {/* Generate */}
        <div className="stat-card generate-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #c4b5fd' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={16} color="#6d28d9" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#4c1d95' }}>Generate New Notes</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateNote()}
            placeholder="e.g. Algebra basics, Evidence-based questions, Transitions..."
            className="input-field"
            style={{ flex: 1 }}
          />
          <button
            onClick={generateNote}
            disabled={!topic.trim() || generating}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem', background: generating ? '#c4b5fd' : '#6d28d9', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', cursor: generating ? 'default' : 'pointer', whiteSpace: 'nowrap' }}
          >
            {generating ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><Plus size={15} /> Generate</>}
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>You haven't generated any study notes yet.</p>
          </div>
        )}
        {notes.map(note => (
          <div key={note.id} className={`stat-card note-card ${printingNoteId === note.id ? 'printing' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
            <div
              className="note-accordion-header"
              onClick={() => setExpanded(expanded === note.id ? null : note.id)}
              style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: expanded === note.id ? '1px solid #f1f5f9' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: note.subject === 'Math' ? '#dbeafe' : note.subject === 'R&W' ? '#f3e8ff' : '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color={note.subject === 'Math' ? '#1d4ed8' : note.subject === 'R&W' ? '#7c3aed' : '#6d28d9'} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem' }}>{note.topic}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Generated {note.generated}</div>
                </div>
              </div>
              <div className="note-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={e => { e.stopPropagation(); setNotes(prev => prev.filter(n => n.id !== note.id)); }} style={{ padding: '0.25rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
                <ChevronDown size={14} color="#94a3b8" style={{ transform: expanded === note.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </div>
            </div>

            {expanded === note.id && (
              <div style={{ padding: '1.25rem' }}>
                <div className="note-content" style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '1.25rem', fontSize: '0.875rem', color: '#334155', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  <Latex delimiters={LATEX_DELIMITERS} strict={false}>{note.content}</Latex>
                </div>
                <div className="note-actions" style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem' }}>
                  <button onClick={() => handleCopy(note.content)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#fff', color: '#475569', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <Copy size={12} /> Copy
                  </button>
                  <button onClick={() => handleDownload(note)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#fff', color: '#475569', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </>
  );
}
