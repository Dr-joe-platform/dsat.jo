"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function MarketingHeader() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDarkTheme = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = isDarkTheme ? '#ffffff' : '#000000';
  const logoBg = isDarkTheme ? '#ffffff' : '#000000';
  const logoText = isDarkTheme ? '#000000' : '#ffffff';
  const linkInactive = isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
  const navBgScrolled = isDarkTheme ? 'rgba(10, 10, 10, 0.7)' : 'rgba(255, 255, 255, 0.8)';
  const navBorder = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const navShadow = isDarkTheme ? '0 10px 40px -10px rgba(0,0,0,0.5)' : '0 10px 40px -10px rgba(0,0,0,0.05)';
  const startBtnShadow = isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const startBtnShadowHover = isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';

  return (
    <>
      {/* ── NAVBAR ── */}
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
              background: scrolled ? navBgScrolled : 'rgba(0, 0, 0, 0)',
              backdropFilter: scrolled ? 'blur(24px)' : 'none',
              WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
              border: scrolled ? `1px solid ${navBorder}` : '1px solid transparent',
              borderRadius: '100px',
              padding: '0.75rem 1.5rem',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: scrolled ? navShadow : 'none'
            }}
          >
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', background: logoBg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: logoText, fontWeight: '900', fontSize: '1rem', letterSpacing: '-0.05em' }}>JO</div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: textColor, letterSpacing: '0.02em' }}>DSAT.JO</span>
            </Link>

            <div className="nav-links" style={{ display: 'flex', gap: '2.5rem' }}>
              {['Platform', 'Methodology', 'Pricing', 'FAQ'].map(item => (
                <Link key={item} href={`/#${item.toLowerCase()}`} className="nav-link" style={{ fontSize: '0.85rem', fontWeight: '500', color: linkInactive, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = textColor} onMouseOut={e => e.currentTarget.style.color = linkInactive}>
                  {item}
                </Link>
              ))}
            </div>

            <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link href="/login" style={{ fontSize: '0.85rem', fontWeight: '600', color: textColor, textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.7'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                Login
              </Link>
              <Link href="/signup" style={{ 
                background: logoBg, 
                color: logoText, 
                padding: '0.6rem 1.25rem', 
                borderRadius: '100px',
                fontSize: '0.85rem', 
                fontWeight: '700', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: `0 0 20px ${startBtnShadow}`
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 0 30px ${startBtnShadowHover}`; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 20px ${startBtnShadow}`; }}
              >
                Start Now <ArrowRight size={16} />
              </Link>
            </div>

            <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X size={24} color={textColor} /> : <Menu size={24} color={textColor} />}
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
              background: isDarkTheme ? '#000000' : '#ffffff',
              padding: '2rem 5%',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {['Platform', 'Methodology', 'Pricing', 'FAQ'].map(item => (
              <Link key={item} href={`/#${item.toLowerCase()}`} style={{ fontSize: '1.5rem', fontWeight: '800', color: textColor, textDecoration: 'none', borderBottom: `1px solid ${navBorder}`, paddingBottom: '1rem' }} onClick={() => setMobileMenu(false)}>
                {item}
              </Link>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
              <Link href="/login" style={{ border: `1px solid ${navBorder}`, color: textColor, padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }} onClick={() => setMobileMenu(false)}>
                Login
              </Link>
              <Link href="/signup" style={{ background: logoBg, color: logoText, padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }} onClick={() => setMobileMenu(false)}>
                Start Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
