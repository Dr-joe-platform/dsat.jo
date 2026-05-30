"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PenTool, UploadCloud, Loader2, Sparkles, CheckCircle, Database, Search, Edit2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { parsePdfToQuestions } from '@/app/actions/parse-pdf';
import { createTestBank, AdminTestBank } from '@/lib/db';
import Link from 'next/link';
import { downloadCSVTemplate, parseQuestionsCSV } from '@/lib/csv-parser';

interface ParsedQuestion {
  id: string;
  type: 'MCQ' | 'SPR';
  passage?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  domain: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  module?: string | number;
  imageUrl?: string;
}

export default function CreateTestPage() {
  const { appUser } = useAuth();
  
  // File Upload State
  const [uploadMode, setUploadMode] = useState<'single' | 'split'>('single');
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  
  // CSV Upload State
  const [csvUploadMode, setCsvUploadMode] = useState<'single' | 'split'>('single');
  const csvFile1Ref = useRef<HTMLInputElement>(null);
  const csvFile2Ref = useRef<HTMLInputElement>(null);
  const [csvFile1, setCsvFile1] = useState<File | null>(null);
  const [csvFile2, setCsvFile2] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generated Quiz State
  const [generatedQuestions, setGeneratedQuestions] = useState<ParsedQuestion[]>([]);
  const [testName, setTestName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings
  const [groqKey, setGroqKey] = useState('');

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDoc(doc(db, 'settings', 'ai'));
        if (snap.exists() && snap.data().groq_api_key) {
          setGroqKey(snap.data().groq_api_key);
        }
      } catch(e) {}
    };
    fetchKey();
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile1(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!groqKey) {
      setError("Groq API Key is missing. Please ask Admin to set it in AI Settings, or paste it here temporarily.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSaveSuccess(false);

    try {
      if (uploadMode === 'single') {
        if (!file1) throw new Error("Please select a PDF file.");
        const formData = new FormData();
        formData.append('file', file1);
        
        const result = await parsePdfToQuestions(formData, groqKey);
        if (result.success && result.data) {
          setGeneratedQuestions(result.data);
          setTestName(file1.name.replace('.pdf', '') + ' Quiz');
        } else {
          setError(result.error || "Failed to process PDF.");
        }
      } else {
        if (!file1) throw new Error("Please select at least a PDF for Module 1.");
        
        // Parse File 1
        const form1 = new FormData();
        form1.append('file', file1);
        const res1 = await parsePdfToQuestions(form1, groqKey, "Module 1");
        if (!res1.success || !res1.data) throw new Error("Module 1 Error: " + res1.error);
        
        let merged = [...res1.data];
        
        // Parse File 2 if provided
        if (file2) {
          const form2 = new FormData();
          form2.append('file', file2);
          const res2 = await parsePdfToQuestions(form2, groqKey, "Module 2");
          if (!res2.success || !res2.data) throw new Error("Module 2 Error: " + res2.error);
          merged = [...merged, ...res2.data];
        }
        
        setGeneratedQuestions(merged);
        setTestName(file1.name.replace('.pdf', '') + ' Quiz');
      }
    } catch (err: any) {
      setError(err.message);
    }
    
    setIsProcessing(false);
  };

  const handleCSVProcess = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      if (csvUploadMode === 'single') {
        if (!csvFile1) throw new Error("Please select a CSV file.");
        const questions = await parseQuestionsCSV(csvFile1);
        setGeneratedQuestions(questions as any);
        setTestName(csvFile1.name.replace('.csv', '') + ' Quiz');
      } else {
        if (!csvFile1) throw new Error("Please select at least Module 1 CSV.");
        const res1 = await parseQuestionsCSV(csvFile1, "Module 1");
        let merged = [...res1];
        
        if (csvFile2) {
          const res2 = await parseQuestionsCSV(csvFile2, "Module 2");
          merged = [...merged, ...res2];
        }
        
        setGeneratedQuestions(merged as any);
        setTestName(csvFile1.name.replace('.csv', '') + ' Quiz');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setIsProcessing(false);
  };

  const handleSaveToBank = async () => {
    if (!appUser || generatedQuestions.length === 0 || !testName.trim()) return;
    setIsSaving(true);
    
    try {
      const testData: Omit<AdminTestBank, 'id'> = {
        name: testName,
        subject: appUser.teacherSubject === 'Math' ? 'Math' : appUser.teacherSubject === 'English' ? 'English' : 'Mixed',
        questions: generatedQuestions.length,
        source: 'AI Generator',
        createdAt: new Date().toISOString(),
        isPublic: false,
        createdBy: appUser.uid,
        teacherId: appUser.uid,
        teacherName: appUser.displayName,
        content: JSON.stringify(generatedQuestions) // Save raw generated format
      };

      await createTestBank(testData);
      setSaveSuccess(true);
      setGeneratedQuestions([]);
      setFile1(null);
      setFile2(null);
      setCsvFile1(null);
      setCsvFile2(null);
      setTestName('');
    } catch(err: any) {
      alert("Error saving test: " + err.message);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/teacher" style={{ padding: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#475569', display: 'flex' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PenTool size={22} color="#22c55e" /> AI Quiz Generator
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upload a PDF of questions and let the AI convert it into an interactive quiz instantly.</p>
        </div>
      </div>

      {!groqKey && (
        <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#92400e', marginBottom: '0.5rem' }}>Groq API Key (Temporary Override)</label>
          <input type="password" value={groqKey} onChange={e => setGroqKey(e.target.value)} placeholder="gsk_..." className="input-field" style={{ maxWidth: '400px' }} />
          <p style={{ fontSize: '0.7rem', color: '#b45309', marginTop: '0.25rem' }}>Your admin hasn't set a global Groq API key yet. Paste yours here to use the generator.</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {saveSuccess && (
        <div style={{ padding: '1rem', background: '#dcfce7', border: '1px solid #86efac', color: '#16a34a', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> Quiz saved successfully to Test Bank! Your students can now access it.
        </div>
      )}

      {generatedQuestions.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* PDF Box */}
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', border: '2px dashed #cbd5e1', textAlign: 'center', transition: 'border-color 0.2s' }}>
            <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <UploadCloud size={32} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>AI Generate (PDF)</h3>
            
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', margin: '0 auto', maxWidth: '300px' }}>
              <button onClick={() => setUploadMode('single')} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: 'none', background: uploadMode === 'single' ? '#fff' : 'transparent', fontWeight: uploadMode === 'single' ? '700' : '600', color: uploadMode === 'single' ? '#0f172a' : '#64748b', boxShadow: uploadMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem' }}>Auto-Split (1 File)</button>
              <button onClick={() => setUploadMode('split')} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: 'none', background: uploadMode === 'split' ? '#fff' : 'transparent', fontWeight: uploadMode === 'split' ? '700' : '600', color: uploadMode === 'split' ? '#0f172a' : '#64748b', boxShadow: uploadMode === 'split' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem' }}>Manual Split (2 Files)</button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
              {uploadMode === 'single' ? 'Upload 1 PDF. The AI will extract all questions and divide them evenly into Module 1 and Module 2.' : 'Upload Module 1 and Module 2 as separate PDFs for precise splitting.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              {/* File 1 Input */}
              <input type="file" ref={file1Ref} accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files && setFile1(e.target.files[0])} />
              {file1 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%', maxWidth: '300px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <Sparkles size={14} color="#64748b" flexShrink={0} />
                    <span style={{ fontWeight: '600', fontSize: '0.8rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file1.name}</span>
                  </div>
                  <button onClick={() => setFile1(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              ) : (
                <button onClick={() => file1Ref.current?.click()} style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', background: uploadMode === 'single' ? '#0f172a' : '#f8fafc', color: uploadMode === 'single' ? '#fff' : '#0f172a', border: uploadMode === 'single' ? 'none' : '1px solid #e2e8f0', borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                  {uploadMode === 'single' ? 'Select PDF' : 'Upload Module 1 PDF'}
                </button>
              )}

              {/* File 2 Input (Only in split mode) */}
              {uploadMode === 'split' && (
                <>
                  <input type="file" ref={file2Ref} accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files && setFile2(e.target.files[0])} />
                  {file2 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%', maxWidth: '300px', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <Sparkles size={14} color="#64748b" flexShrink={0} />
                        <span style={{ fontWeight: '600', fontSize: '0.8rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file2.name}</span>
                      </div>
                      <button onClick={() => setFile2(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => file2Ref.current?.click()} style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', background: '#f8fafc', color: '#0f172a', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                      Upload Module 2 PDF (Optional)
                    </button>
                  )}
                </>
              )}

              <button onClick={handleProcess} disabled={isProcessing || !file1} style={{ width: '100%', maxWidth: '300px', marginTop: '1rem', padding: '0.875rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '800', cursor: (isProcessing || !file1) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (!file1 || isProcessing) ? 0.7 : 1 }}>
                {isProcessing ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <><Sparkles size={16} /> Generate Questions</>}
              </button>
            </div>
          </div>

          {/* CSV Box */}
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', border: '2px dashed #cbd5e1', textAlign: 'center', transition: 'border-color 0.2s' }}>
            <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Database size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Bulk Import (CSV)</h3>
            
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', margin: '0 auto', maxWidth: '300px' }}>
              <button onClick={() => setCsvUploadMode('single')} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: 'none', background: csvUploadMode === 'single' ? '#fff' : 'transparent', fontWeight: csvUploadMode === 'single' ? '700' : '600', color: csvUploadMode === 'single' ? '#0f172a' : '#64748b', boxShadow: csvUploadMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem' }}>Single CSV</button>
              <button onClick={() => setCsvUploadMode('split')} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: 'none', background: csvUploadMode === 'split' ? '#fff' : 'transparent', fontWeight: csvUploadMode === 'split' ? '700' : '600', color: csvUploadMode === 'split' ? '#0f172a' : '#64748b', boxShadow: csvUploadMode === 'split' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem' }}>Split (2 CSVs)</button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
              {csvUploadMode === 'single' ? 'Import questions from a single CSV. The module column in the CSV will be used if present.' : 'Upload Module 1 and Module 2 as separate CSVs for precise splitting.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              {/* File 1 Input */}
              <input type="file" ref={csvFile1Ref} accept=".csv" style={{ display: 'none' }} onChange={e => e.target.files && setCsvFile1(e.target.files[0])} />
              {csvFile1 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%', maxWidth: '300px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <Database size={14} color="#16a34a" flexShrink={0} />
                    <span style={{ fontWeight: '600', fontSize: '0.8rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{csvFile1.name}</span>
                  </div>
                  <button onClick={() => setCsvFile1(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              ) : (
                <button onClick={() => csvFile1Ref.current?.click()} style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', background: csvUploadMode === 'single' ? '#0f172a' : '#f8fafc', color: csvUploadMode === 'single' ? '#fff' : '#0f172a', border: csvUploadMode === 'single' ? 'none' : '1px solid #e2e8f0', borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                  {csvUploadMode === 'single' ? 'Select CSV' : 'Upload Module 1 CSV'}
                </button>
              )}

              {/* File 2 Input (Only in split mode) */}
              {csvUploadMode === 'split' && (
                <>
                  <input type="file" ref={csvFile2Ref} accept=".csv" style={{ display: 'none' }} onChange={e => e.target.files && setCsvFile2(e.target.files[0])} />
                  {csvFile2 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%', maxWidth: '300px', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <Database size={14} color="#16a34a" flexShrink={0} />
                        <span style={{ fontWeight: '600', fontSize: '0.8rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{csvFile2.name}</span>
                      </div>
                      <button onClick={() => setCsvFile2(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => csvFile2Ref.current?.click()} style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', background: '#f8fafc', color: '#0f172a', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                      Upload Module 2 CSV (Optional)
                    </button>
                  )}
                </>
              )}

              <button onClick={handleCSVProcess} disabled={isProcessing || !csvFile1} style={{ width: '100%', maxWidth: '300px', marginTop: '0.5rem', padding: '0.875rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '800', cursor: (isProcessing || !csvFile1) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (!csvFile1 || isProcessing) ? 0.7 : 1 }}>
                {isProcessing ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <><Database size={16} /> Import Questions</>}
              </button>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button onClick={() => downloadCSVTemplate('Math')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>📐 Math Template</button>
                <button onClick={() => downloadCSVTemplate('English')} style={{ background: 'none', border: 'none', color: '#0891b2', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>📖 English Template</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <input value={testName} onChange={e => setTestName(e.target.value)} className="input-field" style={{ fontSize: '1.25rem', fontWeight: '800', width: '300px', padding: '0.5rem', border: 'none', borderBottom: '2px solid #e2e8f0', borderRadius: 0, background: 'transparent' }} placeholder="Test Name" />
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>{generatedQuestions.length} questions extracted successfully.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setGeneratedQuestions([])} style={{ padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.625rem', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSaveToBank} disabled={isSaving} style={{ padding: '0.75rem 1.5rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Database size={16} /> Save to Test Bank</>}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {generatedQuestions.map((q, idx) => (
                <div key={idx} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>
                      Question {idx + 1} 
                      {q.module && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: '#f3e8ff', color: '#7e22ce', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>{q.module}</span>}
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: q.type === 'MCQ' ? '#dbeafe' : '#fce7f3', color: q.type === 'MCQ' ? '#1d4ed8' : '#be185d', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>{q.type}</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{q.domain} &gt; {q.skill} ({q.difficulty})</span>
                  </div>
                  
                  {q.imageUrl && (
                    <div style={{ marginBottom: '1rem' }}>
                      <img src={q.imageUrl} alt="Question figure" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                    </div>
                  )}

                  {q.passage && (
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#334155', borderLeft: '4px solid #94a3b8', whiteSpace: 'pre-wrap' }}>
                      <strong>Passage:</strong>\n{q.passage}
                    </div>
                  )}
                  <p style={{ color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{q.question}</p>
                  
                  {q.type === 'MCQ' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      {q.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isCorrect = letter === q.correctAnswer;
                        return (
                          <div key={i} style={{ padding: '0.75rem', background: isCorrect ? '#dcfce7' : '#fff', border: isCorrect ? '1px solid #86efac' : '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.875rem', color: isCorrect ? '#16a34a' : '#475569', fontWeight: isCorrect ? '600' : '500' }}>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'SPR' && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Correct Answer (SPR): </span>
                      <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontWeight: '700', fontFamily: 'monospace', border: '1px solid #86efac' }}>{q.correctAnswer}</span>
                    </div>
                  )}

                  <div style={{ padding: '0.75rem', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                    <strong style={{ color: '#0f172a' }}>Explanation:</strong> {q.explanation}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <label style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Plus size={14} /> Attach Image
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newQs = [...generatedQuestions];
                            newQs[idx].imageUrl = reader.result as string;
                            setGeneratedQuestions(newQs);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
