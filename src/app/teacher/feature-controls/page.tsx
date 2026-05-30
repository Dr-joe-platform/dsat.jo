"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getFeatureControls, setFeatureControls, FeatureControls } from '@/lib/db';
import { BrainCircuit, Settings, ToggleRight, ToggleLeft, Users, Save, CheckCircle, Loader2 } from 'lucide-react';

export default function TeacherFeatureControlsPage() {
  const { appUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Hardcoded to 'all' for global teacher settings
  const [selectedClass, setSelectedClass] = useState('all');

  const [features, setFeatures] = useState({
    aiTutor: true,
    aiNotes: true,
    leaderboard: false,
    miniQuizzes: true,
    flashcards: true,
    strictExamMode: false,
  });

  useEffect(() => {
    if (appUser) loadData();
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getFeatureControls(appUser!.uid, 'all');
      if (data) {
        setFeatures({
          aiTutor: data.aiTutor ?? true,
          aiNotes: data.aiNotes ?? true,
          leaderboard: data.leaderboard ?? false,
          miniQuizzes: data.miniQuizzes ?? true,
          flashcards: data.flashcards ?? true,
          strictExamMode: data.strictExamMode ?? false,
        });
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setFeatureControls(appUser!.uid, 'all', features);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving feature controls');
    }
    setSaving(false);
  };

  const featureDefs = [
    { key: 'aiTutor', label: 'AI Tutor Access', desc: 'Allows students to chat with the AI Tutor for explanations.' },
    { key: 'aiNotes', label: 'AI Study Notes', desc: 'Generates automatic study notes based on student weak points.' },
    { key: 'leaderboard', label: 'Class Leaderboard', desc: 'Enables a competitive leaderboard among students in the class.' },
    { key: 'miniQuizzes', label: 'Mini-Quizzes', desc: 'Allows students to take random AI-generated mini-quizzes.' },
    { key: 'flashcards', label: 'Vocabulary & Flashcards', desc: 'Enables the flashcard learning module.' },
    { key: 'strictExamMode', label: 'Strict Exam Mode', desc: 'Disables all AI tools and pauses during active assignments to simulate real testing conditions.' },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
        Loading settings...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BrainCircuit size={22} color="#6366f1" /> Feature Controls
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Toggle platform features on or off for your classes.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: saved ? '#16a34a' : '#0f172a', color: '#fff', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', border: 'none', cursor: saving ? 'wait' : 'pointer', transition: 'all 0.2s' }}
        >
          {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Header/Selector */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e0e7ff', padding: '0.5rem', borderRadius: '0.5rem', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Select Target</div>
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', color: '#0f172a', background: '#fff' }}
            >
              <option value="all">Global Setting (All Students)</option>
            </select>
          </div>
        </div>

        {/* Feature List */}
        <div style={{ padding: '1rem 1.5rem' }}>
          {featureDefs.map((feat, i) => {
            const isEnabled = features[feat.key as keyof typeof features];
            return (
              <div key={feat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: i < featureDefs.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ paddingRight: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{feat.label}</h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: isEnabled ? '#dcfce3' : '#f1f5f9', color: isEnabled ? '#16a34a' : '#64748b', textTransform: 'uppercase' }}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>{feat.desc}</p>
                </div>
                <button 
                  onClick={() => toggleFeature(feat.key as keyof typeof features)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isEnabled ? '#4f46e5' : '#cbd5e1', transition: 'color 0.2s', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {isEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
