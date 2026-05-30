"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, Send, Zap, BarChart2, BookOpen, Brain, Target, Star, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarketingHeader from '@/components/MarketingHeader';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const faqs = [
  {
    q: "What is DSAT.JO?",
    a: "DSAT.JO is an advanced Digital SAT preparation platform that combines real practice tests, AI-powered study plans, a vast question bank, and performance analytics to help you achieve your best score."
  },
  {
    q: "What improvement can I expect?",
    a: "Students using DSAT.JO regularly see an average score improvement of 80–150 points over 6–8 weeks of consistent practice. Results vary based on effort and starting level."
  },
  {
    q: "Do you offer score guarantees?",
    a: "While we cannot guarantee specific scores, our platform is designed for maximum improvement. We provide all the tools, and students who consistently practice see measurable gains."
  },
  {
    q: "Do you offer any features for teachers?",
    a: "Yes! Teachers can create Classes, assign vocabulary sets and practice tests, and monitor student progress through our dedicated teacher dashboard."
  },
  {
    q: "How does the AI-targeted study plan work?",
    a: "Our AI analyzes your performance data—question types, time spent, accuracy—and generates a personalized weekly study plan that targets your weakest areas first for maximum efficiency."
  },
  {
    q: "Can I try DSAT.JO for free?",
    a: "Absolutely! Our Free plan gives you access to one test per month, the SQB question bank, and curated vocabulary sets—no credit card required."
  },
];

const features = [
  {
    num: "01",
    title: "Full-Length Adaptive Practice Tests",
    desc: "Experience the real Digital SAT with our full-length adaptive tests. Our realistic interface and authentic question types build stamina, familiarity, and confidence for exam day.",
    icon: <Play size={20} />,
    side: "right",
  },
  {
    num: "02",
    title: "Master Your Vocabulary",
    desc: "Build your SAT vocabulary with smart flashcards, spaced repetition, and interactive quizzes. Track your progress and focus on the words that matter most for the exam.",
    icon: <BookOpen size={20} />,
    side: "left",
  },
  {
    num: "03",
    title: "Comprehensive Question Bank",
    desc: "Access 3,400+ SAT-style questions from the College Board's official question bank. Every question comes with detailed, expert explanations to reinforce your understanding.",
    icon: <Target size={20} />,
    side: "right",
  },
  {
    num: "04",
    title: "Deep Performance Analytics",
    desc: "Get granular insights into your performance by skill, domain, and question type. Track your score trajectory, identify patterns, and understand exactly where to improve.",
    icon: <BarChart2 size={20} />,
    side: "left",
  },
];

const defaultPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "Perfect for getting started with exam preparation.",
    cta: "Get started free",
    ctaStyle: "secondary",
    popular: false,
    features: [
      "1 test every month",
      "Free SQB question bank",
      "Curated vocabulary sets",
      "Basic performance overview",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$13.99",
    period: "/month",
    desc: "Enhanced features for serious test preparation.",
    cta: "Get Pro",
    ctaStyle: "primary",
    popular: true,
    features: [
      "20 credits for new exams",
      "10 credits for retaking",
      "Add 20 vocabulary words/day",
      "AI-targeted study plan",
      "Expert feedback once/month",
      "Full analytics for all features",
    ],
  },
  {
    name: "Elite",
    price: "$24.99",
    period: "/month",
    desc: "Complete access with premium support and features.",
    cta: "Get Elite",
    ctaStyle: "secondary",
    popular: false,
    features: [
      "30 test credits + 15 retakes",
      "Add 50 vocabulary words/day",
      "AI study plan (twice monthly)",
      "Expert feedback twice/month",
      "Priority support",
      "Advanced analytics",
    ],
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [plans, setPlans] = useState(defaultPlans);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch dynamic pricing
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

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <MarketingHeader />

      {/* ── HERO ── */}
      <header id="home" style={{
        paddingTop: '10rem',
        paddingBottom: '5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10rem 5% 5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Radial gradient bg */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-badge"
        >
          <Zap size={12} />
          AI-Powered Digital SAT Prep
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hero-title" 
          style={{ maxWidth: '900px' }}
        >
          Master Your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Digital SAT
          </span>{' '}
          Exam
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hero-subtitle"
        >
          Transform your test prep with AI-powered study plans, adaptive learning,
          real practice tests, and personalized strategies designed to maximize your score.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hero-cta" 
          style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link href="/signup" className="btn btn-primary btn-lg">
            Start for free <ArrowRight size={18} />
          </Link>
          <a href="#features" className="btn btn-secondary btn-lg">
            See features
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <div style={{ display: 'flex', gap: '-0.5rem' }}>
            {['#6366f1','#22d3ee','#f59e0b','#ec4899','#10b981'].map((color, i) => (
              <div key={i} style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: color, border: '2px solid #ffffff',
                marginLeft: i > 0 ? '-10px' : '0',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
          </div>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
            Trusted by <strong style={{ color: '#0f172a' }}>5,000+</strong> students
          </span>
        </motion.div>

        {/* Browser mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          style={{ width: '100%', maxWidth: '1040px', marginTop: '5rem' }}
        >
          <div className="browser-window">
            <div className="browser-bar">
              <div className="browser-dot browser-dot-red" />
              <div className="browser-dot browser-dot-yellow" />
              <div className="browser-dot browser-dot-green" />
              <div className="browser-url" />
            </div>

            {/* Test interface preview */}
            <div style={{ display: 'flex', height: '420px', backgroundColor: '#ffffff', fontFamily: 'serif' }}>
              {/* Passage side */}
              <div style={{ flex: 1, padding: '2rem', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.9', color: '#334155' }}>
                  Indigenous Photograph is an organization whose mission is to ensure that images of indigenous peoples in the media are presented from indigenous perspectives. The organization believes that authentic representation is not just a moral imperative but a cultural necessity. By working directly with communities and indigenous photographers, they help tell stories that have long been{' '}
                  <span style={{ background: '#fef08a', padding: '0 2px' }}>overlooked or misrepresented</span>{' '}
                  in mainstream media. This approach challenges the dominant narratives and invites broader audiences to engage with more nuanced understandings of indigenous life, history, and culture.
                </p>
              </div>

              {/* Question side */}
              <div style={{ flex: 1, padding: '2rem', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f1f5f9', borderRadius: '0.5rem', marginBottom: '1.5rem', fontFamily: 'sans-serif' }}>
                  <div style={{ background: '#0f172a', color: '#fff', width: '2rem', height: '2rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>1</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Which choice completes the text most logically?</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontFamily: 'sans-serif' }}>
                  {[
                    { l: 'A', t: 'concludes', sel: false },
                    { l: 'B', t: 'explains', sel: true },
                    { l: 'C', t: 'precedes', sel: false },
                    { l: 'D', t: 'shows', sel: false },
                  ].map(opt => (
                    <div key={opt.l} className={`test-option ${opt.sel ? 'selected' : ''}`}>
                      <div className={`test-option-letter ${opt.sel ? 'selected' : ''}`}>{opt.l}</div>
                      <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>{opt.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ padding: '0.75rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                <span>Section 1, Module 1</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>31:44</span> remaining
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ padding: '0.375rem 1rem', background: '#94a3b8', color: '#fff', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '600' }}>Back</div>
                <div style={{ padding: '0.375rem 1rem', background: '#2563eb', color: '#fff', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '600' }}>Next</div>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* ── STATS STRIP ── */}
      <div style={{ padding: '3rem 5%', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          {[
            { value: '3,400+', label: 'Practice Questions' },
            { value: '80+', label: 'Avg. Score Increase' },
            { value: '5,000+', label: 'Active Students' },
            { value: '98%', label: 'Satisfaction Rate' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', marginBottom: '0.25rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '7rem 5%', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div className="section-label">Features</div>
          <h2 className="section-title" style={{ margin: '0 auto 1rem' }}>Everything You Need to Succeed</h2>
          <p className="section-desc" style={{ margin: '0 auto', textAlign: 'center' }}>
            Explore the core features of our platform, meticulously designed to help you master the Digital SAT.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5rem',
              flexDirection: f.side === 'left' ? 'row-reverse' : 'row',
            }}>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="feature-number">{f.num}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>
                  Try it now <ChevronRight size={16} />
                </Link>
              </div>

              {/* Visual */}
              <div style={{
                flex: 1.2,
                minWidth: 0,
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                height: '340px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative pattern */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }} />
                <div style={{
                  position: 'relative', zIndex: 1,
                  background: '#ffffff',
                  borderRadius: '0.875rem',
                  padding: '1.5rem 2rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  minWidth: '260px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div className="icon-box" style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {f.icon}
                    </div>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{f.title.split(' ').slice(0, 3).join(' ')}</span>
                  </div>
                  {/* Mini progress bars */}
                  {['Reading & Writing', 'Math', 'Vocabulary'].map((item, j) => (
                    <div key={j} style={{ marginBottom: j < 2 ? '1rem' : '0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                        <span>{item}</span>
                        <span style={{ color: '#0f172a', fontWeight: '600' }}>{[78, 65, 82][j]}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${[78, 65, 82][j]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '7rem 5%', backgroundColor: '#fafafa', textAlign: 'center' }}>
        <div style={{ marginBottom: '4rem' }}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title" style={{ margin: '0 auto 1rem' }}>Unlock Your SAT Potential</h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Select the plan that matches your goals. Upgrade anytime and cancel whenever you want.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'left', alignItems: 'start' }}>
          {plans.map((plan, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`} 
              style={{ position: 'relative' }}
            >
              {plan.popular && <div className="popular-badge">MOST POPULAR</div>}

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>{plan.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.5', minHeight: '40px' }}>{plan.desc}</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-2px', lineHeight: '1' }}>{plan.price}</span>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '500' }}>{plan.period}</span>
              </div>

              <Link
                href="/signup"
                className={`btn ${plan.ctaStyle === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'center', borderRadius: '0.625rem', marginBottom: '2rem', padding: '0.875rem' }}
              >
                {plan.cta}
              </Link>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '1rem' }}>INCLUDES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {plan.features.map((feat, j) => (
                    <div key={j} className="check-item">
                      <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ fontSize: '0.875rem' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '7rem 5%' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Find answers to common questions about our platform, features, and pricing.
            </p>
          </div>

          <div>
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="accordion-item"
                  style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    color="#94a3b8"
                    style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}
                  />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 0 1.5rem', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.7', animation: 'fadeIn 0.2s ease' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '5rem 5%', textAlign: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.375rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1.5rem', color: '#c7d2fe', letterSpacing: '0.05em' }}>
            <Zap size={12} /> FREE TO START
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1px', lineHeight: '1.15' }}>
            Ready to ace your Digital SAT?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>
            Join thousands of students who improved their scores with DSAT.JO. Start for free today.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg" style={{ background: '#ffffff', color: '#0f172a' }}>
            Start for free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" style={{ padding: '4rem 5% 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '2rem', borderBottom: '1px solid #1e293b', marginBottom: '1.5rem' }}>
          <div>
            <div className="footer-logo">DSAT.JO</div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.5rem', maxWidth: '280px' }}>
              Elevating your SAT prep experience with cutting-edge tools and personalized learning.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'FB', href: '#' },
                { label: 'X', href: '#' },
                { label: 'IG', href: '#' },
                { label: 'IN', href: '#' },
                { icon: <Send size={16} />, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', transition: 'all 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#334155'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1e293b'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                >
                  {s.icon || s.label}
                </a>
              ))}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>support@dsat.jo</div>
          </div>

          {[
            { 
              title: 'PRODUCT', 
              links: [
                { label: 'AI Study Plan', href: '/signup' },
                { label: 'Question Bank', href: '/signup' },
                { label: 'Practice Tests', href: '/signup' },
                { label: 'Vocabulary', href: '/signup' }
              ] 
            },
            { 
              title: 'COMPANY', 
              links: [
                { label: 'About Us', href: '/about' },
                { label: 'Blog', href: '/blog' },
                { label: 'Careers', href: '/careers' }
              ] 
            },
            { 
              title: 'LEGAL', 
              links: [
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' }
              ] 
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontWeight: '700', marginBottom: '1.5rem', color: '#ffffff', fontSize: '0.75rem', letterSpacing: '0.08em' }}>{col.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {col.links.map((link, j) => (
                  <Link key={j} href={link.href} className="footer-link">{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>
          <span>© 2026 DSAT.JO. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
