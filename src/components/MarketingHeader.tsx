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
      {/* ── NAVBAR (Dark Premium) ── */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? '1rem 0' : '1.5rem 0',
          transition: 'padding 0.3s ease',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 5%',
          pointerEvents: 'auto'
        }}>
          <nav 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: scrolled ? 'rgba(10, 10, 10, 0.7)' : 'rgba(0, 0, 0, 0)',
              backdropFilter: scrolled ? 'blur(24px)' : 'none',
              WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
              border: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
              borderRadius: '100px',
              padding: '0.75rem 1.5rem',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: scrolled ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none'
            }}
          >
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', background: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', fontWeight: '900', fontSize: '1rem', letterSpacing: '-0.05em' }}>JO</div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.02em' }}>DSAT.JO</span>
            </Link>

            <div className="nav-links" style={{ display: 'flex', gap: '2.5rem' }}>
              {['Platform', 'Methodology', 'Pricing', 'FAQ'].map(item => (
                <Link key={item} href={`/#${item.toLowerCase()}`} className="nav-link" style={{ fontSize: '0.85rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}>
                  {item}
                </Link>
              ))}
            </div>

            <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link href="/login" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.7'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                Login
              </Link>
              <Link href="/signup" style={{ 
                background: '#ffffff', 
                color: '#000000', 
                padding: '0.6rem 1.25rem', 
                borderRadius: '100px',
                fontSize: '0.85rem', 
                fontWeight: '700', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: '0 0 20px rgba(255,255,255,0.1)'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.1)'; }}
              >
                Start Now <ArrowRight size={16} />
              </Link>
            </div>

            <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
              {mobileMenu ? <X size={24} color="#ffffff" /> : <Menu size={24} color="#ffffff" />}
            </button>
          </nav>
        </div>
      </motion.div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '80px',
              left: 0,
              right: 0,
              bottom: 0,
              background: '#000000',
              padding: '2rem 5%',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {['Platform', 'Methodology', 'Pricing', 'FAQ'].map(item => (
              <Link key={item} href={`/#${item.toLowerCase()}`} style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }} onClick={() => setMobileMenu(false)}>
                {item}
              </Link>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
              <Link href="/login" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }} onClick={() => setMobileMenu(false)}>
                Login
              </Link>
              <Link href="/signup" style={{ background: '#ffffff', color: '#000000', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }} onClick={() => setMobileMenu(false)}>
                Start Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
