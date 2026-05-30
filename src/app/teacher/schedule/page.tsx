"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, ChevronDown, CheckCircle } from 'lucide-react';

const mockTests = [
  { id: 'TEST_1', name: 'DSAT Mock Test 1' },
  { id: 'TEST_2', name: 'DSAT Mock Test 2' },
];

interface Schedule {
  id: number;
  testId: string;
  testName: string;
  date: string;
  time: string;
  duration: number;
  studentCount: number;
  status: 'upcoming' | 'active' | 'done';
}

const initSchedules: Schedule[] = [
  { id: 1, testId: 'TEST_1', testName: 'DSAT Mock Test 1', date: '2026-05-30', time: '10:00', duration: 90, studentCount: 4, status: 'upcoming' },
  { id: 2, testId: 'TEST_2', testName: 'DSAT Mock Test 2', date: '2026-05-25', time: '14:00', duration: 90, studentCount: 2, status: 'done' },
];

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  upcoming: { bg: '#fef3c7', color: '#d97706', label: 'Upcoming' },
  active: { bg: '#dcfce7', color: '#16a34a', label: 'Active Now' },
  done: { bg: '#f1f5f9', color: '#64748b', label: 'Completed' },
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(initSchedules);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ testId: 'TEST_1', date: '', time: '', duration: 90 });

  const addSchedule = () => {
    if (!form.date || !form.time) return;
    const test = mockTests.find(t => t.id === form.testId);
    setSchedules(prev => [...prev, {
      id: Date.now(), testId: form.testId, testName: test?.name ?? '', date: form.date,
      time: form.time, duration: form.duration, studentCount: 0, status: 'upcoming',
    }]);
    setShowForm(false);
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={22} color="#6366f1" /> Schedule Tests
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Schedule when students can take each test.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={15} /> New Schedule
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="stat-card" style={{ marginBottom: '1.5rem', border: '1px solid #c4b5fd', background: '#faf5ff' }}>
          <h3 style={{ fontWeight: '700', color: '#4c1d95', marginBottom: '1.25rem' }}>New Test Schedule</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Test</label>
              <select value={form.testId} onChange={e => setForm(f => ({ ...f, testId: e.target.value }))} className="input-field">
                {mockTests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Duration (min)</label>
              <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="input-field" min={30} max={180} step={15} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Start Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={addSchedule} style={{ padding: '0.625rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
              Schedule Test
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.625rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Schedule list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {schedules.sort((a, b) => a.date.localeCompare(b.date)).map(s => {
          const ss = statusStyle[s.status];
          return (
            <div key={s.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: s.status === 'active' ? 'linear-gradient(135deg, #22c55e, #10b981)' : s.status === 'upcoming' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.status === 'done' ? <CheckCircle size={22} color="#94a3b8" /> : <Calendar size={22} color={s.status === 'active' ? '#fff' : '#fff'} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.925rem' }}>{s.testName}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.1rem 0.5rem', borderRadius: '1rem', background: ss.bg, color: ss.color }}>{ss.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={11} /> {s.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {s.time}</span>
                  <span>{s.duration} min</span>
                  <span>{s.studentCount} students</span>
                </div>
              </div>
              <button onClick={() => setSchedules(prev => prev.filter(x => x.id !== s.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
