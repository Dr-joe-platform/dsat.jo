"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { LATEX_DELIMITERS } from '@/components/AnnotatableText';
import { Star, ChevronLeft, ChevronRight, RotateCcw, Check, X, BookOpen, Layers, Zap, Trophy, Wand2, Loader2 } from 'lucide-react';
import { getFlashcardSets, FlashcardSet, getUserVocabulary } from '@/lib/db';
import Latex from 'react-latex-next';
import { useAuth } from '@/lib/auth-context';
import { useSearchParams } from 'next/navigation';

const SUBJECT_THEMES: Record<string, { gradient: string; light: string; color: string; emoji: string }> = {
  Vocabulary:      { gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)', light: '#f3e8ff', color: '#7c3aed', emoji: '📚' },
  Math:            { gradient: 'linear-gradient(135deg,#2563eb,#3b82f6)', light: '#dbeafe', color: '#2563eb', emoji: '📐' },
  'Literary Terms':{ gradient: 'linear-gradient(135deg,#db2777,#ec4899)', light: '#fce7f3', color: '#db2777', emoji: '✍️' },
  Science:         { gradient: 'linear-gradient(135deg,#059669,#10b981)', light: '#dcfce7', color: '#059669', emoji: '🔬' },
  Reading:         { gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', light: '#fef3c7', color: '#d97706', emoji: '📖' },
};
const DEFAULT_THEME = { gradient: 'linear-gradient(135deg,#475569,#64748b)', light: '#f1f5f9', color: '#475569', emoji: '🃏' };

export default function FlashcardsPage() {
  const [sets, setSets]           = useState<FlashcardSet[]>([]);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [current, setCurrent]     = useState(0);
  const [flipped, setFlipped]     = useState(false);
  const [known, setKnown]         = useState<Set<number>>(new Set());
  const [unknown, setUnknown]     = useState<Set<number>>(new Set());
  const [loading, setLoading]     = useState(true);
  const [animating, setAnimating] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const { appUser } = useAuth();
  const searchParams = useSearchParams();
  const requestedDeck = searchParams?.get('deck');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedSets = await getFlashcardSets();
        
        // If coming from Vocabulary page, fetch and inject the Vocab deck
        if (appUser?.uid && requestedDeck === 'my-vocabulary') {
          const vocab = await getUserVocabulary(appUser.uid);
          if (vocab.length > 0) {
            const vocabDeck: FlashcardSet = {
              id: 'my-vocabulary',
              title: 'My Vocabulary',
              subject: 'Vocabulary',
              cards: vocab.map(v => ({
                front: v.word,
                back: v.definition,
                example: v.example
              }))
            };
            fetchedSets.unshift(vocabDeck);
          }
        }
        
        setSets(fetchedSets);
        if (fetchedSets.length > 0) {
          // Default to the requested deck if it exists, otherwise the first one
          const defaultId = requestedDeck === 'my-vocabulary' ? 'my-vocabulary' : fetchedSets[0].id;
          setActiveSetId(defaultId);
        }
      } catch (err) {
        console.error("Failed to load decks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appUser, requestedDeck]);

  const activeSet = sets.find(s => s.id === activeSetId) || null;
  const cards     = activeSet?.cards || [];
  const total     = cards.length;
  const theme     = SUBJECT_THEMES[activeSet?.subject || ''] || DEFAULT_THEME;

  useEffect(() => { setCurrent(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); }, [activeSetId]);

  const navigate = useCallback((dir: 1 | -1) => {
    if (total === 0 || animating) return;
    setAnimating(true);
    setFlipped(false);
    setTimeout(() => {
      setCurrent(c => (c + dir + total) % total);
      setAnimating(false);
    }, 200);
  }, [total, animating]);

  const markKnown = () => {
    if (total === 0) return;
    setKnown(prev => new Set([...prev, current]));
    setUnknown(prev => { const s = new Set(prev); s.delete(current); return s; });
    const newKnown = known.size + 1;
    if (newKnown === total) { setCelebrate(true); setTimeout(() => setCelebrate(false), 3000); }
    navigate(1);
  };

  const markUnknown = () => {
    if (total === 0) return;
    setUnknown(prev => new Set([...prev, current]));
    setKnown(prev => { const s = new Set(prev); s.delete(current); return s; });
    navigate(1);
  };

  const reset = () => {
    setFlipped(false);
    setCurrent(0);
    setKnown(new Set());
    setUnknown(new Set());
  };

  const generateAiDeck = async () => {
    if (!appUser?.uid) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch('/api/generate-personal-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: appUser.uid })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }
      
      const newDeck: FlashcardSet = {
        id: 'ai-personal-deck-' + Date.now(),
        title: 'My Weakness Review',
        subject: 'Custom',
        cards: data.cards,
        createdBy: appUser.uid
      };
      
      setSets(prev => [newDeck, ...prev]);
      setActiveSetId(newDeck.id);
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const card        = cards[current];
  const isKnown     = known.has(current);
  const isUnknown   = unknown.has(current);
  const reviewedPct = total > 0 ? Math.round(((known.size + unknown.size) / total) * 100) : 0;
  const masteryPct  = total > 0 ? Math.round((known.size / total) * 100) : 0;

  return (
    <div style={{ maxWidth: '860px', animation: 'fadeInUp 0.4s ease' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardFlip { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(180deg)} }
        @keyframes confettiBurst { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(2.5) rotate(45deg);opacity:0} }
        @keyframes celebratePop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        .flip-card { perspective: 1200px; }
        .flip-inner {
          position: relative;
          width: 100%;
          transition: transform 0.55s cubic-bezier(0.4,0.2,0.2,1);
          transform-style: preserve-3d;
        }
        .flip-inner.is-flipped { transform: rotateY(180deg); }
        .flip-face {
          position: absolute; top:0; left:0; width:100%; height:100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 1.5rem;
        }
        .flip-back { transform: rotateY(180deg); }
        .deck-card { transition: all 0.2s ease; cursor: pointer; }
        .deck-card:hover { transform: translateY(-2px); }
        .nav-btn { transition: all 0.2s ease; }
        .nav-btn:hover { transform: scale(1.08); }
        .action-btn { transition: all 0.2s ease; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .progress-dot { transition: all 0.25s ease; cursor: pointer; }
        .progress-dot:hover { transform: scaleY(2); }
        .celebrate-banner {
          animation: celebratePop 0.5s ease forwards;
          position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(135deg,#0f172a,#1e293b);
          color: #fff; padding: 1rem 2rem; border-radius: 2rem;
          font-weight: 800; font-size: 1rem; z-index: 9999;
          display: flex; align-items: center; gap: 0.75rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          white-space: nowrap;
        }
      `}</style>

      {/* Celebrate banner */}
      {celebrate && (
        <div className="celebrate-banner">
          <Trophy size={20} color="#f59e0b" />
          🎉 You've mastered all cards in this deck!
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🃏</span> Flashcards
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Flip through cards — mark what you know and keep learning.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          {/* AI Generation Button */}
          <button
            onClick={generateAiDeck}
            disabled={generating}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #4f46e5, #c026d3)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '700', cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1, boxShadow: '0 4px 12px rgba(192, 38, 211, 0.25)' }}
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {generating ? 'Analyzing Mistakes...' : 'Generate from Mistakes'}
          </button>

          {/* Stats pills */}
          {total > 0 && (
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#dcfce7', color: '#166534', padding: '0.375rem 0.875rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '700' }}>
                <Check size={13} /> {known.size} Known
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#fee2e2', color: '#991b1b', padding: '0.375rem 0.875rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '700' }}>
                <X size={13} /> {unknown.size} Learning
              </div>
            </div>
          )}
        </div>
      </div>

      {genError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1rem', borderRadius: '0.875rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
          {genError}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading decks…</span>
        </div>
      ) : total === 0 && sets.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <BookOpen size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#475569', fontWeight: '700', marginBottom: '0.5rem' }}>No flashcard decks found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Decks will appear here once they're added.</p>
        </div>
      ) : (
        <>
          {/* ── Progress bar ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span style={{ fontWeight: '600' }}>Card {current + 1} of {total}</span>
              <span style={{ display: 'flex', gap: '1rem' }}>
                <span><span style={{ fontWeight: '700', color: '#0f172a' }}>{reviewedPct}%</span> reviewed</span>
                <span><span style={{ fontWeight: '700', color: '#22c55e' }}>{masteryPct}%</span> mastered</span>
              </span>
            </div>
            {/* Segment dots */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {cards.map((_, i) => (
                <div
                  key={i}
                  className="progress-dot"
                  onClick={() => { setFlipped(false); setCurrent(i); }}
                  style={{
                    flex: 1, height: i === current ? '8px' : '5px', borderRadius: '4px',
                    background: known.has(i) ? '#22c55e' : unknown.has(i) ? '#ef4444' : i === current ? theme.color : '#e2e8f0',
                    boxShadow: i === current ? `0 0 8px ${theme.color}55` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── 3D Flip Card ── */}
          <div className="flip-card" style={{ width: '100%', height: '340px', marginBottom: '1.25rem' }}>
            <div className={`flip-inner ${flipped ? 'is-flipped' : ''}`} style={{ height: '340px' }}>

              {/* Front */}
              <div
                className="flip-face"
                onClick={() => setFlipped(true)}
                style={{
                  background: '#ffffff',
                  border: `2px solid ${isKnown ? '#86efac' : isUnknown ? '#fca5a5' : '#e2e8f0'}`,
                  boxShadow: isKnown ? '0 8px 30px rgba(34,197,94,0.12)' : isUnknown ? '0 8px 30px rgba(239,68,68,0.1)' : '0 8px 30px rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '2.5rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none',
                }}
              >
                {/* Subject badge */}
                <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '2rem', background: theme.light, color: theme.color }}>
                    {theme.emoji} {activeSet?.subject}
                  </span>
                </div>
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Layers size={11} /> Tap to reveal
                </div>

                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Term</div>
                <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', lineHeight: '1.2' }}>
                  <Latex delimiters={LATEX_DELIMITERS} strict={false}>{card?.front || ''}</Latex>
                </div>

                {/* Status indicator */}
                {(isKnown || isUnknown) && (
                  <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem' }}>
                    {isKnown
                      ? <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={11} /> Known</span>
                      : <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><X size={11} /> Learning</span>
                    }
                  </div>
                )}
              </div>

              {/* Back */}
              <div
                className="flip-face flip-back"
                onClick={() => setFlipped(false)}
                style={{
                  background: 'linear-gradient(145deg,#0f172a 0%,#1e293b 60%,#0f2027 100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '2.5rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                    {theme.emoji} {activeSet?.subject}
                  </span>
                </div>
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontSize: '0.7rem', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RotateCcw size={10} /> Tap to flip back
                </div>

                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Definition</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff', lineHeight: '1.65', marginBottom: card?.example ? '1.25rem' : '0' }}>
                  <Latex delimiters={LATEX_DELIMITERS} strict={false}>{card?.back || ''}</Latex>
                </div>
                {card?.example && (
                  <div style={{ padding: '0.875rem 1.25rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.875rem', fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.6', maxWidth: '480px' }}>
                    <Zap size={12} style={{ display:'inline', marginRight:'0.375rem', color: '#f59e0b' }} />
                    <Latex delimiters={LATEX_DELIMITERS} strict={false}>{card.example}</Latex>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Controls ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.875rem' }}>
            {/* Still Learning */}
            <button
              className="action-btn"
              onClick={markUnknown}
              style={{ flex: 1, padding: '0.875rem', background: '#fff', border: '2px solid #fca5a5', borderRadius: '0.875rem', color: '#ef4444', fontWeight: '700', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <X size={16} /> Still Learning
            </button>

            {/* Nav */}
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button className="nav-btn" onClick={() => navigate(-1)} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <ChevronLeft size={17} />
              </button>
              <button className="nav-btn" onClick={reset} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <RotateCcw size={14} />
              </button>
              <button className="nav-btn" onClick={() => navigate(1)} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <ChevronRight size={17} />
              </button>
            </div>

            {/* Got It */}
            <button
              className="action-btn"
              onClick={markKnown}
              style={{ flex: 1, padding: '0.875rem', background: 'linear-gradient(135deg,#0f172a,#1e293b)', border: 'none', borderRadius: '0.875rem', color: '#fff', fontWeight: '700', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Check size={16} /> Got It!
            </button>
          </div>
        </>
      )}

      {/* ── Deck Selector ── */}
      {sets.length > 0 && (
        <div className="stat-card" style={{ marginTop: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BookOpen size={15} color="#6366f1" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' }}>Your Decks</h3>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>{sets.length} deck{sets.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem' }}>
            {sets.map((deck) => {
              const t = SUBJECT_THEMES[deck.subject] || DEFAULT_THEME;
              const isActive = deck.id === activeSetId;
              return (
                <div
                  key={deck.id}
                  className="deck-card"
                  onClick={() => setActiveSetId(deck.id)}
                  style={{
                    padding: '0.875rem',
                    border: `2px solid ${isActive ? t.color : '#e2e8f0'}`,
                    borderRadius: '0.75rem',
                    background: isActive ? t.light : '#fafafa',
                    textAlign: 'center',
                    boxShadow: isActive ? `0 4px 16px ${t.color}22` : 'none',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{t.emoji}</div>
                  <div style={{ fontWeight: '700', color: isActive ? t.color : '#0f172a', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{deck.title}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{deck.cards.length} cards</div>
                  {isActive && (
                    <div style={{ marginTop: '0.5rem', height: '3px', borderRadius: '2px', background: t.gradient }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
