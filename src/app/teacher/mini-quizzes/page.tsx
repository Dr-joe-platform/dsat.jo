"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MiniQuiz, QuizQuestion, getMiniQuizzes, addMiniQuiz, updateMiniQuiz, deleteMiniQuiz } from '@/lib/db';
import { downloadCSVTemplate, parseQuestionsCSV } from '@/lib/csv-parser';
import { Zap, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Check, Save, Edit2 } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

export default function MiniQuizzesPage() {
  const { appUser } = useAuth();
  const [quizzes, setQuizzes] = useState<MiniQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Adding/Editing questions
  const [addingQuestionTo, setAddingQuestionTo] = useState<string | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newAnswerIndex, setNewAnswerIndex] = useState(0);

  useEffect(() => {
    if (appUser?.uid) loadData();
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const qz = await getMiniQuizzes(appUser!.uid);
      setQuizzes(qz);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const togglePublic = async (quiz: MiniQuiz) => {
    if (!quiz.id) return;
    try {
      await updateMiniQuiz(quiz.id, { isPublic: !quiz.isPublic });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error updating quiz');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await deleteMiniQuiz(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error deleting quiz');
    }
  };

  const createQuiz = async () => {
    if (!newTitle.trim()) return;
    try {
      await addMiniQuiz({
        teacherId: appUser!.uid,
        teacherName: appUser!.displayName || 'Teacher',
        title: newTitle,
        subject: appUser!.teacherSubject || 'Both',
        questions: [],
        isPublic: false
      });
      setNewTitle('');
      setShowCreate(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error creating quiz");
    }
  };

  const handleSaveQuestion = async (quiz: MiniQuiz) => {
    if (!quiz.id) return;
    if (!newQuestion.trim() || newOptions.some(o => !o.trim())) {
      return alert("Please fill out the question and all 4 options.");
    }
    
    try {
      let updatedQuestions = [...quiz.questions];
      if (editingQuestionIndex !== null) {
        updatedQuestions[editingQuestionIndex] = {
          question: newQuestion,
          options: newOptions,
          answer: newAnswerIndex
        };
      } else {
        updatedQuestions.push({
          question: newQuestion,
          options: newOptions,
          answer: newAnswerIndex
        });
      }
      
      await updateMiniQuiz(quiz.id, { questions: updatedQuestions });
      setAddingQuestionTo(null);
      setEditingQuestionIndex(null);
      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      setNewAnswerIndex(0);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error saving question");
    }
  };

  const handleCSVUploadForQuiz = async (quiz: MiniQuiz, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quiz.id) return;
    e.target.value = ''; // reset so same file can be re-uploaded
    try {
      const parsed = await parseQuestionsCSV(file);
      const newQuestions = parsed.map(q => {
        let combinedQuestion = q.passage ? `Passage:\n${q.passage}\n\nQuestion:\n${q.question}` : q.question;
        if (q.explanation) combinedQuestion += `\n\nExplanation: ${q.explanation}`;

        if (q.type === 'SPR') {
          return { question: combinedQuestion, options: [q.correctAnswer, '', '', ''], answer: 0 };
        } else {
          const opts = q.options.length === 4 && q.options.some(o => o !== '') ? q.options : ['A', 'B', 'C', 'D'];
          const ansIdx = q.correctAnswer === 'B' ? 1 : q.correctAnswer === 'C' ? 2 : q.correctAnswer === 'D' ? 3 : 0;
          return { question: combinedQuestion, options: opts, answer: ansIdx };
        }
      });
      const updatedQuestions = [...quiz.questions, ...newQuestions];
      await updateMiniQuiz(quiz.id, { questions: updatedQuestions });
      loadData();
      alert(`Successfully imported ${newQuestions.length} questions!`);
    } catch (err: any) {
      alert('Error importing CSV: ' + err.message);
    }
  };




  const handleDeleteQuestion = async (quiz: MiniQuiz, qIndex: number) => {
    if (!quiz.id || !confirm("Delete this question?")) return;
    try {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== qIndex);
      await updateMiniQuiz(quiz.id, { questions: updatedQuestions });
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error deleting question");
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={22} color="#f59e0b" /> Mini-Quizzes
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create short quizzes to reinforce specific topics.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={15} /> New Quiz
        </button>
      </div>

      {showCreate && (
        <div className="stat-card" style={{ marginBottom: '1.5rem', border: '1px solid #fde68a', background: '#fffbeb' }}>
          <h3 style={{ fontWeight: '700', color: '#92400e', marginBottom: '1rem' }}>Create New Quiz</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Quiz title (e.g. Linear Equations Quick Check)" className="input-field" />
            <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: '600' }}>Subject: {appUser?.teacherSubject}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={createQuiz} style={{ padding: '0.5rem 1.25rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}>Create</button>
            <button onClick={() => setShowCreate(false)} style={{ padding: '0.5rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          No quizzes created yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {quizzes.map(quiz => (
            <div key={quiz.id} className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === quiz.id ? null : quiz.id!)}>
                <div style={{ width: '40px', height: '40px', borderRadius: '0.625rem', background: quiz.subject === 'Math' ? '#dbeafe' : '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={18} color={quiz.subject === 'Math' ? '#1d4ed8' : '#7c3aed'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.925rem' }}>{quiz.title}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: quiz.subject === 'Math' ? '#dbeafe' : '#ede9fe', color: quiz.subject === 'Math' ? '#1d4ed8' : '#7c3aed' }}>
                      {quiz.subject.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{quiz.questions.length} questions</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <button onClick={e => { e.stopPropagation(); togglePublic(quiz); }} title={quiz.isPublic ? 'Public — click to make private' : 'Private — click to publish'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: quiz.isPublic ? '#22c55e' : '#94a3b8' }}>
                    {quiz.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); quiz.id && handleDelete(quiz.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                  {expanded === quiz.id ? <ChevronUp size={15} color="#94a3b8" /> : <ChevronDown size={15} color="#94a3b8" />}
                </div>
              </div>

              {expanded === quiz.id && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.25rem' }}>
                  {quiz.questions.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No questions yet. Add questions below.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {quiz.questions.map((q, i) => (
                        <div key={i} style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: '0.5rem', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => {
                              setAddingQuestionTo(quiz.id!);
                              setEditingQuestionIndex(i);
                              setNewQuestion(q.question);
                              setNewOptions([...q.options]);
                              setNewAnswerIndex(q.answer);
                            }} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteQuestion(quiz, i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                          <p style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.5rem', paddingRight: '4rem', whiteSpace: 'pre-wrap' }}>Q{i + 1}. {q.question}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                            {q.options.map((opt, oi) => (
                              <div key={oi} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: oi === q.answer ? '#dcfce7' : 'transparent', color: oi === q.answer ? '#16a34a' : '#475569', fontWeight: oi === q.answer ? '700' : '400', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {oi === q.answer && <Check size={10} />} {String.fromCharCode(65 + oi)}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit Question Form */}
                  {addingQuestionTo === quiz.id ? (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>{editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}</h4>
                      <textarea value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Enter question..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1rem', minHeight: '80px', resize: 'vertical' }} />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        {newOptions.map((opt, oi) => (
                          <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="radio" checked={newAnswerIndex === oi} onChange={() => setNewAnswerIndex(oi)} style={{ cursor: 'pointer' }} />
                            <input value={opt} onChange={e => {
                              const opts = [...newOptions];
                              opts[oi] = e.target.value;
                              setNewOptions(opts);
                            }} placeholder={`Option ${String.fromCharCode(65 + oi)}`} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }} />
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleSaveQuestion(quiz)} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Save Question</button>
                          <button onClick={() => {
                            setAddingQuestionTo(null);
                            setEditingQuestionIndex(null);
                          }} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                        </div>
                        <ImageUploader 
                          onUpload={(url) => {
                            setNewQuestion(prev => prev + `\n\n![Image](${url})`);
                          }}
                          buttonText="Attach Image"
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button onClick={() => setAddingQuestionTo(quiz.id!)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <Plus size={14} /> Add Manually
                      </button>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <Plus size={14} /> Import CSV
                        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleCSVUploadForQuiz(quiz, e)} />
                      </label>
                      {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both' || appUser.teacherSubject === 'Math') && (
                        <button onClick={() => downloadCSVTemplate('Math')} style={{ padding: '0.5rem 0.75rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}>
                          📐 Math Template
                        </button>
                      )}
                      {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both' || appUser.teacherSubject === 'English') && (
                        <button onClick={() => downloadCSVTemplate('English')} style={{ padding: '0.5rem 0.75rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}>
                          📖 English Template
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
