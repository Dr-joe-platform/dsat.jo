'use client';

import React, { useState, useRef } from 'react';
import { parsePdfToQuestions } from '@/app/actions/parse-pdf';


type Question = {
  id: string;
  module: number;
  text: string;
  type: 'MC' | 'SPR';
  options: string[];
  correctAnswer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  domain: string;
  skill: string;
};

export default function DataLab() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [groqKey, setGroqKey] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileObj, setFileObj] = useState<File | null>(null);

  
  // Current Form State
  const [qId, setQId] = useState('ENG_M1_Q1');
  const [qMod, setQMod] = useState(1);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'MC' | 'SPR'>('MC');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correct, setCorrect] = useState('A');
  const [diff, setDiff] = useState<'Easy'|'Medium'|'Hard'>('Medium');
  const [domain, setDomain] = useState('Craft and Structure');
  const [skill, setSkill] = useState('Words in Context');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileObj(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  const handleAutoExtract = async () => {
    if (!fileObj) return alert('Please upload a PDF first.');
    if (!groqKey) return alert('Please enter your Groq API Key.');
    
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', fileObj);
      
      const res = await parsePdfToQuestions(formData, groqKey);
      if (res.success && res.data) {
        setQuestions(prev => [...prev, ...(res.data as any)]);
        alert(`Successfully extracted ${res.data.length} questions!`);
      } else {
        alert('Failed to extract: ' + res.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: qId,
      module: qMod,
      text: qText,
      type: qType,
      options: qType === 'MC' ? [optA, optB, optC, optD] : [],
      correctAnswer: correct,
      difficulty: diff,
      domain,
      skill
    };
    
    setQuestions([...questions, newQ]);
    
    // Auto-increment ID for next question
    const match = qId.match(/(.*Q)(\d+)$/);
    if (match) {
      setQId(`${match[1]}${parseInt(match[2]) + 1}`);
    }
    
    // Clear text but keep meta
    setQText('');
    setOptA(''); setOptB(''); setOptC(''); setOptD('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Left: PDF Viewer */}
      <div style={{ flex: 1, borderRight: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', background: '#0f172a', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>📄 JO SAT DataLab (OCR Tool)</span>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} style={{ color: 'white' }} />
        </div>
        <div style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
          {pdfUrl ? (
            <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} />
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Upload a PDF to start extracting text
            </div>
          )}
        </div>
      </div>

      {/* Right: Rapid Entry Form */}
      <div style={{ width: '450px', display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ padding: '1rem', background: '#1e293b', color: 'white', fontWeight: 'bold' }}>
          ✏️ Rapid JSON Builder
        </div>
        
        
        <div style={{ padding: '1rem', background: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '2px solid #cbd5e1' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>🤖 AI Auto-Extract (Groq)</div>
          <input type="password" placeholder="Enter Groq API Key (gsk_...)" value={groqKey} onChange={e=>setGroqKey(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #94a3b8' }} />
          <button onClick={handleAutoExtract} disabled={isExtracting || !fileObj} style={{ padding: '0.75rem', background: isExtracting ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isExtracting ? 'not-allowed' : 'pointer' }}>
            {isExtracting ? 'Extracting with AI... Please wait...' : '✨ Magic Extract Exam'}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ flex: 1 }}>ID <input value={qId} onChange={e=>setQId(e.target.value)} style={{width:'100%', padding:'0.5rem', border:'1px solid #cbd5e1'}} /></label>
            <label style={{ flex: 1 }}>Module <input type="number" value={qMod} onChange={e=>setQMod(Number(e.target.value))} style={{width:'100%', padding:'0.5rem', border:'1px solid #cbd5e1'}} /></label>
          </div>

          <label>Question Text (Copy from PDF & Paste here)
            <textarea value={qText} onChange={e=>setQText(e.target.value)} rows={4} style={{width:'100%', padding:'0.5rem', border:'1px solid #cbd5e1', resize: 'vertical'}} />
          </label>

          <label>Type
            <select value={qType} onChange={e=>setQType(e.target.value as any)} style={{width:'100%', padding:'0.5rem', border:'1px solid #cbd5e1'}}>
              <option value="MC">Multiple Choice (MC)</option>
              <option value="SPR">Student Produced Response (SPR)</option>
            </select>
          </label>

          {qType === 'MC' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '3px solid #3b82f6' }}>
              <label>A <input value={optA} onChange={e=>setOptA(e.target.value)} style={{width:'100%', padding:'0.25rem', border:'1px solid #cbd5e1'}}/></label>
              <label>B <input value={optB} onChange={e=>setOptB(e.target.value)} style={{width:'100%', padding:'0.25rem', border:'1px solid #cbd5e1'}}/></label>
              <label>C <input value={optC} onChange={e=>setOptC(e.target.value)} style={{width:'100%', padding:'0.25rem', border:'1px solid #cbd5e1'}}/></label>
              <label>D <input value={optD} onChange={e=>setOptD(e.target.value)} style={{width:'100%', padding:'0.25rem', border:'1px solid #cbd5e1'}}/></label>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ flex: 1 }}>Answer <input value={correct} onChange={e=>setCorrect(e.target.value)} style={{width:'100%', padding:'0.5rem', border:'1px solid #cbd5e1'}} /></label>
            <label style={{ flex: 1 }}>Diff
              <select value={diff} onChange={e=>setDiff(e.target.value as any)} style={{width:'100%', padding:'0.5rem', border:'1px solid #cbd5e1'}}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ flex: 1 }}>Domain <input value={domain} onChange={e=>setDomain(e.target.value)} style={{width:'100%', padding:'0.5rem', border:'1px solid #cbd5e1'}} /></label>
            <label style={{ flex: 1 }}>Skill <input value={skill} onChange={e=>setSkill(e.target.value)} style={{width:'100%', padding:'0.5rem', border:'1px solid #cbd5e1'}} /></label>
          </div>

          <button onClick={handleAddQuestion} style={{ padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
            + Save Question & Next
          </button>
        </div>

        {/* Output Area */}
        <div style={{ height: '30%', borderTop: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.5rem 1rem', background: '#f1f5f9', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>Generated JSON ({questions.length})</span>
            <button onClick={() => navigator.clipboard.writeText(JSON.stringify(questions, null, 2))} style={{ cursor: 'pointer' }}>Copy All</button>
          </div>
          <textarea 
            readOnly 
            value={JSON.stringify(questions, null, 2)} 
            style={{ flex: 1, padding: '1rem', border: 'none', background: '#fff', fontSize: '0.75rem', fontFamily: 'monospace', resize: 'none' }} 
          />
        </div>
      </div>
    </div>
  );
}
