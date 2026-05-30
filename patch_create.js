const fs = require('fs');

let code = fs.readFileSync('src/app/teacher/create-test/page.tsx', 'utf8');

// 1. Add imports
if (!code.includes("import { downloadCSVTemplate")) {
  code = code.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { downloadCSVTemplate, parseQuestionsCSV } from '@/lib/csv-parser';");
}

// 2. Add handleCSVUpload
const processStr = "setIsProcessing(false);\n  };";
if (!code.includes("handleCSVUpload")) {
  code = code.replace(processStr, processStr + `\n\n  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const questions = await parseQuestionsCSV(file);
      setGeneratedQuestions(questions as any);
      setTestName(file.name.replace('.csv', '') + ' Quiz');
    } catch (err: any) {
      setError(err.message);
    }
    setIsProcessing(false);
  };`);
}

// 3. Replace the UI block
const oldUiStart = "{generatedQuestions.length === 0 ? (";
const oldUiEnd = ") : (";

const startIdx = code.indexOf(oldUiStart);
const endIdx = code.indexOf(oldUiEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1 && !code.includes("Bulk Import (CSV)")) {
  const newUi = `{generatedQuestions.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* PDF Box */}
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '3rem', border: '2px dashed #cbd5e1', textAlign: 'center', transition: 'border-color 0.2s' }}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#6366f1'; }}
            onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onDrop={handleFileDrop}
          >
            <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <UploadCloud size={32} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>AI Generate (PDF)</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '300px', margin: '0 auto 2rem' }}>
              Upload a PDF. The AI will automatically extract text, identify MCQs and SPRs, and generate the JSON data.
            </p>

            <input type="file" ref={fileInputRef} accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files && setFile(e.target.files[0])} />
            
            {file ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <Sparkles size={18} color="#64748b" />
                <span style={{ fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button onClick={handleProcess} disabled={isProcessing} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isProcessing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <><Sparkles size={14} /> Generate</>}
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} style={{ padding: '0.875rem 2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                Select PDF
              </button>
            )}
          </div>

          {/* CSV Box */}
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '3rem', border: '2px dashed #cbd5e1', textAlign: 'center', transition: 'border-color 0.2s' }}>
            <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Database size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Bulk Import (CSV)</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', maxWidth: '300px', margin: '0 auto' }}>
              Import hundreds of questions instantly using a standardized CSV file. Supports LaTeX!
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginTop: '1.5rem' }}>
              <label style={{ padding: '0.875rem 2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                Upload CSV
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVUpload} />
              </label>
              
              <button 
                onClick={() => downloadCSVTemplate(appUser?.teacherSubject === 'Math' ? 'Math' : 'English')} 
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                Download {appUser?.teacherSubject === 'Math' ? 'Math' : 'English'} Template
              </button>
            </div>
          </div>
        </div>
      `;
  code = code.substring(0, startIdx) + newUi + code.substring(endIdx);
}

// 4. Update Passage display
const oldQRender = "<p style={{ color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{q.question}</p>";
const newQRender = `{q.passage && (
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#334155', borderLeft: '4px solid #94a3b8', whiteSpace: 'pre-wrap' }}>
                      <strong>Passage:</strong>\\n{q.passage}
                    </div>
                  )}
                  <p style={{ color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{q.question}</p>`;

if (!code.includes("q.passage &&")) {
  code = code.replace(oldQRender, newQRender);
}

fs.writeFileSync('src/app/teacher/create-test/page.tsx', code, 'utf8');
console.log("Updated correctly");
