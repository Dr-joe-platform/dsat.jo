import React from 'react';
import MarketingHeader from '@/components/MarketingHeader';

export default function AboutPage() {
  return (
    <>
      <MarketingHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', padding: '8rem 5% 5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '1.5rem' }}>About DSAT.JO</h1>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p>
              Welcome to DSAT.JO! We are a passionate team of educators, engineers, and designers dedicated to revolutionizing how students prepare for the Digital SAT.
            </p>
            <p>
              Our mission is simple: to make high-quality, personalized SAT preparation accessible to everyone. We believe that every student deserves the tools to achieve their highest potential, regardless of their background or starting score.
            </p>
            <p>
              Through cutting-edge AI technology, an extensive library of practice questions, and data-driven insights, DSAT.JO adapts to your unique learning style. We pinpoint your weaknesses and transform them into strengths.
            </p>
            <p>
              Join thousands of students who have already transformed their test prep journey with us. Let's achieve your dream score together!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
