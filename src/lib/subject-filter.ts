/**
 * Central utility for Math / English isolation.
 *
 * Teachers with a single subject only see data that belongs to that subject.
 * Teachers marked "Both" can see mixed/full/general material.
 */

export type TeacherSubject = 'Math' | 'English' | 'Both';
export type StudentSubject = 'math' | 'english' | 'both';
export type CanonicalSubject = 'math' | 'english' | 'both' | 'general' | null;
export type TestSubject = string | undefined | null;

const ENGLISH_ALIASES = new Set([
  'english',
  'reading',
  'reading writing',
  'reading & writing',
  'r&w',
  'rw',
  'reading_writing',
  'vocabulary',
]);

const BOTH_ALIASES = new Set([
  'both',
  'mixed',
  'full',
  'all',
]);

const GENERAL_ALIASES = new Set([
  'general',
  'custom',
  'literary terms',
]);

function normalizeRawSubject(subject: TestSubject): string {
  return String(subject ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function normalizeSubject(subject: TestSubject): CanonicalSubject {
  const value = normalizeRawSubject(subject);
  if (!value) return null;
  if (value === 'math') return 'math';
  if (ENGLISH_ALIASES.has(value)) return 'english';
  if (BOTH_ALIASES.has(value)) return 'both';
  if (GENERAL_ALIASES.has(value)) return 'general';
  return null;
}

export function normalizeTeacherSubject(subject: TeacherSubject | string | undefined): CanonicalSubject {
  return normalizeSubject(subject) ?? 'both';
}

export function normalizeStudentSubject(subject: StudentSubject | string | undefined): CanonicalSubject {
  return normalizeSubject(subject);
}

export function studentMatchesTeacher(
  studentSubject: StudentSubject | string | undefined,
  teacherSubject: TeacherSubject | string | undefined
): boolean {
  const teacher = normalizeTeacherSubject(teacherSubject);
  const student = normalizeStudentSubject(studentSubject);
  if (teacher === 'both') return true;
  if (!student) return false;
  if (student === 'both') return true;
  return student === teacher;
}

export function itemMatchesTeacher(
  itemSubject: TestSubject,
  teacherSubject: TeacherSubject | string | undefined
): boolean {
  const teacher = normalizeTeacherSubject(teacherSubject);
  const item = normalizeSubject(itemSubject);
  if (teacher === 'both') return true;
  return item === teacher;
}

export function itemMatchesStudent(
  itemSubject: TestSubject,
  studentSubject: StudentSubject | string | undefined
): boolean {
  const student = normalizeStudentSubject(studentSubject);
  const item = normalizeSubject(itemSubject);
  if (!student || student === 'both') return true;
  if (item === 'both' || item === 'general') return true;
  return item === student;
}

export function resultMatchesTeacher<T extends { subject?: TestSubject }>(
  result: T,
  teacherSubject: TeacherSubject | string | undefined
): boolean {
  return itemMatchesTeacher(result.subject, teacherSubject);
}

export function filterStudentsBySubject<T extends { subject?: StudentSubject | string }>(
  students: T[],
  teacherSubject: TeacherSubject | string | undefined
): T[] {
  return students.filter(s => studentMatchesTeacher(s.subject, teacherSubject));
}

export function filterItemsBySubject<T extends { subject?: TestSubject }>(
  items: T[],
  teacherSubject: TeacherSubject | string | undefined
): T[] {
  return items.filter(t => itemMatchesTeacher(t.subject, teacherSubject));
}

export function filterItemsForStudent<T extends { subject?: TestSubject }>(
  items: T[],
  studentSubject: StudentSubject | string | undefined
): T[] {
  return items.filter(t => itemMatchesStudent(t.subject, studentSubject));
}

export function filterResultsBySubject<T extends { subject?: TestSubject }>(
  results: T[],
  teacherSubject: TeacherSubject | string | undefined
): T[] {
  return results.filter(r => resultMatchesTeacher(r, teacherSubject));
}
