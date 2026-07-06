import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { userId, weakTopics } = await req.json();

    if (!weakTopics || weakTopics.length === 0) {
      return NextResponse.json({ error: 'No weak topics provided' }, { status: 400 });
    }

    // Fetch groq API Key
    const settingsSnap = await getDoc(doc(db, 'settings', 'ai'));
    const groqKey = settingsSnap.exists() ? settingsSnap.data().groq_api_key : process.env.GROQ_API_KEY;

    if (!groqKey) {
      return NextResponse.json({ error: 'Groq API Key not found. Please set it in AI Settings.' }, { status: 400 });
    }

    const topicsStr = weakTopics.join(', ');

    const prompt = `You are an expert Digital SAT tutor. The student is struggling with the following topics: ${topicsStr}.
Generate a practice test of exactly 10 questions focusing ONLY on these topics.

Return the result as a raw JSON array of objects (NO Markdown blocks, NO \`\`\`json, NO other text).
Each object must match this interface exactly:
{
  "id": "unique-id",
  "type": "MCQ" | "SPR",
  "passage": "optional text (for reading)",
  "question": "The question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "A",
  "explanation": "Why this is correct",
  "domain": "Math" | "English",
  "skill": "The specific weak topic",
  "difficulty": "medium",
  "module": "1"
}

Ensure the questions perfectly simulate the Digital SAT difficulty and style. Only output the raw JSON array.`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!groqRes.ok) {
      const txt = await groqRes.text();
      return NextResponse.json({ error: 'Groq API Error: ' + txt }, { status: 500 });
    }

    const groqData = await groqRes.json();
    let content = groqData.choices[0].message.content.trim();
    if (content.startsWith('```json')) content = content.replace(/```json/g, '').replace(/```/g, '');
    if (content.startsWith('```')) content = content.replace(/```/g, '');
    
    const questions = JSON.parse(content);

    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
