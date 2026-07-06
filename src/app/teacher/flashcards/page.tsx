"use client";
import React, { useState, useEffect } from 'react';
import { getFlashcardSets, createFlashcardSet, deleteFlashcardSet, FlashcardSet, Flashcard } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { Layers, Plus, Search, Trash2, Edit2, Play, Save, Upload } from 'lucide-react';
import Papa from 'papaparse';
import ImageUploader from '@/components/ImageUploader';

export default function FlashcardsManagerPage() {
  const { appUser } = useAuth();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCards, setNewCards] = useState<Flashcard[]>([{ front: '', back: '', example: '' }]);

  useEffect(() => {
    if (appUser?.uid) loadSets();
  }, [appUser?.uid, appUser?.teacherSubject]);

  const loadSets = async () => {
    setLoading(true);
    try {
      const data = await getFlashcardSets(appUser?.uid, appUser?.role, appUser?.teacherSubject);
      setSets(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddSet = async () => {
    if (!newTitle) return alert("Title required");
    const validCards = newCards.filter(c => c.front.trim() && c.back.trim());
    if (validCards.length === 0) return alert("At least one valid card required");

    try {
      await createFlashcardSet({
        title: newTitle,
        subject: appUser?.teacherSubject || 'General',
        cards: validCards,
        createdBy: appUser?.uid
      });
      setIsCreating(false);
      setNewTitle('');
      setNewCards([{ front: '', back: '', example: '' }]);
      loadSets();
    } catch (err) {
      console.error(err);
      alert("Error adding set");
    }
  };

  const downloadFlashcardTemplate = (subject: 'Math' | 'English') => {
    const header = `Front,Back,Example\n`;
    const rows = subject === 'Math'
      ? `"$x^2 - 9$","$(x-3)(x+3)$","$4^2 - 9 = (4-3)(4+3) = 7$"\n"Slope formula","$m = \\frac{y_2 - y_1}{x_2 - x_1}$","Points (1,2) and (3,6): $m = 2$"\n`
      : `"Rhetoric","The art of persuasion through speech or writing","The candidate used rhetoric to win votes."\n"Candid","Truthful and straightforward","She gave a candid assessment of the situation."\n`;
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards_${subject.toLowerCase()}_template.csv`;
    a.click();
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const imported: Flashcard[] = [];
        results.data.forEach((row: any) => {
          const front = row['Front']?.toString().trim();
          const back = row['Back']?.toString().trim();
          if (front && back) {
            imported.push({ front, back, example: row['Example']?.toString().trim() || '' });
          }
        });
        if (imported.length === 0) return alert('No valid cards found. Make sure columns are: Front, Back, Example');
        setNewCards(prev => [...prev.filter(c => c.front || c.back), ...imported]);
        setIsCreating(true);
        alert(`Imported ${imported.length} cards! Set a title and click Save Set.`);
      },
      error: (err: any) => alert('CSV parse error: ' + err.message)
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this set completely?")) return;
    try {
      await deleteFlashcardSet(id);
      loadSets();
    } catch (err) {
      console.error(err);
      alert("Error deleting");
    }
  };

  const filteredSets = sets.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Flashcard Banks</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage and create flashcard decks for your students.</p>
        </div>
        <button onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          <Plus size={16} /> Create New Set
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#6366f1', color: '#fff', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>
          <Upload size={16} /> Import CSV
          <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
        </label>
        {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both' || appUser.teacherSubject === 'Math') && (
          <button onClick={() => downloadFlashcardTemplate('Math')} style={{ padding: '0.625rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
            📐 Math Template
          </button>
        )}
        {(!appUser?.teacherSubject || appUser.teacherSubject === 'Both' || appUser.teacherSubject === 'English') && (
          <button onClick={() => downloadFlashcardTemplate('English')} style={{ padding: '0.625rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
            📖 English Template
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>New Flashcard Set</h2>
          <input 
            type="text" placeholder="Set Title (e.g. Algebra Basics)" 
            value={newTitle} onChange={e => setNewTitle(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1rem' }}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {newCards.map((card, i) => (
              <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', position: 'relative' }}>
                <button onClick={() => { const nc = [...newCards]; nc.splice(i, 1); setNewCards(nc); }} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.25rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}><Trash2 size={16} /></button>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem', marginTop: '1rem' }}>
                  <div>
                    <textarea placeholder="Front (Term)" value={card.front} onChange={e => { const nc = [...newCards]; nc[i].front = e.target.value; setNewCards(nc); }} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', minHeight: '80px', resize: 'vertical', marginBottom: '0.5rem' }} />
                    <ImageUploader 
                      onUpload={(url) => {
                        const nc = [...newCards];
                        nc[i].front = nc[i].front + `\n\n![Image](${url})`;
                        setNewCards(nc);
                      }}
                      buttonText="Image"
                      style={{ background: '#fff' }}
                    />
                  </div>
                  <div>
                    <textarea placeholder="Back (Definition)" value={card.back} onChange={e => { const nc = [...newCards]; nc[i].back = e.target.value; setNewCards(nc); }} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', minHeight: '80px', resize: 'vertical', marginBottom: '0.5rem' }} />
                    <ImageUploader 
                      onUpload={(url) => {
                        const nc = [...newCards];
                        nc[i].back = nc[i].back + `\n\n![Image](${url})`;
                        setNewCards(nc);
                      }}
                      buttonText="Image"
                      style={{ background: '#fff' }}
                    />
                  </div>
                </div>
                <input type="text" placeholder="Example sentence (optional)" value={card.example || ''} onChange={e => { const nc = [...newCards]; nc[i].example = e.target.value; setNewCards(nc); }} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} />
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => setNewCards([...newCards, { front: '', back: '', example: '' }])} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>+ Add Card</button>
            <button onClick={handleAddSet} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={16} /> Save Set</button>
            <button onClick={() => setIsCreating(false)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading sets...</div>
        ) : filteredSets.map(set => (
          <div key={set.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Layers size={20} />
              </div>
              <button onClick={() => handleDelete(set.id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
                <Trash2 size={16} />
              </button>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>{set.title}</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>{set.cards.length} cards • {set.subject}</div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button style={{ flex: 1, padding: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
