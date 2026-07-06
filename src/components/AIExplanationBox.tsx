"use client";

import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import Latex from 'react-latex-next';
import WhiteboardStep from './WhiteboardStep';
import VoiceTutor from './VoiceTutor';
import { LATEX_DELIMITERS } from './AnnotatableText';

interface AIExplanationBoxProps {
  questionText: string;
  passage?: string;
  options?: string[];
  correctAnswer: string;
  existingExplanation?: string;
}

export default function AIExplanationBox({ questionText, passage, options, correctAnswer, existingExplanation }: AIExplanationBoxProps) {
  const [generatedExp, setGeneratedExp] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset generated explanation if the user switches to a different question
  React.useEffect(() => {
    setGeneratedExp(null);
    setError(null);
    setIsGenerating(false);
  }, [questionText]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText, passage, options, correctAnswer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate explanation');
      setGeneratedExp(data.explanation);
    } catch (err: any) {
      setError(err.message);
    }
    setIsGenerating(false);
  };

  const finalExplanation = existingExplanation || generatedExp;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ padding: '1.5rem', background: '#f8fafc', borderLeft: '4px solid #3b82f6', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', fontFamily: 'sans-serif' }}>Explanation</h3>
        
        <div style={{ marginBottom: '1rem', color: '#10b981', fontWeight: '700', fontFamily: 'sans-serif' }}>
          Correct Answer: {correctAnswer}
        </div>

        <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#334155', fontFamily: 'sans-serif' }}>
          {finalExplanation ? (
            <div style={{ marginTop: '-1rem' }}>
              <WhiteboardStep explanationText={finalExplanation} />
            </div>
          ) : (
            <div>
              <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '1rem' }}>
                Detailed explanation is not available for this specific question in the mock data.
              </p>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                  color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
                  fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  cursor: isGenerating ? 'not-allowed' : 'pointer'
                }}
              >
                {isGenerating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
                {isGenerating ? 'Generating...' : '✨ Generate AI Explanation'}
              </button>
              {error && <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>}
            </div>
          )}
        </div>
      </div>
      
      {/* Voice Tutor is pinned below the explanation box and always available */}
      <VoiceTutor 
        explanationText={finalExplanation || `The student needs help with this question: "${questionText}". The options were: ${options?.join(', ')}. The correct answer is ${correctAnswer}. Please explain it step by step if they ask.`} 
      />
    </div>
  );
}
