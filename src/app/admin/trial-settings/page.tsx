"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTestBanks, AdminTestBank, getTrialSettings, setTrialSettings, TrialSettings } from '@/lib/db';
import { Settings, Save, Loader2, CheckSquare, Square, ShieldAlert } from 'lucide-react';

const ALL_FEATURES = [
  { id: '/dashboard/practice', label: 'Practice Tests' },
  { id: '/dashboard/question-bank', label: 'Question Bank' },
  { id: '/dashboard/mini-quizzes', label: 'Mini-Quizzes' },
  { id: '/dashboard/assignments', label: 'Assignments' },
  { id: '/dashboard/vocabulary', label: 'Vocabulary' },
  { id: '/dashboard/wrong-answers', label: 'Wrong Answers' },
  { id: '/dashboard/flashcards', label: 'Flashcards' },
  { id: '/dashboard/bookmarks', label: 'Bookmarks' },
  { id: '/dashboard/weak-points', label: 'Weak Points' },
  { id: '/dashboard/ai-tutor', label: 'AI Tutor' },
  { id: '/dashboard/ai-analysis', label: 'AI Score Analysis' },
  { id: '/dashboard/ai-notes', label: 'AI Study Notes' },
  { id: '/dashboard/study-plan', label: 'Study Plan' },
  { id: '/dashboard/results', label: 'Analytics' },
  { id: '/dashboard/leaderboard', label: 'Leaderboard' },
  { id: '/dashboard/classes', label: 'Classes' },
  { id: '/dashboard/sat-calculator', label: 'SAT Calculator' },
  { id: '/dashboard/ebooks', label: 'E-Books' },
  { id: '/dashboard/messages', label: 'Messages' },
];

export default function TrialSettingsPage() {
  const { appUser } = useAuth();
  const [tests, setTests] = useState<AdminTestBank[]>([]);
  const [settings, setSettings] = useState<TrialSettings>({ allowedFeatures: [], allowedTests: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!appUser?.uid || appUser.role !== 'super_admin' && appUser.role !== 'admin') return;

    Promise.all([
      getTestBanks(appUser.uid, appUser.role),
      getTrialSettings()
    ]).then(([fetchedTests, fetchedSettings]) => {
      // Only show global (admin) tests
      setTests(fetchedTests.filter(t => !t.teacherId));
      setSettings(fetchedSettings);
      setLoading(false);
    });
  }, [appUser]);

  const toggleFeature = (featId: string) => {
    setSettings(prev => ({
      ...prev,
      allowedFeatures: prev.allowedFeatures.includes(featId)
        ? prev.allowedFeatures.filter(f => f !== featId)
        : [...prev.allowedFeatures, featId]
    }));
  };

  const toggleTest = (testId: string) => {
    setSettings(prev => ({
      ...prev,
      allowedTests: prev.allowedTests.includes(testId)
        ? prev.allowedTests.filter(id => id !== testId)
        : [...prev.allowedTests, testId]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await setTrialSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('Failed to save settings.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={22} color="#6366f1" /> Trial Mode Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Configure what pending students can access in their trial mode dashboard.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Features Column */}
        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>Allowed Features</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ALL_FEATURES.map(feat => {
              const isAllowed = settings.allowedFeatures.includes(feat.id);
              return (
                <div 
                  key={feat.id} 
                  onClick={() => toggleFeature(feat.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem', background: isAllowed ? '#f0fdf4' : 'transparent', border: isAllowed ? '1px solid #bbf7d0' : '1px solid transparent', transition: 'all 0.15s' }}
                  onMouseEnter={e => !isAllowed && (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => !isAllowed && (e.currentTarget.style.background = 'transparent')}
                >
                  {isAllowed ? <CheckSquare size={18} color="#16a34a" /> : <Square size={18} color="#cbd5e1" />}
                  <span style={{ fontSize: '0.875rem', fontWeight: isAllowed ? '700' : '500', color: isAllowed ? '#166534' : '#475569' }}>
                    {feat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tests Column */}
        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Allowed Practice Tests
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>Select which global practice tests should appear for Trial users when they visit the Practice Tests page.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
            {tests.map(test => {
              const isAllowed = settings.allowedTests.includes(test.id!);
              return (
                <div 
                  key={test.id} 
                  onClick={() => toggleTest(test.id!)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem', background: isAllowed ? '#eff6ff' : 'transparent', border: isAllowed ? '1px solid #bfdbfe' : '1px solid transparent', transition: 'all 0.15s' }}
                  onMouseEnter={e => !isAllowed && (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => !isAllowed && (e.currentTarget.style.background = 'transparent')}
                >
                  {isAllowed ? <CheckSquare size={18} color="#2563eb" /> : <Square size={18} color="#cbd5e1" />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: isAllowed ? '700' : '600', color: isAllowed ? '#1e40af' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {test.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{test.subject} • {test.questions} questions</div>
                  </div>
                </div>
              );
            })}
            {tests.length === 0 && (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No tests available.</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.85rem' }}>
          <ShieldAlert size={16} />
          <span>Users in Trial Mode will see a "Locked" screen for any features not selected above.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {success && <span style={{ color: '#16a34a', fontSize: '0.875rem', fontWeight: '700' }}>Settings saved!</span>}
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
