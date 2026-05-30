const fs = require('fs');
let code = fs.readFileSync('src/lib/db.ts', 'utf8');

const target = `  isPublic: boolean;
  createdAt: any;
  createdBy?: string; // UID of creator
}

export async function deleteTestBank(testId: string): Promise<void> {`;

const replacement = `  isPublic: boolean;
  createdAt: any;
  createdBy?: string; // UID of creator
  teacherId?: string; // UID of teacher who owns this
  teacherName?: string;
  content?: string;
}

export async function getTestBanks(userId?: string, role?: string): Promise<AdminTestBank[]> {
  try {
    const colRef = collection(db, 'tests');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const allTests = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminTestBank));

    if (role === 'super_admin' || role === 'admin') return allTests;

    if (role === 'student' && userId) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const allowedTests = userDoc.exists() ? (userDoc.data().allowedTests || []) : [];
      return allTests.filter(t => t.isPublic || allowedTests.includes(t.id));
    }

    if (role === 'teacher' && userId) {
      return allTests.filter(t => t.isPublic || t.teacherId === userId || t.createdBy === userId);
    }

    return allTests.filter(t => t.isPublic);
  } catch (err) {
    console.error('Failed to fetch test banks, check indexes', err);
    return [];
  }
}

export async function toggleTestPublicStatus(testId: string, isPublic: boolean): Promise<void> {
  const docRef = doc(db, 'tests', testId);
  await updateDoc(docRef, { isPublic });
}

export async function deleteTestBank(testId: string): Promise<void> {`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/lib/db.ts', code, 'utf8');
  console.log('Restored perfectly!');
} else {
  console.log('Target not found in db.ts! Length of code: ', code.length);
}
