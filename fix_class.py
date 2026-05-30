



import sys; sys.stdout.reconfigure(encoding='utf-8')

f = open(r'C:\Users\elnim\Desktop\dsatuz\src\lib\db.ts', 'r', encoding='utf-8')
text = f.read()
f.close()

# The fused bad string to find and replace
old = "export async function createClass(name: string, teacherId: string, teacherName: strconst DEFAULT_FLASHCARDS"

# The reconstructed correct code - restore createClass body + class helper functions + blank line before DEFAULT_FLASHCARDS
new = """export async function createClass(name: string, teacherId: string, teacherName: string): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const docRef = await addDoc(collection(db, 'classes'), {
    name,
    teacherId,
    teacherName,
    code,
    studentIds: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getTeacherClasses(teacherId: string): Promise<ClassModel[]> {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassModel));
}

export async function getStudentClasses(studentId: string): Promise<ClassModel[]> {
  const q = query(collection(db, 'classes'), where('studentIds', 'array-contains', studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassModel));
}

export async function joinClassByCode(studentId: string, code: string): Promise<void> {
  const q = query(collection(db, 'classes'), where('code', '==', code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Class not found');
  const classDoc = snap.docs[0];
  await updateDoc(classDoc.ref, { studentIds: arrayUnion(studentId) });
}

export async function deleteClass(classId: string): Promise<void> {
  await deleteDoc(doc(db, 'classes', classId));
}

const DEFAULT_FLASHCARDS"""

if old in text:
    print("Found corruption. Replacing...")
    text = text.replace(old, new, 1)
    with open(r'C:\Users\elnim\Desktop\dsatuz\src\lib\db.ts', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Saved successfully!")
else:
    print("Pattern not found!")
    print("Looking for partial match...")
    idx = text.find("teacherName: strconst")
    print(f"strconst at: {idx}")
    print(repr(text[idx-100:idx+100]))
