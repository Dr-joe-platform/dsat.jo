import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
  writeBatch,
  arrayUnion,
  arrayRemove,
  documentId,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { AppUser } from './auth-context';
import {
  filterItemsBySubject,
  filterItemsForStudent,
  filterResultsBySubject,
  filterStudentsBySubject,
  itemMatchesTeacher,
  studentMatchesTeacher,
} from './subject-filter';
export type { AppUser }; // Re-export for other pages

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface TestResult {
  correctQuestionIds?: string[];
  unansweredQuestionIds?: string[];
  id: string;
  userId: string;
  testId: string;
  testName: string;
  module: string;
  totalScore: number;
  totalMathScore?: number;
  totalEnglishScore?: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  answers: Record<string, string>;
  wrongQuestionIds: string[];
  bookmarkedIds: string[];
  timeTaken: number; // seconds
  completedAt: Timestamp;
  subject: 'math' | 'reading_writing' | 'full';
  skills?: { skill: string; correct: boolean }[];
}


// ─── Users ────────────────────────────────────────────────────────────────────

/** Get all users (admin only) */
export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as AppUser));
}

/** Get users by teacher code (teacher) */
export async function getUsersByTeacherCode(code: string): Promise<AppUser[]> {
  const q = query(collection(db, 'users'), where('teacherCode', '==', code));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as AppUser));
}

/** Automatically links a student to a teacher's classes using their Teacher Code */
export async function linkStudentToTeacherByCode(studentId: string, studentSubject: string, teacherCode: string): Promise<void> {
  // 1. Find the teacher with this code
  const q = query(collection(db, 'users'), where('role', '==', 'teacher'), where('teacherCode', '==', teacherCode));
  const snap = await getDocs(q);
  if (snap.empty) return; // Teacher not found, do nothing

  const teacher = snap.docs[0];
  const teacherId = teacher.id;

  // 2. Find classes owned by this teacher
  const classesQ = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  const classesSnap = await getDocs(classesQ);
  
  if (classesSnap.empty) return;

  // 3. Add student to appropriate classes
  for (const cDoc of classesSnap.docs) {
    const cData = cDoc.data();
    // Only add if the subject matches (or class is 'Both')
    if (!cData.subject || cData.subject === 'Both' || cData.subject.toLowerCase() === studentSubject.toLowerCase()) {
      await updateDoc(cDoc.ref, { studentIds: arrayUnion(studentId) });
    }
  }
}

/** Ensures a teacher has a generated teacherCode. Used for migrating old accounts or forcing generation. */
export async function ensureTeacherCode(teacherId: string): Promise<string> {
  const docRef = doc(db, 'users', teacherId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return '';
  
  const data = snap.data() as AppUser;
  if (data.teacherCode) return data.teacherCode;
  
  // Generate a random 6-character code e.g. TCH-A1B2C3
  const code = 'TCH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  await updateDoc(docRef, { teacherCode: code });
  return code;
}

/** Get users by multiple UIDs */
export async function getUsersByIds(uids: string[]): Promise<AppUser[]> {
  if (!uids || uids.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < uids.length; i += 10) {
    chunks.push(uids.slice(i, i + 10));
  }
  let allUsers: AppUser[] = [];
  for (const chunk of chunks) {
    const q = query(collection(db, 'users'), where(documentId(), 'in', chunk));
    const snap = await getDocs(q);
    allUsers = [...allUsers, ...snap.docs.map(d => ({ uid: d.id, ...d.data() } as AppUser))];
  }
  return allUsers;
}

export async function getTeacherStudents(
  teacherId: string,
  teacherSubject?: AppUser['teacherSubject']
): Promise<AppUser[]> {
  const teacherDoc = await getDoc(doc(db, 'users', teacherId));
  const tData = teacherDoc.exists() ? (teacherDoc.data() as AppUser) : null;
  const teacherCode = tData?.teacherCode;

  const classes = await getTeacherClasses(teacherId);
  const classStudentIds = Array.from(new Set(classes.flatMap(c => c.studentIds || [])));

  const allUsers = await getAllUsers();
  
  const students = allUsers.filter(u => {
    if (u.role !== 'student' || u.status === 'rejected') return false;
    
    // In a class
    if (classStudentIds.includes(u.uid)) return true;
    
    // Has teacher code
    if (teacherCode) {
      const normalizedTeacherCode = teacherCode.toLowerCase().trim();
      const uTeacherCode = u.teacherCode?.toLowerCase().trim();
      const uReferredBy = (u as any).referredBy?.toLowerCase().trim();
      const uTeacherCodes = u.teacherCodes?.map(c => c.toLowerCase().trim()) || [];
      
      if (uTeacherCodes.includes(normalizedTeacherCode) || 
          uTeacherCode === normalizedTeacherCode || 
          uReferredBy === normalizedTeacherCode) {
        return true;
      }
    }

    return false;
  });

  return filterStudentsBySubject(students, teacherSubject);
}

/** Update user role/status (admin) */
export async function updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data as DocumentData);
}

/** Delete user doc from Firestore (admin — does NOT delete Firebase Auth account) */
export async function deleteUserDoc(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}

// ─── Results ──────────────────────────────────────────────────────────────────

/** Get all results for a specific user */
export async function getUserResults(userId: string): Promise<TestResult[]> {
  const q = query(
    collection(db, 'results'),
    where('userId', '==', userId),
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as TestResult));
  // Sort client-side — no composite index needed
  return docs.sort((a, b) => (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0));
}

/** Get all results for all students (teacher/admin) */
export async function getAllResults(limitCount = 100): Promise<TestResult[]> {
  // No orderBy to avoid needing a single-collection index — sorted client-side
  const q = query(
    collection(db, 'results'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as TestResult));
  return docs.sort((a, b) => (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0));
}

export async function getResultsForUsers(userIds: string[], limitCount = 500): Promise<TestResult[]> {
  if (!userIds || userIds.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < userIds.length; i += 10) {
    chunks.push(userIds.slice(i, i + 10));
  }

  let results: TestResult[] = [];
  for (const chunk of chunks) {
    const q = query(collection(db, 'results'), where('userId', 'in', chunk));
    const snap = await getDocs(q);
    results = [...results, ...snap.docs.map(d => ({ id: d.id, ...d.data() } as TestResult))];
  }

  return results
    .sort((a, b) => (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0))
    .slice(0, limitCount);
}

export async function getTeacherResults(
  teacherId: string,
  teacherSubject?: AppUser['teacherSubject'],
  limitCount = 500
): Promise<TestResult[]> {
  const classes = await getTeacherClasses(teacherId);
  const studentIds = Array.from(new Set(classes.flatMap(c => c.studentIds || [])));
  const results = await getResultsForUsers(studentIds, limitCount);
  return filterResultsBySubject(results, teacherSubject).slice(0, limitCount);
}

/** Real-time listener for a user's results */
export function subscribeUserResults(
  userId: string,
  callback: (results: TestResult[]) => void
) {
  const q = query(
    collection(db, 'results'),
    where('userId', '==', userId),
  );
  return onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as TestResult));
    // Sort client-side to avoid composite index
    callback(docs.sort((a, b) => (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0)));
  });
}

// ─── Weak Points Analysis ─────────────────────────────────────────────────────

export interface WeakPoint {
  topic: string;
  subject: string;
  correct: number;
  total: number;
  pct: number;
}

/** Compute weak points from results */
export function computeWeakPoints(results: TestResult[]): WeakPoint[] {
  const topicMap: Record<string, { correct: number; total: number; subject: string }> = {};

  for (const result of results) {
    if (result.skills) {
      for (const { skill, correct } of result.skills) {
        if (!topicMap[skill]) {
          topicMap[skill] = { correct: 0, total: 0, subject: result.subject };
        }
        topicMap[skill].total += 1;
        if (correct) {
          topicMap[skill].correct += 1;
        }
      }
    }
  }

  // Return sorted by pct ascending
  return Object.entries(topicMap)
    .map(([topic, { correct, total, subject }]) => ({
      topic, subject, correct, total,
      pct: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct);
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  points: number;
  streak: number;
  tests: number;
  badges: number;
}

/** Compute leaderboard from users + results */
export async function getLeaderboard(limit_n = 20): Promise<LeaderboardEntry[]> {
  const users = await getAllUsers();
  const allResults = await getAllResults(500);

  const entries: LeaderboardEntry[] = users
    .filter(u => u.role === 'student' && u.status === 'approved')
    .map(u => {
      const myResults = allResults.filter(r => r.userId === u.uid);
      const points = myResults.reduce((sum, r) => sum + r.correctCount * 10 + 50, 0);
      return {
        uid: u.uid,
        displayName: u.displayName || u.email,
        points,
        streak: 0, // TODO: compute from daily activity
        tests: myResults.length,
        badges: Math.floor(points / 500),
      };
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, limit_n);

  return entries;
}

// ─── Trial Settings ─────────────────────────────────────────────────────────

export interface TrialSettings {
  allowedFeatures: string[];
  allowedTests: string[];
}

export async function getTrialSettings(): Promise<TrialSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'trialMode'));
    if (snap.exists()) {
      return snap.data() as TrialSettings;
    }
  } catch (error) {
    console.error("Failed to fetch Trial Settings:", error);
  }
  // Fallback defaults
  return {
    allowedFeatures: [],
    allowedTests: [],
  };
}

export async function setTrialSettings(settings: TrialSettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'trialMode'), settings);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface FirestoreTest {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
  subject: string;
  questionCount: number;
  isPublic: boolean;
  assignedTo?: string[];
}

export async function getPublicTests(): Promise<FirestoreTest[]> {
  const q = query(collection(db, 'tests'), where('isPublic', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreTest));
}

export async function getTestById(testId: string): Promise<AdminTestBank | null> {
  const snap = await getDoc(doc(db, 'tests', testId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as AdminTestBank;
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export interface Assignment {
  id: string;
  testId: string;
  testName: string;
  subject?: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  dueDate: Timestamp;
  status: 'pending' | 'completed';
  completedAt?: Timestamp;
  score?: number;
}

export async function getStudentAssignments(studentId: string): Promise<Assignment[]> {
  const q = query(
    collection(db, 'test_assignments'),
    where('studentId', '==', studentId),
  );
  const snap = await getDocs(q);

  if (snap.empty) return [];

  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment));
  // Sort client-side — no composite index needed
  return docs.sort((a, b) => (b.dueDate?.seconds ?? 0) - (a.dueDate?.seconds ?? 0));
}

// ─── Flashcard Sets ───────────────────────────────────────────────────────────


// ─── E-Books ─────────────────────────────────────────────────────────────────

export interface EbookSettings {
  allowDownload: boolean;
  saveProgress: boolean;
  allowAnnotations: boolean;
}

export interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string;
  pdfUrl: string;
  coverUrl?: string;
  createdAt: any;
  subject?: string;
  coverColor?: string;
  coverEmoji?: string;
  teacherId?: string;
  downloadUrl?: string;
  settings?: EbookSettings;
  classIds?: string[];
}

export async function getEbooks(userId?: string, role?: string, subject?: string): Promise<Ebook[]> {
  const snap = await getDocs(collection(db, 'ebooks'));
  const allEbooks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ebook));

  if (role === 'super_admin' || role === 'admin') {
    return subject ? filterItemsBySubject(allEbooks, subject) : allEbooks;
  }

  if (role === 'teacher' && userId) {
    const mine = allEbooks.filter(b => b.teacherId === userId);
    return filterItemsBySubject(mine, subject);
  }

  if (role === 'student' && userId) {
    const studentClasses = await getStudentClasses(userId);
    const studentClassIds = studentClasses.map(c => c.id);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    const studentSubject = subject || (userDoc.exists() ? userDoc.data().subject : undefined);
    
    const visible = allEbooks.filter(b => {
      if (b.teacherId === 'admin_global' || !b.teacherId) return true; // Global books
      // If book has assigned classes, check if student is in any of them
      if (b.classIds && b.classIds.length > 0) {
        return b.classIds.some(id => studentClassIds.includes(id));
      }
      // If book has NO assigned classes, fallback to checking if student is taught by the teacher
      const teacherIds = studentClasses.map(c => c.teacherId).filter(Boolean);
      return teacherIds.includes(b.teacherId);
    });
    
    return filterItemsForStudent(visible, studentSubject);
  }

  return allEbooks.filter(b => b.teacherId === 'admin_global' || !b.teacherId);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: 'test_assigned' | 'account_approved' | 'test_completed' | 'new_test' | 'streak' | 'milestone' | 'system' | 'ebook_assigned';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Timestamp;
}

export async function getNotifications(userId: string, max = 30): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    limit(max)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
  
  const now = Date.now() / 1000;
  const freshDocs = docs.filter(d => (now - (d.createdAt?.seconds ?? 0)) <= 24 * 3600);
  const oldDocs = docs.filter(d => (now - (d.createdAt?.seconds ?? 0)) > 24 * 3600);
  
  if (oldDocs.length > 0) {
    // Fire and forget delete
    import('firebase/firestore').then(({ deleteDoc, doc }) => {
      oldDocs.forEach(d => {
        deleteDoc(doc(db, 'notifications', d.id)).catch(e => console.error(e));
      });
    });
  }

  // Sort client-side to avoid needing a composite index
  return freshDocs.sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });
}

export function subscribeNotifications(userId: string, cb: (n: Notification[]) => void) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    limit(30)
  );
  return onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
    
    const now = Date.now() / 1000;
    const freshDocs = docs.filter(d => (now - (d.createdAt?.seconds ?? 0)) <= 24 * 3600);
    const oldDocs = docs.filter(d => (now - (d.createdAt?.seconds ?? 0)) > 24 * 3600);
    
    if (oldDocs.length > 0) {
      // Fire and forget delete
      import('firebase/firestore').then(({ deleteDoc, doc }) => {
        oldDocs.forEach(d => {
          deleteDoc(doc(db, 'notifications', d.id)).catch(e => console.error(e));
        });
      });
    }

    // Sort client-side to avoid needing a composite index
    const sorted = freshDocs.sort((a, b) => {
      const aTime = a.createdAt?.seconds ?? 0;
      const bTime = b.createdAt?.seconds ?? 0;
      return bTime - aTime;
    });
    cb(sorted);
  });
}

export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
}

export async function markAllNotificationsRead(userId: string) {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('isRead', '==', false));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { isRead: true }));
  await batch.commit();
}

export async function addNotification(data: Omit<Notification, 'id' | 'createdAt'>) {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function notifyStudentsForNewTest(testName: string, visibleTo: string[] | 'all', assignerName: string = 'Your Teacher') {
  if (!visibleTo || (Array.isArray(visibleTo) && visibleTo.length === 0)) return;

  const title = '📝 New Test Available';
  const message = `${assignerName} granted you access to a new test: ${testName}.`;
  
  if (visibleTo === 'all') {
    const allUsers = await getAllUsers();
    const students = allUsers.filter(u => u.role === 'student' || (u.role as string) === 'trial');
    for (const student of students) {
      await addNotification({
        userId: student.uid,
        type: 'test_assigned',
        title,
        message,
        isRead: false,
        link: '/dashboard/practice',
      });
    }
  } else if (Array.isArray(visibleTo)) {
    for (const uid of visibleTo) {
      await addNotification({
        userId: uid,
        type: 'test_assigned',
        title,
        message,
        isRead: false,
        link: '/dashboard/practice',
      });
    }
  }
}

export async function notifyStudentsForNewEbook(bookTitle: string, visibleTo: string[] | 'all', assignerName: string = 'Admin', isClassIds = false) {
  if (!visibleTo || (Array.isArray(visibleTo) && visibleTo.length === 0)) return;

  const title = '📚 New E-Book Available';
  const message = `${assignerName} added a new E-Book for you: ${bookTitle}.`;
  
  let targetUids: string[] = [];

  if (visibleTo === 'all') {
    const allUsers = await getAllUsers();
    targetUids = allUsers.filter(u => u.role === 'student' || (u.role as string) === 'trial').map(u => u.uid);
  } else if (isClassIds) {
    // visibleTo contains class IDs
    for (const classId of visibleTo) {
      const classDoc = await getDoc(doc(db, 'classes', classId));
      if (classDoc.exists()) {
        const cData = classDoc.data();
        if (cData.studentIds) {
          targetUids.push(...cData.studentIds);
        }
      }
    }
  } else {
    targetUids = visibleTo;
  }

  // Remove duplicates
  targetUids = Array.from(new Set(targetUids));

  for (const uid of targetUids) {
    await addNotification({
      userId: uid,
      type: 'ebook_assigned',
      title,
      message,
      isRead: false,
      link: '/dashboard/ebooks',
    });
  }
}

// ─── Save Test Result ─────────────────────────────────────────────────────────

export async function saveTestResult(result: Omit<TestResult, 'id' | 'completedAt'>): Promise<string> {
  // Strip undefined values deeply to prevent Firebase errors
  const cleanResult = JSON.parse(JSON.stringify(result));
  
  const ref = await addDoc(collection(db, 'results'), {
    ...cleanResult,
    completedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Update User Profile ──────────────────────────────────────────────────────

export async function updateUserProfile(uid: string, data: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data as DocumentData);
}

// ─── Test Access ─────────────────────────────────────────────────────────────

export interface TestAccess {
  userId: string;
  testId: string;
  grantedBy: string;
  grantedAt: Timestamp;
}

export async function getTestAccessForUser(userId: string): Promise<string[]> {
  const q = query(collection(db, 'test_access'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => (d.data() as TestAccess).testId);
}

export async function grantTestAccess(userId: string, testId: string, teacherId: string) {
  const id = `${userId}_${testId}`;
  await setDoc(doc(db, 'test_access', id), {
    userId, testId, grantedBy: teacherId, grantedAt: serverTimestamp(),
  });
}

export async function revokeTestAccess(userId: string, testId: string) {
  await deleteDoc(doc(db, 'test_access', `${userId}_${testId}`));
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  userId: string;
  testId: string;
  questionId: string;
  questionText: string;
  options?: string[];
  explanation?: string;
  correctAnswer: string;
  createdAt: Timestamp;
}

export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  const q = query(collection(db, 'bookmarks'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Bookmark));
  // Sort client-side — no composite index needed
  return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function addBookmark(data: Omit<Bookmark, 'id' | 'createdAt'>) {
  const id = `${data.userId}_${data.questionId}`;
  const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
  await setDoc(doc(db, 'bookmarks', id), { ...cleanData, createdAt: serverTimestamp() });
}

export async function removeBookmark(userId: string, questionId: string) {
  await deleteDoc(doc(db, 'bookmarks', `${userId}_${questionId}`));
}

// ─── Streak / Stats ───────────────────────────────────────────────────────────

export interface UserStats {
  userId: string;
  streak: number;
  longestStreak: number;
  totalPoints: number;
  lastActivityDate: string; // YYYY-MM-DD
  totalStudyMinutes: number;
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const snap = await getDoc(doc(db, 'user_stats', userId));
  if (!snap.exists()) return null;
  return { userId, ...snap.data() } as UserStats;
}

export async function updateUserStats(userId: string, data: Partial<UserStats>) {
  await setDoc(doc(db, 'user_stats', userId), data, { merge: true });
}

// ─── Test Assignments ─────────────────────────────────────────────────────────

export async function createAssignment(data: Omit<Assignment, 'id' | 'completedAt'>) {
  await addDoc(collection(db, 'test_assignments'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function completeAssignment(assignmentId: string, score: number) {
  await updateDoc(doc(db, 'test_assignments', assignmentId), {
    status: 'completed',
    score,
    completedAt: serverTimestamp(),
  });
}

// ─── Admin Activity Logs ──────────────────────────────────────────────────────

export interface ActivityLog {
  id?: string;
  type: 'auth' | 'admin' | 'test' | 'system';
  action: string;
  user: string; // email or name of the user performing the action or subject
  details: string;
  severity: 'info' | 'warn' | 'error';
  timestamp: any;
}

export async function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const colRef = collection(db, 'activity_logs');
    await addDoc(colRef, {
      ...log,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to add activity log', error);
  }
}

export async function getActivityLogs(limitCount = 100): Promise<ActivityLog[]> {
  try {
    const colRef = collection(db, 'activity_logs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
  } catch (err) {
    console.error('Failed to get activity logs. Ensure index exists.', err);
    return [];
  }
}

export async function clearActivityLogs(): Promise<void> {
  const colRef = collection(db, 'activity_logs');
  const snap = await getDocs(colRef);
  const batch = writeBatch(db);
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

// ─── Admin Test Bank ──────────────────────────────────────────────────────────

export interface AdminTestBank {
  id?: string;
  name: string;
  subject: string;
  questions: number;
  difficulty?: string;
  source: string;
  isPublic: boolean;
  createdAt: any;
  createdBy?: string; // UID of creator
  teacherId?: string; // UID of teacher who owns this
  teacherName?: string;
  content?: string;
  visibleTo?: 'all' | string[];
  isMiniQuiz?: boolean;
  customTime?: number;
  allowedPlans?: string[];
  modulesConfig?: {
    M1?: { time: number, questions: number, name?: string },
    M2?: { time: number, questions: number, name?: string },
    MATH_M1?: { time: number, questions: number, name?: string },
    MATH_M2?: { time: number, questions: number, name?: string },
    MATH_M2H?: { time: number, questions: number, name?: string },
    MATH_M2E?: { time: number, questions: number, name?: string }
  };
}

export async function getTestBanks(userId?: string, role?: string, subject?: string): Promise<AdminTestBank[]> {
  try {
    const colRef = collection(db, 'tests');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const allTests = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminTestBank));

    if (role === 'super_admin' || role === 'admin') {
      return subject ? filterItemsBySubject(allTests, subject) : allTests;
    }

    if (role === 'student' && userId) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const allowedTests = userData.allowedTests || [];
      const studentSubject = subject || userData.subject;
      const teacherIds = await getTeacherIdsForStudent(userId);

      const visible = allTests.filter(t => {
        if (!t.teacherId) {
          return t.isPublic || 
                 allowedTests.includes(t.id) || 
                 t.visibleTo === 'all' || 
                 (Array.isArray(t.visibleTo) && t.visibleTo.includes(userId));
        }
        
        if (teacherIds.includes(t.teacherId)) {
          return t.visibleTo === 'all' || 
                 allowedTests.includes(t.id) || 
                 (Array.isArray(t.visibleTo) && t.visibleTo.includes(userId));
        }

        return false;
      });
      return filterItemsForStudent(visible, studentSubject);
    }

    if (role === 'teacher' && userId) {
      const mine = allTests.filter(t => t.teacherId === userId || t.createdBy === userId);
      return filterItemsBySubject(mine, subject);
    }

    return allTests.filter(t => t.isPublic);
  } catch (err) {
    console.error('Failed to fetch test banks, check indexes', err);
    return [];
  }
}

export async function updateTestBank(testId: string, data: Partial<AdminTestBank>): Promise<void> {
  const docRef = doc(db, 'tests', testId);
  await updateDoc(docRef, data);
}

export async function toggleTestPublicStatus(testId: string, isPublic: boolean): Promise<void> {
  const docRef = doc(db, 'tests', testId);
  await updateDoc(docRef, { isPublic });
}

export async function deleteTestBank(testId: string): Promise<void> {
  const docRef = doc(db, 'tests', testId);
  await deleteDoc(docRef);
}

export async function createTestBank(data: Omit<AdminTestBank, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'tests'), {
    ...data,
    createdAt: serverTimestamp(),
  });

  if (data.visibleTo) {
    await notifyStudentsForNewTest(data.name, data.visibleTo, data.teacherName || 'Admin');
  }
}

// ─── Classes ─────────────────────────────────────────────────────────────────

export interface ClassModel {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  subject?: 'Math' | 'English' | 'Both';
  code: string;
  studentIds: string[];
  createdAt: any;
}

export async function createClass(
  name: string,
  teacherId: string,
  teacherName: string,
  subject: AppUser['teacherSubject'] = 'Both'
): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const docRef = await addDoc(collection(db, 'classes'), {
    name,
    teacherId,
    teacherName,
    subject,
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

export async function joinClass(studentId: string, code: string): Promise<void> {
  const q = query(collection(db, 'classes'), where('code', '==', code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Class not found');
  const classDoc = snap.docs[0];
  const classData = { id: classDoc.id, ...classDoc.data() } as ClassModel;
  const [studentSnap, teacherSnap] = await Promise.all([
    getDoc(doc(db, 'users', studentId)),
    getDoc(doc(db, 'users', classData.teacherId)),
  ]);
  const studentData = studentSnap.exists() ? (studentSnap.data() as AppUser) : null;
  const teacherData = teacherSnap.exists() ? (teacherSnap.data() as AppUser) : null;
  const classSubject = classData.subject || teacherData?.teacherSubject || 'Both';
  const studentSubject = studentData?.subject || 'both';

  if (!studentMatchesTeacher(studentSubject, classSubject)) {
    throw new Error(`This class is for ${classSubject} students only.`);
  }

  await updateDoc(classDoc.ref, { studentIds: arrayUnion(studentId) });
  
  if (!studentData?.subject && classSubject !== 'Both') {
    await updateDoc(doc(db, 'users', studentId), { subject: classSubject.toLowerCase() });
  }
}

export async function deleteClass(classId: string): Promise<void> {
  await deleteDoc(doc(db, 'classes', classId));
}

export async function getClassDetails(classId: string): Promise<ClassModel | null> {
  const snap = await getDoc(doc(db, 'classes', classId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ClassModel;
}

export async function removeStudentFromClass(classId: string, studentId: string): Promise<void> {
  await updateDoc(doc(db, 'classes', classId), { studentIds: arrayRemove(studentId) });
}

// ─────────────────────────────────────────────────────────────────────────────

export interface Flashcard {
  front: string;
  back: string;
  example?: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  createdBy?: string;
}

const DEFAULT_FLASHCARDS: Omit<FlashcardSet, 'id'>[] = [
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
      { front: 'Quadratic Formula', back: '$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$', example: 'Used to find the roots of a quadratic equation $ax^2 + bx + c = 0$.' },
      { front: 'Distance Formula', back: '$$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$', example: 'Finds the distance between two points in a Cartesian plane.' },
      { front: 'Circle Equation', back: '$$(x - h)^2 + (y - k)^2 = r^2$$', example: 'Where $(h, k)$ is the center and $r$ is the radius.' },
      { front: 'Slope Formula', back: '$$m = \frac{y_2 - y_1}{x_2 - x_1}$$', example: 'Finds the steepness of a line.' }
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

export async function getTeacherIdsForStudent(studentId: string): Promise<string[]> {
  const classes = await getStudentClasses(studentId);
  return Array.from(new Set(classes.map(c => c.teacherId).filter(Boolean)));
}

export async function getFlashcardSets(
  userId?: string,
  role?: string,
  subject?: string
): Promise<FlashcardSet[]> {
  const q = query(collection(db, 'flashcard_sets'));
  const snap = await getDocs(q);
  const allSets = snap.docs.map(d => ({ id: d.id, ...d.data() } as FlashcardSet));

  if (role === 'super_admin' || role === 'admin') {
    return subject ? filterItemsBySubject(allSets, subject) : allSets;
  }

  if (role === 'teacher' && userId) {
    const mine = allSets.filter(s => !s.createdBy || s.createdBy === userId);
    return filterItemsBySubject(mine, subject);
  }

  if (role === 'student' && userId) {
    const teacherIds = await getTeacherIdsForStudent(userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    const studentSubject = subject || (userDoc.exists() ? userDoc.data().subject : undefined);
    const visible = allSets.filter(s => !s.createdBy || teacherIds.includes(s.createdBy));
    return filterItemsForStudent(visible, studentSubject);
  }

  return allSets.filter(s => !s.createdBy);
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
}
export async function deleteVocabWord(id: string): Promise<void> {
  await deleteDoc(doc(db, 'vocabulary', id));
}

// ─── Support Tickets ──────────────────────────────────────────────────────────

export interface SupportTicket {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'new' | 'answered' | 'resolved';
  replyMessage?: string;
  repliedAt?: any;
  createdAt: any;
}

export async function createSupportTicket(data: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'repliedAt' | 'replyMessage'>): Promise<string> {
  const colRef = collection(db, 'support_tickets');
  const docRef = await addDoc(colRef, {
    ...data,
    status: 'new',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  const colRef = collection(db, 'support_tickets');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
}

export async function updateSupportTicket(ticketId: string, data: Partial<SupportTicket>): Promise<void> {
  const docRef = doc(db, 'support_tickets', ticketId);
  await updateDoc(docRef, data as DocumentData);
}

export interface StudyPlan {
  id?: string;
  teacherId: string;
  studentId: string;
  title: string;
  description?: string;
  items?: { title: string; description?: string; link?: string }[];
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

export interface SharedResource {
  id?: string;
  teacherId: string;
  title: string;
  subject: string;
  fileUrl: string;
  fileName: string;
  coverUrl?: string;
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

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  imageUrl?: string;
  passageStartLine?: number;
  passageName?: string;
}
export interface MiniQuiz {
  teacherName?: string;
  difficulty?: string;
  visibleTo?: 'all' | string[];
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
  
  if (data.visibleTo) {
    await notifyStudentsForNewTest(data.title, data.visibleTo, data.teacherName || 'Admin');
  }
  
  return docRef.id;
}

export async function updateMiniQuiz(id: string, data: Partial<MiniQuiz>): Promise<void> {
  await updateDoc(doc(db, 'mini_quizzes', id), data as DocumentData);
}

export async function deleteMiniQuiz(id: string): Promise<void> {
  await deleteDoc(doc(db, 'mini_quizzes', id));
}

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

// ─── Support Tickets (User Specific) ──────────────────────────────────────────

export async function getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
  const colRef = collection(db, 'support_tickets');
  const q = query(colRef, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket)).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// ─── Chat System ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id?: string;
  senderId: string;
  text: string;
  timestamp: any;
}

export interface Conversation {
  id?: string;
  participants: string[];
  participantRoles: string[];
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: Record<string, number>;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const colRef = collection(db, 'conversations');
  const q = query(colRef, where('participants', 'array-contains', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation)).sort((a, b) => (b.lastMessageTime?.seconds || 0) - (a.lastMessageTime?.seconds || 0));
}

export async function getOrCreateConversation(user1: string, role1: string, user2: string, role2: string): Promise<string> {
  const colRef = collection(db, 'conversations');
  const q = query(colRef, where('participants', 'array-contains', user1));
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => {
    const p = d.data().participants;
    return p.includes(user1) && p.includes(user2);
  });
  
  if (existing) return existing.id;
  
  const docRef = await addDoc(colRef, {
    participants: [user1, user2],
    participantRoles: [role1, role2],
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    unreadCount: { [user1]: 0, [user2]: 0 }
  });
  return docRef.id;
}

export async function sendMessage(conversationId: string, senderId: string, text: string, receiverId: string): Promise<void> {
  const msgsRef = collection(db, `conversations/${conversationId}/messages`);
  await addDoc(msgsRef, {
    senderId,
    text,
    timestamp: serverTimestamp()
  });
  
  // Update conversation
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    [`unreadCount.${receiverId}`]: increment(1)
  } as any);
}

export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, {
    [`unreadCount.${userId}`]: 0
  } as any);
}

export function subscribeToMessages(conversationId: string, callback: (msgs: ChatMessage[]) => void) {
  const msgsRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(msgsRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    callback(msgs);
  });
}


export async function getAllMiniQuizzes(): Promise<MiniQuiz[]> {
  const q = query(collection(db, 'mini_quizzes'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MiniQuiz));
}

export async function getStudentMiniQuizzes(userId: string, subject?: string): Promise<MiniQuiz[]> {
  const allQuizzes = await getAllMiniQuizzes();
  const teacherIds = await getTeacherIdsForStudent(userId);

  return allQuizzes.filter(q => {
    const isAdminQuiz = !q.teacherId || q.teacherId === 'admin';
    const isMyTeacher = teacherIds.includes(q.teacherId);

    if (isAdminQuiz || isMyTeacher) {
      if (q.visibleTo && Array.isArray(q.visibleTo)) {
        return q.visibleTo.includes(userId);
      }
      return q.isPublic || q.visibleTo === 'all';
    }

    return false;
  });
}

export async function getMiniQuizById(id: string): Promise<MiniQuiz | null> {
  const docSnap = await getDoc(doc(db, 'mini_quizzes', id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as MiniQuiz;
}
