import os

path = r'c:\Users\elnim\Desktop\dsatuz\src\app\test\[testId]\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import_firebase = "import { db } from '@/lib/firebase';\nimport { setDoc, doc, serverTimestamp } from 'firebase/firestore';\n"
if 'firebase/firestore' not in content:
    content = content.replace("import { useAuth } from '@/lib/auth-context';", "import { useAuth } from '@/lib/auth-context';\n" + import_firebase)

heartbeat = """
  // --- Live Classroom Heartbeat ---
  useEffect(() => {
    if (!appUser?.uid || phase !== 'testing') return;

    const updateLiveStatus = async () => {
      try {
        await setDoc(doc(db, 'live_sessions', appUser.uid), {
          uid: appUser.uid,
          displayName: appUser.displayName || 'Student',
          testId: testId,
          phase: phase,
          currentQuestion: currentQIndex + 1,
          totalQuestions: flatQuestions.length,
          lastActive: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error('Failed to update live status', err);
      }
    };

    updateLiveStatus(); // Initial update
    const interval = setInterval(updateLiveStatus, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [appUser?.uid, phase, currentQIndex, testId, flatQuestions.length]);
"""

if 'live_sessions' not in content:
    content = content.replace("  const [timeRemaining, setTimeRemaining] = useState(1);", "  const [timeRemaining, setTimeRemaining] = useState(1);\n" + heartbeat)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added heartbeat to page.tsx")
else:
    print("Heartbeat already exists.")
