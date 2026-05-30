const fs = require('fs');

let code = fs.readFileSync('src/app/teacher/mini-quizzes/page.tsx', 'utf8');

// 1. Add import
if (!code.includes("import { downloadCSVTemplate")) {
  code = code.replace("import { Zap, Plus, Trash2", "import { downloadCSVTemplate, parseQuestionsCSV } from '@/lib/csv-parser';\nimport { Zap, Plus, Trash2");
}

// 2. Add handleCSVUploadForQuiz
const saveFn = "alert(\"Error saving question\");\n    }\n  };";
if (!code.includes("handleCSVUploadForQuiz")) {
  code = code.replace(saveFn, saveFn + `\n\n  const handleCSVUploadForQuiz = async (quiz: MiniQuiz, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quiz.id) return;
    try {
      const parsed = await parseQuestionsCSV(file);
      const newQuestions = parsed.map(q => {
        let combinedQuestion = q.passage ? \`**Passage:**\\n\${q.passage}\\n\\n**Question:**\\n\${q.question}\` : q.question;
        if (q.explanation) combinedQuestion += \`\\n\\n**Explanation:** \\n\${q.explanation}\`;
        
        if (q.type === 'SPR') {
          return { question: combinedQuestion, options: [q.correctAnswer, '', '', ''], answer: 0 };
        } else {
          const opts = q.options.length === 4 && q.options[0] !== '' ? q.options : ['A', 'B', 'C', 'D'];
          const ansIdx = q.correctAnswer === 'B' ? 1 : q.correctAnswer === 'C' ? 2 : q.correctAnswer === 'D' ? 3 : 0;
          return { question: combinedQuestion, options: opts, answer: ansIdx };
        }
      });
      const updatedQuestions = [...quiz.questions, ...newQuestions];
      await updateMiniQuiz(quiz.id, { questions: updatedQuestions });
      loadData();
    } catch (err: any) {
      alert("Error importing CSV: " + err.message);
    }
  };`);
}

// 3. Add UI buttons
const uiTarget = "<button onClick={() => setAddingQuestionTo(quiz.id!)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>";
const uiReplacement = `<button onClick={() => setAddingQuestionTo(quiz.id!)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <Plus size={14} /> Add Question manually
                        </button>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <Plus size={14} /> Import CSV
                          <input type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleCSVUploadForQuiz(quiz, e)} />
                        </label>
                        <button onClick={() => downloadCSVTemplate(appUser?.teacherSubject === 'Math' ? 'Math' : 'English')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                          Download Template
                        </button>`;
                        
if (!code.includes("Import CSV") && code.includes(uiTarget)) {
  code = code.replace(uiTarget + "\n                          <Plus size={14} /> Add Question\n                        </button>", uiReplacement);
}

fs.writeFileSync('src/app/teacher/mini-quizzes/page.tsx', code, 'utf8');
console.log("Updated Mini Quizzes successfully!");
