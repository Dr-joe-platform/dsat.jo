"use client";

import React, { useEffect, useState } from 'react';
import { LATEX_DELIMITERS } from '@/components/AnnotatableText';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, ChevronDown, RefreshCw, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getUserResults, getTestById, getMiniQuizById, TestResult } from '@/lib/db';
import { ALL_TEST_QUESTIONS, DSATQuestion } from '@/lib/questions-data';
import { explainQuestionAction } from '@/app/actions/ai-tutor';
import Latex from 'react-latex-next';
import WhiteboardStep from '@/components/WhiteboardStep';

interface WrongQuestion {
  id: string;
  testId: string;
  testName: string;
  question: DSATQuestion | null;
  date: string;
  userAnswer?: string;
}

export default function WrongAnswersPage() {
  const { appUser } = useAuth();
  const [wrongQs, setWrongQs] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (testName: string) => {
    setCollapsedGroups(prev => ({ ...prev, [testName]: !prev[testName] }));
  };

  const fetchExplanation = async (wq: WrongQuestion) => {
    if (!wq.question) return;
    
    if (wq.question.explanation) {
      const expl = wq.question.explanation;
      setExplanations(prev => ({ ...prev, [wq.id]: expl }));
      return;
    }

    setLoadingExplanation(prev => ({ ...prev, [wq.id]: true }));
    try {
      const groqKey = localStorage.getItem('groq_api_key') || '';
      const optionsText = wq.question.options ? wq.question.options.map((o:any, i:number) => `${String.fromCharCode(65+i)}) ${o}`).join('\n') : "Student Produced Response";
      const res = await explainQuestionAction(wq.question.text, optionsText, groqKey);
      
      if (res.success) {
        setExplanations(prev => ({ ...prev, [wq.id]: res.data! }));
      } else {
        setExplanations(prev => ({ ...prev, [wq.id]: `Error: ${res.error}` }));
      }
    } catch (err) {
      console.error(err);
      setExplanations(prev => ({ ...prev, [wq.id]: "An unexpected error occurred." }));
    } finally {
      setLoadingExplanation(prev => ({ ...prev, [wq.id]: false }));
    }
  };

  useEffect(() => {
    if (!appUser?.uid) return;
    const loadQuestions = async () => {
      try {
        const { getAllAvailableQuestions } = await import('@/lib/questions-pool');
        const results = await getUserResults(appUser.uid);
        const questions: WrongQuestion[] = [];
        const seen = new Set<string>();

        // Pre-build a map of ALL possible questions the user has access to
        const allAvailableQs = await getAllAvailableQuestions(appUser.uid, appUser.subject);
        const allQuestionsMap = new Map<string, DSATQuestion>();
        allAvailableQs.forEach(q => allQuestionsMap.set(q.id, q));

        // Add static mock tests as a fallback
        Object.values(ALL_TEST_QUESTIONS).forEach(td => {
          ['M1', 'M2H', 'M2E', 'MATH_M1', 'MATH_M2H', 'MATH_M2E'].forEach(mod => {
            const qs = td[mod as keyof typeof td];
            if (qs && Array.isArray(qs)) {
              qs.forEach(q => allQuestionsMap.set(q.id, q as DSATQuestion));
            }
          });
        });

        // Add custom tests that might have been deleted but are in results
        const customTestIds = new Set<string>();
        results.forEach(r => {
          if (r.testId && r.testId !== 'question_bank' && !ALL_TEST_QUESTIONS[r.testId as keyof typeof ALL_TEST_QUESTIONS]) {
            customTestIds.add(r.testId);
          }
        });

        const customTestsMap = new Map<string, any>();
        for (const tid of customTestIds) {
          try {
            const t = await getTestById(tid);
            if (t && (t as any).content) {
              const parsed = JSON.parse((t as any).content);
              const tData: any = { M1: [], M2H: [], MATH_M1: [], MATH_M2H: [] };
              const isFull = (t as any).subject === 'Full' || (t as any).subject === 'Mixed';
              
              parsed.forEach((q: any) => {
                const qid = q.id || `custom-${Math.random()}`;
                const formattedQ: DSATQuestion = {
                  id: qid,
                  module: q.module || 1,
                  difficulty: q.difficulty || 'Medium',
                  domain: q.domain || 'General',
                  skill: q.skill || 'General',
                  text: q.question || '',
                  passage: q.passage || undefined,
                  passageName: q.passageName || undefined,
                  passageStartLine: q.passageStartLine || undefined,
                  imageUrl: q.imageUrl || q.image || undefined,
                  options: q.options && q.options.length > 0 ? q.options : undefined,
                  correctAnswer: q.correctAnswer || (q.options ? ['A','B','C','D'][q.answer || 0] : ''),
                  explanation: q.explanation || '',
                  type: (q.type === 'MCQ' || q.type === 'MC' || (q.options && q.options.length > 0)) ? 'MC' : 'SPR'
                };
                allQuestionsMap.set(qid, formattedQ);
                
                if (isFull) {
                  if (q.module === 'M1') tData.M1.push(formattedQ);
                  else if (q.module === 'M2H' || q.module === 'M2E' || q.module === 'M2') tData.M2H.push(formattedQ);
                  else if (q.module === 'MATH_M1') tData.MATH_M1.push(formattedQ);
                  else if (q.module === 'MATH_M2H' || q.module === 'MATH_M2') tData.MATH_M2H.push(formattedQ);
                  else tData.M1.push(formattedQ);
                } else {
                  if (String(q.module).includes('1') || String(q.module).toUpperCase().includes('M1')) tData.M1.push(formattedQ);
                  else if (String(q.module).includes('2') || String(q.module).toUpperCase().includes('M2')) tData.M2H.push(formattedQ);
                  else tData.M1.push(formattedQ);
                }
              });
              customTestsMap.set(tid, tData);
            } else {
              const mq = await getMiniQuizById(tid);
              if (mq) {
                const m1: any[] = [];
                (mq.questions || []).forEach((q: any, i: number) => {
                  const qid = `mini-${tid}-${i}`;
                  const formattedMq: DSATQuestion = {
                    id: qid,
                    module: q.module || 1,
                    difficulty: q.difficulty || 'Medium',
                    text: q.question,
                    domain: 'General',
                    skill: 'General',
                    options: q.options && q.options.length > 0 && q.options.some((o: string) => o.trim()) ? q.options : undefined,
                    correctAnswer: q.options && q.options.length > 0 && q.options.some((o: string) => o.trim()) ? ['A','B','C','D'][q.answer || 0] : q.answer,
                    type: q.options && q.options.length > 0 && q.options.some((o: string) => o.trim()) ? 'MC' : 'SPR'
                  };
                  allQuestionsMap.set(qid, formattedMq);
                  m1.push(formattedMq);
                });
                customTestsMap.set(tid, { M1: m1 });
              }
            }
          } catch (e) { console.error(e); }
        }

        results.forEach(r => {
          r.wrongQuestionIds?.forEach(qid => {
            if (seen.has(qid)) return;
            seen.add(qid);
            
            const found = allQuestionsMap.get(qid);
            if (!found) return; // Ignore missing questions instead of showing "Content not found"
            
            let userAnswer: string | undefined;
            const testData = ALL_TEST_QUESTIONS[r.testId as keyof typeof ALL_TEST_QUESTIONS] || customTestsMap.get(r.testId);
            
            if (testData) {
              const modules = ['M1', 'M2H', 'M2E', 'MATH_M1', 'MATH_M2H', 'MATH_M2E'] as const;
              for (const mod of modules) {
                const qs = testData[mod as keyof typeof testData];
                if (qs && Array.isArray(qs)) {
                  const idx = qs.findIndex((q: any) => q.id === qid);
                  if (idx !== -1) {
                    userAnswer = (r as any).answers?.[mod]?.[idx] || (r as any).sprAnswers?.[`spr${mod}`]?.[idx];
                    break;
                  }
                }
              }
            }
            
            questions.push({
              id: qid,
              testId: r.testId,
              testName: r.testName || 'Practice Test',
              question: found,
              date: r.completedAt?.toDate?.()?.toLocaleDateString?.() ?? '',
              userAnswer,
            });
          });
        });
        
        setWrongQs(questions);
        setLoading(false);
      } catch (err) {
        console.error("Error loading wrong questions:", err);
        setLoading(false);
      }
    };
    loadQuestions();
  }, [appUser?.uid]);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Wrong Answers</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Questions you got wrong — review them to improve</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#ef4444', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : wrongQs.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertTriangle size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#475569', fontWeight: '700', marginBottom: '0.5rem' }}>No wrong answers yet!</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Perfect score! Or you haven't taken a test yet.
          </p>
          <Link href="/dashboard/practice" style={{ padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
            Take a Practice Test
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{wrongQs.length} questions to review</span>
            <Link href="/dashboard/practice" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>
              <RefreshCw size={13} /> Retake test
            </Link>
          </div>
          {Object.entries(wrongQs.reduce((acc, wq) => {
            if (!acc[wq.testName]) acc[wq.testName] = [];
            acc[wq.testName].push(wq);
            return acc;
          }, {} as Record<string, WrongQuestion[]>)).map(([testName, questions]) => (
            <div key={testName} style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div 
                onClick={() => toggleGroup(testName)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              >
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <div style={{ width: '4px', height: '1.25rem', backgroundColor: '#6366f1', borderRadius: '4px' }} />
                  {testName} <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{questions.length}</span>
                </h2>
                <div style={{ color: '#94a3b8', transition: 'transform 0.2s', transform: collapsedGroups[testName] ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                  <ChevronDown size={20} />
                </div>
              </div>
              
              {!collapsedGroups[testName] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                  {questions.map((wq, i) => (
            <div key={i} className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {wq.testName} &nbsp;&bull;&nbsp; {wq.date} &nbsp;&bull;&nbsp; Q: {wq.id}
                </div>
                {wq.question && (
                  <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.1rem 0.5rem', borderRadius: '1rem',
                    background: wq.question.difficulty === 'Hard' ? '#fee2e2' : wq.question.difficulty === 'Medium' ? '#fef3c7' : '#dcfce7',
                    color: wq.question.difficulty === 'Hard' ? '#dc2626' : wq.question.difficulty === 'Medium' ? '#d97706' : '#16a34a',
                  }}>
                    {wq.question.difficulty}
                  </span>
                )}
              </div>
              {wq.question ? (
                <>
                  {wq.question.passage && (
                    <div style={{ padding: '1rem', background: '#f8fafc', borderLeft: '4px solid #94a3b8', marginBottom: '1rem', fontSize: '0.875rem', lineHeight: '1.6', color: '#334155', borderRadius: '0 0.5rem 0.5rem 0' }}>
                      <Latex delimiters={LATEX_DELIMITERS} strict={false}>{wq.question.passage}</Latex>
                    </div>
                  )}
                  <p style={{ color: '#0f172a', fontSize: '0.875rem', lineHeight: '1.65', marginBottom: '1rem', fontWeight: wq.question.passage ? '700' : '400' }}>
                    <Latex delimiters={LATEX_DELIMITERS} strict={false}>{wq.question.text}</Latex>
                  </p>
                  {wq.question.imageUrl && (
                    <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                      <img src={wq.question.imageUrl} alt="Question figure" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}
                  {wq.question.type === 'MC' && wq.question.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {wq.question.options.map((opt, oi) => {
                        const letter = 'ABCD'[oi];
                        const isCorrect = letter === wq.question!.correctAnswer;
                        const isStudentAnswer = letter === wq.userAnswer;
                        
                        let bgColor = '#f8fafc';
                        let borderColor = '#f1f5f9';
                        let textColor = '#475569';
                        let letterColor = '#94a3b8';
                        
                        if (isCorrect) {
                          bgColor = '#dcfce7';
                          borderColor = '#86efac';
                          textColor = '#166534';
                          letterColor = '#16a34a';
                        } else if (isStudentAnswer) {
                          bgColor = '#fee2e2';
                          borderColor = '#fca5a5';
                          textColor = '#991b1b';
                          letterColor = '#dc2626';
                        }

                        return (
                          <div key={oi} style={{
                            padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                            background: bgColor,
                            border: `1px solid ${borderColor}`,
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                          }}>
                            <span style={{ fontWeight: '700', fontSize: '0.78rem', color: letterColor, flexShrink: 0 }}>{letter}.</span>
                            <span style={{ fontSize: '0.82rem', color: textColor, display: 'flex', alignItems: 'center' }}>
                              {(opt.trim().startsWith('http') && !opt.trim().includes(' ')) ? (
                                <img src={opt.trim()} alt="Option image" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', objectFit: 'contain' }} />
                              ) : (
                                <Latex delimiters={LATEX_DELIMITERS} strict={false}>{opt}</Latex>
                              )}
                            </span>
                            {isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#16a34a', fontWeight: '700' }}>✓ Correct</span>}
                            {isStudentAnswer && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#dc2626', fontWeight: '700' }}>✗ Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {wq.question.type === 'SPR' && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Correct Answer:</span>
                        <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '700' }}>{wq.question.correctAnswer}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Your Answer:</span>
                        <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '700' }}>{wq.userAnswer || '(None)'}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* AI Explanation Section */}
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                    {explanations[wq.id] ? (
                      <WhiteboardStep explanationText={explanations[wq.id]} />
                    ) : (
                      <button 
                        onClick={() => fetchExplanation(wq)}
                        disabled={loadingExplanation[wq.id]}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', cursor: loadingExplanation[wq.id] ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loadingExplanation[wq.id] ? 0.7 : 1 }}
                      >
                        {loadingExplanation[wq.id] ? <Loader2 size={15} className="animate-spin" /> : <Bot size={15} />}
                        {loadingExplanation[wq.id] ? 'Analyzing question...' : 'Explain with AI Tutor ✨'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', border: '1px solid #fca5a5' }}>
                  <strong>Content not found!</strong><br />
                  Please tell me: <br />
                  Question ID: <code>{wq.id}</code><br />
                  Test ID: <code>{wq.testId}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
            </div>
          ))}
  </div>
)}
    </div>
  );
}

