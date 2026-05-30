import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, Download, FileText, CheckCircle, BrainCircuit } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Digital SAT Resources | DSAT.JO',
  description: 'Download free Digital SAT practice tests, cheat sheets, and study guides. Boost your score with expertly crafted resources by DSAT.JO.',
  keywords: 'Digital SAT resources, free SAT practice, SAT cheat sheet, SAT study guide, math formulas',
};

const resources = [
  {
    title: 'Ultimate Math Formulas Cheat Sheet',
    desc: 'Every formula you need for the Digital SAT Math section, neatly organized by topic (Algebra, Advanced Math, Problem Solving, Geometry).',
    icon: <BrainCircuit size={24} color="#6366f1" />,
    type: 'PDF Guide'
  },
  {
    title: 'Grammar Rules Masterclass',
    desc: 'The 15 grammar rules that appear on every single Digital SAT. Master these and secure an extra 50-100 points on the Reading & Writing section.',
    icon: <FileText size={24} color="#22c55e" />,
    type: 'Study Guide'
  },
  {
    title: 'Desmos Mastery Guide',
    desc: 'Learn how to solve complex algebra and geometry problems in seconds using the built-in Desmos graphing calculator.',
    icon: <Download size={24} color="#a855f7" />,
    type: 'PDF Guide'
  }
];

export default function ResourcesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '800', background: '#e0e7ff', color: '#4f46e5', padding: '0.375rem 1rem', borderRadius: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'inline-block' }}>Free Downloads</span>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', marginBottom: '1rem' }}>Digital SAT Resources</h1>
          <p style={{ fontSize: '1.125rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to kickstart your SAT preparation. Download our free guides and start improving today.
          </p>
        </div>

        {/* Resources Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {resources.map((res, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {res.icon}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{res.type}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', lineHeight: '1.3' }}>{res.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5', flex: 1, marginBottom: '2rem' }}>{res.desc}</p>
              
              <style>{`
                .resource-btn {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.5rem;
                  padding: 0.75rem;
                  background: #f8fafc;
                  color: #0f172a;
                  border-radius: 0.75rem;
                  font-weight: 700;
                  text-decoration: none;
                  border: 1px solid #e2e8f0;
                  transition: all 0.2s;
                }
                .resource-btn:hover {
                  background: #0f172a;
                  color: #fff;
                }
              `}</style>
              <Link href="/signup" className="resource-btn">
                Unlock Download <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {/* Platform Features */}
        <div style={{ background: '#0f172a', borderRadius: '1.5rem', padding: '3rem', color: '#fff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>Looking for more than just PDFs?</h2>
            <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2rem' }}>Join DSAT.JO for a complete interactive learning experience.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'Full-length adaptive practice tests',
                'AI Tutor to explain any wrong answers',
                'Detailed analytics & weak point tracking',
                'Built-in Desmos calculator'
              ].map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', fontWeight: '600', color: '#f8fafc' }}>
                  <CheckCircle size={20} color="#22c55e" /> {feat}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{ display: 'inline-block', padding: '1rem 2rem', background: '#6366f1', color: '#fff', borderRadius: '0.75rem', fontWeight: '800', textDecoration: 'none', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
              Create Free Account
            </Link>
          </div>
          <div style={{ position: 'relative', height: '100%', minHeight: '300px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '1rem', border: '1px solid #334155', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#fff', letterSpacing: '-2px' }}>1600</div>
              <div style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Score</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
