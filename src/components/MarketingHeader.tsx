"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketingHeader() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ── NAVBAR ── */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="navbar" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.06)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.6)' : '1px solid #e2e8f0',
          padding: scrolled ? '1rem 5%' : '1.5rem 5%',
          transition: 'all 0.3s ease',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', background: '#0f172a', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.25rem' }}>D</div>
          <span style={{ fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic', color: '#0f172a', letterSpacing: '-0.5px' }}>DSAT.JO</span>
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/#features" className="nav-link">Features</Link>
          <Link href="/#pricing" className="nav-link">Pricing</Link>
          <Link href="/#faq" className="nav-link">FAQ</Link>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/login" className="btn btn-secondary" style={{ borderRadius: '0.625rem', padding: '0.5rem 1.125rem' }}>
            Sign in
          </Link>
          <Link href="/signup" className="btn btn-primary" style={{ borderRadius: '0.625rem', padding: '0.5rem 1.125rem' }}>
            Start for free <ArrowRight size={15} />
          </Link>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X size={24} color="#0f172a" /> : <Menu size={24} color="#0f172a" />}
        </button>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: scrolled ? '64px' : '80px',
              left: 0,
              right: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Link href="/" className="nav-link" onClick={() => setMobileMenu(false)}>Home</Link>
            <Link href="/#features" className="nav-link" onClick={() => setMobileMenu(false)}>Features</Link>
            <Link href="/#pricing" className="nav-link" onClick={() => setMobileMenu(false)}>Pricing</Link>
            <Link href="/#faq" className="nav-link" onClick={() => setMobileMenu(false)}>FAQ</Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <Link href="/login" className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setMobileMenu(false)}>
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMobileMenu(false)}>
                Start for free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
