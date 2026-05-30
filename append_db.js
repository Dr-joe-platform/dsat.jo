const fs = require('fs');

const code = `
export interface StudyPlan {
  id?: string;
  teacherId: string;
  studentId: string;
  title: string;
  tasks: { id: string; title: string; completed: boolean }[];
  createdAt: any;
}

export async function getStudyPlansByTeacher(teacherId: string): Promise<StudyPlan[]> {
  const q = query(collection(db, 'study_plans'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyPlan));
}

export async function createStudyPlan(data: Omit<StudyPlan, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'study_plans'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function deleteStudyPlan(id: string): Promise<void> {
  await deleteDoc(doc(db, 'study_plans', id));
}
`;

fs.appendFileSync('src/lib/db.ts', code, 'utf8');
console.log('Appended safely');
