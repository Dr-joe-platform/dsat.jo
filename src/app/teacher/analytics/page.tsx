"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getTeacherClasses, ClassModel, getUsersByIds, AppUser, getUserResults, TestResult, computeWeakPoints, WeakPoint, getAllResults, getTeacherStudents } from '@/lib/db';
import { filterStudentsBySubject, filterResultsBySubject } from '@/lib/subject-filter';
import { Target, TrendingUp, AlertTriangle, User, Flame, Search, ChevronRight, Download, MessageCircle, Phone, ArrowLeft, CheckCircle, XCircle, Printer } from 'lucide-react';

export default function TeacherAnalyticsPage() {
  const { appUser } = useAuth();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Drill-down State
  const [selectedStudent, setSelectedStudent] = useState<AppUser | null>(null);
  const [studentResults, setStudentResults] = useState<TestResult[]>([]);
  const [studentWeakPoints, setStudentWeakPoints] = useState<WeakPoint[]>([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState(false);

  useEffect(() => {
    if (appUser?.uid) loadData();
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const cls = await getTeacherClasses(appUser!.uid);
      setClasses(cls);
      
      const stds = await getTeacherStudents(appUser!.uid, appUser!.teacherSubject);
      setStudents(stds);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(s => {
    if (selectedClass !== 'all') {
      const cls = classes.find(c => c.id === selectedClass);
      if (!cls || !cls.studentIds?.includes(s.uid)) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!s.displayName?.toLowerCase().includes(q) && !s.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleStudentClick = async (student: AppUser) => {
    setSelectedStudent(student);
    setLoadingDrillDown(true);
    try {
      const allResults = await getUserResults(student.uid);
      const filteredResults = filterResultsBySubject(allResults, appUser?.teacherSubject);
      setStudentResults(filteredResults);
      setStudentWeakPoints(computeWeakPoints(filteredResults));
    } catch (err) {
      console.error(err);
    }
    setLoadingDrillDown(false);
  };

  const generateCSV = async () => {
    // Fetch all recent results to get the last exam info
    const allResultsRaw = await getAllResults(500);
    const allResults = filterResultsBySubject(allResultsRaw, appUser?.teacherSubject);

    const headers = ["Name", "Email", "Phone", "Parent Phone", "Status", "Last Active", "Last Exam Date", "Last Exam Score"];
    
    const rows = filteredStudents.map(s => {
      // Find the most recent result for this student
      const studentTests = allResults.filter(r => r.userId === s.uid);
      const lastTest = studentTests.length > 0 ? studentTests[0] : null; // Already sorted by completion date

      return [
        s.displayName || 'Unknown',
        s.email || '',
        s.phone || '',
        s.parentPhone || '',
        s.status || 'active',
        s.lastActiveDate || 'Never',
        lastTest ? new Date(lastTest.completedAt?.seconds * 1000).toLocaleDateString() : 'N/A',
        lastTest ? `${lastTest.totalScore}/${lastTest.maxScore} (${lastTest.percentage}%)` : 'N/A'
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppLink = (phone?: string, text?: string) => {
    if (!phone) return '#';
    // Remove non-numeric chars
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text || 'Hello!')}`;
  };

  if (selectedStudent) {
    // ─── DRILL DOWN VIEW ──────────────────────────────────────────────────────────
    return (
      <div style={{ maxWidth: '1200px' }}>
        <button 
          onClick={() => setSelectedStudent(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#475569', fontWeight: '600', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Student List
        </button>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-report, #printable-report * {
              visibility: visible;
            }
            #printable-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 2rem;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-before: always;
            }
            .print-border {
              border: 1px solid #ccc !important;
              box-shadow: none !important;
            }
          }
        `}</style>

        <div id="printable-report" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="no-print" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Student Report Card</div>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>{selectedStudent.displayName}</h1>
              <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                <span>Email: {selectedStudent.email}</span>
                <span className="no-print">•</span>
                <span className="no-print">Last Active: {selectedStudent.lastActiveDate || 'Never'}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
              <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                <Printer size={16} /> Print / Save PDF
              </button>
              {selectedStudent.phone && (
                <a href={getWhatsAppLink(selectedStudent.phone, `Hello ${selectedStudent.displayName}, this is your teacher.`)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#22c55e', color: '#fff', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>
                  <MessageCircle size={16} /> Contact Student
                </a>
              )}
              {selectedStudent.parentPhone && (
                <a href={getWhatsAppLink(selectedStudent.parentPhone, `Hello, this is the teacher of ${selectedStudent.displayName}. I wanted to update you on their progress.`)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>
                  <Phone size={16} /> Contact Parent
                </a>
              )}
            </div>
          </div>

        {loadingDrillDown ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading student data...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Left: Test History */}
            <div className="print-border" style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>Exam History</h2>
              {studentResults.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No exams taken yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {studentResults.map(res => {
                    const wpSummary = studentWeakPoints.slice(0, 2).map(w => w.topic).join(', ');
                    const parentMsg = `Report for ${selectedStudent.displayName}:\nExam: ${res.testName}\nScore: ${res.totalScore} / ${res.maxScore} (${res.percentage}%)\nWeak Points to focus on: ${wpSummary || 'None identified yet'}.`;
                    
                    return (
                      <div key={res.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>{res.testName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(res.completedAt?.seconds * 1000).toLocaleDateString()} • {(res.module || 'N/A').toUpperCase()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: res.percentage >= 80 ? '#16a34a' : res.percentage >= 60 ? '#d97706' : '#dc2626' }}>{res.totalScore}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{res.percentage}%</div>
                          </div>
                          <div className="no-print">
                            {selectedStudent.parentPhone && (
                              <a href={getWhatsAppLink(selectedStudent.parentPhone, parentMsg)} target="_blank" rel="noreferrer" title="Send Report to Parent" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', transition: 'all 0.2s' }}>
                                <MessageCircle size={18} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Weak Points & Wrong Answers Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="print-border" style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={20} color="#d97706" /> Top Weak Points</h2>
                {studentWeakPoints.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>Not enough data.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {studentWeakPoints.slice(0, 5).map((wp, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                          <span style={{ color: '#0f172a' }}>{wp.topic}</span>
                          <span style={{ color: wp.pct >= 70 ? '#16a34a' : wp.pct >= 50 ? '#d97706' : '#dc2626' }}>{Math.round(wp.pct)}% Accuracy</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${wp.pct}%`, background: wp.pct >= 70 ? '#22c55e' : wp.pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{wp.correct} correct out of {wp.total} attempts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  // ─── MAIN OVERVIEW ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Student Analytics</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Track performance, streaks, and contact students directly.</p>
        </div>
        <button onClick={generateCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#10b981', color: '#fff', borderRadius: '0.625rem', fontWeight: '700', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          <Download size={16} /> Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <select 
          value={selectedClass} 
          onChange={e => setSelectedClass(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', color: '#0f172a', fontWeight: '600', minWidth: '200px' }}
        >
          <option value="all">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" placeholder="Search by name or phone..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>
      </div>

      {/* Student List */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Student</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Contact</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Last Active</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading students...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No students found.</td></tr>
            ) : (
              filteredStudents.map((s, i) => {
                const isActive = s.status !== 'rejected';
                return (
                  <tr key={s.uid} style={{ borderBottom: i < filteredStudents.length - 1 ? '1px solid #e2e8f0' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} onClick={() => handleStudentClick(s)}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                          {(s.displayName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{s.displayName || 'Unknown'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {s.phone && (
                          <a href={getWhatsAppLink(s.phone)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="WhatsApp Student" style={{ color: '#22c55e', background: '#f0fdf4', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
                            <MessageCircle size={16} />
                          </a>
                        )}
                        {s.parentPhone && (
                          <a href={getWhatsAppLink(s.parentPhone)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="WhatsApp Parent" style={{ color: '#0f172a', background: '#f1f5f9', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
                            <Phone size={16} />
                          </a>
                        )}
                        {!s.phone && !s.parentPhone && <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>No phones</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '700', background: isActive ? '#dcfce3' : '#fee2e2', color: isActive ? '#16a34a' : '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 'fit-content' }}>
                        {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />} {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>
                      {s.lastActiveDate ? new Date(s.lastActiveDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: '#0f172a', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        View Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
