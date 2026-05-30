"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Lock, BarChart2, ArrowRight, CheckCircle, Clock, BookOpen, Settings, Loader2, X } from 'lucide-react';
import { useResults } from '@/lib/hooks/useResults';

const typeColors: Record<string, { bg: string; color: string }> = {
  'R&W': { bg: '#ede9fe', color: '#6d28d9' },
  'Math': { bg: '#dbeafe', color: '#1d4ed8' },
  'Vocab': { bg: '#dcfce7', color: '#166534' },
  'Practice': { bg: '#fef3c7', color: '#92400e' },
};

function generateWeekDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function StudyPlanPage() {
  const { results, loading } = useResults();
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  
  const [plan, setPlan] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [intensity, setIntensity] = useState('Balanced'); // Casual, Balanced, Intense
  const [focus, setFocus] = useState('Balanced'); // Math, R&W, Balanced
  const [level, setLevel] = useState('Intermediate'); // Beginner, Intermediate, Advanced

  useEffect(() => {
    setWeekDays(generateWeekDays());
    const saved = localStorage.getItem('dsat_ai_study_plan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // rehydrate dates
        parsed.forEach((p: any) => p.date = new Date(p.date));
        setPlan(parsed);
      } catch (e) {
        console.error('Failed to parse saved plan', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const hasResults = results.length > 0;
  const avgMath = hasResults ? results.reduce((s, r) => s + (r.subject === 'math' ? r.percentage : (r.correctCount / (r.correctCount + r.wrongCount || 1))), 0) / results.length * 100 : 50;
  const avgRW = hasResults ? results.reduce((s, r) => s + (r.subject === 'reading_writing' ? r.percentage : (r.correctCount / (r.correctCount + r.wrongCount || 1))), 0) / results.length * 100 : 50;

  const generateAiPlan = async () => {
    if (weekDays.length === 0) return;
    setGenerating(true);
    setShowSettings(false);
    
    try {
      const res = await fetch('/api/ai-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intensity, 
          focus, 
          level,
          stats: { math: Math.round(avgMath), rw: Math.round(avgRW) } 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      if (data.plan && Array.isArray(data.plan)) {
        const newPlan = data.plan.map((dayTasks: any, i: number) => {
          let dayStr = weekDays[i]?.toLocaleDateString('en-US', { weekday: 'long' }) || '';
          if (i === 0) dayStr = 'Today';
          if (i === 1) dayStr = 'Tomorrow';

          return {
            day: dayStr,
            date: weekDays[i],
            isToday: i === 0,
            isPast: false,
            tasks: dayTasks.map((t: any) => ({ ...t, done: false }))
          };
        });
        
        setPlan(newPlan);
        localStorage.setItem('dsat_ai_study_plan', JSON.stringify(newPlan));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate study plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // If no plan is loaded initially and we are ready, maybe we should prompt them to generate one?
  // We'll show an empty state or the old default plan if empty.
  
  if (loading || !isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const weekStartStr = weekDays[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEndStr = weekDays[6]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div style={{ maxWidth: '900px', position: 'relative' }}>
      
      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Plan Settings</h2>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Intensity</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Casual', 'Balanced', 'Intense'].map(opt => (
                  <button key={opt} onClick={() => setIntensity(opt)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: intensity === opt ? '2px solid #6366f1' : '1px solid #e2e8f0', background: intensity === opt ? '#e0e7ff' : '#fff', color: intensity === opt ? '#4338ca' : '#64748b', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Current Level</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Beginner', 'Intermediate', 'Advanced'].map(opt => (
                  <button key={opt} onClick={() => setLevel(opt)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: level === opt ? '2px solid #6366f1' : '1px solid #e2e8f0', background: level === opt ? '#e0e7ff' : '#fff', color: level === opt ? '#4338ca' : '#64748b', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>Subject Focus</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Math', 'Balanced', 'R&W'].map(opt => (
                  <button key={opt} onClick={() => setFocus(opt)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: focus === opt ? '2px solid #6366f1' : '1px solid #e2e8f0', background: focus === opt ? '#e0e7ff' : '#fff', color: focus === opt ? '#4338ca' : '#64748b', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateAiPlan} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.875rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
              <Sparkles size={16} /> Generate AI Plan
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={22} color="#6366f1" /> AI Study Plan
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {hasResults 
              ? 'Personalized weekly plan based on your recent tests and preferences.' 
              : 'Complete a practice test to let the AI learn your strengths, or generate a custom plan now.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={generateAiPlan} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#ede9fe', color: '#6d28d9', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '700', border: 'none', cursor: generating ? 'default' : 'pointer' }}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {generating ? 'Generating...' : 'Regenerate Plan'}
          </button>
          <button onClick={() => setShowSettings(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
            <Settings size={14} /> Preferences
          </button>
        </div>
      </div>

      {/* Week overview */}
      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Week of {weekStartStr} – {weekEndStr}</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>0 tasks completed</span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>WEEKLY PROGRESS</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0f172a' }}>0%</span>
          </div>
          <div className="progress-bar" style={{ height: '8px' }}>
            <div className="progress-fill" style={{ width: '0%', background: '#6366f1' }} />
          </div>
        </div>

        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {weekDays.map((date, i) => {
            const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            const isToday = i === 0;
            const hasTasks = plan[i] && plan[i].tasks.length > 0;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: isToday ? '#6366f1' : '#94a3b8', marginBottom: '0.375rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{dayStr}</div>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: isToday ? '#6366f1' : hasTasks ? '#f8fafc' : '#ffffff',
                  color: isToday ? '#fff' : '#0f172a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                  fontSize: '0.8rem', fontWeight: '700',
                  border: isToday ? '2px solid #6366f1' : hasTasks ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                }}>
                  {dayNum}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {plan.length === 0 && !generating && (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          <Sparkles size={48} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>No Plan Generated Yet</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Let the AI analyze your strengths and weaknesses to build a custom study schedule.</p>
          <button onClick={() => setShowSettings(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#6366f1', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>
            Configure & Generate Plan
          </button>
        </div>
      )}

      {/* Daily plan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plan.map((day, di) => (
          <div key={di} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                {day.day} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500', marginLeft: '0.5rem' }}>{day.date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {day.isToday && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: '#ede9fe', color: '#6d28d9', padding: '0.125rem 0.5rem', borderRadius: '1rem', fontWeight: '700' }}>Today</span>}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {day.tasks.reduce((s: number, t: any) => s + (t.questions || 0), 0)} questions
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {day.tasks.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>Rest day. No tasks scheduled!</div>
              ) : day.tasks.map((task: any, ti: number) => {
                const tc = typeColors[task.type] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <div key={ti} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid #f1f5f9', borderRadius: '0.625rem', background: '#fafafa', gap: '1rem' }}>
                    <div style={{ background: tc.bg, color: tc.color, fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', flexShrink: 0 }}>
                      {task.type}
                    </div>
                    <div style={{ flex: 1, fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>{task.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>
                      <Clock size={11} /> {task.questions} q&apos;s
                    </div>
                    {task.done ? (
                      <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                    ) : (
                      <Link href={task.type === 'Practice' ? '/dashboard/practice' : task.type === 'Vocab' ? '/dashboard/question-bank' : `/test/ai-generated?topic=${encodeURIComponent(task.label)}&subject=${encodeURIComponent(task.type)}&q=${task.questions}`} style={{ padding: '0.375rem 0.75rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.75rem', border: 'none', cursor: 'pointer', flexShrink: 0, textDecoration: 'none' }}>
                        Start
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade CTA */}
      <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '1rem', padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Lock size={14} color="#c7d2fe" />
            <span style={{ color: '#c7d2fe', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' }}>PRO FEATURE</span>
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem' }}>Get Unlimited AI Study Plans</h3>
          <p style={{ color: '#a5b4fc', fontSize: '0.875rem' }}>Upgrade to Pro or Elite to unlock long-term personalized plans.</p>
        </div>
        <Link href="/dashboard/upgrade" style={{ background: '#fff', color: '#4f46e5', padding: '0.75rem 1.5rem', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          Upgrade <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
