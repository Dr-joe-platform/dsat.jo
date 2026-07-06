import os

path = r'c:\Users\elnim\Desktop\dsatuz\src\lib\db.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'unlockDate?: Timestamp;' not in content:
    content = content.replace("  dueDate: Timestamp;\n  status: 'pending' | 'completed';", "  dueDate: Timestamp;\n  unlockDate?: Timestamp;\n  status: 'pending' | 'completed';")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added unlockDate to Assignment interface.")
else:
    print("unlockDate already exists.")
