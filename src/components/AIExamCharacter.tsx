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
        <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {/* Orbital Math Symbols */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed rgba(99, 102, 241, 0.4)' }}
          >
            <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(0deg)', color: '#6366f1', fontWeight: 'bold', fontSize: '1rem' }}>∑</div>
            <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%) rotate(180deg)', color: '#8b5cf6', fontWeight: 'bold', fontSize: '1rem' }}>π</div>
            <div style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', color: '#ec4899', fontWeight: 'bold', fontSize: '1rem' }}>√</div>
            <div style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#3b82f6', fontWeight: 'bold', fontSize: '1rem' }}>∫</div>
          </motion.div>

          <div style={{ position: 'relative', zIndex: 1, width: '64px', height: '64px', background: 'linear-gradient(135deg, #4f46e5, #9333ea)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)' }}>
            <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <Bot size={32} color="#fff" strokeWidth={1.5} />
            </motion.div>
          </div>
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
          style={{ width: '100px', height: '100px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'grab', transition: 'transform 0.2s', position: 'relative' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {/* Orbital Math Symbols */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed rgba(99, 102, 241, 0.3)' }}
          >
            <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(0deg)', color: '#6366f1', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 8px rgba(99,102,241,0.6)' }}>∑</div>
            <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%) rotate(180deg)', color: '#8b5cf6', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 8px rgba(139,92,246,0.6)' }}>π</div>
            <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', color: '#ec4899', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 8px rgba(236,72,153,0.6)' }}>√</div>
            <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#3b82f6', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 8px rgba(59,130,246,0.6)' }}>∫</div>
          </motion.div>

          {/* Glowing pulse effect */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: '70%', height: '70%', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}
          />

          <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'none', width: '70px', height: '70px', background: 'linear-gradient(135deg, #4f46e5, #9333ea)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)' }}>
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <Bot size={35} color="#fff" strokeWidth={1.5} />
            </motion.div>
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
          <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5, #9333ea)', borderRadius: '50%', boxShadow: '0 2px 10px rgba(79, 70, 229, 0.5)' }}>
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <Bot size={22} color="#fff" strokeWidth={1.5} />
            </motion.div>
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
