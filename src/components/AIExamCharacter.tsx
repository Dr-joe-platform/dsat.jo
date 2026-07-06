"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, HelpCircle, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { motion } from 'framer-motion';

interface AIExamCharacterProps {
  phase: 'intro' | 'testing';
  currentQuestion?: any;
  activeHelpsLeft: number;
  onRequestHelp: () => void;
}

export default function AIExamCharacter({ phase, currentQuestion, activeHelpsLeft, onRequestHelp }: AIExamCharacterProps) {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(phase === 'intro');
  const [isExpanded, setIsExpanded] = useState(false); // For full active help text
  const [studentRequest, setStudentRequest] = useState('');
  const [mode, setMode] = useState<'intro' | 'auto-hint' | 'active-help'>(phase === 'intro' ? 'intro' : 'auto-hint');

  const prevQuestionIdRef = useRef<string | null>(null);
  const isDragging = useRef(false);

  // Fetch Intro on load if phase is intro
  useEffect(() => {
    if (phase === 'intro') {
      fetchAIResponse('intro');
    }
  }, [phase]);

  // Fetch Auto-Hint when question changes in testing phase
  useEffect(() => {
    if (phase === 'testing' && currentQuestion) {
      if (prevQuestionIdRef.current !== currentQuestion.id) {
        prevQuestionIdRef.current = currentQuestion.id;
        
        const timer = setTimeout(() => {
          setMode('auto-hint');
          setIsExpanded(false);
          setMessage('');
          fetchAIResponse('auto-hint', currentQuestion);
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [phase, currentQuestion]);

  const fetchAIResponse = async (action: 'intro' | 'auto-hint' | 'active-help', question?: any, userRequest?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          phase,
          questionText: question?.text || question?.question,
          options: question?.options,
          studentRequest: userRequest
        })
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setMessage(data.reply);
    } catch (err) {
      console.warn(err);
      setMessage("I'm having trouble connecting right now. Let's try again later!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestHelp = () => {
    if (activeHelpsLeft <= 0) return;
    if (!studentRequest.trim()) {
      setStudentRequest("I need help with this question");
    }
    setMode('active-help');
    setIsExpanded(true);
    onRequestHelp(); // Decrement counter in parent
    fetchAIResponse('active-help', currentQuestion, studentRequest || "I need help with this question");
    setStudentRequest(''); // Clear input
  };

  if (phase === 'intro') {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
        <div style={{ width: '80px', height: '80px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%' }}>
          <Bot size={40} color="#4338ca" />
        </div>
        <div style={{ flex: 1, position: 'relative', background: '#fff', padding: '1.25rem', borderRadius: '1rem', borderTopLeftRadius: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          {/* Speech bubble arrow */}
          <div style={{ position: 'absolute', top: 0, left: '-10px', width: 0, height: 0, borderTop: '10px solid #fff', borderLeft: '10px solid transparent' }}></div>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            AI Proctor <span style={{ fontSize: '0.75rem', fontWeight: '500', background: '#dbeafe', color: '#1d4ed8', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>Assistant</span>
          </h3>
          
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              <Loader2 size={16} className="animate-spin" /> Thinking...
            </div>
          ) : (
            <div style={{ color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>
              <Latex>{message}</Latex>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Testing Phase - Floating Character
  if (!isOpen && phase === 'testing') {
    return (
      <motion.div 
        drag
        dragMomentum={false}
        onDragStart={() => isDragging.current = true}
        onDragEnd={() => setTimeout(() => isDragging.current = false, 100)}
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, touchAction: 'none' }}
      >
        <div 
          onClick={() => {
            if (!isDragging.current) {
              setIsOpen(true);
            }
          }}
          style={{ width: '90px', height: '90px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'grab', transition: 'transform 0.2s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ pointerEvents: 'none', width: '90px', height: '90px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Bot size={45} color="#4338ca" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      drag
      dragMomentum={false}
      style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '380px', background: '#fff', borderRadius: '1rem', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>AI Assistant</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Helps left: {activeHelpsLeft}/5</div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem' }}>
          <X size={20} />
        </button>
      </div>

      {/* Message Area */}
      <div style={{ padding: '1.25rem', maxHeight: isExpanded ? '300px' : '150px', overflowY: 'auto', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', transition: 'max-height 0.3s' }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            <Loader2 size={16} className="animate-spin" /> {mode === 'auto-hint' ? 'Generating hint...' : 'Analyzing question...'}
          </div>
        ) : (
          <div style={{ color: '#334155', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: mode === 'auto-hint' ? '#8b5cf6' : '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {mode === 'auto-hint' ? '💡 Auto-Hint' : '🤖 Active Help'}
            </div>
            <Latex>{message || 'Hi! Let me know if you need help with this question.'}</Latex>
          </div>
        )}
      </div>

      {/* Request Help Area */}
      <div style={{ padding: '1rem', background: '#fff' }}>
        {activeHelpsLeft > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Need more help? ({activeHelpsLeft} remaining)</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={studentRequest}
                onChange={e => setStudentRequest(e.target.value)}
                placeholder="E.g., I don't understand the first step"
                style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                onKeyDown={(e) => { if(e.key === 'Enter') handleRequestHelp() }}
              />
              <button 
                onClick={handleRequestHelp}
                disabled={isLoading}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#ef4444', textAlign: 'center', fontWeight: '500' }}>
            You have used all 5 helps for this test. Good luck!
          </div>
        )}
      </div>
    </motion.div>
  );
}
