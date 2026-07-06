"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Plus, Minus, BarChart, Target, Zap, Activity, Star, Shield, Cpu, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarketingHeader from '@/components/MarketingHeader';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './page.module.css';

const faqs = [
  {
    q: "Why is this different from other platforms?",
    a: "Most platforms use generic question banks. We analyzed every released DSAT and built a database of brutal, high-yield questions specifically designed to break your bad habits."
  },
  {
    q: "What is the average score increase?",
    a: "Students who complete our methodology see an average increase of 120 points. We don't do 'easy' practice. If you want to feel good, go elsewhere. If you want to score high, stay here."
  },
  {
    q: "How does the analytics engine work?",
    a: "It tracks your time-per-question, distractor vulnerability, and sub-skill accuracy to generate a ruthless, targeted daily syllabus."
  },
];

const defaultPlans = [
  {
    name: "Base",
    price: "$0",
    period: "Forever",
    desc: "A taste of the methodology.",
    cta: "Start Free",
    popular: false,
    features: [
      "1 Diagnostic Test",
      "Limited Question Bank",
      "Basic Analytics",
    ],
  },
  {
    name: "Pro",
    price: "$13.99",
    period: "Monthly",
    desc: "The complete arsenal for serious candidates.",
    cta: "Upgrade to Pro",
    popular: true,
    features: [
      "20 New Exams",
      "Unlimited Question Bank",
      "Advanced Weakness Targeting",
      "Priority Support",
    ],
  },
  {
    name: "Elite",
    price: "$29.99",
    period: "Monthly",
    desc: "1-on-1 tutoring & deep analytics.",
    cta: "Get Elite",
    popular: false,
    features: [
      "Everything in Pro",
      "Real-time Chat Support",
      "Custom Study Schedules",
      "Essay Grading (Beta)",
    ],
  },
];

const testimonials = [
  { name: "Sarah J.", score: "1580", quote: "The platform is incredibly accurate. It found weaknesses I didn't even know I had and drilled them until I couldn't get them wrong." },
  { name: "Michael T.", score: "1540", quote: "I was stuck at 1420 for months using Khan Academy. Two weeks with this platform and I broke 1500. The Hard tier questions are brutal." },
  { name: "Emily R.", score: "1590", quote: "Stop wasting time on easy questions. If you want a top 1% score, this is the only platform that pushes you past your limits." },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plans, setPlans] = useState(defaultPlans);

  useEffect(() => {
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
    <div className={styles.container}>
      <MarketingHeader />

      {/* ── HERO (Dark Premium) ── */}
      <section className={styles.section} style={{ paddingTop: '200px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className={styles.glowTop} />
        <div className={styles.glowLeft} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} 
            className={styles.heroTitle}
          >
            1500 IS THE BASELINE.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} 
            className={styles.heroDescription}
          >
            No generic advice. No fluff. Just the hardest questions and an analytics engine that exposes exactly why you're failing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/signup" className={styles.primaryCta}>
              Enter Platform <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* SaaS UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} 
            className={styles.mockupContainer}
          >
            <div className={styles.mockupInner}>
              <div className={styles.mockupHeader}>
                <div>
                  <div className={styles.mockupScoreLabel}>Projected Score</div>
                  <div className={styles.mockupScoreValue}>1540</div>
                </div>
                <div className={styles.mockupIncrease}>+120</div>
              </div>

              <div className={styles.mockupStatsGrid}>
                {[
                  { label: 'Advanced Math', val: '98%', color: '#3b82f6' },
                  { label: 'Command of Evidence', val: '92%', color: '#8b5cf6' },
                  { label: 'Expression of Ideas', val: '95%', color: '#10b981' }
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className={styles.statItemLabel}>
                      <span className={styles.statItemLabelName}>{stat.label}</span>
                      <span className={styles.statItemLabelValue}>{stat.val}</span>
                    </div>
                    <div className={styles.statBarContainer}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        whileInView={{ width: stat.val }} 
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5 + (i * 0.2), ease: "easeOut" }} 
                        className={styles.statBarFill}
                        style={{ background: stat.color, boxShadow: `0 0 12px ${stat.color}40` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BANNER / LOGOS ── */}
      <section className={styles.trustSection}>
        <div className={styles.trustLabel}>Trusted by candidates admitted to</div>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeContent}>
            {['HARVARD', 'STANFORD', 'MIT', 'PRINCETON', 'YALE', 'COLUMBIA', 'UPENN'].map((logo, i) => (
              <div key={i} className={styles.trustLogo}>{logo}</div>
            ))}
          </div>
          {/* Duplicate for seamless infinite loop */}
          <div className={styles.marqueeContent}>
            {['HARVARD', 'STANFORD', 'MIT', 'PRINCETON', 'YALE', 'COLUMBIA', 'UPENN'].map((logo, i) => (
              <div key={`dup-${i}`} className={styles.trustLogo}>{logo}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY (DARK BENTO GRID) ── */}
      <section id="methodology" className={styles.section}>
        <div className={styles.divider} style={{ top: 0 }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>We rebuilt SAT prep.</h2>
            <p className={styles.sectionSubtitle}>Engineered for absolute maximum performance.</p>
          </div>

          <div className={styles.bentoGrid}>
            {[
              { icon: <Target size={26} color="#3b82f6" />, title: 'Surgical Precision', desc: 'Our engine isolates the exact sub-skills costing you points and forces you to master them.' },
              { icon: <BarChart size={26} color="#8b5cf6" />, title: 'Raw Analytics', desc: 'See your true projected score, time-per-question variance, and distracter vulnerability.' },
              { icon: <Zap size={26} color="#f59e0b" />, title: 'High-Yield Bank', desc: '14,000+ brutal questions. If you can survive our Hard tier, the real exam is a joke.' }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={styles.bentoCard}
              >
                <div className={styles.bentoIconBox}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className={styles.bentoTitle}>{feat.title}</h3>
                  <p className={styles.bentoDesc}>{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEEP DIVE 1: ANALYTICS ── */}
      <section className={styles.deepDiveSection}>
        <div className={styles.divider} style={{ top: 0 }} />
        
        {/* ── DEEP DIVE 1: AI ANALYTICS ── */}
        <div className={styles.deepDiveRow}>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={styles.deepDiveContent}
          >
            <div className={styles.deepDiveLabel}><Target size={14} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} /> Analytics Core</div>
            <h2 className={styles.deepDiveTitle}>Analytics that expose your blind spots.</h2>
            <p className={styles.deepDiveDesc}>
              Stop doing 100 random math questions. Our proprietary system tracks every micro-interaction, identifies the root sub-skill of your mistakes, and generates a personalized attack plan. We map your pathway to learning.
            </p>
            <div className={styles.deepDiveList}>
              {['Real-time cognitive tracking', 'Predictive score modeling', 'Adaptive difficulty scaling', 'Weakness isolation'].map((item, i) => (
                <div key={i} className={styles.deepDiveListItem}>
                  <Shield size={18} color="#3b82f6" /> {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={styles.deepDiveVisual}
          >
            <div className={styles.visualMockup}>
              <div className={styles.aiBrainGrid}>
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={styles.aiNode}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.1, 1],
                      boxShadow: ["0 0 0px #3b82f6", "0 0 20px #3b82f6", "0 0 0px #3b82f6"]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── DEEP DIVE 2: CONTENT ── */}
        <div className={`${styles.deepDiveRow} ${styles.deepDiveRowReverse}`}>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={styles.deepDiveContent}
          >
            <div className={styles.deepDiveLabel} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}><BookOpen size={14} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} /> Dynamic Content</div>
            <h2 className={styles.deepDiveTitle}>Dynamic, high-yield questions.</h2>
            <p className={styles.deepDiveDesc}>
              The actual DSAT is full of tricks. We analyzed every released College Board exam to provide dynamic permutations of high-yield questions. No two practice sessions are the same.
            </p>
            <div className={styles.deepDiveList}>
              {['Massive question bank', 'Dynamic distracter generation', 'Real-time Bluebook simulation', 'Detailed step-by-step explanations'].map((item, i) => (
                <div key={i} className={styles.deepDiveListItem}>
                  <Check size={18} color="#10b981" /> {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={styles.deepDiveVisual}
          >
            <div className={styles.visualMockup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', height: '300px', justifyContent: 'center' }}>
                <motion.div 
                  className={styles.aiCodeLine} 
                  initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }} 
                />
                <motion.div 
                  className={styles.aiCodeLine} 
                  initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", delay: 0.2 }} 
                />
                <motion.div 
                  className={styles.aiCodeLine} 
                  initial={{ width: 0 }} animate={{ width: '90%' }} transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", delay: 0.4 }} 
                />
                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <motion.div whileHover={{ scale: 1.05 }} className={styles.aiOptionGreen}>Option A</motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className={styles.aiOptionDark}>Option B</motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS WALL ── */}
      <section className={styles.section} style={{ background: 'rgba(10,10,10,0.5)' }}>
        <div className={styles.divider} style={{ top: 0 }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Proof is in the Scores.</h2>
            <p className={styles.sectionSubtitle}>Average increase of 120 points. See what our top candidates say.</p>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((test, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={styles.testimonialCard}
              >
                <div className={styles.rating}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p className={styles.testimonialQuote}>"{test.quote}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>{test.name.charAt(0)}</div>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{test.name}</span>
                    <span className={styles.authorDetail}>Scored {test.score}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING (Dark SaaS) ── */}
      <section id="pricing" className={styles.section}>
        <div className={styles.divider} style={{ top: 0 }} />
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Access the Arsenal.</h2>
          </div>

          <div className={styles.pricingGrid}>
            {plans.map((plan, i) => {
              const isPopular = plan.popular;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={`${styles.pricingCard} ${isPopular ? styles.pricingCardPopular : ''}`}
                >
                  {isPopular && (
                    <div className={styles.popularBadge}>Standard Issue</div>
                  )}
                  
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planDesc}>{plan.desc}</div>
                  
                  <div className={styles.planPrice}>
                    <span className={styles.planPriceAmount}>{plan.price}</span>
                    <span className={styles.planPricePeriod}>/ {plan.period}</span>
                  </div>

                  <Link href="/signup" className={`${styles.pricingCta} ${isPopular ? styles.pricingCtaPopular : ''}`}>
                    {plan.cta}
                  </Link>

                  <div className={styles.featureList}>
                    {(plan.features || []).map((feat: string, j: number) => (
                      <div key={j} className={styles.featureItem}>
                        <Check size={18} color={isPopular ? "#3b82f6" : "#71717a"} strokeWidth={3} className={styles.featureIcon} />
                        <span className={styles.featureText}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={styles.section}>
        <div className={styles.divider} style={{ top: 0 }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div className={styles.sectionHeader} style={{ marginBottom: '4rem' }}>
            <h2 className={styles.sectionTitle}>Interrogation.</h2>
          </div>
          
          <div className={styles.faqContainer}>
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={styles.faqItem}
              >
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className={styles.faqButton}>
                  <span className={styles.faqQuestion}>{faq.q}</span>
                  {openFaq === i ? <Minus size={20} color="#71717a" /> : <Plus size={20} color="#71717a" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={styles.faqAnswerWrapper}
                    >
                      <div className={styles.faqAnswer}>{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL MASSIVE CTA ── */}
      <section className={styles.finalCtaSection}>
        <div className={styles.divider} style={{ top: 0 }} />
        <div className={styles.finalCtaGlow} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={styles.finalCtaContent}
        >
          <h2 className={styles.finalCtaTitle}>Ready to break the 1500 barrier?</h2>
          <p className={styles.deepDiveDesc} style={{ marginBottom: '3rem', maxWidth: '600px' }}>
            Stop wasting time with generic prep. Join the elite candidates and let our analytics engine reconstruct your approach to the DSAT.
          </p>
          <Link href="/signup" className={styles.primaryCta} style={{ transform: 'scale(1.1)' }}>
            Start Your Training <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>DSAT.JO</div>
              <div className={styles.footerSlogan}>The Baseline is 1500.</div>
              <div style={{ marginTop: '1.5rem', color: '#71717a', fontSize: '0.85rem' }}>
                © {new Date().getFullYear()} DSAT.JO. All rights reserved.
              </div>
            </div>
            
            <div className={styles.footerNavGrid}>
              <div className={styles.footerNavCol}>
                <h4>Platform</h4>
                <Link href="#methodology">Analytics</Link>
                <Link href="#methodology">Question Bank</Link>
                <Link href="#pricing">Pricing</Link>
              </div>
              <div className={styles.footerNavCol}>
                <h4>Company</h4>
                <Link href="/about">About</Link>
                <Link href="https://wa.me/201114436085" target="_blank" rel="noopener noreferrer">Contact</Link>
              </div>
              <div className={styles.footerNavCol}>
                <h4>Legal</h4>
                <Link href="/terms">Terms of Service</Link>
                <Link href="/privacy">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
