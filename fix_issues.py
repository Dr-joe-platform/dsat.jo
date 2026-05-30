import os

page_path = r'c:\Users\elnim\Desktop\dsatuz\src\app\test\[testId]\page.tsx'

with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()

# Fix 1: allModules is not defined
page_content = page_content.replace(
    "allModules.forEach(mk => {",
    "const allModules = ['M1', 'M2S', 'M2H'];\n    allModules.forEach(mk => {"
)

# Fix 2: Exit button in Header
page_content = page_content.replace(
    """<button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.7rem', fontWeight: '600', padding: 0 }}
          >
            <MoreHorizontal size={20} /> More
          </button>""",
    """<button
            onClick={() => setShowExitConfirm(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.7rem', fontWeight: '600', padding: 0 }}
          >
            <X size={20} /> Exit
          </button>"""
)

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)


annotatable_path = r'c:\Users\elnim\Desktop\dsatuz\src\components\AnnotatableText.tsx'

with open(annotatable_path, 'r', encoding='utf-8') as f:
    anno_content = f.read()

# Add Latex import
if 'react-latex-next' not in anno_content:
    anno_content = anno_content.replace(
        "import { Edit2, X, BookOpen, Loader2 } from 'lucide-react';",
        "import { Edit2, X, BookOpen, Loader2 } from 'lucide-react';\nimport Latex from 'react-latex-next';"
    )

# Fix Latex rendering
anno_content = anno_content.replace(
    "{seg.text}\n          </mark>",
    "<Latex>{seg.text}</Latex>\n          </mark>"
).replace(
    "return <span key={i}>{seg.text}</span>;",
    "return <span key={i}><Latex>{seg.text}</Latex></span>;"
)

with open(annotatable_path, 'w', encoding='utf-8') as f:
    f.write(anno_content)

print("Fixed issues.")
