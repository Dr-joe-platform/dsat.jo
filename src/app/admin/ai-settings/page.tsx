"use client";

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Save, RotateCcw, Info } from 'lucide-react';

interface Setting {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'text' | 'select' | 'number';
  value: string | boolean | number;
  options?: string[];
}

const initSettings: Setting[] = [
  { key: 'ai_enabled', label: 'Enable AI Tutor', description: 'Allow students to use the AI chat assistant.', type: 'toggle', value: true },
  { key: 'ai_model', label: 'AI Model', description: 'Which AI model to power the tutor.', type: 'select', value: 'gemini-2.0-flash', options: ['gemini-2.0-flash', 'gemini-1.5-pro', 'groq-llama3-70b-8192', 'groq-mixtral-8x7b-32768'] },
  { key: 'ai_system_prompt', label: 'AI System Prompt', description: 'Base instructions given to the AI before every student session.', type: 'text', value: 'You are an expert SAT tutor. You help students understand Digital SAT math and reading concepts clearly and concisely. Always explain your reasoning step by step.' },
  { key: 'ai_notes_enabled', label: 'Enable AI Study Notes', description: 'Allow students to generate study notes from topics.', type: 'toggle', value: true },
  { key: 'ai_analysis_enabled', label: 'Enable AI Score Analysis', description: 'Show AI-generated insights on student score trends.', type: 'toggle', value: true },
  { key: 'ai_daily_limit', label: 'Daily AI Messages Per Student', description: 'Max messages a student can send per day (0 = unlimited).', type: 'number', value: 50 },
  { key: 'gemini_api_key', label: 'Gemini API Key', description: 'Your Google Gemini API key for AI features.', type: 'text', value: '' },
  { key: 'groq_api_key', label: 'Groq API Key', description: 'Your Groq API key (Required if using a Groq model).', type: 'text', value: '' },
];

export default function AiSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>(initSettings);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDoc(doc(db, 'settings', 'ai'));
        if (snap.exists()) {
          const data = snap.data();
          setSettings(prev => prev.map(s => data[s.key] !== undefined ? { ...s, value: data[s.key] } : s));
        }
      } catch (e) { console.error('Failed to load AI settings', e); }
      setLoading(false);
    };
    loadData();
  }, []);

  const update = (key: string, value: string | boolean | number) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setSaved(false);
  };

  const save = async () => {
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const data = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      await setDoc(doc(db, 'settings', 'ai'), data, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert('Failed to save AI settings');
    }
  };

  const reset = () => setSettings(initSettings);

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '750px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot size={22} color="#6366f1" /> AI Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Configure AI features for the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', color: '#475569', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={save} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1.25rem', background: saved ? '#22c55e' : '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.3s' }}>
            {saved ? '✓ Saved!' : <><Save size={14} /> Save Settings</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {settings.map(s => (
          <div key={s.key} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Sparkles size={14} color="#6366f1" />
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{s.label}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.5', marginBottom: s.type !== 'toggle' ? '0.75rem' : '0' }}>{s.description}</p>

                {s.type === 'text' && (
                  s.key === 'ai_system_prompt' ? (
                    <textarea
                      value={s.value as string}
                      onChange={e => update(s.key, e.target.value)}
                      rows={3}
                      className="input-field"
                      style={{ resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type={s.key.includes('key') ? 'password' : 'text'}
                      value={s.value as string}
                      onChange={e => update(s.key, e.target.value)}
                      placeholder={s.key.includes('key') ? 'AIza...' : ''}
                      className="input-field"
                    />
                  )
                )}
                {s.type === 'select' && (
                  <select value={s.value as string} onChange={e => update(s.key, e.target.value)} className="input-field" style={{ width: 'auto' }}>
                    {s.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {s.type === 'number' && (
                  <input type="number" value={s.value as number} onChange={e => update(s.key, +e.target.value)} className="input-field" style={{ width: '120px' }} min={0} />
                )}
              </div>

              {s.type === 'toggle' && (
                <button
                  onClick={() => update(s.key, !(s.value as boolean))}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: s.value ? '#6366f1' : '#e2e8f0', position: 'relative', flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%',
                    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                    left: s.value ? '23px' : '3px',
                  }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
