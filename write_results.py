import os

file_path = r'c:\Users\elnim\Desktop\dsatuz\src\app\test\[testId]\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We look for the placeholder I just added
target = """  if (phase === 'results') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1rem', fontFamily: 'sans-serif', color: '#0f172a' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 0.5rem', letterSpacing: '-0.5px' }}>Your SAT Results</h1>
            <p>Please check your Analytics dashboard to view details.</p>
            <button onClick={() => router.push('/dashboard/practice')} style={{ padding: '1rem 3rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }"""

new_results = """  if (phase === 'results') {
    const domainStats: Record<string, { correct: number, total: number }> = {};
    const questionList: any[] = [];
    let qNumber = 1;

    allModules.forEach(mk => {
      const qs = testData[mk as keyof DSATModule] ?? [];
      qs.forEach((q: any, i: number) => {
        const userAns = q.type === 'SPR' ? sprAnswers[mk as string]?.[i] : answers[mk as string]?.[i];
        const isCorrect = userAns === q.correctAnswer;
        const domain = q.domain || 'General Practice';
        if (!domainStats[domain]) domainStats[domain] = { correct: 0, total: 0 };
        domainStats[domain].total++;
        if (isCorrect) domainStats[domain].correct++;

        questionList.push({
          num: qNumber++,
          module: mk,
          domain: domain,
          difficulty: q.difficulty || 'Medium',
          userAns: userAns || '-',
          correctAnswer: q.correctAnswer,
          isCorrect: isCorrect,
          idx: i
        });
      });
    });

    const Dial = ({ score, min, max, title, color, isTotal }: any) => {
      const radius = isTotal ? 70 : 55;
      const size = isTotal ? 180 : 140;
      const strokeW = isTotal ? 14 : 10;
      const circumference = 2 * Math.PI * radius;
      const pct = Math.max(0, Math.min(1, (score - min) / (max - min)));
      const strokeDashoffset = circumference - pct * circumference;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', flex: isTotal ? 1.2 : 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</div>
          <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
              <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeW} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: isTotal ? '2.5rem' : '1.75rem', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', marginTop: '0.25rem' }}>out of {max}</span>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1rem', fontFamily: 'sans-serif', color: '#0f172a' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 0.25rem', letterSpacing: '-0.5px' }}>{testData.name} Results</h1>
              <p style={{ color: '#64748b', margin: 0 }}>Completed on {new Date().toLocaleDateString()}</p>
            </div>
            <button onClick={() => router.push('/dashboard/practice')} style={{ padding: '0.75rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexDirection: 'row', flexWrap: 'wrap' }}>
            {isFull && <Dial score={finalScaledScore} min={400} max={1600} title="Total Score" color="#8b5cf6" isTotal={true} />}
            {(isFull || isRW) && <Dial score={rwScaledScore} min={200} max={800} title="Reading & Writing" color="#3b82f6" isTotal={!isFull} />}
            {(isFull || isMath) && <Dial score={mathScaledScore} min={200} max={800} title="Math" color="#10b981" isTotal={!isFull} />}
          </div>

          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Knowledge Domains</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {Object.entries(domainStats).map(([domain, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={domain}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                      <span>{domain}</span>
                      <span style={{ color: '#64748b' }}>{stats.correct} / {stats.total} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Question Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '700' }}>#</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '700' }}>Module</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '700' }}>Domain</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '700' }}>Difficulty</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '700' }}>Your Answer</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '700' }}>Correct</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '700' }}>Status</th>
                    <th style={{ padding: '1rem 0.5rem', color: '#64748b', fontWeight: '700', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {questionList.map((q, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>{q.num}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{q.module.replace('M2H', 'M2 (Hard)')}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{q.domain}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: q.difficulty === 'Hard' ? '#fee2e2' : q.difficulty === 'Medium' ? '#fef3c7' : '#dcfce3', color: q.difficulty === 'Hard' ? '#991b1b' : q.difficulty === 'Medium' ? '#92400e' : '#166534', fontSize: '0.8rem', fontWeight: '600' }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '600', color: q.isCorrect ? '#10b981' : '#ef4444' }}>{q.userAns}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>{q.correctAnswer}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {q.isCorrect ? <span style={{ color: '#10b981', fontWeight: '700' }}>✓ Correct</span> : <span style={{ color: '#ef4444', fontWeight: '700' }}>✗ Incorrect</span>}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setModuleKey(q.module);
                            setCurrentIdx(q.idx);
                            setPhase('review');
                          }}
                          style={{ padding: '0.4rem 1rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }"""

if target in content:
    content = content.replace(target, new_results)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Results successfully injected!')
else:
    print('Could not find target block.')
