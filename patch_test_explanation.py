import os

path = r'c:\Users\elnim\Desktop\dsatuz\src\app\test\[testId]\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import for AIExplanationBox
if 'import AIExplanationBox from' not in content:
    content = content.replace("import VoiceTutor from '@/components/VoiceTutor';\nimport WhiteboardStep from '@/components/WhiteboardStep';", "import AIExplanationBox from '@/components/AIExplanationBox';")

# 2. Replace the old explanation block
target_start = "{isReviewMode && ("
target_end = "          )}\n          \n          </div>"
idx_start = content.find(target_start)
idx_end = content.find(target_end, idx_start)

if idx_start != -1 and idx_end != -1:
    target = content[idx_start:idx_end + len("          )}")]
    replacement = """{isReviewMode && (
            <AIExplanationBox 
              questionText={q.text} 
              passage={q.passage} 
              options={q.options} 
              correctAnswer={q.correctAnswer} 
              existingExplanation={q.explanation} 
            />
          )}"""
    content = content.replace(target, replacement)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched test page to use AIExplanationBox")
else:
    print("Could not find the target block")
