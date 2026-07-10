"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, PenTool, Eraser, Loader2, Save, Hand, Highlighter, Type } from 'lucide-react';

// Setup pdf.js worker using Next.js native URL import
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerProps {
  url: string;
  ebookId: string;
  studentId: string;
  allowAnnotations?: boolean;
  saveProgress?: boolean;
}

// Subcomponent for each page to handle its own drawing canvas
const PdfPageWithDrawing = ({ 
  pageNumber, 
  scale, 
  activeTool, 
  penColor, 
  allowAnnotations, 
  studentId, 
  ebookId,
  saveRef
}: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState<{ x: number, y: number, text: string } | null>(null);
  const getAnnotationKey = (page: number) => `ebook_annot_${studentId}_${ebookId}_page_${page}`;

  // Robust Canvas Initialization with ResizeObserver
  useEffect(() => {
    if (!allowAnnotations) return;
    const parent = canvasRef.current?.parentElement;
    if (!parent) return;

    let resizeTimeout: NodeJS.Timeout;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas || parent.clientWidth === 0 || parent.clientHeight === 0) return;
      
      const prevDataUrl = canvas.width > 0 ? canvas.toDataURL() : null;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
        
        const img = new Image();
        img.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        const saved = localStorage.getItem(getAnnotationKey(pageNumber));
        if (saved) {
          img.src = saved;
        } else if (prevDataUrl) {
          img.src = prevDataUrl;
        }
      }
    };

    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 50); // Debounce to prevent flicker
    });

    observer.observe(parent);
    
    // Initial trigger
    resizeTimeout = setTimeout(resizeCanvas, 100);

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [allowAnnotations, scale, pageNumber]);

  const saveDrawings = () => {
    if (!allowAnnotations || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    localStorage.setItem(getAnnotationKey(pageNumber), dataUrl);
  };

  // expose save method
  useEffect(() => {
    if (saveRef) {
      saveRef.current = saveDrawings;
    }
  }, [saveRef]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'hand') return;
    
    const { offsetX, offsetY } = getCoordinates(e);

    if (activeTool === 'text') {
      if (textInput) {
        // If there is an existing text input, commit it first
        commitText();
      }
      setTextInput({ x: offsetX, y: offsetY, text: '' });
      return;
    }

    setIsDrawing(true);
    if (contextRef.current) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault(); // prevent scrolling while drawing
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = contextRef.current;
    if (ctx) {
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 25;
      } else if (activeTool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 18;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 3;
      }
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      if (contextRef.current) {
        contextRef.current.closePath();
      }
      setIsDrawing(false);
      saveDrawings();
    }
  };

  const commitText = () => {
    if (!textInput || !textInput.text.trim()) {
      setTextInput(null);
      return;
    }
    const ctx = contextRef.current;
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = penColor;
      // Approximate scaling for text size
      const fontSize = Math.max(16, 24 * scale);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillText(textInput.text, textInput.x, textInput.y + (fontSize / 2));
      saveDrawings();
    }
    setTextInput(null);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <Page 
        pageNumber={pageNumber} 
        scale={scale} 
        renderTextLayer={false} 
        renderAnnotationLayer={false}
      />
      {allowAnnotations && (
        <>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              pointerEvents: activeTool === 'hand' ? 'none' : 'auto',
              cursor: activeTool === 'hand' ? 'inherit' : (activeTool === 'pen' || activeTool === 'highlighter' ? 'crosshair' : (activeTool === 'text' ? 'text' : (activeTool === 'eraser' ? 'cell' : 'default'))),
              touchAction: activeTool !== 'hand' ? 'none' : 'auto' // CRITICAL to prevent scroll while drawing on mobile
            }}
          />
          {textInput && (
            <input 
              autoFocus
              type="text"
              value={textInput.text}
              onChange={e => setTextInput({ ...textInput, text: e.target.value })}
              onBlur={commitText}
              onKeyDown={e => {
                if (e.key === 'Enter') commitText();
              }}
              style={{
                position: 'absolute',
                left: textInput.x,
                top: textInput.y - (Math.max(16, 24 * scale) / 2),
                zIndex: 20,
                color: penColor,
                fontSize: `${Math.max(16, 24 * scale)}px`,
                background: 'transparent',
                border: '1px dashed #94a3b8',
                outline: 'none',
                minWidth: '150px'
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default function PdfViewer({ url, ebookId, studentId, allowAnnotations, saveProgress }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.2);
  const [activeTool, setActiveTool] = useState<'hand' | 'pen' | 'highlighter' | 'eraser' | 'text'>('hand');
  const [penColor, setPenColor] = useState('#ef4444');
  
  // Drag to scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#0f172a'];
  const progressKey = `ebook_progress_${studentId}_${ebookId}`;
  
  // We need to keep track of save functions for all pages to force save
  const pageSaveRefs = useRef<Record<number, any>>({});

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'hand' || !scrollContainerRef.current) return;
    
    // Only intercept if they are actively dragging with left click
    if (e.button !== 0) return;
    
    const element = scrollContainerRef.current;
    
    // Don't intercept if they are clicking the native scrollbar
    const isScrollbarY = e.clientX >= element.getBoundingClientRect().right - (element.offsetWidth - element.clientWidth);
    const isScrollbarX = e.clientY >= element.getBoundingClientRect().bottom - (element.offsetHeight - element.clientHeight);
    if (isScrollbarY || isScrollbarX) return;
    
    e.preventDefault(); // Prevent native text selection/image dragging
    setIsDragging(true);
    setStartY(e.pageY - element.offsetTop);
    setStartX(e.pageX - element.offsetLeft);
    setScrollTop(element.scrollTop);
    setScrollLeft(element.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || activeTool !== 'hand' || !scrollContainerRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walkY = (y - startY); // 1:1 natural scroll speed
    const walkX = (x - startX);
    scrollContainerRef.current.scrollTop = scrollTop - walkY;
    scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const forceSaveAll = () => {
    Object.values(pageSaveRefs.current).forEach(saveFn => {
      if (saveFn) saveFn();
    });
    alert('All annotations saved successfully!');
  };

  if (url.includes('drive.google.com')) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.5rem', background: '#fff3cd', color: '#856404', fontSize: '0.85rem', textAlign: 'center', borderBottom: '1px solid #ffeeba' }}>
          <strong>Note:</strong> Google Drive links do not support local annotations or saving progress.
        </div>
        <iframe src={url} style={{ flex: 1, border: 'none', width: '100%' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: '100%', minHeight: 0, background: '#f1f5f9' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', background: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Zoom Out</button>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))} style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', background: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Zoom In</button>
        </div>

        {allowAnnotations && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.25rem' }}>
              <button 
                onClick={() => setActiveTool('hand')} 
                style={{ padding: '0.4rem', background: activeTool === 'hand' ? '#fff' : 'transparent', color: activeTool === 'hand' ? '#0f172a' : '#64748b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', boxShadow: activeTool === 'hand' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                title="Hand Tool (Scroll)"
              >
                <Hand size={16} />
              </button>
              <button 
                onClick={() => setActiveTool('pen')} 
                style={{ padding: '0.4rem', background: activeTool === 'pen' ? '#fee2e2' : 'transparent', color: activeTool === 'pen' ? penColor : '#64748b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', boxShadow: activeTool === 'pen' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                title="Pen Tool"
              >
                <PenTool size={16} />
              </button>
              <button 
                onClick={() => setActiveTool('highlighter')} 
                style={{ padding: '0.4rem', background: activeTool === 'highlighter' ? '#fef08a' : 'transparent', color: activeTool === 'highlighter' ? '#ca8a04' : '#64748b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', boxShadow: activeTool === 'highlighter' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                title="Highlighter"
              >
                <Highlighter size={16} />
              </button>
              <button 
                onClick={() => setActiveTool('text')} 
                style={{ padding: '0.4rem', background: activeTool === 'text' ? '#e0e7ff' : 'transparent', color: activeTool === 'text' ? '#4338ca' : '#64748b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', boxShadow: activeTool === 'text' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                title="Text Box Tool"
              >
                <Type size={16} />
              </button>
              <button 
                onClick={() => setActiveTool('eraser')} 
                style={{ padding: '0.4rem', background: activeTool === 'eraser' ? '#f1f5f9' : 'transparent', color: activeTool === 'eraser' ? '#475569' : '#64748b', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', boxShadow: activeTool === 'eraser' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                title="Eraser"
              >
                <Eraser size={16} />
              </button>
            </div>

            {(activeTool === 'pen' || activeTool === 'text') && (
              <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setPenColor(color)}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', background: color, border: penColor === color ? '2px solid #0f172a' : '2px solid transparent', cursor: 'pointer', padding: 0 }}
                  />
                ))}
              </div>
            )}

            <button onClick={forceSaveAll} style={{ padding: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: 'pointer' }} title="Force Save">
              <Save size={16} color="#10b981" />
            </button>
          </div>
        )}
      </div>

      {/* PDF Container - Continuous Scroll */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ 
          flex: 1, 
          overflowY: 'auto',
          overflowX: 'auto',
          minHeight: 0,
          padding: '2rem 1rem', 
          textAlign: 'center', 
          position: 'relative',
          cursor: activeTool === 'hand' ? (isDragging ? 'grabbing' : 'grab') : 'default',
          userSelect: activeTool === 'hand' ? 'none' : 'auto'
        }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b' }}><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading PDF...</div>}
          error={<div style={{ padding: '2rem', color: '#ef4444', textAlign: 'center' }}>Failed to load PDF. Please make sure the link is a direct PDF link with CORS enabled.</div>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_wrapper_${index}`} style={{ marginBottom: '1.5rem', display: 'block' }}>
              <PdfPageWithDrawing
                pageNumber={index + 1}
                scale={scale}
                activeTool={activeTool}
                penColor={penColor}
                allowAnnotations={allowAnnotations}
                studentId={studentId}
                ebookId={ebookId}
                saveRef={{
                  get current() { return null; },
                  set current(val: any) {
                    pageSaveRefs.current[index + 1] = val;
                  }
                } as any}
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
