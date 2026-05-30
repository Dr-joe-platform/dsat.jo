"use client";

import React, { useState, useRef, useEffect } from 'react';
import { LATEX_DELIMITERS } from '@/components/AnnotatableText';
import { Bot, Send, User, Sparkles, BookOpen, TrendingDown, Calculator } from 'lucide-react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

type Message = { role: 'user' | 'assistant'; text: string };

const suggestions = [
  { icon: TrendingDown, text: 'Explain "Words in Context" questions' },
  { icon: BookOpen, text: 'Help me with the Quadratic Formula' },
  { icon: Sparkles, text: 'Give me tips for the Reading section' },
  { icon: Calculator, text: 'Solve: If 3x + 5 = 20, find x' },
];

const initialMessages: Message[] = [
  {
    role: 'assistant',
    text: "Hi! I'm your AI SAT Tutor 🎓\n\nI can help you understand concepts, solve math problems, explain answer choices, and give you personalized study tips.\n\nWhat would you like to work on today?",
  },
];

export default function AiTutorPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read from search params if passed
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && messages.length === 1) {
      // Clear URL to prevent re-triggering
      window.history.replaceState({}, '', '/dashboard/ai-tutor');
      sendMessage(query);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Network error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', height: 'calc(100vh - 6rem)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot size={24} color="#6366f1" /> AI Tutor
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Your personal SAT coach — ask anything, anytime.</p>
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '1rem', background: '#fafafa', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {/* Avatar */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: msg.role === 'assistant' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#0f172a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {msg.role === 'assistant' ? <Bot size={16} color="#fff" /> : <User size={16} color="#fff" />}
            </div>
            {/* Bubble */}
            <div style={{
              maxWidth: '78%',
              padding: '0.875rem 1.125rem',
              borderRadius: msg.role === 'user' ? '1rem 0.25rem 1rem 1rem' : '0.25rem 1rem 1rem 1rem',
              background: msg.role === 'user' ? '#0f172a' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : '#0f172a',
              fontSize: '0.875rem',
              lineHeight: '1.65',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: msg.role === 'assistant' ? '1px solid #f1f5f9' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.role === 'assistant' ? <Latex delimiters={LATEX_DELIMITERS} strict={false}>{msg.text}</Latex> : msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#fff" />
            </div>
            <div style={{ padding: '0.875rem 1.125rem', borderRadius: '0.25rem 1rem 1rem 1rem', background: '#ffffff', border: '1px solid #f1f5f9', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 150, 300].map(d => (
                <div key={d} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1', animation: `bounce 1s ${d}ms infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only shown when only 1 message) */}
      {messages.length === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.875rem', flexShrink: 0 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s.text)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0',
                borderRadius: '0.625rem', background: '#fff',
                color: '#475569', fontWeight: '500', fontSize: '0.8rem',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLElement).style.color = '#6366f1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
            >
              <s.icon size={14} style={{ flexShrink: 0 }} /> {s.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.625rem', flexShrink: 0 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Ask me anything about the SAT..."
          className="input-field"
          style={{ flex: 1 }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          style={{
            padding: '0 1.25rem',
            background: input.trim() ? '#0f172a' : '#e2e8f0',
            color: input.trim() ? '#fff' : '#94a3b8',
            border: 'none', borderRadius: '0.625rem',
            fontWeight: '700', fontSize: '0.875rem',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <Send size={16} />
        </button>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}
