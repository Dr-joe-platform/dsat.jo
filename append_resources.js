const fs = require('fs');

const dbCode = `
export interface SharedResource {
  id?: string;
  teacherId: string;
  title: string;
  subject: string;
  fileUrl: string;
  fileName: string;
  createdAt: any;
}

export async function getSharedResources(teacherId: string): Promise<SharedResource[]> {
  const q = query(collection(db, 'shared_resources'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SharedResource));
}

export async function addSharedResource(data: Omit<SharedResource, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'shared_resources'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function deleteSharedResource(id: string): Promise<void> {
  await deleteDoc(doc(db, 'shared_resources', id));
}
`;

fs.appendFileSync('src/lib/db.ts', dbCode, 'utf8');
console.log('Added resource methods');
