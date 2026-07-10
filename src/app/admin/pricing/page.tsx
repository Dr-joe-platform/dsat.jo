"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown, Check, Loader2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  cta: string;
  ctaStyle: 'primary' | 'secondary';
  popular: boolean;
  features: string[];
  allowedModules?: string[]; // New field for access control
  order: number;
}

const AVAILABLE_MODULES = [
  { id: '/dashboard/practice', label: 'Practice' },
  { id: '/dashboard/ebooks', label: 'E-Books' },
  { id: '/dashboard/mini-quizzes', label: 'Mini Quizzes' },
  { id: '/dashboard/analytics', label: 'Analytics' },
  { id: '/dashboard/study-plan', label: 'Study Plans' },
  { id: '/dashboard/flashcards', label: 'Flashcards' },
  { id: '/dashboard/vocabulary', label: 'Vocabulary' },
  { id: '/dashboard/notes', label: 'Shared Notes' },
  { id: '/dashboard/messages', label: 'Messages' }
];

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PricingPlan>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'pricing'));
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PricingPlan));
      
      // If no plans exist, provide empty state
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setPlans(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit = (plan: PricingPlan) => {
    setForm({ ...plan });
    setEditingId(plan.id);
  };

  const handleAddNew = () => {
    setForm({
      name: 'New Plan',
      price: 'EGP 0',
      period: '/month',
      desc: 'Description goes here.',
      cta: 'Get Started',
      ctaStyle: 'primary',
      popular: false,
      features: ['Feature 1', 'Feature 2'],
      order: plans.length,
    });
    setEditingId('new');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId === 'new') {
        const docRef = await addDoc(collection(db, 'pricing'), form);
        setPlans([...plans, { id: docRef.id, ...form } as PricingPlan]);
      } else if (editingId) {
        await updateDoc(doc(db, 'pricing', editingId), form);
        setPlans(plans.map(p => p.id === editingId ? { ...p, ...form } as PricingPlan : p));
      }
      setEditingId(null);
    } catch (err: any) {
      alert("Error saving plan: " + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await deleteDoc(doc(db, 'pricing', id));
      setPlans(plans.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(form.features || [])];
    newFeatures[index] = value;
    setForm({ ...form, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(form.features || [])];
    newFeatures.splice(index, 1);
    setForm({ ...form, features: newFeatures });
  };

  const addFeature = () => {
    setForm({ ...form, features: [...(form.features || []), 'New Feature'] });
  };

  const moveOrder = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= plans.length) return;
    const newPlans = [...plans];
    const temp = newPlans[index].order;
    newPlans[index].order = newPlans[index + direction].order;
    newPlans[index + direction].order = temp;
    
    // Sort array locally
    newPlans.sort((a, b) => a.order - b.order);
    setPlans(newPlans);

    // Save to DB
    try {
      await updateDoc(doc(db, 'pricing', newPlans[index].id), { order: newPlans[index].order });
      await updateDoc(doc(db, 'pricing', newPlans[index + direction].id), { order: newPlans[index + direction].order });
    } catch (err) {}
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading plans...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditCard size={22} color="#6366f1" /> Pricing Plans
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage subscription tiers displayed on the landing page.</p>
        </div>
        <button onClick={handleAddNew} disabled={editingId !== null} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: editingId ? 'not-allowed' : 'pointer', opacity: editingId ? 0.5 : 1 }}>
          <Plus size={16} /> Add Plan
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {plans.length === 0 && editingId !== 'new' && (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '1rem', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
            <CreditCard size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No pricing plans exist. Click "Add Plan" to create one.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>You should create Free, Pro, and Elite plans.</p>
          </div>
        )}

        {editingId === 'new' && (
          <PlanEditor form={form} setForm={setForm} onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving} updateFeature={updateFeature} removeFeature={removeFeature} addFeature={addFeature} />
        )}

        {plans.map((plan, index) => (
          <div key={plan.id}>
            {editingId === plan.id ? (
              <PlanEditor form={form} setForm={setForm} onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving} updateFeature={updateFeature} removeFeature={removeFeature} addFeature={addFeature} />
            ) : (
              <div className="stat-card" style={{ display: 'flex', padding: '1.5rem', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{plan.name}</h2>
                    {plan.popular && <span style={{ fontSize: '0.65rem', fontWeight: '800', background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '1rem', letterSpacing: '0.05em' }}>POPULAR</span>}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px' }}>{plan.price}</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>{plan.period}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{plan.desc}</p>
                  
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {plan.features?.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                          <Check size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid #f1f5f9', paddingLeft: '1.5rem', justifyContent: 'center' }}>
                  <button onClick={() => moveOrder(index, -1)} disabled={index === 0} style={{ padding: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }} title="Move Up"><MoveUp size={14} /></button>
                  <button onClick={() => moveOrder(index, 1)} disabled={index === plans.length - 1} style={{ padding: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: index === plans.length - 1 ? 'not-allowed' : 'pointer', opacity: index === plans.length - 1 ? 0.3 : 1 }} title="Move Down"><MoveDown size={14} /></button>
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '0.25rem 0' }} />
                  <button onClick={() => handleEdit(plan)} style={{ padding: '0.5rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', justifyContent: 'center' }} title="Edit"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(plan.id)} style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', justifyContent: 'center' }} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-component for editing form
function PlanEditor({ form, setForm, onSave, onCancel, saving, updateFeature, removeFeature, addFeature }: any) {
  return (
    <div className="stat-card" style={{ padding: '1.5rem', border: '2px solid #6366f1' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Plan Name</label>
          <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g. Pro" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Price</label>
            <input value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} className="input-field" placeholder="e.g. EGP 500" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Period</label>
            <input value={form.period || ''} onChange={e => setForm({...form, period: e.target.value})} className="input-field" placeholder="e.g. /month" />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Description</label>
          <input value={form.desc || ''} onChange={e => setForm({...form, desc: e.target.value})} className="input-field" placeholder="Brief description of the plan" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Button Text</label>
          <input value={form.cta || ''} onChange={e => setForm({...form, cta: e.target.value})} className="input-field" placeholder="e.g. Get Started" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>Button Style</label>
            <select value={form.ctaStyle || 'primary'} onChange={e => setForm({...form, ctaStyle: e.target.value})} className="input-field">
              <option value="primary">Primary (Blue)</option>
              <option value="secondary">Secondary (Outline)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input type="checkbox" id="popular" checked={form.popular || false} onChange={e => setForm({...form, popular: e.target.checked})} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <label htmlFor="popular" style={{ fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', color: '#0f172a' }}>Mark as "Popular"</label>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.75rem' }}>
          <span>Features List</span>
          <button onClick={addFeature} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>+ Add Item</button>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {form.features?.map((f: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
              <input value={f} onChange={e => updateFeature(i, e.target.value)} className="input-field" style={{ padding: '0.5rem', fontSize: '0.8rem', height: 'auto' }} />
              <button onClick={() => removeFeature(i)} style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

        <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.75rem' }}>
            System Access / Modules Allowed
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {AVAILABLE_MODULES.map(mod => {
              const checked = form.allowedModules?.includes(mod.id) || false;
              return (
                <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: '#334155' }}>
                  <input 
                    type="checkbox" 
                    checked={checked} 
                    onChange={e => {
                      const current = form.allowedModules || [];
                      if (e.target.checked) {
                        setForm({ ...form, allowedModules: [...current, mod.id] });
                      } else {
                        setForm({ ...form, allowedModules: current.filter((id: string) => id !== mod.id) });
                      }
                    }} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  {mod.label}
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button onClick={onCancel} style={{ padding: '0.625rem 1.25rem', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
        <button onClick={onSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} Save Plan
        </button>
      </div>
    </div>
  );
}
