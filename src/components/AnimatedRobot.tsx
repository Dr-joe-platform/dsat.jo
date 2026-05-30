import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function AnimatedRobot({ size = 100 }: { size?: number }) {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 400);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const eyeX = useSpring(useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-6, 6]), { stiffness: 150, damping: 20 });
  const eyeY = useSpring(useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 800], [-4, 4]), { stiffness: 150, damping: 20 });

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))' }}>
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ears */}
        <rect x="25" y="65" width="20" height="30" rx="10" fill="#cbd5e1" />
        <rect x="155" y="65" width="20" height="30" rx="10" fill="#cbd5e1" />

        {/* Arms */}
        <motion.g
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "40px 130px" }}
        >
          <rect x="25" y="120" width="25" height="50" rx="12.5" fill="#e2e8f0" />
        </motion.g>
        <motion.g
          animate={{ rotate: [5, -5, 5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "160px 130px" }}
        >
          <rect x="150" y="120" width="25" height="50" rx="12.5" fill="#e2e8f0" />
        </motion.g>

        {/* Main Body (Bottom) */}
        <path d="M 60 110 C 60 180, 140 180, 140 110 Z" fill="url(#bodyGrad)" />
        <path d="M 65 140 Q 100 155 135 140" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

        {/* Head */}
        <rect x="40" y="40" width="120" height="80" rx="40" fill="url(#bodyGrad)" />
        
        {/* Face Screen */}
        <rect x="55" y="55" width="90" height="50" rx="20" fill="url(#screenGrad)" />

        {/* Eyes (Blinking + Tracking Animation) */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
          style={{ transformOrigin: "center", x: eyeX, y: eyeY }}
        >
          {/* Left Eye */}
          <path d="M 75 80 Q 82 70 90 80" fill="none" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
          <path d="M 75 80 Q 82 70 90 80" fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
          
          {/* Right Eye */}
          <path d="M 110 80 Q 117 70 125 80" fill="none" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
          <path d="M 110 80 Q 117 70 125 80" fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
        </motion.g>

        {/* Mouth */}
        <path d="M 95 90 Q 100 95 105 90" fill="none" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
      </svg>
    </motion.div>
  );
}
