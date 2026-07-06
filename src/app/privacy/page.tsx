import React from 'react';
import MarketingHeader from '@/components/MarketingHeader';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <>
      <MarketingHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', padding: '8rem 5% 5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Last Updated: October 2026</p>
        
        <div style={{ fontSize: '1rem', lineHeight: '1.8', color: '#475569', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>At DSAT.JO, your privacy is critically important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, such as your name, email address, and phone number. We also collect data regarding your test performance and usage of our platform to provide personalized study plans.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>2. How We Use Information</h2>
          <p>We use the collected data to provide, maintain, and improve our services. Specifically, your test results are analyzed by our system to generate custom study recommendations.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>3. Data Sharing</h2>
          <p>We do not sell your personal data to third parties. If you are enrolled in a Teacher's class, your performance data will be shared with that specific teacher to facilitate your learning.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>4. Security</h2>
          <p>We implement strict security measures to protect your data. All sensitive information is encrypted using industry-standard protocols.</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '1rem' }}>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@dsat.jo.</p>
        </div>
        </div>
      </div>
    </>
  );
}
