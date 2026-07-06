import os

path = r'c:\Users\elnim\Desktop\dsatuz\src\app\dashboard\weak-points\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add states
if 'const [generating, setGenerating] = useState(false);' not in content:
    content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n  const [generating, setGenerating] = useState(false);")

# Add the function
if 'handleGenerateWorkout' not in content:
    func_code = """
  const handleGenerateWorkout = async () => {
    if (weakPoints.length === 0) return;
    setGenerating(true);
    try {
      const topics = weakPoints.map(w => w.topic).slice(0, 3); // top 3 weakest
      const res = await fetch('/api/ai-weakness-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: appUser!.uid, weakTopics: topics })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Save to admin_test_bank as a private test
      const { createTestBank } = await import('@/lib/db');
      const { collection, doc, setDoc, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const testId = await createTestBank({
        name: `AI Weakness Workout: ${topics[0]}`,
        subject: 'Mixed',
        questions: data.questions.length,
        source: 'AI Workout',
        createdAt: new Date().toISOString(),
        isPublic: false,
        visibleTo: [appUser!.uid],
        createdBy: 'AI',
        teacherId: 'AI',
        teacherName: 'AI Tutor',
        content: JSON.stringify(data.questions)
      });
      
      // Auto-assign it to the student
      const ref = doc(collection(db, 'assignments'));
      await setDoc(ref, {
        id: ref.id,
        testId: testId,
        testName: `AI Weakness Workout: ${topics[0]}`,
        studentId: appUser!.uid,
        teacherId: 'AI',
        teacherName: 'AI Tutor',
        dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
        status: 'pending'
      });

      alert("AI Workout Generated successfully! Redirecting to test...");
      window.location.href = `/test/${testId}`;
    } catch(err: any) {
      alert("Error: " + err.message);
    }
    setGenerating(false);
  };
"""
    content = content.replace("const trend = results.map(r => ({", func_code + "\n  const trend = results.map(r => ({")

# Add the UI button
ui_code = """
        <button onClick={handleGenerateWorkout} disabled={generating} style={{ padding: '0.625rem 1.25rem', background: '#6366f1', color: '#fff', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.875rem', cursor: generating ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          {generating ? 'Generating AI Workout...' : '✨ Generate AI Workout from Weaknesses'}
        </button>
      </div>
"""
if 'Generate AI Workout from Weaknesses' not in content:
    content = content.replace("</p>\n      </div>", "</p>\n" + ui_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added AI Workout button to weak-points page")
