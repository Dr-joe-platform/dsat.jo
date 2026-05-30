const fs = require('fs');

const dbCode = `
export interface FeatureControls {
  id?: string;
  classId: string;
  teacherId: string;
  aiTutor: boolean;
  aiNotes: boolean;
  leaderboard: boolean;
  miniQuizzes: boolean;
  flashcards: boolean;
  strictExamMode: boolean;
}

export async function getFeatureControls(teacherId: string, classId: string): Promise<FeatureControls | null> {
  const q = query(collection(db, 'feature_toggles'), where('teacherId', '==', teacherId), where('classId', '==', classId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as FeatureControls;
}

export async function setFeatureControls(teacherId: string, classId: string, controls: Partial<FeatureControls>): Promise<void> {
  const existing = await getFeatureControls(teacherId, classId);
  if (existing && existing.id) {
    await updateDoc(doc(db, 'feature_toggles', existing.id), controls as DocumentData);
  } else {
    await addDoc(collection(db, 'feature_toggles'), { teacherId, classId, ...controls });
  }
}
`;

fs.appendFileSync('src/lib/db.ts', dbCode, 'utf8');
console.log('Added feature toggles methods');
