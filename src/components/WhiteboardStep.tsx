"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Latex from 'react-latex-next';
import { LATEX_DELIMITERS } from './AnnotatableText';

interface WhiteboardStepProps {
  explanationText: string;
}

export default function WhiteboardStep({ explanationText }: WhiteboardStepProps) {
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean markdown hashes and bold stars
    const cleanText = (explanationText || '').replace(/[#*]/g, '');
    
    // Split into sentences/steps, trying to preserve math blocks if possible
    let extractedSteps = cleanText.split(/(?<=\.)\s+/).filter(s => s.trim().length > 0);
    
    if (extractedSteps.length === 1 && extractedSteps[0].length > 100) {
        extractedSteps = extractedSteps[0].split(/(?<=,)\s+/);
    }
    
    setSteps(extractedSteps.map(s => s.trim()));
    setCurrentStep(0);
  }, [explanationText]);

  useEffect(() => {
    // Scroll down slightly whenever a new step is revealed
    if (currentStep > 0 && bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [currentStep]);

  // Tokenize a string into words, spaces, and math blocks
  const tokenize = (text: string) => {
    return text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\s+)/).filter(t => t.length > 0);
  };

  if (steps.length <= 1) {
    // If it's a very short explanation, still render it with Latex and animation
    if (steps.length === 0) return null;
  }

  return (
    <div style={{ background: '#1e293b', borderRadius: '0.75rem', padding: '1.5rem', marginTop: '1rem', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
      {/* Chalkboard noise overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, pointerEvents: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#93c5fd', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Interactive Chalkboard
        </h4>
      </div>

      <div style={{ minHeight: '150px', position: 'relative' }}>
        <AnimatePresence>
          {steps.slice(0, currentStep + 1).map((step, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              initial={idx === currentStep ? "hidden" : "visible"}
              animate="visible"
              style={{
                marginBottom: '1rem',
                fontSize: '1.1rem',
                lineHeight: '1.8',
                color: idx === currentStep ? '#ffffff' : 'rgba(255,255,255,0.6)',
                fontWeight: idx === currentStep ? '700' : '500',
                fontFamily: "'Chalkboard SE', 'Comic Sans MS', sans-serif",
                textShadow: '0px 0px 2px rgba(255,255,255,0.4)',
                wordWrap: 'break-word'
              }}
            >
              {tokenize(step).map((token, tIdx) => {
                const isBlockMath = token.startsWith('$$');
                
                if (isBlockMath) {
                  return (
                    <motion.div
                      key={tIdx}
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1 }
                      }}
                      style={{ display: 'block', margin: '0.5rem 0' }}
                    >
                      <span className="chalk-math">
                        <Latex delimiters={LATEX_DELIMITERS} strict={false}>{token}</Latex>
                      </span>
                    </motion.div>
                  );
                }
                
                return (
                  <motion.span
                    key={tIdx}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 }
                    }}
                    style={{ display: 'inline', margin: '0' }}
                  >
                    <span className="chalk-math">
                      <Latex delimiters={LATEX_DELIMITERS} strict={false}>{token}</Latex>
                    </span>
                  </motion.span>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} style={{ height: '1px', marginTop: '1rem' }} />
      </div>

      {/* Action Area at the bottom */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', position: 'relative' }}>
        <button 
          onClick={() => {
            if (currentStep > 0) {
              setCurrentStep(prev => prev - 1);
            }
          }}
          disabled={currentStep === 0}
          style={{ background: 'transparent', color: currentStep === 0 ? 'rgba(255,255,255,0.3)' : '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: '700', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 0.2s' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button 
          onClick={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep(prev => prev + 1);
            } else {
              setCurrentStep(0); // Reset
            }
          }}
          style={{ background: '#3b82f6', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}
        >
          {currentStep < steps.length - 1 ? (
            <>Next Step <ChevronRight size={16} /></>
          ) : (
            <>Replay Steps</>
          )}
        </button>
      </div>
      
      {/* Chalk Progress */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((currentStep + 1) / steps.length) * 100}%`, background: '#fff', boxShadow: '0 0 5px #fff', transition: 'width 0.3s ease' }} />
      </div>
      
      {/* Force math to look slightly chalky if possible */}
      <style>{`
        .chalk-math .katex {
          text-shadow: none;
          color: inherit;
        }
      `}</style>
    </div>
  );
}
