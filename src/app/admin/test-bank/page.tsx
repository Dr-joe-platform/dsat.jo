"use client";

import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Eye, Search, ChevronDown, ChevronUp, Edit, Loader2, X, FileText, UploadCloud } from 'lucide-react';
import { getTestBanks, toggleTestPublicStatus, deleteTestBank, AdminTestBank, addActivityLog, createTestBank } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { parseQuestionsCSV } from '@/lib/csv-parser';
import { parsePdfToQuestions } from '@/app/actions/parse-pdf';
import { useRef } from 'react';
import ImageUploader from '@/components/ImageUploader';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { EyeOff } from 'lucide-react';

const LATEX_DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '$', right: '$', display: false },
  { left: '\\(', right: '\\)', display: false },
  { left: '\\[', right: '\\]', display: true }
];


export default function TestBankPage() {
  const { appUser } = useAuth();
  const [tests, setTests] = useState<AdminTestBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  
  // Add Test Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTest, setNewTest] = useState({ name: '', subject: 'Math', questions: 44, source: 'Manual Entry' });
  const [isAdding, setIsAdding] = useState(false);
  const [fileType, setFileType] = useState<'pdf' | 'csv'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const file2Ref = useRef<HTMLInputElement>(null);
  
  // Preview State
  const [generatedQuestions, setGeneratedQuestions] = useState<any[] | null>(null);
  const [previewMode, setPreviewMode] = useState<Record<number, boolean>>({});

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await getTestBanks();
      setTests(data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadTests(); }, []);

  const filtered = tests.filter(t =>
    (!search || t.name.toLowerCase().includes(search.toLowerCase())) &&
    (!subjectFilter || t.subject === subjectFilter)
  );

  const togglePublic = async (id: string, currentPublic: boolean, name: string) => {
    const newStatus = !currentPublic;
    setTests(prev => prev.map(t => t.id === id ? { ...t, isPublic: newStatus } : t));
    await toggleTestPublicStatus(id, newStatus);
    await addActivityLog({ type: 'test', action: 'Test Visibility Changed', user: appUser?.email || 'Admin', details: `Test "${name}" made ${newStatus ? 'Public' : 'Private'}`, severity: 'info' });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely delete "${name}"? This action cannot be undone.`)) return;
    setTests(prev => prev.filter(t => t.id !== id));
    await deleteTestBank(id);
    await addActivityLog({ type: 'admin', action: 'Test Deleted', user: appUser?.email || 'Admin', details: `Deleted test: ${name}`, severity: 'error' });
  };

  const handleParseAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      let finalData: any[] = [];
      if (file) {
        if (fileType === 'pdf') {
          const groqKey = localStorage.getItem('groq_api_key') || undefined;
          if (!groqKey) throw new Error("GROQ API key is required for PDF parsing.");
          const form = new FormData();
          form.append('file', file);
          const res = await parsePdfToQuestions(form, groqKey);
          if (!res.success || !res.data) throw new Error(res.error || "Failed to parse PDF");
          finalData = res.data;
        } else {
          finalData = await parseQuestionsCSV(file);
          if (file2) {
             const data2 = await parseQuestionsCSV(file2);
             finalData = [...finalData, ...data2];
          }
        }
      }
      setGeneratedQuestions(finalData);
      setNewTest(prev => ({ ...prev, questions: finalData.length || prev.questions }));
    } catch (err: any) {
      console.error(err);
      alert('Failed to parse test: ' + err.message);
    }
    setIsAdding(false);
  };

  const handleFinalSave = async () => {
    setIsAdding(true);
    try {
      let finalQuestions = generatedQuestions || [];
      if (finalQuestions.length === 0) throw new Error("No questions to save.");

      const testData = {
        name: newTest.name,
        subject: newTest.subject,
        questions: finalQuestions.length || newTest.questions,
        difficulty: 'Mixed',
        source: newTest.source,
        isPublic: false,
        content: JSON.stringify(finalQuestions),
      };
      await createTestBank(testData);
      await addActivityLog({ type: 'admin', action: 'Test Created', user: appUser?.email || 'Admin', details: `Created test: ${newTest.name}`, severity: 'info' });
      await loadTests();
      setShowAddModal(false);
      setGeneratedQuestions(null); setPreviewMode({});
      setNewTest({ name: '', subject: 'Math', questions: 44, source: 'Manual Entry' });
      setFile(null);
      setFile2(null);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save test: ' + err.message);
    }
    setIsAdding(false);
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={22} color="#6366f1" /> Test Bank
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage all tests and question banks on the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/create-complete-test" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#6366f1', color: '#fff', textDecoration: 'none', borderRadius: '0.625rem', fontWeight: '700' }}>
            <FileText size={16} /> Create Full Exam
          </Link>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', cursor: 'pointer' }}>
            <Plus size={16} /> Add Test
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Tests', value: tests.length, color: '#6366f1' },
          { label: 'Total Questions', value: tests.reduce((s, t) => s + (Number(t.questions) || 0), 0), color: '#22c55e' },
          { label: 'Public Tests', value: tests.filter(t => t.isPublic).length, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.875rem', fontWeight: '900', color: s.color, marginBottom: '0.25rem' }}>
              {loading ? '—' : s.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Test Modal */}
      {showAddModal && generatedQuestions === null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Add New Test</h2>
            <form onSubmit={handleParseAndPreview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Test Name</label>
                <input type="text" required value={newTest.name} onChange={e => setNewTest({ ...newTest, name: e.target.value })} className="input-field" placeholder="e.g. DSAT Practice 4" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Subject</label>
                  <select value={newTest.subject} onChange={e => setNewTest({ ...newTest, subject: e.target.value })} className="input-field">
                    <option value="Math">Math</option>
                    <option value="English">English</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Questions</label>
                  <input type="number" required value={newTest.questions} onChange={e => setNewTest({ ...newTest, questions: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Time (Mins)</label>
                  <input type="number" value={(newTest as any).customTime || ''} onChange={e => setNewTest({ ...newTest, customTime: parseInt(e.target.value) || undefined } as any)} className="input-field" placeholder="Default" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Source / Notes</label>
                <input type="text" value={newTest.source} onChange={e => setNewTest({ ...newTest, source: e.target.value })} className="input-field" placeholder="e.g. Official CB 2024" />
              </div>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Upload Questions (Optional)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <select value={fileType} onChange={e => setFileType(e.target.value as any)} className="input-field" style={{ flex: 1 }}>
                    <option value="csv">CSV Import</option>
                    <option value="pdf">PDF Upload</option>
                  </select>
                </div>
                <input type="file" ref={fileRef} accept={fileType === 'pdf' ? '.pdf' : '.csv'} style={{ display: 'none' }} onChange={e => e.target.files && setFile(e.target.files[0])} />
                <button type="button" onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: fileType === 'csv' ? '0.5rem' : '0' }}>
                  <UploadCloud size={16} />
                  {file ? file.name : `Select ${fileType.toUpperCase()} file 1...`}
                </button>

                {fileType === 'csv' && (
                  <>
                    <input type="file" ref={file2Ref} accept=".csv" style={{ display: 'none' }} onChange={e => e.target.files && setFile2(e.target.files[0])} />
                    <button type="button" onClick={() => file2Ref.current?.click()} style={{ width: '100%', padding: '0.75rem', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                      <UploadCloud size={16} />
                      {file2 ? file2.name : `Select CSV file 2 (Optional)`}
                    </button>
                  </>
                )}

              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isAdding} style={{ flex: 1, padding: '0.75rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {isAdding ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Parse & Preview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Preview JSON Modal -> Replaced with Cards */}
      {showAddModal && generatedQuestions !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="stat-card" style={{ width: '90%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '1rem', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Preview & Edit: {newTest.name}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Edit individual questions below.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => { setGeneratedQuestions(null); setPreviewMode({}); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(() => {
                let currentModule = '';
                let moduleQuestionIndex = 0;
                return generatedQuestions.map((q, idx) => {
                  const mod = q.module || 'General';
                  const showHeader = mod !== currentModule;
                  if (showHeader) {
                    currentModule = mod as string;
                    moduleQuestionIndex = 1;
                  } else {
                    moduleQuestionIndex++;
                  }
                  const isPreview = previewMode[idx];

                  return (
                    <React.Fragment key={idx}>
                      {showHeader && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 0.5rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#334155', margin: 0 }}>{mod}</h3>
                          <div style={{ flex: 1, height: '2px', background: '#e2e8f0' }} />
                        </div>
                      )}
                      <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{ fontWeight: '800', color: '#0f172a' }}>
                            Question {moduleQuestionIndex} 
                            {q.module && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: '#f3e8ff', color: '#7e22ce', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>{q.module}</span>}
                            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: q.type === 'MCQ' ? '#dbeafe' : '#fce7f3', color: q.type === 'MCQ' ? '#1d4ed8' : '#be185d', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>{q.type}</span>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{q.domain} &gt; {q.skill} ({q.difficulty})</span>
                            <button 
                              onClick={() => setPreviewMode(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', background: isPreview ? '#e0e7ff' : '#fff', color: isPreview ? '#4338ca' : '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                              {isPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                              {isPreview ? 'Edit Mode' : 'Preview Math (LaTeX)'}
                            </button>
                          </div>
                        </div>
                        
                        {q.imageUrl && (
                          <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
                            <img src={q.imageUrl} alt="Question figure" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                            <button onClick={() => {
                              const newQs = [...generatedQuestions];
                              newQs[idx].imageUrl = undefined;
                              setGeneratedQuestions(newQs);
                            }} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              &times;
                            </button>
                          </div>
                        )}
                        {isPreview ? (
                          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', color: '#1e293b' }}>
                            {q.passage && (
                              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                                <Latex>{q.passage}</Latex>
                              </div>
                            )}
                            <div style={{ fontWeight: '600', marginBottom: '1rem' }}>
                              <Latex delimiters={LATEX_DELIMITERS} strict={false}>{q.question}</Latex>
                            </div>
                            
                            {q.type === 'MCQ' ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {q.options.map((opt: any, i: number) => {
                                  const letter = String.fromCharCode(65 + i);
                                  const isCorrect = letter === q.correctAnswer;
                                  return (
                                    <div key={i} style={{ padding: '0.75rem', background: isCorrect ? '#dcfce7' : '#fff', border: isCorrect ? '1px solid #86efac' : '1px solid #e2e8f0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{ fontWeight: '700', color: isCorrect ? '#16a34a' : '#64748b' }}>{letter}.</span>
                                      <span style={{ color: isCorrect ? '#166534' : '#334155' }}><Latex delimiters={LATEX_DELIMITERS} strict={false}>{opt}</Latex></span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '0.5rem' }}>
                                <span style={{ fontWeight: '700', color: '#16a34a' }}>Correct Answer:</span>
                                <span style={{ color: '#166534', fontWeight: '600' }}>{q.correctAnswer}</span>
                              </div>
                            )}
                            
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
                              <strong style={{ color: '#0f172a' }}>Explanation:</strong> <br/>
                              <Latex>{q.explanation || ''}</Latex>
                            </div>
                          </div>
                        ) : (
                          <>
                            <textarea
                              value={q.passage || ''}
                              onChange={(e) => {
                                const newQs = [...generatedQuestions];
                                newQs[idx].passage = e.target.value;
                                setGeneratedQuestions(newQs);
                              }}
                              style={{ width: '100%', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#334155', border: '1px solid #94a3b8', minHeight: '80px', resize: 'vertical' }}
                              placeholder="Passage (optional). Use $math$ for inline LaTeX and $$math$$ for block."
                            />
                            
                            <textarea
                              value={q.question}
                              onChange={(e) => {
                                const newQs = [...generatedQuestions];
                                newQs[idx].question = e.target.value;
                                setGeneratedQuestions(newQs);
                              }}
                              style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1rem', minHeight: '80px', resize: 'vertical', fontSize: '0.95rem' }}
                              placeholder="Question Text. Use LaTeX syntax."
                            />
                            
                            {q.type === 'MCQ' && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                {q.options.map((opt: any, i: number) => {
                                  const letter = String.fromCharCode(65 + i);
                                  const isCorrect = letter === q.correctAnswer;
                                  return (
                                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                      <input 
                                        type="radio" 
                                        checked={isCorrect} 
                                        onChange={() => {
                                          const newQs = [...generatedQuestions];
                                          newQs[idx].correctAnswer = letter;
                                          setGeneratedQuestions(newQs);
                                        }}
                                        style={{ width: '1.25rem', height: '1.25rem' }}
                                      />
                                      <input
                                        value={opt}
                                        onChange={(e) => {
                                          const newQs = [...generatedQuestions];
                                          newQs[idx].options[i] = e.target.value;
                                          setGeneratedQuestions(newQs);
                                        }}
                                        style={{ flex: 1, padding: '0.75rem', background: isCorrect ? '#dcfce7' : '#f8fafc', border: isCorrect ? '1px solid #86efac' : '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#0f172a' }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {q.type === 'SPR' && (
                              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Correct Answer (SPR): </span>
                                <input
                                  value={q.correctAnswer}
                                  onChange={(e) => {
                                    const newQs = [...generatedQuestions];
                                    newQs[idx].correctAnswer = e.target.value;
                                    setGeneratedQuestions(newQs);
                                  }}
                                  style={{ flex: 1, padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#0f172a' }}
                                />
                              </div>
                            )}

                            <textarea
                              value={q.explanation || ''}
                              onChange={(e) => {
                                const newQs = [...generatedQuestions];
                                newQs[idx].explanation = e.target.value;
                                setGeneratedQuestions(newQs);
                              }}
                              style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #94a3b8', minHeight: '60px', resize: 'vertical', fontSize: '0.85rem' }}
                              placeholder="Explanation (Optional)"
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                              <ImageUploader 
                                onUpload={(url) => {
                                  const newQs = [...generatedQuestions];
                                  newQs[idx].imageUrl = url;
                                  setGeneratedQuestions(newQs);
                                }} 
                                buttonText={q.imageUrl ? "Replace Image" : "Attach Image to Question"}
                                style={{ background: '#f1f5f9' }}
                              />
                              <button onClick={() => {
                                const newQs = [...generatedQuestions];
                                newQs.splice(idx, 1);
                                setGeneratedQuestions(newQs);
                              }} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <Trash2 size={14} /> Remove Question
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
            </div>

            <div style={{ padding: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => { setGeneratedQuestions(null); setPreviewMode({}); }} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}>Back to Files</button>
              <button onClick={handleFinalSave} disabled={isAdding} style={{ padding: '0.75rem 1.5rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isAdding && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />} Finalize & Save Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem' }} />
          </div>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="input-field" style={{ width: 'auto' }}>
            <option value="">All Subjects</option>
            <option value="Math">Math</option>
            <option value="English">English</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.875rem' }}>Loading tests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <Database size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p style={{ fontWeight: '600' }}>No tests found in Firestore</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['Test Name', 'Subject', 'Questions', 'Source', 'Visibility', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 1rem', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(test => (
                <tr key={test.id} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: '#0f172a' }}>{test.name}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700', background: test.subject === 'Math' ? '#dbeafe' : test.subject === 'English' ? '#ede9fe' : '#e2e8f0', color: test.subject === 'Math' ? '#1d4ed8' : test.subject === 'English' ? '#6d28d9' : '#475569' }}>
                      {test.subject || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>{test.questions || 0}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>{test.source || 'Manual'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <button onClick={() => togglePublic(test.id!, test.isPublic, test.name)} style={{ padding: '0.15rem 0.625rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: '700', border: 'none', cursor: 'pointer', background: test.isPublic ? '#dcfce7' : '#f1f5f9', color: test.isPublic ? '#16a34a' : '#94a3b8' }}>
                      {test.isPublic ? '🌐 Public' : '🔒 Private'}
                    </button>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleDelete(test.id!, test.name)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
