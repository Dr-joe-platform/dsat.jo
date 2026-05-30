"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { CreditCard, CheckCircle, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const params = useParams();
  const planId = params?.planId as string;
  const { appUser } = useAuth();
  const router = useRouter();
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Fake card details state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      try {
        const docRef = doc(db, 'pricing', planId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPlan({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Failed to load plan", err);
      }
      setLoading(false);
    };
    fetchPlan();
  }, [planId]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !plan) return;
    
    setProcessing(true);
    
    // Simulate API delay for payment processing
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      // Update user document to grant access
      // In a real app, this should be done via a secure backend webhook
      await updateDoc(doc(db, 'users', appUser.uid), {
        status: 'active',
        planId: plan.id,
        planName: plan.name,
      });
      
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
        // Force reload to update context and layout state
        window.location.href = '/dashboard';
      }, 3000);
      
    } catch (err) {
      console.error("Failed to update user", err);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Plan not found</h2>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>The selected plan does not exist.</p>
        <Link href="/dashboard/upgrade" style={{ display: 'inline-block', marginTop: '2rem', color: '#6366f1', fontWeight: '700' }}>Back to Plans</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '4rem 3rem', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
          <CheckCircle size={80} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Payment Successful!</h2>
          <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Welcome to the <strong>{plan.name}</strong> plan. Your account has been activated and upgraded.
          </p>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
            Redirecting you to dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
      
      {/* Checkout Form */}
      <div>
        <Link href="/dashboard/upgrade" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to plans
        </Link>
        
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
          Checkout
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>
          Complete your purchase to activate your account.
        </p>
        
        <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Payment Details</h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Simulated Test Environment</div>
            </div>
          </div>
          
          <form onSubmit={handleCheckout}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>CARDHOLDER NAME</label>
              <input 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>CARD NUMBER</label>
              <div style={{ position: 'relative' }}>
                <input 
                  required
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', letterSpacing: '2px', fontFamily: 'monospace' }}
                />
                <CreditCard size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>EXPIRY DATE</label>
                <input 
                  required
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>CVC</label>
                <input 
                  required
                  value={cvv}
                  onChange={e => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', textAlign: 'center' }}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={processing}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                background: '#6366f1', 
                color: '#fff', 
                borderRadius: '0.5rem', 
                fontWeight: '700', 
                fontSize: '1.1rem', 
                border: 'none', 
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                opacity: processing ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {processing ? (
                <>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={18} /> Pay {plan.price}
                </>
              )}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} color="#10b981" /> 256-bit SSL encrypted. Simulated test payment.
            </div>
          </form>
        </div>
      </div>
      
      {/* Order Summary */}
      <div>
        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>{plan.name} Plan</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Billed {plan.period.replace('/', '')}</div>
            </div>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.25rem' }}>{plan.price}</div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>What's Included</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(plan.features || []).slice(0, 4).map((feat: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={14} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: '700', color: '#475569' }}>Total Due</div>
            <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>{plan.price}</div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
