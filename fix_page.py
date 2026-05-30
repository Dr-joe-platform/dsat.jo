import os

file_path = r'c:\Users\elnim\Desktop\dsatuz\src\app\test\[testId]\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, l in enumerate(lines):
    if "const isReviewMode = phase === 'review';" in l:
        start_idx = i
        break

end_idx = -1
for i, l in enumerate(lines):
    if '      {/* ── QUESTION NAVIGATOR MODAL ── */}' in l:
        end_idx = i
        break

if start_idx == -1 or end_idx == -1:
    print('Indices not found:', start_idx, end_idx)
    exit()

kept_lines_start = lines[:start_idx]
kept_lines_end = lines[end_idx:]

rebuilt = """  const isReviewMode = phase === 'review';

  // ── MAIN TEST UI ──
  const q = questions[currentIdx];
  if (!q) return null;

  const currentAnswer = q.type === 'SPR' ? undefined : answers[moduleKey]?.[currentIdx];
  const currentSpr = sprAnswers[moduleKey]?.[currentIdx] ?? '';
  const isMarked = !!marked[moduleKey]?.[currentIdx];
  const crossedOptions = crossed[moduleKey]?.[currentIdx] ?? [];
  const isElimMode = !!eliminated[moduleKey]?.[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === questions.length - 1;
  const hasImage = q.imageUrl && q.imageUrl !== null && q.imageUrl !== '';
  const optLetters = ['A', 'B', 'C', 'D'];

  const toggleCross = (optLetter) => {
    setCrossed(prev => {
      const cur = prev[moduleKey]?.[currentIdx] ?? [];
      const next = cur.includes(optLetter) ? cur.filter(x => x !== optLetter) : [...cur, optLetter];
      return { ...prev, [moduleKey]: { ...prev[moduleKey], [currentIdx]: next } };
    });
  };

  if (loadingTest) return null;
  if (!testData) return null;

  if (phase === 'intro') {
    const m1count = testData.M1?.length ?? 0;
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '720px', width: '100%', background: '#fff', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Digital SAT · {isMath ? 'Math' : 'Reading & Writing'} Section</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>{testData.name}</h1>
            </div>
          </div>
          <button
            onClick={() => { setPhase('testing'); }}
            style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            Start Test <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'break') {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%', padding: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Take a Break</h1>
          <div style={{ fontSize: '4rem', fontWeight: '900', color: '#1d4ed8', marginBottom: '3rem', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setPhase('testing')}
            style={{ padding: '1rem 2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' }}
          >
            Resume Test Now
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
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
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f9fa', fontFamily: '"Georgia", "Times New Roman", serif', overflow: 'hidden' }}>

      {/* ── HEADER ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 2rem 0.5rem', flexShrink: 0,
        background: '#fff',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isReviewMode && (
            <button onClick={() => setPhase('results')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', color: '#475569', fontWeight: '700' }}>
              <ArrowLeft size={16} /> Back to Results
            </button>
          )}
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>
              {isReviewMode ? 'Review Mode' : `Section ${isMath ? '2' : '1'}`}, {moduleKey === 'M1' ? 'Module 1' : moduleKey === 'M2H' ? 'Module 2 (Hard)' : 'Module 2 (Standard)'}: {isMath ? 'Math' : 'Reading & Writing'}
            </div>
            <button
              onClick={() => setShowDirections(!showDirections)}
              style={{ fontFamily: 'sans-serif', fontWeight: '500', color: '#2563eb', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              Directions
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', fontFamily: 'sans-serif', flex: 1 }}>
          {!isReviewMode ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '1.5rem' }}>
                {showTimer ? (
                  <span style={{
                    fontSize: '1.25rem', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums',
                    color: timerWarning ? '#ef4444' : '#0f172a',
                    lineHeight: 1
                  }}>
                    {formatTime(timeLeft)}
                  </span>
                ) : (
                  <Clock size={22} color="#0f172a" />
                )}
              </div>
              <button
                onClick={() => !timerWarning && setShowTimer(!showTimer)}
                disabled={timerWarning}
                style={{ 
                  background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '12px', 
                  cursor: timerWarning ? 'not-allowed' : 'pointer', color: '#475569', padding: '2px 10px', fontSize: '0.7rem', fontWeight: '600',
                  display: 'flex', alignItems: 'center', opacity: timerWarning ? 0.5 : 1
                }}
              >
                {showTimer ? 'Hide' : 'Show'}
              </button>
            </>
          ) : (
            <div style={{ background: '#eab308', color: '#fff', padding: '0.25rem 1rem', borderRadius: '1rem', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Review Mode
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', fontFamily: 'sans-serif' }}>
          {isMath && (
            <>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.7rem', fontWeight: '600', padding: 0 }}
              >
                <Calculator size={20} /> Calculator
              </button>
              <button
                onClick={() => setShowReference(!showReference)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.7rem', fontWeight: '600', padding: 0 }}
              >
                <LayoutTemplate size={20} /> Reference
              </button>
            </>
          )}
          {!isMath && (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.7rem', fontWeight: '600', padding: 0, opacity: 0.6, cursor: 'not-allowed' }}
              title="Select text in passage to highlight"
            >
              <Edit2 size={20} /> Highlights & Notes
            </div>
          )}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.7rem', fontWeight: '600', padding: 0 }}
          >
            <MoreHorizontal size={20} /> More
          </button>
        </div>
      </header>

      <div style={{ height: '3px', width: '100%', display: 'flex', background: '#fff' }}>
         {Array.from({ length: 40 }).map((_, i) => {
           const colors = ['#2563eb', '#16a34a', '#dc2626', '#8b5cf6'];
           return <div key={i} style={{ flex: 1, background: colors[i % colors.length], margin: '0 4px', height: '100%' }} />
         })}
      </div>

      {showDirections && (
        <div style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', padding: '0.875rem 2rem', fontFamily: 'sans-serif', fontSize: '0.82rem', color: '#1e40af', lineHeight: '1.6', flexShrink: 0 }}>
          <strong>{isMath ? 'Math' : 'Reading & Writing'} Directions:</strong> {isMath ? 'The questions in this section address important math skills. For multiple-choice questions, choose the best answer from the choices provided. For student-produced response questions, solve the problem and enter your answer. A reference sheet with helpful formulas is available.' : 'The questions in this section address a number of important reading and writing skills. Each question has one or more passages. Read each passage and question carefully, and then choose the best answer to the question based on the passage(s).'}
        </div>
      )}

      {timerWarning && !isReviewMode && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '0.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'sans-serif', fontSize: '0.8rem', color: '#92400e', fontWeight: '600', flexShrink: 0 }}>
          <AlertTriangle size={14} /> 5 minutes remaining in this module
        </div>
      )}

      {/* ── QUESTION AREA ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: q.passage ? 'row' : 'column', alignItems: q.passage ? 'stretch' : 'center', overflow: 'hidden', background: '#fff' }}>
        {q.passage && (
          <div style={{ flex: 1, padding: '2rem 3rem', borderRight: '2px solid #e2e8f0', overflowY: 'auto', fontSize: fsz, lineHeight: lh, fontFamily: 'Georgia, serif', color: '#1e293b' }}>
             <AnnotatableText
               text={q.passage}
               annotations={annotations[q.id] || []}
               onAddAnnotation={(ann) => setAnnotations(prev => ({
                 ...prev,
                 [q.id]: [...(prev[q.id] || []), { ...ann, id: Date.now().toString() }]
               }))}
               onRemoveAnnotation={(id) => setAnnotations(prev => ({
                 ...prev,
                 [q.id]: (prev[q.id] || []).filter(a => a.id !== id)
               }))}
             />
          </div>
        )}

        <div style={{ flex: q.passage ? 1 : 'none', width: q.passage ? 'auto' : '100%', maxWidth: q.passage ? 'none' : '800px', overflowY: 'auto', padding: q.passage ? '2rem 3rem' : '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: q.passage ? 'flex-start' : 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '0.5rem', marginBottom: '2rem', fontFamily: 'sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '24px', height: '24px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  {currentIdx + 1}
                </div>
                <button
                  onClick={toggleMark}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}
                >
                  {isMarked ? <BookmarkCheck size={16} color="#dc2626" /> : <Bookmark size={16} />} Mark for Review
                </button>
              </div>
              
              <button
                onClick={() => setEliminated(prev => ({ ...prev, [moduleKey]: { ...prev[moduleKey], [currentIdx]: !prev[moduleKey][currentIdx] } }))}
                style={{ background: isElimMode ? '#fef08a' : '#f1f5f9', border: isElimMode ? '1px solid #eab308' : '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: 'bold', textDecoration: isElimMode ? 'line-through' : 'none' }}
              >
                ABC
              </button>
            </div>

            <div style={{ fontSize: fsz, lineHeight: lh, color: '#1e293b', marginBottom: '2rem' }}>
              {hasImage && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'sans-serif', textAlign: 'center', padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '0.375rem', width: '100%' }}>
                    📊 [Figure/Graph would display here]
                  </div>
                </div>
              )}
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: q.passage ? 'sans-serif' : 'inherit' }}>
                <AnnotatableText
                   text={q.text}
                   annotations={annotations[`${q.id}-qtext`] || []}
                   onAddAnnotation={(ann) => setAnnotations(prev => ({
                     ...prev,
                     [`${q.id}-qtext`]: [...(prev[`${q.id}-qtext`] || []), { ...ann, id: Date.now().toString() }]
                   }))}
                   onRemoveAnnotation={(id) => setAnnotations(prev => ({
                     ...prev,
                     [`${q.id}-qtext`]: (prev[`${q.id}-qtext`] || []).filter(a => a.id !== id)
                   }))}
                />
              </div>
            </div>

          {q.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {q.options.map((opt, i) => {
                const letter = optLetters[i] ?? String.fromCharCode(65 + i);
                const isSelected = currentAnswer === letter;
                const isCrossed = crossedOptions.includes(letter);

                return (
                  <button
                    key={i}
                    onClick={() => !isReviewMode && setAnswer(letter)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', background: 'transparent',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #94a3b8', borderRadius: '8px', cursor: isReviewMode ? 'default' : 'pointer',
                      position: 'relative', opacity: (isElimMode && isCrossed) ? 0.4 : 1, transition: 'all 0.1s'
                    }}
                  >
                    {isElimMode && (
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleCross(letter); }}
                        style={{
                          position: 'absolute', right: '-10px', top: '-10px', width: '20px', height: '20px', borderRadius: '50%',
                          background: isCrossed ? '#ef4444' : '#fff', border: `1px solid ${isCrossed ? '#ef4444' : '#cbd5e1'}`,
                          color: isCrossed ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10
                        }}
                      >
                        ✕
                      </div>
                    )}
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                      background: isReviewMode 
                        ? (letter === q.correctAnswer ? '#10b981' : isSelected ? '#ef4444' : '#fff')
                        : (isSelected ? '#2563eb' : '#fff'),
                      border: isReviewMode
                        ? (letter === q.correctAnswer ? 'none' : isSelected ? 'none' : '1px solid #64748b')
                        : (isSelected ? 'none' : '1px solid #64748b'),
                      color: isReviewMode ? (letter === q.correctAnswer || isSelected ? '#fff' : '#000') : (isSelected ? '#fff' : '#000'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem'
                    }}>
                      {letter}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', fontSize: fsz, lineHeight: lh, position: 'relative' }}>
                      <Latex>{opt}</Latex>
                      {(isElimMode && isCrossed) && (
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '2px solid #000' }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'SPR' && (
            <div style={{ width: '100%', padding: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                Your Answer:
              </div>
              <input
                type="text"
                value={currentSpr}
                onChange={(e) => {
                  if (!isReviewMode) {
                    setSpr(e.target.value);
                  }
                }}
                disabled={isReviewMode}
                placeholder={isReviewMode ? '' : "Enter your answer here"}
                style={{
                  width: '100%', padding: '0.75rem', fontSize: '1.25rem',
                  border: isReviewMode 
                    ? (currentSpr === q.correctAnswer ? '2px solid #10b981' : '2px solid #ef4444')
                    : '2px solid #cbd5e1', 
                  borderRadius: '0.5rem', fontFamily: 'sans-serif'
                }}
              />
            </div>
          )}
          
          {isReviewMode && q.explanation && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderLeft: '4px solid #3b82f6', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', fontFamily: 'sans-serif' }}>Explanation</h3>
              {q.type === 'SPR' && (
                <div style={{ marginBottom: '1rem', color: '#10b981', fontWeight: '700', fontFamily: 'sans-serif' }}>Correct Answer: {q.correctAnswer}</div>
              )}
              <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#334155', fontFamily: 'sans-serif' }}>
                <Latex>{q.explanation}</Latex>
              </div>
            </div>
          )}
          
          </div>
        </div>
      </main>

      <footer style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 2rem', background: '#f8fafc', borderTop: '1px solid #cbd5e1', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
            {appUser?.displayName ?? 'Student'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isFirst ? (
            <div style={{ width: '80px' }} />
          ) : (
            <button
              onClick={() => setCurrentIdx(currentIdx - 1)}
              style={{ padding: '0.4rem 1.25rem', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '1rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Back
            </button>
          )}
          
          <button
            onClick={() => setShowNav(!showNav)}
            style={{
              padding: '0.4rem 1.25rem', background: '#e2e8f0', color: '#0f172a', border: 'none',
              borderRadius: '1rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.375rem'
            }}
          >
            {showNav ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            Question {currentIdx + 1} of {questions.length}
          </button>

          <button
            onClick={() => {
              if (isReviewMode) {
                setPhase('results');
              } else if (isLast) {
                setShowSubmitConfirm(true);
              } else {
                setCurrentIdx(i => i + 1);
              }
            }}
            style={{ padding: '0.375rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '2rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '0.9rem' }}
          >
            {isReviewMode ? 'Back to Results' : isLast ? 'Next' : 'Next'}
          </button>
        </div>
      </footer>
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(kept_lines_start)
    f.write(rebuilt + '\n')
    f.writelines(kept_lines_end)
