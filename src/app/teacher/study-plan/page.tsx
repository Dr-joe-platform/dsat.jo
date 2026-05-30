"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTeacherStudents, AppUser, StudyPlan, getStudyPlansByTeacher, createStudyPlan, deleteStudyPlan } from '@/lib/db';
import { Calendar, Plus, CheckCircle, Trash2, Save, X } from 'lucide-react';

export default function StudyPlanManagerPage() {
  const { appUser } = useAuth();
  const [students, setStudents] = useState<AppUser[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', studentId: '' });
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: '1', title: '', completed: false }
  ]);

  useEffect(() => {
    if (appUser?.uid) {
      loadData();
    }
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stds, p] = await Promise.all([
        getTeacherStudents(appUser!.uid, appUser!.teacherSubject),
        getStudyPlansByTeacher(appUser!.uid),
      ]);
      setStudents(stds);
      setPlans(p);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newPlan.title || !newPlan.studentId) return alert("Title and Student required");
    const validTasks = tasks.filter(t => t.title.trim() !== '');
    if (validTasks.length === 0) return alert("Add at least one task");

    try {
      await createStudyPlan({
        teacherId: appUser!.uid,
        studentId: newPlan.studentId,
        title: newPlan.title,
        tasks: validTasks
      });
      setIsCreating(false);
      setNewPlan({ title: '', studentId: '' });
      setTasks([{ id: '1', title: '', completed: false }]);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error saving study plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this study plan?")) return;
    try {
      await deleteStudyPlan(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error deleting study plan");
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Study Plans</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Assign tasks and track weekly plans for your students.</p>
        </div>
        <button onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          <Plus size={16} /> New Study Plan
        </button>
      </div>

      {isCreating && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Create Study Plan</h2>
            <button onClick={() => setIsCreating(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" placeholder="Plan Title (e.g. Week 1: Algebra)" 
              value={newPlan.title} onChange={e => setNewPlan({...newPlan, title: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
            <select 
              value={newPlan.studentId} onChange={e => setNewPlan({...newPlan, studentId: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            >
              <option value="" disabled>Select Student...</option>
              {students.map(s => <option key={s.uid} value={s.uid}>{s.displayName || s.email}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Tasks</h3>
            {tasks.map((task, i) => (
              <div key={task.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text" placeholder="Task description..." 
                  value={task.title} onChange={e => {
                    const nt = [...tasks];
                    nt[i].title = e.target.value;
                    setTasks(nt);
                  }}
                  style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                />
                <button onClick={() => { const nt = [...tasks]; nt.splice(i, 1); setTasks(nt); }} style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={() => setTasks([...tasks, { id: Math.random().toString(), title: '', completed: false }])} style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 0' }}>
              + Add Task
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleCreate} style={{ padding: '0.625rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> Assign Plan
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>Loading study plans...</div>
      ) : plans.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          No study plans created yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {plans.map(plan => {
            const student = students.find(s => s.uid === plan.studentId);
            const compTasks = plan.tasks.filter(t => t.completed).length;
            const progress = plan.tasks.length === 0 ? 0 : Math.round((compTasks / plan.tasks.length) * 100);

            return (
              <div key={plan.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.5rem', borderRadius: '0.5rem' }}>
                    <Calendar size={20} />
                  </div>
                  <button onClick={() => plan.id && handleDelete(plan.id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>{plan.title}</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: '600' }}>
                  Assigned to: <span style={{ color: '#0f172a' }}>{student?.displayName || 'Unknown Student'}</span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>
                    <span>PROGRESS</span>
                    <span style={{ color: progress === 100 ? '#16a34a' : '#2563eb' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#22c55e' : '#3b82f6', borderRadius: '3px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                  {plan.tasks.slice(0, 3).map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: t.completed ? '#94a3b8' : '#334155' }}>
                      <CheckCircle size={14} color={t.completed ? '#22c55e' : '#cbd5e1'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</span>
                    </div>
                  ))}
                  {plan.tasks.length > 3 && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '1.4rem' }}>
                      +{plan.tasks.length - 3} more tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
