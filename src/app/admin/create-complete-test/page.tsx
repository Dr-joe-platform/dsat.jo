"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PenTool, UploadCloud, Loader2, Sparkles, Database, Search, ArrowLeft, Check, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { parsePdfToQuestions } from '@/app/actions/parse-pdf';
import { createTestBank, AdminTestBank, getAllUsers, AppUser } from '@/lib/db';
import Link from 'next/link';
import { parseQuestionsCSV } from '@/lib/csv-parser';

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
}

export default function CreateCompleteTestPage() {
  const { appUser } = useAuth();
  
  const [testName, setTestName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // English Files
  const [engMode, setEngMode] = useState<'single' | 'split'>('single');
  const [engType, setEngType] = useState<'pdf' | 'csv'>('pdf');
  const [engFile1, setEngFile1] = useState<File | null>(null);
  const [engFile2, setEngFile2] = useState<File | null>(null);

  // Math Files
  const [mathMode, setMathMode] = useState<'single' | 'split'>('single');
  const [mathType, setMathType] = useState<'pdf' | 'csv'>('pdf');
  const [mathFile1, setMathFile1] = useState<File | null>(null);
  const [mathFile2, setMathFile2] = useState<File | null>(null);

  // Audience
  const [students, setStudents] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['all']);

  useEffect(() => {
    getAllUsers().then(users => {
      setStudents(users.filter(u => u.role === 'student'));
    });
  }, []);

  const toggleStudent = (uid: string) => {
    if (uid === 'all') {
      setSelectedStudents(['all']);
      return;
    }
    
    let newSelection = selectedStudents.filter(id => id !== 'all');
    if (newSelection.includes(uid)) {
      newSelection = newSelection.filter(id => id !== uid);
      if (newSelection.length === 0) newSelection = ['all'];
    } else {
      newSelection.push(uid);
    }
    setSelectedStudents(newSelection);
  };

  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const processFiles = async (
    file1: File | null, 
    file2: File | null, 
    mode: 'single' | 'split', 
    type: 'pdf' | 'csv', 
    mod1Name: string, 
    mod2Name: string,
    groqKey?: string
  ): Promise<ParsedQuestion[]> => {
    if (mode === 'single') {
      if (!file1) throw new Error("Missing file.");
      if (type === 'pdf') {
        const form = new FormData();
        form.append('file', file1);
        const res = await parsePdfToQuestions(form, groqKey);
        if (!res.success || !res.data) throw new Error("PDF Error: " + res.error);
        
        const data = res.data;
        const half = Math.ceil(data.length / 2);
        data.forEach((q: any, i: number) => {
          q.module = i < half ? mod1Name : mod2Name;
        });
        return data as ParsedQuestion[];
      } else {
        const res = await parseQuestionsCSV(file1);
        const data = res as any[];
        const half = Math.ceil(data.length / 2);
        data.forEach((q: any, i: number) => {
          if (!q.module) q.module = i < half ? mod1Name : mod2Name;
          else {
            q.module = String(q.module).includes('2') ? mod2Name : mod1Name;
          }
        });
        return data as ParsedQuestion[];
      }
    } else {
      if (!file1 || !file2) throw new Error("Please upload both files for split mode.");
      let merged: ParsedQuestion[] = [];
      if (type === 'pdf') {
        const form1 = new FormData(); form1.append('file', file1);
        const res1 = await parsePdfToQuestions(form1, groqKey, mod1Name);
        if (!res1.success || !res1.data) throw new Error("PDF 1 Error: " + res1.error);
        merged = [...res1.data] as any[];

        const form2 = new FormData(); form2.append('file', file2);
        const res2 = await parsePdfToQuestions(form2, groqKey, mod2Name);
        if (!res2.success || !res2.data) throw new Error("PDF 2 Error: " + res2.error);
        merged = [...merged, ...res2.data] as any[];
      } else {
        const res1 = await parseQuestionsCSV(file1, mod1Name);
        const res2 = await parseQuestionsCSV(file2, mod2Name);
        merged = [...res1, ...res2] as any[];
      }
      return merged;
    }
  };

  const handleProcess = async () => {
    if (!testName.trim()) {
      setError("Please provide a test name.");
      return;
    }
    if (!engFile1) {
      setError("Please provide English file(s).");
      return;
    }
    if (!mathFile1) {
      setError("Please provide Math file(s).");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const groqKey = localStorage.getItem('groq_api_key') || undefined;
      
      const englishQs = await processFiles(engFile1, engFile2, engMode, engType, "M1", "M2H", groqKey);
      const mathQs = await processFiles(mathFile1, mathFile2, mathMode, mathType, "MATH_M1", "MATH_M2H", groqKey);
      
      const allQs = [...englishQs, ...mathQs];
      
      if (allQs.length === 0) throw new Error("No questions extracted.");

      setIsSaving(true);
      const testData: Omit<AdminTestBank, 'id'> = {
        name: testName,
        subject: 'Full',
        questions: allQs.length,
        source: 'Complete Exam Upload',
        createdAt: new Date().toISOString(),
        isPublic: selectedStudents.includes('all'),
        createdBy: appUser?.uid,
        visibleTo: selectedStudents.includes('all') ? 'all' : selectedStudents,
        content: JSON.stringify(allQs)
      };

      await createTestBank(testData);
      setSaveSuccess(true);
      
      setEngFile1(null); setEngFile2(null);
      setMathFile1(null); setMathFile2(null);
      setTestName('');
      
    } catch (err: any) {
      setError(err.message);
    }
    setIsProcessing(false);
    setIsSaving(false);
  };

  const FileUploader = ({ 
    title, mode, setMode, type, setType, file1, setFile1, file2, setFile2 
  }: any) => {
    const f1Ref = useRef<HTMLInputElement>(null);
    const f2Ref = useRef<HTMLInputElement>(null);
    
    return (
      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>{title}</h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select value={type} onChange={e => setType(e.target.value as any)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
            <option value="pdf">PDF Upload</option>
            <option value="csv">CSV Import</option>
          </select>
          <select value={mode} onChange={e => setMode(e.target.value as any)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
            <option value="single">Single File (Auto-split)</option>
            <option value="split">Two Files (Manual split)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input type="file" ref={f1Ref} accept={type === 'pdf' ? '.pdf' : '.csv'} style={{ display: 'none' }} onChange={e => e.target.files && setFile1(e.target.files[0])} />
          <button onClick={() => f1Ref.current?.click()} style={{ padding: '0.75rem', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {type === 'pdf' ? <UploadCloud size={16} /> : <Database size={16} />}
            {file1 ? file1.name : (mode === 'single' ? `Upload Full ${title} ${type.toUpperCase()}` : `Upload ${title} Module 1 ${type.toUpperCase()}`)}
          </button>
          
          {mode === 'split' && (
            <>
              <input type="file" ref={f2Ref} accept={type === 'pdf' ? '.pdf' : '.csv'} style={{ display: 'none' }} onChange={e => e.target.files && setFile2(e.target.files[0])} />
              <button onClick={() => f2Ref.current?.click()} style={{ padding: '0.75rem', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {type === 'pdf' ? <UploadCloud size={16} /> : <Database size={16} />}
                {file2 ? file2.name : `Upload ${title} Module 2 ${type.toUpperCase()}`}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (saveSuccess) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <CheckCircle size={64} color="#16a34a" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Test Created Successfully!</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>The complete exam has been published to the selected students.</p>
        <button onClick={() => setSaveSuccess(false)} style={{ padding: '0.75rem 2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
          Create Another
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/test-bank" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ArrowLeft size={16} /> Back</Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PenTool size={24} color="#6366f1" /> Create Complete Test</h1>
      </div>

      {error && <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>{error}</div>}

      <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>Test Name</label>
          <input 
            value={testName} 
            onChange={e => setTestName(e.target.value)} 
            placeholder="e.g., DSAT Complete Mock 1"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
          />
        </div>

        <FileUploader title="English Section (Reading & Writing)" mode={engMode} setMode={setEngMode} type={engType} setType={setEngType} file1={engFile1} setFile1={setEngFile1} file2={engFile2} setFile2={setEngFile2} />
        <FileUploader title="Math Section" mode={mathMode} setMode={setMathMode} type={mathType} setType={setMathType} file1={mathFile1} setFile1={setMathFile1} file2={mathFile2} setFile2={setMathFile2} />

        {/* Audience Selector */}
        <div style={{ marginTop: '2rem' }}>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>Assign To</label>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => toggleStudent('all')}>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #cbd5e1', background: selectedStudents.includes('all') ? '#6366f1' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedStudents.includes('all') && <Check size={14} color="#fff" />}
            </div>
            <Users size={18} color="#64748b" />
            <span style={{ fontWeight: '600' }}>All Students</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search specific students by name or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
            {filteredStudents.map(student => (
              <div key={student.uid} onClick={() => toggleStudent(student.uid)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: selectedStudents.includes(student.uid) ? '#eff6ff' : '#fff' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1px solid #cbd5e1', background: selectedStudents.includes(student.uid) ? '#6366f1' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedStudents.includes(student.uid) && <Check size={12} color="#fff" />}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#0f172a' }}>{student.displayName || 'Unknown Student'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.email}</div>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>No students found.</div>}
          </div>
        </div>

        <button onClick={handleProcess} disabled={isProcessing || isSaving} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '800', marginTop: '2rem', cursor: (isProcessing || isSaving) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {(isProcessing || isSaving) ? <><Loader2 size={18} className="spin" /> Uploading Exam...</> : <><Sparkles size={18} /> Submit Complete Exam</>}
        </button>
      </div>
    </div>
  );
}
