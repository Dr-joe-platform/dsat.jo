"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Edit2, X, BookOpen, Loader2 } from 'lucide-react';
import Latex from 'react-latex-next';
import { useAuth } from '@/lib/auth-context';
import { addVocabWord } from '@/lib/db';

export const LATEX_DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false },
  { left: '\\[', right: '\\]', display: true },
];

export type HighlightAnnotation = {
  id: string;
  startIndex: number;
  endIndex: number;
  color: string;
};

interface AnnotatableTextProps {
  text: string;
  annotations: HighlightAnnotation[];
  onAddAnnotation: (annotation: Omit<HighlightAnnotation, 'id'>) => void;
  onRemoveAnnotation: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
  disableLatex?: boolean;
}

export default function AnnotatableText({ text, annotations, onAddAnnotation, onRemoveAnnotation, className, style, disableLatex = false }: AnnotatableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { appUser } = useAuth();
  const [addingWord, setAddingWord] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; show: boolean; start: number; end: number }>({ top: 0, left: 0, show: false, start: 0, end: 0 });

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (tooltipPos.show) setTooltipPos(prev => ({ ...prev, show: false }));
        return;
      }

      if (containerRef.current && containerRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Calculate absolute start/end indices
        // Note: This relies on the container structure being predictable.
        const start = getCharIndexFromNode(containerRef.current, range.startContainer, range.startOffset);
        const end = getCharIndexFromNode(containerRef.current, range.endContainer, range.endOffset);

        if (start !== -1 && end !== -1 && start !== end) {
          setTooltipPos({
            show: true,
            top: rect.top + window.scrollY - 40,
            left: rect.left + window.scrollX + (rect.width / 2),
            start: Math.min(start, end),
            end: Math.max(start, end)
          });
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [tooltipPos.show]);

  // Recursively find the absolute character index
  const getCharIndexFromNode = (container: Node, targetNode: Node, targetOffset: number): number => {
    let index = 0;
    let found = false;

    const traverse = (node: Node) => {
      if (found) return;
      if (node === targetNode) {
        index += targetOffset;
        found = true;
        return;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        index += node.textContent?.length || 0;
      } else {
        node.childNodes.forEach(traverse);
      }
    };

    traverse(container);
    return found ? index : -1;
  };

  const handleAddColor = (color: string) => {
    onAddAnnotation({
      startIndex: tooltipPos.start,
      endIndex: tooltipPos.end,
      color
    });
    setTooltipPos(prev => ({ ...prev, show: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleAddVocab = async () => {
    if (!appUser?.uid) return;
    const word = text.substring(tooltipPos.start, tooltipPos.end).trim();
    if (!word || word.length > 40) {
      alert("Please select a single word or short phrase (max 40 characters).");
      return;
    }
    setAddingWord(true);
    try {
      const res = await fetch('/api/define-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await addVocabWord(appUser.uid, word, data.definition, data.example);
      
      alert(`Added "${word}" to your vocabulary!`);
      setTooltipPos(prev => ({ ...prev, show: false }));
      window.getSelection()?.removeAllRanges();
    } catch (err) {
      alert("Failed to fetch definition or add word.");
    } finally {
      setAddingWord(false);
    }
  };

  const renderWithImages = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(!\[.*?\]\([^)]+\))/g);
    return parts.map((part, index) => {
      if (!part) return null;
      const match = part.match(/!\[.*?\]\(([^)]+)\)/);
      if (match) {
        return <img key={index} src={match[1]} alt="inline figure" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '0.5rem', display: 'block', margin: '1rem auto', border: '1px solid #cbd5e1' }} />;
      }
      return disableLatex ? part : <Latex key={index} delimiters={LATEX_DELIMITERS} strict={false}>{part}</Latex>;
    });
  };

  // Render text with highlights
  const renderText = () => {
    if (!annotations || annotations.length === 0) {
      return renderWithImages(text);
    }

    let segments: { text: string; annotation?: HighlightAnnotation }[] = [];
    
    // Sort annotations by startIndex
    const sorted = [...annotations].sort((a, b) => a.startIndex - b.startIndex);
    let currentIndex = 0;

    sorted.forEach(ann => {
      if (ann.startIndex > currentIndex) {
        segments.push({ text: text.substring(currentIndex, ann.startIndex) });
      }
      segments.push({
        text: text.substring(Math.max(currentIndex, ann.startIndex), ann.endIndex),
        annotation: ann
      });
      currentIndex = Math.max(currentIndex, ann.endIndex);
    });

    if (currentIndex < text.length) {
      segments.push({ text: text.substring(currentIndex) });
    }

    return segments.map((seg, i) => {
      if (seg.annotation) {
        return (
          <mark 
            key={i} 
            style={{ 
              backgroundColor: seg.annotation.color, 
              cursor: 'pointer',
              color: 'inherit',
              padding: '2px 0',
              borderRadius: '2px'
            }}
            onClick={() => onRemoveAnnotation(seg.annotation!.id)}
            title="Click to remove highlight"
          >
            {renderWithImages(seg.text)}
          </mark>
        );
      }
      return <span key={i}>{renderWithImages(seg.text)}</span>;
    });
  };

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
      {renderText()}
      
      {tooltipPos.show && (
        <div 
          style={{
            position: 'absolute',
            top: tooltipPos.top - (containerRef.current?.getBoundingClientRect().top || 0) + (containerRef.current?.scrollTop || 0),
            left: tooltipPos.left - (containerRef.current?.getBoundingClientRect().left || 0),
            transform: 'translateX(-50%)',
            background: '#0f172a',
            padding: '8px 12px',
            borderRadius: '8px',
            display: 'flex',
            gap: '8px',
            zIndex: 100,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => handleAddColor('#fef08a')} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fef08a', border: 'none', cursor: 'pointer' }} title="Highlight Yellow" />
          <button onClick={() => handleAddColor('#fca5a5')} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fca5a5', border: 'none', cursor: 'pointer' }} title="Highlight Pink" />
          <button onClick={() => handleAddColor('#93c5fd')} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#93c5fd', border: 'none', cursor: 'pointer' }} title="Highlight Blue" />
          
          {(tooltipPos.end - tooltipPos.start) <= 40 && (
            <>
              <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
              <button 
                onClick={handleAddVocab} 
                disabled={addingWord}
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: addingWord ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600' }}
                title="Add to Vocabulary"
              >
                {addingWord ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                Add Vocab
              </button>
            </>
          )}

          <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
          <button onClick={() => setTooltipPos(prev => ({ ...prev, show: false }))} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
