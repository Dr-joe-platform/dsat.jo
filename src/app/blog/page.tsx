import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, BookOpen, Calendar, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | DSAT.JO - Digital SAT Preparation Insights',
  description: 'Read the latest tips, strategies, and updates about the Digital SAT. Master the exam with expert insights from DSAT.JO.',
  keywords: 'Digital SAT blog, SAT prep tips, SAT strategies, DSAT updates, study guide',
};

const blogPosts = [
  {
    slug: 'mastering-desmos-digital-sat',
    title: 'How to Master the Desmos Calculator on the Digital SAT',
    excerpt: 'The built-in Desmos graphing calculator is your secret weapon on the Digital SAT Math section. Learn the top 5 tricks to save time and guarantee accurate answers.',
    date: 'Oct 15, 2023',
    category: 'Math Strategy',
    readTime: '6 min read'
  },
  {
    slug: 'reading-writing-time-management',
    title: 'Time Management Strategies for Reading & Writing',
    excerpt: 'Running out of time on the second module? Here is a proven pacing strategy to ensure you confidently answer every Reading & Writing question.',
    date: 'Oct 02, 2023',
    category: 'English Strategy',
    readTime: '5 min read'
  },
  {
    slug: 'understanding-adaptive-testing',
    title: 'What Does "Adaptive" Mean on the Digital SAT?',
    excerpt: 'The Digital SAT adapts to your performance. Discover how the algorithm works and why your performance on Module 1 dictates your final score ceiling.',
    date: 'Sep 18, 2023',
    category: 'Exam Structure',
    readTime: '4 min read'
  }
];

export default function BlogPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', marginBottom: '1rem' }}>DSAT.JO Blog</h1>
          <p style={{ fontSize: '1.125rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            Expert insights, proven strategies, and the latest updates to help you conquer the Digital SAT.
          </p>
        </div>

        {/* Featured Post */}
        <div style={{ background: '#fff', borderRadius: '1.5rem', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '3rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#e0e7ff', color: '#4f46e5', padding: '0.25rem 0.75rem', borderRadius: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Featured</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: '#94a3b8' }}><Calendar size={14} /> Nov 10, 2023</span>
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
              The Ultimate 30-Day Digital SAT Study Plan
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', marginBottom: '2rem' }}>
              Only have a month left before your exam? Don't panic. Our comprehensive day-by-day study plan breaks down exactly what you need to focus on to maximize your score improvement in just 30 days.
            </p>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: '700', color: '#6366f1', textDecoration: 'none', width: 'fit-content' }}>
              Start your journey today <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Recent Posts Grid */}
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>Recent Articles</h3>
        <style>{`
          .blog-card {
            background: #fff;
            border-radius: 1rem;
            border: 1px solid #e2e8f0;
            padding: 1.5rem;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
          }
          .blog-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          }
        `}</style>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {blogPosts.map((post, i) => (
            <div key={i} className="blog-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6366f1' }}>{post.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{post.readTime}</span>
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', lineHeight: '1.3' }}>{post.title}</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', marginBottom: '1.5rem' }}>{post.excerpt}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{post.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>Read <ChevronRight size={14} /></span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '4rem', background: 'linear-gradient(135deg, #1e40af, #4f46e5)', borderRadius: '1.5rem', padding: '3rem', textAlign: 'center', color: '#fff' }}>
          <BookOpen size={36} color="#c7d2fe" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Ready to boost your score?</h2>
          <p style={{ fontSize: '1.1rem', color: '#e0e7ff', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>Join thousands of students who have improved their Digital SAT scores using our platform.</p>
          <Link href="/signup" style={{ display: 'inline-block', padding: '1rem 2rem', background: '#fff', color: '#4f46e5', borderRadius: '0.75rem', fontWeight: '800', textDecoration: 'none', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            Start Practicing for Free
          </Link>
        </div>

      </div>
    </div>
  );
}
