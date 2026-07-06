import os

path = r'c:\Users\elnim\Desktop\dsatuz\src\lib\db.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_func = """
export async function createAssignment(assignment: Omit<Assignment, 'id'>) {
  const ref = doc(collection(db, 'assignments'));
  await setDoc(ref, {
    ...assignment,
    id: ref.id
  });
  return ref.id;
}
"""

if 'export async function createAssignment' not in content:
    content = content.replace("export async function getStudentAssignments", new_func + "\nexport async function getStudentAssignments")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added createAssignment to db.ts")
else:
    print("createAssignment already exists.")
