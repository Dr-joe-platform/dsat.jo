"use client";

import React from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, ChevronRight } from 'lucide-react';

const FORMULAS = [
  { label: 'Government University (SAT1 ≥ 1090)', formula: '(SAT1/1600)×69 + (SAT2/1600)×15 + GPA', bonus: '+9%' },
  { label: 'Private University (SAT1 ≥ 1090)', formula: '(SAT1/1600)×75 + (SAT2/1600)×15 + GPA', bonus: '+15%' },
  { label: 'Below 1090 (any)', formula: '(SAT1/1600)×60 + (SAT2/1600)×15 + GPA', bonus: 'No bonus' },
];

export default function SatCalculatorPage() {
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calculator size={24} /> SAT Score Calculator
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Calculate your weighted score for Egyptian universities.</p>
      </div>

      {/* Calculator card */}
      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* SAT 1 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
              SAT 1 SCORE <span style={{ color: '#94a3b8', fontWeight: '400' }}>(out of 1600)</span>
            </label>
            <input id="calc-sat1" type="number" min={0} max={1600} placeholder="e.g. 1320" className="input-field" />
          </div>

          {/* SAT 2 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
              SAT 2 SCORE <span style={{ color: '#94a3b8', fontWeight: '400' }}>(out of 1600)</span>
            </label>
            <input id="calc-sat2" type="number" min={0} max={1600} placeholder="e.g. 1450" className="input-field" />
          </div>

          {/* GPA */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
              GPA SCORE <span style={{ color: '#94a3b8', fontWeight: '400' }}>(out of 40)</span>
            </label>
            <input id="calc-gpa" type="number" min={0} max={40} step={0.01} placeholder="e.g. 35" className="input-field" />
          </div>

          {/* Method */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
              UNIVERSITY TYPE
            </label>
            <select id="calc-method" className="input-field">
              <option value="government">Government University</option>
              <option value="private">Private University</option>
              <option value="institutes">Higher Institutes (with fees)</option>
            </select>
          </div>

          {/* Calculate button */}
          <button
            style={{
              width: '100%', padding: '0.875rem',
              background: '#0f172a', color: '#fff',
              borderRadius: '0.625rem', fontWeight: '700',
              fontSize: '0.95rem', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onClick={() => {
              const sat1 = parseFloat((document.getElementById('calc-sat1') as HTMLInputElement).value) || 0;
              const sat2 = parseFloat((document.getElementById('calc-sat2') as HTMLInputElement).value) || 0;
              const gpa = parseFloat((document.getElementById('calc-gpa') as HTMLInputElement).value) || 0;
              const method = (document.getElementById('calc-method') as HTMLSelectElement).value;
              const resultBox = document.getElementById('calc-result-box');
              const resultValue = document.getElementById('calc-result-value');
              const resultDetail = document.getElementById('calc-result-detail');
              if (!resultBox || !resultValue || !resultDetail) return;
              if (sat1 <= 0 || gpa <= 0) { alert('Please enter SAT 1 and GPA scores.'); return; }

              let score = 0;
              let detail = '';
              const sat2Valid = method === 'government' ? sat2 >= 1100 : sat2 >= 900;
              const sat2Score = sat2Valid ? sat2 : 0;
              const sat2Note = sat2Valid ? '' : ` (SAT2 ${sat2} below minimum, not counted)`;

              if (sat1 >= 1090) {
                if (method === 'private') {
                  score = (sat1 / 1600) * 75 + (sat2Score / 1600) * 15 + gpa;
                  detail = `(${sat1}/1600)×75 + (${sat2Score}/1600)×15 + ${gpa}${sat2Note}`;
                } else {
                  score = (sat1 / 1600) * 69 + (sat2Score / 1600) * 15 + gpa;
                  detail = `(${sat1}/1600)×69 + (${sat2Score}/1600)×15 + ${gpa}${sat2Note}`;
                }
              } else {
                score = (sat1 / 1600) * 60 + (sat2Score / 1600) * 15 + gpa;
                detail = `(${sat1}/1600)×60 + (${sat2Score}/1600)×15 + ${gpa} (no bonus, SAT1 < 1090)${sat2Note}`;
              }

              resultValue.textContent = score.toFixed(2);
              resultDetail.textContent = detail;
              resultBox.style.display = 'block';
            }}
          >
            <Calculator size={18} /> Calculate My Score
          </button>

          {/* Result box */}
          <div id="calc-result-box" style={{
            display: 'none', background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: '0.875rem', padding: '1.5rem', textAlign: 'center',
          }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Your Weighted Score</p>
            <p id="calc-result-value" style={{ fontSize: '3.5rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-2px', lineHeight: '1' }}>0.00</p>
            <p id="calc-result-detail" style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.75rem', lineHeight: '1.6' }}></p>
          </div>
        </div>
      </div>

      {/* Formula reference */}
      <div className="stat-card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Formula Reference</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FORMULAS.map((f, i) => (
            <div key={i} style={{ padding: '0.875rem', border: '1px solid #f1f5f9', borderRadius: '0.625rem', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.825rem' }}>{f.label}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', background: i === 0 ? '#dbeafe' : i === 1 ? '#ede9fe' : '#f1f5f9', color: i === 0 ? '#1d4ed8' : i === 1 ? '#6d28d9' : '#64748b', padding: '0.15rem 0.5rem', borderRadius: '1rem', flexShrink: 0 }}>
                  {f.bonus}
                </span>
              </div>
              <code style={{ fontSize: '0.75rem', color: '#6366f1', fontFamily: 'monospace' }}>{f.formula}</code>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.625rem', fontSize: '0.75rem', color: '#92400e', lineHeight: '1.6' }}>
          <strong>Rules:</strong> SAT1 min 1050 (gov) / 890 (institutes). SAT2 min 1100 (gov) / 900 (private/institutes) to count.
        </div>
      </div>
    </div>
  );
}
