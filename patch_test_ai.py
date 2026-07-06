import os

path = r'c:\Users\elnim\Desktop\dsatuz\src\app\test\[testId]\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
if 'import VoiceTutor' not in content:
    content = content.replace("import AIExamCharacter from '@/components/AIExamCharacter';", "import AIExamCharacter from '@/components/AIExamCharacter';\nimport VoiceTutor from '@/components/VoiceTutor';\nimport WhiteboardStep from '@/components/WhiteboardStep';")

# 2. Add components in explanation UI
# Find:
"""
          {isReviewMode && q.explanation && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', fontFamily: 'sans-serif' }}>Explanation</h3>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', fontFamily: 'serif' }}>
                <Latex delimiters={LATEX_DELIMITERS} strict={false}>{q.explanation}</Latex>
              </div>
            </div>
          )}
"""
# Replace with:
"""
          {isReviewMode && q.explanation && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', fontFamily: 'sans-serif' }}>Explanation</h3>
                <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', fontFamily: 'serif' }}>
                  <Latex delimiters={LATEX_DELIMITERS} strict={false}>{q.explanation}</Latex>
                </div>
              </div>
              <WhiteboardStep explanationText={q.explanation} />
              <VoiceTutor explanationText={q.explanation} />
            </div>
          )}
"""

target = """          {isReviewMode && q.explanation && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', fontFamily: 'sans-serif' }}>Explanation</h3>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', fontFamily: 'serif' }}>
                <Latex delimiters={LATEX_DELIMITERS} strict={false}>{q.explanation}</Latex>
              </div>
            </div>
          )}"""

replacement = """          {isReviewMode && q.explanation && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', fontFamily: 'sans-serif' }}>Explanation</h3>
                <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', fontFamily: 'serif' }}>
                  <Latex delimiters={LATEX_DELIMITERS} strict={false}>{q.explanation}</Latex>
                </div>
              </div>
              <WhiteboardStep explanationText={q.explanation} />
              <VoiceTutor explanationText={q.explanation} />
            </div>
          )}"""

content = content.replace(target, replacement)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added Voice Tutor & Whiteboard to Test page")
