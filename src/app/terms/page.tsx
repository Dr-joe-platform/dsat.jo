import React from 'react';
import MarketingHeader from '@/components/MarketingHeader';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <>
      <MarketingHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', padding: '8rem 5% 5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.5rem' }}>Terms of Service</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Last Updated: October 2026</p>
        
        <div style={{ fontSize: '1rem', lineHeight: '1.8', color: '#475569', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>By accessing and using DSAT.JO, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our platform.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>1. Account Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your password and account.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>2. Acceptable Use</h2>
          <p>You agree not to misuse our services. You may not copy, distribute, or reverse-engineer any part of the platform, including our practice tests, question banks, and algorithms, without explicit permission.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>3. Subscription & Payments</h2>
          <p>Certain features require a paid subscription. Payments are processed securely. Subscriptions automatically renew unless canceled before the next billing cycle.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>4. Disclaimer of Warranties</h2>
          <p>While we strive to provide the best preparation tools, DSAT.JO is provided "as is" without any guarantees regarding specific test score improvements. Results vary based on individual effort.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>5. Limitation of Liability</h2>
          <p>DSAT.JO shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform.</p>
        </div>
        </div>
      </div>
    </>
  );
}
