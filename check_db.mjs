import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCZX2390lzngpNrqu5EZG-bAz9bjqKmXlY",
  authDomain: "dr-joe-for-sat.firebaseapp.com",
  projectId: "dr-joe-for-sat",
  storageBucket: "dr-joe-for-sat.firebasestorage.app",
  messagingSenderId: "459080493956",
  appId: "1:459080493956:web:2becd7cc767babd71dcbd1",
  measurementId: "G-NTVPQY8G51"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'users'));
  const users = snap.docs.map(d => ({id: d.id, ...d.data()}));
  const student = users.find(u => u.email === 'studen@drjoe.com');
  console.log("Student:", student);
  
  const booksSnap = await getDocs(collection(db, 'ebooks'));
  const books = booksSnap.docs.map(d => ({id: d.id, ...d.data()}));
  console.log("Books:", books.map(b => ({id: b.id, title: b.title, subject: b.subject, teacherId: b.teacherId})));
  
  process.exit(0);
}
run();
