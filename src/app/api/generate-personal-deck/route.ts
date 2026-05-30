import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { ALL_TEST_QUESTIONS } from '@/lib/questions-data';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // 1. Fetch user's recent tests (up to 5 recent tests to find mistakes)
    const resultsRef = collection(db, 'results');
    // Using simple where and client-side sort as done in db.ts to avoid composite index requirements
    const q = query(resultsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    results.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
    results = results.slice(0, 5); // Look at top 5 most recent tests

    if (results.length === 0) {
      return NextResponse.json({ error: 'No test history found. Take a test first to generate a personalized deck!' }, { status: 400 });
    }

    // 2. Gather wrong question IDs and their test IDs
    let wrongItems: { testId: string; questionId: string }[] = [];
    for (const r of results) {
      if (r.wrongQuestionIds && Array.isArray(r.wrongQuestionIds)) {
        for (const qId of r.wrongQuestionIds) {
          wrongItems.push({ testId: r.testId, questionId: qId });
        }
      }
    }

    if (wrongItems.length === 0) {
      return NextResponse.json({ error: 'Great job! You have no recorded mistakes in your recent tests.' }, { status: 400 });
    }

    // Limit to 20 most recent mistakes to stay within LLM context
    wrongItems = wrongItems.slice(0, 20);

    // 3. Resolve actual question texts
    // We need to fetch custom tests if any
    const customTestsCache: Record<string, any> = {};
    const questionsToSend: string[] = [];

    for (const item of wrongItems) {
      let questionText = '';
      
      // Check if it's a static test (T1, T2, etc)
      if (ALL_TEST_QUESTIONS[item.testId as keyof typeof ALL_TEST_QUESTIONS]) {
        const testObj = ALL_TEST_QUESTIONS[item.testId as keyof typeof ALL_TEST_QUESTIONS];
        // Search through all modules in the test
        for (const modKey of Object.keys(testObj)) {
          const modQuestions = testObj[modKey as keyof typeof testObj];
          if (Array.isArray(modQuestions)) {
            const qObj = modQuestions.find((q: any) => q.id === item.questionId);
            if (qObj) {
              questionText = qObj.text;
              break;
            }
          }
        }
      } else {
        // It's a custom DB test
        if (!customTestsCache[item.testId]) {
          const tSnap = await getDoc(doc(db, 'tests', item.testId));
          if (tSnap.exists()) {
            customTestsCache[item.testId] = tSnap.data();
          } else {
            customTestsCache[item.testId] = null;
          }
        }
        
        const testData = customTestsCache[item.testId];
        if (testData && testData.content) {
          try {
            const parsed = JSON.parse(testData.content);
            const qObj = parsed.find((q: any) => q.id === item.questionId);
            if (qObj) questionText = qObj.question || qObj.text;
          } catch (e) {}
        }
      }

      if (questionText) {
        questionsToSend.push(questionText);
      }
    }

    if (questionsToSend.length === 0) {
      return NextResponse.json({ error: 'Could not resolve question texts for your mistakes.' }, { status: 400 });
    }

    // 4. Call Groq API
    const prompt = `
You are an expert SAT tutor. A student got the following questions wrong on their recent practice tests.
Analyze the core concepts, vocabulary, or math skills required to solve these questions, and generate a highly targeted flashcard deck for the student to study.

Questions the student got wrong:
${questionsToSend.map((q, i) => `${i + 1}. ${q}`).join('\\n\\n')}

Generate exactly 10-15 flashcards that target the underlying weaknesses revealed by these mistakes.
For example, if they got a vocabulary question wrong, make flashcards for those words. If they got a math question wrong, make a flashcard about the underlying formula or rule.

Return ONLY a valid JSON array of objects with the following exact structure (no markdown blocks, no intro text):
[
  {
    "front": "The concept, formula name, or vocabulary word",
    "back": "The definition, formula, or explanation",
    "example": "An example of how it's used (optional)"
  }
]
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean JSON
    content = content.replace(/^```json/, '').replace(/```$/, '').trim();

    let cards = [];
    try {
      cards = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse Groq response:", content);
      throw new Error("AI returned malformed data.");
    }

    return NextResponse.json({ cards });

  } catch (error) {
    console.error('AI Flashcard Error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
