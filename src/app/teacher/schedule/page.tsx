"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTestBanks, getTeacherStudents, createAssignment, addNotification, AdminTestBank, AppUser } from '@/lib/db';

interface Schedule {
  id: string;
  testId: string;
  testName: string;
  date: string;
  time: string;
  duration: number;
  studentCount: number;
  status: 'upcoming' | 'active' | 'done';
}

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  upcoming: { bg: '#fef3c7', color: '#d97706', label: 'Upcoming' },
  active: { bg: '#dcfce7', color: '#16a34a', label: 'Active Now' },
  done: { bg: '#f1f5f9', color: '#64748b', label: 'Completed' },
};

export default function SchedulePage() {
  const { appUser } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tests, setTests] = useState<AdminTestBank[]>([]);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({ testId: '', date: '', time: '', duration: 90 });

  useEffect(() => {
    if (appUser) loadData();
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allTests = await getTestBanks();
      const teacherTests = allTests.filter(t => t.createdBy === appUser!.uid || t.teacherId === appUser!.uid || t.isPublic);
      setTests(teacherTests);

      const stds = await getTeacherStudents(appUser!.uid, appUser!.teacherSubject);
      setStudents(stds);

      const q = query(collection(db, 'test_schedules'), where('teacherId', '==', appUser!.uid));
      const snap = await getDocs(q);
      const loadedSchedules = snap.docs.map(d => {
        const data = d.data();
        
        // Calculate status based on date/time
        const scheduleDate = new Date(`${data.date}T${data.time}`);
        const endDate = new Date(scheduleDate.getTime() + data.duration * 60000);
        const now = new Date();
        
        let status: 'upcoming' | 'active' | 'done' = 'upcoming';
        if (now > endDate) status = 'done';
        else if (now >= scheduleDate && now <= endDate) status = 'active';

        return {
          id: d.id,
          testId: data.testId,
          testName: data.testName,
          date: data.date,
          time: data.time,
          duration: data.duration,
          studentCount: data.studentCount,
          status,
        };
      });
      setSchedules(loadedSchedules);

      if (teacherTests.length > 0) {
        setForm(f => ({ ...f, testId: teacherTests[0].id || '' }));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const addSchedule = async () => {
    if (!form.date || !form.time || !form.testId || !appUser) return;
    setSaving(true);
    
    try {
      const selectedTest = tests.find(t => t.id === form.testId);
      if (!selectedTest) return;

      const dueTimestamp = Timestamp.fromDate(new Date(`${form.date}T${form.time}`));

      // 1. Save schedule
      const docRef = await addDoc(collection(db, 'test_schedules'), {
        teacherId: appUser.uid,
        testId: form.testId,
        testName: selectedTest.name,
        date: form.date,
        time: form.time,
        duration: form.duration,
        studentCount: students.length,
        createdAt: Timestamp.now()
      });

      // 2. Create assignments for all students
      for (const student of students) {
        await createAssignment({
          testId: form.testId,
          testName: selectedTest.name,
          subject: selectedTest.subject,
          studentId: student.uid,
          teacherId: appUser.uid,
          teacherName: appUser.displayName || 'Your Teacher',
          dueDate: dueTimestamp,
          status: 'pending',
        });
        
        // Notify student
        await addNotification({
          userId: student.uid,
          type: 'test_assigned',
          title: '📋 Test Scheduled',
          message: `${appUser.displayName || 'Your Teacher'} scheduled a test for you: ${selectedTest.name}. It starts on ${form.date} at ${form.time}.`,
          isRead: false,
          link: '/dashboard/assignments',
        });
      }

      setSchedules(prev => [...prev, {
        id: docRef.id,
        testId: form.testId,
        testName: selectedTest.name,
        date: form.date,
        time: form.time,
        duration: form.duration,
        studentCount: students.length,
        status: 'upcoming'
      }]);
      
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add schedule:", err);
      alert("Failed to create schedule. Please try again.");
    }
    
    setSaving(false);
  };

  const deleteScheduleItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule? (Note: existing assignments won\'t be deleted)')) return;
    try {
      await deleteDoc(doc(db, 'test_schedules', id));
      setSchedules(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '850px', padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
        Loading schedules...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={22} color="#6366f1" /> Schedule Tests
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Schedule when students can take each test. This will assign the test to all your students.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={15} /> New Schedule
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="stat-card" style={{ marginBottom: '1.5rem', border: '1px solid #c4b5fd', background: '#faf5ff' }}>
          <h3 style={{ fontWeight: '700', color: '#4c1d95', marginBottom: '1.25rem' }}>New Test Schedule</h3>
          
          {tests.length === 0 ? (
            <div style={{ padding: '1rem', color: '#dc2626', background: '#fee2e2', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              You don't have any tests to schedule. Create a test first.
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Test</label>
                  <select value={form.testId} onChange={e => setForm(f => ({ ...f, testId: e.target.value }))} className="input-field" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
                    {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="input-field" min={30} max={180} step={15} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Start Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="input-field" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button disabled={saving || !form.date || !form.time} onClick={addSchedule} style={{ padding: '0.625rem 1.25rem', background: saving || !form.date || !form.time ? '#94a3b8' : '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', cursor: saving || !form.date || !form.time ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  {saving ? 'Scheduling...' : 'Schedule Test'}
                </button>
                <button onClick={() => setShowForm(false)} style={{ padding: '0.625rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Schedule list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {schedules.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
            <Calendar size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            No schedules created yet.
          </div>
        ) : (
          schedules.sort((a, b) => a.date.localeCompare(b.date)).map(s => {
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
                <button onClick={() => deleteScheduleItem(s.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
