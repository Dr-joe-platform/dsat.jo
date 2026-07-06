"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Play, ChevronDown, Calculator, Book, BarChart, Clock, Target, CheckSquare, Flag, BookOpen, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

import { useResults } from '@/lib/hooks/useResults';
import { getAllAvailableQuestions } from '@/lib/questions-pool';
import { DSATQuestion } from '@/lib/questions-data';

export default function QuestionBankPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  const { results } = useResults();
  
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [expandedMath, setExpandedMath] = useState(false);
  const [expandedRW, setExpandedRW] = useState(false);

  // Unified Pool State
  const [fullPool, setFullPool] = useState<DSATQuestion[]>([]);
  const [loadingPool, setLoadingPool] = useState(true);

  React.useEffect(() => {
    async function loadPool() {
      if (!appUser?.uid) return;
      try {
        const questions = await getAllAvailableQuestions(appUser.uid, appUser.subject);
        setFullPool(questions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPool(false);
      }
    }
    loadPool();
  }, [appUser]);
  
  const toggleFilter = (state: string[], setter: any, val: string) => {
    if (state.includes(val)) setter(state.filter(x => x !== val));
    else setter([...state, val]);
  };

  const getCounts = () => {
    // 1. Calculate user history
    const correctSet = new Set<string>();
    const incorrectSet = new Set<string>();
    const skippedSet = new Set<string>();
    results.forEach(r => {
      (r.correctQuestionIds || []).forEach(qId => correctSet.add(qId));
      (r.wrongQuestionIds || []).forEach(qId => incorrectSet.add(qId));
      (r.unansweredQuestionIds || []).forEach(qId => skippedSet.add(qId));
    });

    // 2. Build full pool
    let pool = [...fullPool];

    // Remove duplicates
    const seen = new Set();
    pool = pool.filter(q => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    });

    // 3. Apply difficulty
    if (difficulty.length > 0) {
      pool = pool.filter(q => difficulty.includes(q.difficulty));
    }

    // 4. Apply status
    if (status.length > 0) {
      pool = pool.filter(q => {
        const isSkipped = skippedSet.has(q.id);
        const isCorrect = correctSet.has(q.id);
        const isIncorrect = incorrectSet.has(q.id);
        if (status.includes('Skipped') && isSkipped) return true;
        if (status.includes('Correct') && isCorrect) return true;
        if (status.includes('Incorrect') && isIncorrect) return true;
        return false;
      });
    }

    const mathQs = pool.filter(q => q._subject === 'Math');
    const rwQs = pool.filter(q => q._subject === 'Reading&Writing');

    return { 
      math: mathQs.length, 
      rw: rwQs.length, 
      total: pool.length,
      mathDomainCounts: {
        algebra: mathQs.filter(q => q.domain === 'Algebra').length,
        advanced: mathQs.filter(q => q.domain === 'Advanced Math').length,
        geometry: mathQs.filter(q => q.domain?.includes('Geometry') || q.domain?.includes('Trigonometry')).length,
        data: mathQs.filter(q => q.domain?.includes('Data')).length,
      },
      rwDomainCounts: {
        info: rwQs.filter(q => q.domain === 'Information and Ideas').length,
        craft: rwQs.filter(q => q.domain === 'Craft and Structure').length,
        expression: rwQs.filter(q => q.domain === 'Expression of Ideas').length,
        standard: rwQs.filter(q => q.domain === 'Standard English Conventions').length,
      }
    };
  };

  const counts = getCounts();

  const startSession = (topic?: string, blitz = false) => {
    const params = new URLSearchParams();
    if (topic) params.set('topic', topic);
    if (difficulty.length) params.set('difficulty', difficulty.join(','));
    if (status.length) params.set('status', status.join(','));
    if (blitz) params.set('mode', 'blitz');
    
    // Navigate to dynamic question bank session
    router.push(`/test/question_bank?${params.toString()}`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Question Bank</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Your personal <strong>Past Questions Vault</strong>. This bank automatically populates with questions from exams, mock tests, and AI quizzes <em>after</em> you solve them. Use this tool to drill past mistakes and review skipped questions!
          </p>
        </div>
      </div>

      {loadingPool && (
        <div style={{ padding: '1rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
          Loading unified question bank pool...
        </div>
      )}

      {/* NEW FEATURE: Timed Challenge (Blitz Mode) */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '1rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={32} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Blitz Mode</h3>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', background: '#f59e0b', color: '#78350f', padding: '0.1rem 0.4rem', borderRadius: '1rem', letterSpacing: '0.05em' }}>NEW</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>10 random questions. 8 minutes on the clock. Go fast, stay accurate.</p>
          </div>
        </div>
        <button 
          onClick={() => startSession(undefined, true)}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: '#f59e0b', color: '#78350f', fontWeight: '800', fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Play size={16} fill="currentColor" /> Start Challenge
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Custom Filters</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Adjust these filters, then drill down by subject below.</p>
        </div>
        <button 
          onClick={() => { setDifficulty([]); setStatus([]); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}
        >
          <RefreshCw size={16} /> Reset Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
        {/* Difficulty */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: '#475569', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            <BarChart size={16} /> DIFFICULTY
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['Easy', 'Medium', 'Hard'].map(d => (
              <button 
                key={d} 
                onClick={() => toggleFilter(difficulty, setDifficulty, d)}
                style={{ padding: '0.375rem 1rem', borderRadius: '2rem', border: `1px solid ${difficulty.includes(d) ? '#0f172a' : '#cbd5e1'}`, backgroundColor: difficulty.includes(d) ? '#0f172a' : '#ffffff', color: difficulty.includes(d) ? '#ffffff' : '#334155', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Answered Status */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: '#475569', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            <CheckSquare size={16} /> STATUS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['Correct', 'Incorrect', 'Skipped'].map(s => (
              <button 
                key={s} 
                onClick={() => toggleFilter(status, setStatus, s)}
                style={{ padding: '0.375rem 1rem', borderRadius: '2rem', border: `1px solid ${status.includes(s) ? '#0f172a' : '#cbd5e1'}`, backgroundColor: status.includes(s) ? '#0f172a' : '#ffffff', color: status.includes(s) ? '#ffffff' : '#334155', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>MATCHING QUESTIONS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{counts.total.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Browse by Subject</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Math Subject */}
        {(!appUser?.subject || appUser?.subject === 'math' || appUser?.subject === 'both') && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <Calculator size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>Math</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{counts.math.toLocaleString()} questions from past exams</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => setExpandedMath(!expandedMath)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}>
                <ChevronDown size={20} style={{ transform: expandedMath ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              <button 
                onClick={() => startSession('Math')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <Play size={14} fill="currentColor" /> Start Math
              </button>
            </div>
          </div>
          {expandedMath && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Algebra</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{counts.mathDomainCounts.algebra} q's</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Advanced Math</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{counts.mathDomainCounts.advanced} q's</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Geometry & Trigonometry</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{counts.mathDomainCounts.geometry} q's</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Problem-Solving and Data Analysis</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{counts.mathDomainCounts.data} q's</span>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Reading & Writing Subject */}
        {(!appUser?.subject || appUser?.subject === 'english' || appUser?.subject === 'both') && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>Reading & Writing</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{counts.rw.toLocaleString()} questions from past exams</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => setExpandedRW(!expandedRW)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}>
                <ChevronDown size={20} style={{ transform: expandedRW ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              <button 
                onClick={() => startSession('Reading&Writing')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <Play size={14} fill="currentColor" /> Start R&W
              </button>
            </div>
          </div>
          {expandedRW && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Information and Ideas</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{counts.rwDomainCounts.info} q's</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Craft and Structure</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{counts.rwDomainCounts.craft} q's</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Expression of Ideas</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{counts.rwDomainCounts.expression} q's</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Standard English Conventions</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{counts.rwDomainCounts.standard} q's</span>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
