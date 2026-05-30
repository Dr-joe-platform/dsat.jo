"use client";

import { LATEX_DELIMITERS } from '@/components/AnnotatableText';
import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Target, Sparkles, Download, Loader2 } from 'lucide-react';
import { useResults } from '@/lib/hooks/useResults';
import { useAuth } from '@/lib/auth-context';
import Latex from 'react-latex-next';

export default function AiAnalysisPage() {
  const { results, loading: resultsLoading } = useResults();
  const { appUser } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const handleExport = () => {
    window.print();
  };

  useEffect(() => {
    if (results.length > 0) {
      setLoadingInsights(true);
      fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: results.slice(0, 10) }) // Send up to 10 recent tests
      })
      .then(r => r.json())
      .then(data => {
        if (data.insights && data.insights.length > 0) {
          setInsights(data.insights);
        } else {
          setInsights([{ title: 'No Insights', text: 'Complete more tests to get AI insights.', color: '#94a3b8', icon: '📝' }]);
        }
        setLoadingInsights(false);
      })
      .catch(err => {
        console.error(err);
        setInsights([{ title: 'Error', text: 'Failed to load AI insights. Please try again.', color: '#ef4444', icon: '⚠️' }]);
        setLoadingInsights(false);
      });
    }
  }, [results]);

  if (resultsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ maxWidth: '900px', textAlign: 'center', padding: '4rem 2rem' }}>
        <BarChart2 size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>No Data Available</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Complete a practice test to unlock your AI Score Analysis.</p>
      </div>
    );
  }

  const scoreHistory = results.slice().reverse().map((r, i) => {
    const safeTotal = r.totalScore || 0;
    const math = r.subject === 'math' ? safeTotal : (r.subject === 'full' ? Math.round(safeTotal / 2) : 0);
    const rw = r.subject === 'reading_writing' ? safeTotal : (r.subject === 'full' ? Math.round(safeTotal / 2) : 0);
    return {
      test: `Test ${i + 1}`,
      math: math || 0,
      rw: rw || 0,
      total: safeTotal,
      date: r.completedAt ? new Date(r.completedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'
    };
  });

  const maxScore = 1600;
  const latest = scoreHistory[scoreHistory.length - 1] || { total: 0, math: 0, rw: 0 };
  const first = scoreHistory[0] || { total: 0, math: 0, rw: 0 };
  const improvement = (latest.total || 0) - (first.total || 0);

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 1cm; size: landscape; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          .sidebar, .top-nav { display: none !important; }
          .main-content { height: auto !important; overflow: visible !important; }
          main { padding: 0 !important; overflow: visible !important; }
          
          /* Hide the normal dashboard UI entirely */
          .dashboard-ui { display: none !important; }
          
          /* Show only the College Board Report */
          .cb-report { display: block !important; padding: 0.5in; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        }
        
        /* Hide the report from normal screen view */
        .cb-report { display: none; }
        
        /* Utility classes for the report */
        .cb-report * { box-sizing: border-box; }
        .cb-boxes { display: flex; gap: 4px; margin-top: 4px; }
        .cb-box { height: 8px; flex: 1; border: 1px solid #94a3b8; }
        .cb-box.filled { background-color: #000; border-color: #000; }
        .cb-domain { margin-bottom: 1.5rem; }
        .cb-domain-title { font-weight: 700; font-size: 0.85rem; color: #000; margin-bottom: 2px; }
        .cb-domain-subtitle { font-size: 0.7rem; color: #64748b; margin-bottom: 6px; }
      `}</style>
      
      {/* ========================================================
          COLLEGE BOARD STYLE PRINT REPORT 
          ======================================================== */}
      <div className="cb-report">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', border: '1px solid #000' }}>
            <div style={{ background: '#000', color: '#fff', padding: '10px 16px', fontSize: '1.75rem', fontWeight: 'bold' }}>D</div>
            <div style={{ background: '#fff', color: '#000', padding: '10px 16px', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>SAT</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: '#000' }}><b>Name:</b> {appUser?.displayName || 'Student'} ({appUser?.email})</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', border: '1px solid #000', padding: '4px 12px', display: 'inline-block', marginTop: '4px', borderRadius: '4px' }}>DSAT.JO</div>
          </div>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#000', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>AI Score Analysis</h1>

        <div style={{ border: '1px solid #94a3b8', display: 'grid', gridTemplateColumns: '1fr 2fr', minHeight: '60vh' }}>
          {/* Left Column: Score Overview */}
          <div style={{ padding: '2rem', borderRight: '1px solid #94a3b8' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '2rem' }}>Performance</h2>
            
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>LATEST TOTAL SCORE</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1' }}>{latest.total}</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>400-1600</div>
                  <div style={{ border: '1px solid #94a3b8', padding: '4px 8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Target: 1400</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>TEST HISTORY</div>
            <div style={{ borderTop: '2px solid #000', paddingTop: '0.5rem' }}>
              {scoreHistory.slice(-5).reverse().map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <span style={{ color: '#475569', fontWeight: '600' }}>{s.date}</span>
                  <span style={{ fontWeight: 'bold', color: '#000' }}>{s.total}</span>
                </div>
              ))}
            </div>
            
            {scoreHistory.length > 1 && (
              <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Trend</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: improvement > 0 ? '#16a34a' : '#000' }}>
                  {improvement > 0 ? `+${improvement} pts` : `${improvement} pts`}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Insights */}
          <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '0.5rem' }}>AI Insights & Recommendations</h2>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '2rem' }}>Personalized analysis based on your recent practice tests.</div>

            {loadingInsights ? (
              <div style={{ padding: '2rem', color: '#64748b', fontStyle: 'italic' }}>Generating insights...</div>
            ) : insights.length === 0 ? (
              <div style={{ padding: '2rem', color: '#64748b', fontStyle: 'italic' }}>No insights available yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {insights.map((ins, i) => (
                  <div key={i} className="cb-domain" style={{ borderBottom: i === insights.length - 1 ? 'none' : '1px solid #e2e8f0', paddingBottom: i === insights.length - 1 ? 0 : '1.5rem', marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{ins.icon}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>{ins.title}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                          <Latex delimiters={LATEX_DELIMITERS} strict={false}>{ins.text}</Latex>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          NORMAL DASHBOARD UI 
          ======================================================== */}
      <div className="dashboard-ui" style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BarChart2 size={24} color="#6366f1" /> AI Score Analysis
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>AI-powered insights based on all your practice tests.</p>
          </div>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', color: '#475569', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
            <Download size={14} /> Export Report
          </button>
        </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Latest Score', value: latest.total, sub: `/ ${maxScore}`, color: '#6366f1' },
          { label: 'Improvement', value: improvement > 0 ? `+${improvement}` : improvement, sub: 'from test 1', color: improvement >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Math Score', value: latest.math, sub: '/ 800', color: '#3b82f6' },
          { label: 'R&W Score', value: latest.rw, sub: '/ 800', color: '#a855f7' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: s.color, letterSpacing: '-1px', lineHeight: '1', marginBottom: '0.25rem' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{s.sub}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* Score chart */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={16} color="#6366f1" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Score Progression</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.875rem', height: '180px', paddingBottom: '2rem', position: 'relative', borderBottom: '1px solid #f1f5f9' }}>
            {scoreHistory.map((s, i) => {
              const totalPct = (s.total / maxScore) * 100;
              const mathPct = (s.math / 800) * 100;
              const rwPct = (s.rw / 800) * 100;

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: '700', marginBottom: '4px' }}>{s.total}</span>
                  <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, height: `${mathPct * 1.4}px`, background: '#3b82f6', borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease', minHeight: '4px' }} title={`Math: ${s.math}`} />
                    <div style={{ flex: 1, height: `${rwPct * 1.4}px`, background: '#a855f7', borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease', minHeight: '4px' }} title={`R&W: ${s.rw}`} />
                  </div>
                </div>
              );
            })}
            {/* X-axis labels */}
            <div style={{ position: 'absolute', bottom: '-1.5rem', left: 0, right: 0, display: 'flex', gap: '0.875rem' }}>
              {scoreHistory.map((s, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.date}</div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6' }} /> Math</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#a855f7' }} /> Reading & Writing</div>
          </div>
        </div>

        {/* AI Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {loadingInsights ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
              <Loader2 size={24} className="animate-spin text-indigo-500" />
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>AI is analyzing your performance...</div>
            </div>
          ) : (
            insights.map((ins, i) => (
              <div key={i} style={{ padding: '1rem 1.25rem', border: `1px solid ${ins.color}22`, borderRadius: '0.875rem', background: `${ins.color}08` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <Target size={16} color={ins.type === 'strength' ? '#22c55e' : ins.type === 'weakness' ? '#ef4444' : '#6366f1'} style={{ marginTop: '0.2rem' }} />
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>{ins.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6' }}>
                      <Latex delimiters={LATEX_DELIMITERS} strict={false}>{ins.text}</Latex>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Target score */}
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <Target size={16} color="#f59e0b" />
              <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.875rem' }}>Target Score</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Current: {latest.total}</span>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700' }}>Target: 1400</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(latest.total / 1400) * 100}%`, background: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>
              {Math.max(0, 1400 - latest.total)} points to goal
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
