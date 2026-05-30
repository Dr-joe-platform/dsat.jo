"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTeacherStudents, AppUser, VocabWord, addVocabWord, getUserVocabulary, deleteVocabWord } from '@/lib/db';
import { BookA, Search, Plus, Trash2, Save, X } from 'lucide-react';

export default function VocabularyManagerPage() {
  const { appUser } = useAuth();
  const [students, setStudents] = useState<AppUser[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [vocabList, setVocabList] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', definition: '', example: '' });

  useEffect(() => {
    if (appUser?.uid) loadStudents();
  }, [appUser]);

  useEffect(() => {
    if (selectedStudent) {
      loadVocabulary(selectedStudent);
    } else {
      setVocabList([]);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const stds = await getTeacherStudents(appUser!.uid, appUser!.teacherSubject);
      setStudents(stds);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadVocabulary = async (studentId: string) => {
    setLoading(true);
    try {
      const words = await getUserVocabulary(studentId);
      setVocabList(words);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddWord = async () => {
    if (!newWord.word || !newWord.definition || !selectedStudent) return;
    try {
      await addVocabWord(selectedStudent, newWord.word, newWord.definition, newWord.example);
      setIsAdding(false);
      setNewWord({ word: '', definition: '', example: '' });
      loadVocabulary(selectedStudent);
    } catch (err) {
      console.error(err);
      alert("Error adding word");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this word from student's dictionary?")) return;
    try {
      await deleteVocabWord(id);
      loadVocabulary(selectedStudent);
    } catch (err) {
      console.error(err);
      alert("Error deleting word");
    }
  };

  const filteredVocab = vocabList.filter(v => 
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Vocabulary Manager</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Assign and track specific vocabulary words for your students.</p>
        </div>
        {selectedStudent && (
          <button onClick={() => setIsAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> Add Word to Student
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select 
          value={selectedStudent} 
          onChange={e => setSelectedStudent(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', color: '#0f172a', fontWeight: '600', minWidth: '250px' }}
        >
          <option value="" disabled>Select a student...</option>
          {students.map(s => (
            <option key={s.uid} value={s.uid}>{s.displayName || s.email}</option>
          ))}
        </select>

        {selectedStudent && (
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" placeholder="Search their vocabulary..." 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
        )}
      </div>

      {isAdding && selectedStudent && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Add Word for {students.find(s => s.uid === selectedStudent)?.displayName}</h2>
            <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <input type="text" placeholder="Word" value={newWord.word} onChange={e => setNewWord({...newWord, word: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Definition" value={newWord.definition} onChange={e => setNewWord({...newWord, definition: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Example Sentence (Optional)" value={newWord.example} onChange={e => setNewWord({...newWord, example: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleAddWord} style={{ padding: '0.625rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> Save Word
            </button>
          </div>
        </div>
      )}

      {!selectedStudent ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
          Select a student from the dropdown to view and manage their vocabulary.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading vocabulary...</div>
          ) : filteredVocab.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No words found for this student.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Word</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Definition</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Example</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVocab.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: i < filteredVocab.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: '#0f172a' }}>{v.word}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.9rem' }}>{v.definition}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>"{v.example}"</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button onClick={() => v.id && handleDelete(v.id)} style={{ color: '#ef4444', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
