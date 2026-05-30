"use client";

import React from 'react';
import Link from 'next/link';
import { Zap, Check, ArrowRight, Star } from 'lucide-react';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';

export default function UpgradePage() {
  const { appUser } = useAuth();
  const [plans, setPlans] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchPricing = async () => {
      try {
        const snap = await getDocs(collection(db, 'pricing'));
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          data.sort((a, b) => (a.order || 0) - (b.order || 0));
          setPlans(data);
        }
      } catch (err) {
        console.error("Failed to load dynamic pricing", err);
      }
    };
    fetchPricing();
  }, []);
  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1', padding: '0.375rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1.25rem' }}>
          <Zap size={12} /> Unlock your full potential
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', marginBottom: '0.75rem', lineHeight: '1.2' }}>
          Upgrade Your Plan
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>
          Get unlimited access to all features and accelerate your SAT preparation.
        </p>
      </div>

      {/* Current plan */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>CURRENT PLAN</div>
          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
            {appUser?.planName ? `${appUser.planName} Plan` : 'Free — Trial Mode'}
          </div>
        </div>
        <span style={{ background: appUser?.status === 'approved' ? '#dcfce7' : '#f1f5f9', color: appUser?.status === 'approved' ? '#166534' : '#475569', fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '2rem' }}>
          {appUser?.status === 'approved' ? 'Active' : 'Pending'}
        </span>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {plans.map((plan, i) => (
          <div key={i} style={{
            background: '#ffffff',
            border: plan.popular ? `2px solid ${plan.color || '#6366f1'}` : '1px solid #e2e8f0',
            borderRadius: '1.25rem',
            padding: '2rem',
            position: 'relative',
            boxShadow: plan.popular ? '0 12px 32px rgba(99,102,241,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: plan.color || '#6366f1', color: '#fff', fontSize: '0.65rem', fontWeight: '800', padding: '0.25rem 1rem', borderRadius: '2rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Star size={10} fill="white" /> MOST POPULAR
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.375rem' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px', lineHeight: '1' }}>{plan.price}</span>
                <span style={{ color: '#94a3b8', fontWeight: '500', fontSize: '0.9rem' }}>{plan.period}</span>
              </div>
            </div>

            <button 
              disabled={appUser?.planId === plan.id}
              onClick={() => {
                if (appUser?.planId !== plan.id) {
                  window.location.href = `/dashboard/checkout/${plan.id}`;
                }
              }}
              style={{
              width: '100%', padding: '0.875rem',
              background: appUser?.planId === plan.id ? '#e2e8f0' : (plan.popular ? (plan.color || '#6366f1') : '#0f172a'),
              color: appUser?.planId === plan.id ? '#64748b' : '#fff', borderRadius: '0.625rem',
              fontWeight: '700', fontSize: '0.9rem', border: 'none', cursor: appUser?.planId === plan.id ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              marginBottom: '1.5rem',
              boxShadow: appUser?.planId === plan.id ? 'none' : (plan.popular ? `0 4px 12px ${plan.color || '#6366f1'}40` : '0 4px 12px rgba(15,23,42,0.2)'),
              transition: 'all 0.2s',
            }}>
              {appUser?.planId === plan.id ? (
                <>Current Plan <Check size={16} /></>
              ) : (
                <>Get {plan.name} <ArrowRight size={16} /></>
              )}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(plan.features || []).map((feat: string, j: number) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <Check size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#334155' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.6' }}>
        All plans include a 7-day free trial. Cancel anytime with no questions asked.
        <br />
        Questions? <Link href="/dashboard/support" style={{ color: '#6366f1', fontWeight: '600' }}>Contact support</Link>
      </p>
    </div>
  );
}
