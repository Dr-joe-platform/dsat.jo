import os

path = r'c:\Users\elnim\Desktop\dsatuz\src\app\dashboard\practice\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
if 'getStudentAssignments' not in content:
    content = content.replace("import { getTestBanks, AdminTestBank } from '@/lib/db';", "import { getTestBanks, AdminTestBank, getStudentAssignments, Assignment } from '@/lib/db';")

# 2. Add state
if 'assignments' not in content:
    content = content.replace("const [dbTests, setDbTests] = useState<AdminTestBank[]>([]);", "const [dbTests, setDbTests] = useState<AdminTestBank[]>([]);\n  const [assignments, setAssignments] = useState<Assignment[]>([]);")

# 3. Add fetch
if 'getStudentAssignments(appUser.uid)' not in content:
    fetch_code = """
      getStudentAssignments(appUser.uid).then(a => setAssignments(a));
    """
    content = content.replace("getTestBanks(appUser.uid, appUser.role).then(async tests => {", fetch_code + "\n    getTestBanks(appUser.uid, appUser.role).then(async tests => {")

# 4. Add UI section before "Dynamically Loaded Teacher/Admin Tests"
ui_code = """
        {/* ASSIGNMENTS */}
        {assignments.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>Scheduled Assignments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assignments.map((assignment) => {
                const now = new Date().getTime();
                const dueTime = assignment.dueDate.toMillis();
                const unlockTime = assignment.unlockDate ? assignment.unlockDate.toMillis() : 0;
                
                const isCompleted = assignment.status === 'completed';
                const isLocked = unlockTime > now && !isCompleted;
                const isPastDue = dueTime < now && !isCompleted;
                
                return (
                  <div key={assignment.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', opacity: isLocked ? 0.6 : 1 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '0.625rem', background: isCompleted ? '#0f172a' : isLocked ? '#f1f5f9' : isPastDue ? '#fee2e2' : '#e0e7ff', color: isCompleted ? '#fff' : isLocked ? '#94a3b8' : isPastDue ? '#dc2626' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                      {isLocked ? <Lock size={16} /> : isCompleted ? <Check size={16} /> : <BookOpen size={16} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {assignment.testName}
                        {isPastDue && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: '700', background: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>PAST DUE</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {assignment.unlockDate && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> Unlocks: {assignment.unlockDate.toDate().toLocaleString()}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={11} /> Due: {assignment.dueDate.toDate().toLocaleString()}</span>
                        <span style={{ color: '#475569' }}>Assigned by {assignment.teacherName}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div style={{ flexShrink: 0 }}>
                      {isCompleted ? (
                        <div style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.875rem' }}>Completed</div>
                      ) : isLocked ? (
                        <div style={{ color: '#94a3b8', fontWeight: '600', fontSize: '0.75rem' }}>Locked</div>
                      ) : isPastDue ? (
                        <div style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.75rem' }}>Locked</div>
                      ) : (
                        <Link href={`/test/${assignment.testId}`} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: '#4f46e5', color: '#fff', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                          <Play size={13} fill="white" /> Start
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
"""
if 'Scheduled Assignments' not in content:
    content = content.replace("{/* Dynamically Loaded Teacher/Admin Tests */}", ui_code + "\n        {/* Dynamically Loaded Teacher/Admin Tests */}")

if 'Check' not in content:
    content = content.replace("from 'lucide-react';", ", Check } from 'lucide-react';")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated practice page with assignments")
