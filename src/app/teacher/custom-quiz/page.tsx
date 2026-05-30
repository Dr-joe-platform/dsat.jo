"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTestBanks, AdminTestBank, createTestBank } from '@/lib/db';
import { Search, Filter, Plus, Trash2, CheckCircle, Save, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface ParsedQuestion {
  id: string;
  type: 'MCQ' | 'SPR';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  domain?: string;
  skill?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  sourceTestName?: string;
}

export default function CustomQuizBuilderPage() {
  const { appUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<ParsedQuestion[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  
  // Selection
  const [selectedQuestions, setSelectedQuestions] = useState<ParsedQuestion[]>([]);
  
  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (appUser?.uid) loadQuestions();
  }, [appUser]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const tests = await getTestBanks(appUser!.uid, 'teacher', appUser!.teacherSubject);
      
      const extracted: ParsedQuestion[] = [];
      tests.forEach(test => {
        if (test.content) {
          try {
            const parsed = JSON.parse(test.content);
            if (Array.isArray(parsed)) {
              parsed.forEach(q => {
                extracted.push({
                  ...q,
                  sourceTestName: test.name
                });
              });
            }
          } catch(e) { console.error("Failed to parse test content for", test.name) }
        }
      });
      setAllQuestions(extracted);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const domains = Array.from(new Set(allQuestions.map(q => q.domain).filter(Boolean))) as string[];

  const filteredQuestions = allQuestions.filter(q => {
    if (search && !q.question?.toLowerCase().includes(search.toLowerCase()) && !q.id?.toLowerCase().includes(search.toLowerCase())) return false;
    if (domainFilter && q.domain !== domainFilter) return false;
    if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  const toggleSelection = (q: ParsedQuestion) => {
    if (selectedQuestions.some(sq => sq.id === q.id)) {
      setSelectedQuestions(prev => prev.filter(sq => sq.id !== q.id));
    } else {
      setSelectedQuestions(prev => [...prev, q]);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizName.trim()) return alert("Please enter a quiz name.");
    if (selectedQuestions.length === 0) return alert("Please select at least 1 question.");
    
    setIsSaving(true);
    try {
      await createTestBank({
        name: quizName,
        subject: appUser!.teacherSubject || 'Mixed',
        questions: selectedQuestions.length,
        difficulty: 'Mixed',
        source: 'Custom Quiz Builder',
        isPublic: false,
        createdBy: appUser!.uid,
        teacherId: appUser!.uid,
        teacherName: appUser!.displayName || 'Teacher',
        content: JSON.stringify(selectedQuestions)
      });
      alert("Custom quiz saved successfully! You can now assign it to your classes.");
      setShowSaveModal(false);
      setQuizName('');
      setSelectedQuestions([]);
    } catch (err: any) {
      alert("Failed to save quiz: " + err.message);
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader2 size={36} className="lucide-spin" color="#6366f1" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      
      {/* Left: Question Bank */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Global Question Bank</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select questions from previous tests to build a custom quiz.</p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="Search questions..." 
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}>
              <option value="">All Domains</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}>
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
          {filteredQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No questions found.</div>
          ) : (
            filteredQuestions.map((q, i) => {
              const isSelected = selectedQuestions.some(sq => sq.id === q.id);
              return (
                <div key={i} style={{ background: '#fff', padding: '1.25rem', borderRadius: '0.75rem', border: `1px solid ${isSelected ? '#6366f1' : '#e2e8f0'}`, boxShadow: isSelected ? '0 0 0 1px #6366f1' : '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <button 
                    onClick={() => toggleSelection(q)}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSelected ? '#6366f1' : '#cbd5e1'}`, background: isSelected ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: '0.25rem' }}
                  >
                    {isSelected && <CheckCircle size={14} color="#fff" />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', background: '#f1f5f9', color: '#475569', borderRadius: '0.25rem' }}>{q.type}</span>
                      {q.difficulty && <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', background: q.difficulty === 'hard' ? '#fee2e2' : q.difficulty === 'medium' ? '#fef3c7' : '#dcfce7', color: q.difficulty === 'hard' ? '#dc2626' : q.difficulty === 'medium' ? '#d97706' : '#16a34a', borderRadius: '0.25rem' }}>{q.difficulty}</span>}
                      {q.domain && <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#4f46e5', borderRadius: '0.25rem' }}>{q.domain}</span>}
                      {q.sourceTestName && <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', marginLeft: 'auto' }}>Source: {q.sourceTestName}</span>}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {q.question}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right: Selected Quiz Summary */}
      <div style={{ width: '350px', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="#6366f1" /> Custom Quiz
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>{selectedQuestions.length} questions selected</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {selectedQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0', fontSize: '0.85rem' }}>No questions selected yet. Click the circles on the left to add questions.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedQuestions.map((q, i) => (
                <div key={i} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.8rem', color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: '0.5rem' }}>
                    {i+1}. {q.question}
                  </div>
                  <button onClick={() => toggleSelection(q)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <button 
            disabled={selectedQuestions.length === 0}
            onClick={() => setShowSaveModal(true)}
            style={{ width: '100%', padding: '0.875rem', background: selectedQuestions.length > 0 ? '#10b981' : '#cbd5e1', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', border: 'none', cursor: selectedQuestions.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Save size={18} /> Save Custom Quiz
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Save Custom Quiz</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Quiz Name</label>
              <input 
                type="text" 
                placeholder="e.g. Weekend Math Drill"
                value={quizName}
                onChange={e => setQuizName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowSaveModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', borderRadius: '0.5rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveQuiz} disabled={isSaving || !quizName.trim()} style={{ flex: 1, padding: '0.75rem', background: '#6366f1', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', border: 'none', cursor: isSaving || !quizName.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {isSaving ? <Loader2 size={16} className="lucide-spin" /> : <Save size={16} />} Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
