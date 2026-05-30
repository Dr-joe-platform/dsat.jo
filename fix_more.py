import os

page_path = r'c:\Users\elnim\Desktop\dsatuz\src\app\test\[testId]\page.tsx'

with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()

# 1. State for scores
if 'const [finalScore, setFinalScore]' not in page_content:
    page_content = page_content.replace(
        "const [fontSize, setFontSize] = useState(1);",
        "const [fontSize, setFontSize] = useState(1);\n  const [finalScore, setFinalScore] = useState(0);\n  const [mathScore, setMathScore] = useState(0);\n  const [rwScore, setRwScore] = useState(0);"
    )

    # set them in saveTestResult
    page_content = page_content.replace(
        "setPhase('results');\n    }\n  };",
        "setFinalScore(finalScaledScore);\n      setMathScore(mathScaledScore);\n      setRwScore(rwScaledScore);\n      setPhase('results');\n    }\n  };"
    )

    # use them in results
    page_content = page_content.replace(
        "{isFull && <Dial score={finalScaledScore}",
        "{isFull && <Dial score={finalScore}"
    )
    page_content = page_content.replace(
        "{(isFull || isRW) && <Dial score={rwScaledScore}",
        "{(isFull || isRW) && <Dial score={rwScore}"
    )
    page_content = page_content.replace(
        "{(isFull || isMath) && <Dial score={mathScaledScore}",
        "{(isFull || isMath) && <Dial score={mathScore}"
    )

# 2. Latex in options
page_content = page_content.replace(
    "<span>{opt}</span>",
    "<span><Latex>{opt}</Latex></span>"
)
page_content = page_content.replace(
    "<span style={{ fontSize: fsz, lineHeight: lh }}>{opt}</span>",
    "<span style={{ fontSize: fsz, lineHeight: lh }}><Latex>{opt}</Latex></span>"
)

# 3. Intro Phase details
# Look for the intro section and add details
if '<div><strong>Subject:</strong>' not in page_content:
    page_content = page_content.replace(
        "<p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>Review the instructions below before you begin.</p>",
        """<p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>Review the instructions below before you begin.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
           <div><strong>Subject:</strong> {testData.subject || 'Mixed'}</div>
           <div><strong>Time limit:</strong> {testData.customTime ? testData.customTime + ' mins' : 'Standard'}</div>
        </div>"""
    )

# 4. Back button missing on first question issue
# The user wants a Back button even on the first question to go to the Dashboard?
# Or just to be visible but disabled?
# If isFirst is true, we render an empty div. We should render a disabled back button instead to make it obvious.
page_content = page_content.replace(
    """{isFirst ? (
            <div style={{ width: '80px' }} />
          ) : (""",
    """{isFirst ? (
            <button disabled style={{ padding: '0.4rem 1.25rem', background: '#e2e8f0', color: '#94a3b8', border: 'none', borderRadius: '1rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'not-allowed' }}>Back</button>
          ) : ("""
)

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Applied fixes via Python script.")
