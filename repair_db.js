const fs = require('fs');
let lines = fs.readFileSync('src/lib/db.ts', 'utf8').split('\n');

const newContent = `const DEFAULT_FLASHCARDS: Omit<FlashcardSet, 'id'>[] = [
  {
    title: 'SAT Core Vocabulary',
    subject: 'Vocabulary',
    cards: [
      { front: 'Aberration', back: 'A departure from what is normal, usual, or expected.', example: 'They described the outbreak of violence in the area as an aberration.' },
      { front: 'Capricious', back: 'Given to sudden and unaccountable changes of mood or behavior.', example: "It's hard to plan a vacation when the weather is so capricious." },
      { front: 'Ephemeral', back: 'Lasting for a very short time.', example: 'Fashions are ephemeral.' },
      { front: 'Iconoclast', back: 'A person who attacks cherished beliefs or institutions.', example: "Because Jared was an iconoclast and dared to question the company's mission, he was fired." },
      { front: 'Meticulous', back: 'Showing great attention to detail; very careful and precise.', example: 'He had always been so meticulous about his appearance.' },
    ]
  },
  {
    title: 'Essential Math Formulas',
    subject: 'Math',
    cards: [
      { front: 'Quadratic Formula', back: '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$', example: 'Used to find the roots of a quadratic equation $ax^2 + bx + c = 0$.' },
      { front: 'Distance Formula', back: '$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$', example: 'Finds the distance between two points in a Cartesian plane.' },
      { front: 'Circle Equation', back: '$$(x - h)^2 + (y - k)^2 = r^2$$', example: 'Where $(h, k)$ is the center and $r$ is the radius.' },
      { front: 'Slope Formula', back: '$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$', example: 'Finds the steepness of a line.' }
    ]
  },
  {
    title: 'Grammar Rules',
    subject: 'Reading',
    cards: [
      { front: 'Semicolon (;)', back: 'Used to link two independent clauses that are closely related in thought.', example: 'Some people write with a word processor; others write with a pen or pencil.' },
      { front: 'Colon (:)', back: 'Used to introduce a list, quote, or explanation.', example: 'He wanted to see three cities in Italy: Rome, Florence, and Venice.' },
      { front: 'Em Dash (—)', back: 'Used to add emphasis or indicate a sudden break in thought.', example: 'The man—the one with the hat—is my father.' }
    ]
  }
];

export async function getFlashcardSets(): Promise<FlashcardSet[]> {
  const q = query(collection(db, 'flashcard_sets'));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    const batch = writeBatch(db);
    const sets: FlashcardSet[] = [];
    for (const def of DEFAULT_FLASHCARDS) {
      const docRef = doc(collection(db, 'flashcard_sets'));
      batch.set(docRef, def);
      sets.push({ id: docRef.id, ...def });
    }
    await batch.commit();
    return sets;
  }
  
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FlashcardSet));
}

export async function createFlashcardSet(data: Omit<FlashcardSet, 'id'>): Promise<string> {
  const colRef = collection(db, 'flashcard_sets');
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

export async function deleteFlashcardSet(id: string): Promise<void> {
  await deleteDoc(doc(db, 'flashcard_sets', id));
}

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulary Engine
// ─────────────────────────────────────────────────────────────────────────────

export interface VocabWord {
  id?: string;
  userId: string;
  word: string;
  definition: string;
  example: string;
  addedAt: any;
}

export async function getUserVocabulary(userId: string): Promise<VocabWord[]> {
  const q = query(collection(db, 'vocabulary'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const words = snap.docs.map(d => ({ id: d.id, ...d.data() } as VocabWord));
  // Sort in JS to avoid requiring a composite index in Firestore
  return words.sort((a, b) => {
    const timeA = a.addedAt?.toMillis ? a.addedAt.toMillis() : 0;
    const timeB = b.addedAt?.toMillis ? b.addedAt.toMillis() : 0;
    return timeB - timeA;
  });
}

export async function addVocabWord(userId: string, word: string, definition: string, example: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'vocabulary'), {
    userId,
    word,
    definition,
    example,
    addedAt: serverTimestamp(),
  });
  return docRef.id;
}`;

lines.splice(680, 14, newContent);
fs.writeFileSync('src/lib/db.ts', lines.join('\\n'), 'utf8');
console.log("File repaired successfully!");
