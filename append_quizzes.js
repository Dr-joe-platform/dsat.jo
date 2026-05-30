const fs = require('fs');

const dbCode = `
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}
export interface MiniQuiz {
  id?: string;
  teacherId: string;
  title: string;
  subject: 'Math' | 'English' | 'Both';
  questions: QuizQuestion[];
  isPublic: boolean;
  createdAt: any;
}

export async function getMiniQuizzes(teacherId: string): Promise<MiniQuiz[]> {
  const q = query(collection(db, 'mini_quizzes'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MiniQuiz));
}

export async function addMiniQuiz(data: Omit<MiniQuiz, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'mini_quizzes'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function updateMiniQuiz(id: string, data: Partial<MiniQuiz>): Promise<void> {
  await updateDoc(doc(db, 'mini_quizzes', id), data as DocumentData);
}

export async function deleteMiniQuiz(id: string): Promise<void> {
  await deleteDoc(doc(db, 'mini_quizzes', id));
}
`;

fs.appendFileSync('src/lib/db.ts', dbCode, 'utf8');
console.log('Added mini quizzes methods');
