import React from 'react';

// Utility for rough percentiles based on 2023 SAT data mapping
const getPercentile = (score: number) => {
  if (score >= 1550) return '99th';
  if (score >= 1500) return '98th';
  if (score >= 1450) return '96th';
  if (score >= 1400) return '93rd';
  if (score >= 1350) return '90th';
  if (score >= 1300) return '86th';
  if (score >= 1250) return '81st';
  if (score >= 1200) return '74th';
  if (score >= 1150) return '67th';
  if (score >= 1100) return '59th';
  if (score >= 1050) return '51st';
  if (score >= 1000) return '43rd';
  if (score >= 950) return '35th';
  if (score >= 900) return '28th';
  if (score >= 850) return '21st';
  if (score >= 800) return '15th';
  if (score >= 700) return '7th';
  if (score >= 600) return '2nd';
  return '< 1st';
};

const getSectionPercentile = (score: number) => {
  const scaled = Math.min(1600, score * 2);
  return getPercentile(scaled);
};

interface DomainStat {
  correct: number;
  total: number;
  name: string;
  description: string;
}

export default function SATScoreReport({
  studentName,
  date,
  totalScore,
  rwScore,
  mathScore,
  domainStats
}: {
  studentName: string;
  date: string;
  totalScore: number;
  rwScore: number;
  mathScore: number;
  domainStats: Record<string, DomainStat>;
}) {
  const rwDomains = [
    { key: 'Craft and Structure', label: 'Craft and Structure', desc: '(28% of test section, 13-17 questions)' },
    { key: 'Information and Ideas', label: 'Information and Ideas', desc: '(26% of test section, 12-16 questions)' },
    { key: 'Standard English Conventions', label: 'Standard English Conventions', desc: '(26% of test section, 12-16 questions)' },
    { key: 'Expression of Ideas', label: 'Expression of Ideas', desc: '(20% of test section, 9-13 questions)' }
  ];

  const mathDomains = [
    { key: 'Algebra', label: 'Algebra', desc: '(35% of test section, 13-17 questions)' },
    { key: 'Advanced Math', label: 'Advanced Math', desc: '(35% of test section, 13-17 questions)' },
    { key: 'Problem-Solving and Data Analysis', label: 'Problem-Solving and Data Analysis', desc: '(15% of test section, 5-9 questions)' },
    { key: 'Geometry and Trigonometry', label: 'Geometry and Trigonometry', desc: '(15% of test section, 5-9 questions)' }
  ];

  const renderBlocks = (domainKey: string) => {
    const stat = domainStats[domainKey] || { correct: 0, total: 0 };
    let filledBlocks = 0;
    if (stat.total > 0) {
      const accuracy = stat.correct / stat.total;
      filledBlocks = Math.max(1, Math.round(accuracy * 7));
    }
    
    return (
      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '10px',
              border: '1px solid #94a3b8',
              backgroundColor: i < filledBlocks ? '#3b82f6' : 'transparent',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div id="sat-score-report" style={{ 
      background: 'white', 
      width: '100%', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '40px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#000',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '50px', height: '50px', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>JO</div>
          <div style={{ height: '50px', padding: '0 15px', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>SAT</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Name:</strong> {studentName}</div>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Date:</strong> {date}</div>
          <div style={{ 
            display: 'inline-block', 
            padding: '4px 16px', 
            border: '2px solid #000', 
            borderRadius: '16px', 
            fontWeight: 'bold',
            fontSize: '14px' 
          }}>
            dsat.jo
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 30px 0' }}>Your Scores</h1>

      <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
        
        {/* Left Column */}
        <div style={{ flex: '0 0 35%', padding: '30px', borderRight: '1px solid #cbd5e1' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 30px 0' }}>SAT Scores</h2>
          
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Total Score</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
              <div style={{ fontSize: '56px', fontWeight: '900', lineHeight: '1' }}>{totalScore}</div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', marginBottom: '2px' }}>400-1600</div>
                <div style={{ border: '1px solid #cbd5e1', padding: '4px 8px', fontSize: '14px', fontWeight: 'bold' }}>{getPercentile(totalScore)}*</div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '20px' }}>Section Scores</div>
            
            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Reading and Writing</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ fontSize: '36px', fontWeight: '900', lineHeight: '1' }}>{rwScore}</div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', marginBottom: '2px' }}>200-800</div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' }}>{getSectionPercentile(rwScore)}*</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Math</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ fontSize: '36px', fontWeight: '900', lineHeight: '1' }}>{mathScore}</div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', marginBottom: '2px' }}>200-800</div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' }}>{getSectionPercentile(mathScore)}*</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '60px', lineHeight: '1.4' }}>
            * Percentiles indicate the percentage of all test takers to date who achieved a score equal to or lower than yours on this specific attempt.
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: '1', padding: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Knowledge and Skills</h2>
          <div style={{ fontSize: '14px', color: '#475569', marginBottom: '30px' }}>View your performance across the 8 content domains measured on the SAT.</div>

          <div style={{ display: 'flex', gap: '30px' }}>
            {/* RW Domains */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Reading and Writing</h3>
              {rwDomains.map((dom, i) => (
                <div key={i} style={{ marginBottom: '25px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>{dom.label}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{dom.desc}</div>
                  {renderBlocks(dom.key)}
                </div>
              ))}
            </div>

            {/* Math Domains */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Math</h3>
              {mathDomains.map((dom, i) => (
                <div key={i} style={{ marginBottom: '25px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>{dom.label}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{dom.desc}</div>
                  {renderBlocks(dom.key)}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
