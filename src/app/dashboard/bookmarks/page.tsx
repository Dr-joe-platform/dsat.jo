"use client";

import React, { useEffect, useState } from 'react';
import { LATEX_DELIMITERS } from '@/components/AnnotatableText';
import Link from 'next/link';
import { BookMarked, Trash2, ArrowRight, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getBookmarks, removeBookmark, Bookmark } from '@/lib/db';
import { ALL_TEST_QUESTIONS, DSATQuestion } from '@/lib/questions-data';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function BookmarksPage() {
  const { appUser } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [explaining, setExplaining] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!appUser?.uid) return;
    getBookmarks(appUser.uid).then(b => {
      // Create a lookup map for fallback options
      const allQuestionsMap = new Map<string, DSATQuestion>();
      Object.values(ALL_TEST_QUESTIONS).forEach(td => {
        (['M1', 'M2H', 'M2E'] as const).forEach(mod => {
          td[mod]?.forEach(q => allQuestionsMap.set(q.id, q));
        });
      });

      // Enrich bookmarks with missing options from predefined tests
      const enrichedBookmarks = b.map(bm => {
        if (!bm.options || bm.options.length === 0) {
          const fallback = allQuestionsMap.get(bm.questionId);
          if (fallback && fallback.options) {
            return { ...bm, options: fallback.options };
          }
        }
        return bm;
      });
      
      setBookmarks(enrichedBookmarks);
      setLoading(false);
    });
  }, [appUser?.uid]);

  const handleRemove = async (bm: Bookmark) => {
    setRemoving(bm.questionId);
    await removeBookmark(appUser!.uid, bm.questionId);
    setBookmarks(prev => prev.filter(b => b.questionId !== bm.questionId));
    setRemoving(null);
  };

  const handleExplain = async (bm: Bookmark) => {
    if (bm.explanation) {
      setExplanations(prev => ({ ...prev, [bm.id]: bm.explanation! }));
      return;
    }
    
    if (explanations[bm.id]) return; // Already have it

    setExplaining(bm.id);
    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: bm.questionText,
          options: bm.options,
          correctAnswer: bm.correctAnswer,
        })
      });
      const data = await res.json();
      if (data.explanation) {
        setExplanations(prev => ({ ...prev, [bm.id]: data.explanation }));
      }
    } catch (err) {
      console.error(err);
    }
    setExplaining(null);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Bookmarks</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Questions you saved while taking tests</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BookMarked size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#475569', fontWeight: '700', marginBottom: '0.5rem' }}>No bookmarks yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            During a test, click the Bookmark icon on any question to save it here.
          </p>
          <Link href="/dashboard/practice" style={{ padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
            Take a Practice Test
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>{bookmarks.length} saved question{bookmarks.length > 1 ? 's' : ''}</div>
          {bookmarks.map(bm => (
            <div key={bm.id} className="stat-card" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                    Test: {bm.testId} &nbsp;&bull;&nbsp; Q: {bm.questionId}
                  </div>
                  
                  {/* Question Text */}
                  <div style={{ color: '#0f172a', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1rem' }} className="dsat-question-text">
                    <Latex delimiters={LATEX_DELIMITERS} strict={false}>{bm.questionText || bm.questionId}</Latex>
                  </div>
                  
                  {/* Options */}
                  {bm.options && bm.options.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', marginTop: '1rem' }}>
                      {bm.options.map((opt, i) => {
                        const isCorrect = String.fromCharCode(65 + i) === bm.correctAnswer;
                        return (
                          <div 
                            key={i} 
                            style={{ 
                              padding: '0.75rem 1rem', 
                              border: isCorrect ? '2px solid #22c55e' : '1px solid #e2e8f0', 
                              borderRadius: '0.5rem',
                              background: isCorrect ? '#f0fdf4' : '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem'
                            }}
                          >
                            <span style={{ 
                              width: '24px', height: '24px', 
                              borderRadius: '50%', 
                              background: isCorrect ? '#22c55e' : '#e2e8f0', 
                              color: isCorrect ? '#fff' : '#64748b', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              fontWeight: '700', fontSize: '0.8rem', flexShrink: 0 
                            }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <div style={{ fontSize: '0.9rem', color: isCorrect ? '#166534' : '#334155' }}>
                              {opt.includes('<table') ? <div dangerouslySetInnerHTML={{ __html: opt }} /> : <Latex delimiters={LATEX_DELIMITERS} strict={false}>{opt}</Latex>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Correct Answer explicitly (in case there are no options e.g. SPR) */}
                  {(!bm.options || bm.options.length === 0) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Correct answer:</span>
                      <span style={{ padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '0.375rem', fontSize: '0.9rem', fontWeight: '800' }}>
                        {bm.correctAnswer}
                      </span>
                    </div>
                  )}

                  {/* Explanation Section */}
                  {explanations[bm.id] ? (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#6366f1', fontWeight: '700', fontSize: '0.85rem' }}>
                        <Sparkles size={16} /> AI Explanation
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }} className="dsat-question-text">
                        <Latex delimiters={LATEX_DELIMITERS} strict={false}>{explanations[bm.id]}</Latex>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleExplain(bm)}
                      disabled={explaining === bm.id}
                      style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: '#fff', color: '#6366f1', 
                        border: '1px solid #c7d2fe', borderRadius: '0.5rem', 
                        fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
                        marginTop: bm.options && bm.options.length > 0 ? '0' : '0.5rem'
                      }}
                    >
                      {explaining === bm.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageCircle size={16} />}
                      {explaining === bm.id ? 'Generating...' : 'Explain with AI'}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleRemove(bm)}
                  disabled={removing === bm.questionId}
                  title="Remove bookmark"
                  style={{ padding: '0.5rem', border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
