import React from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/MarketingHeader';
import { ArrowLeft, Briefcase } from 'lucide-react';

export default function CareersPage() {
  return (
    <>
      <MarketingHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', padding: '8rem 5% 5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Briefcase size={48} color="#94a3b8" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '1rem' }}>Careers at DSAT.JO</h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '3rem' }}>
          Help us build the future of education.
        </p>
        
        <div style={{ padding: '3rem', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1', color: '#475569', fontWeight: '500' }}>
          We currently have no open positions. Follow us on social media to be the first to know when we're hiring!
        </div>
        </div>
      </div>
    </>
  );
}
