import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic, subject, count = 5 } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    const prompt = `
You are an expert Digital SAT (DSAT) test creator.
Your task is to generate exactly ${count} highly realistic DSAT-style practice questions for the following topic:
Topic: "${topic}"
Subject Area: "${subject || 'Not specified (infer from topic)'}"

CRITICAL RULES:
1. Ensure the difficulty matches standard SAT questions (mix of Easy, Medium, Hard).
2. For Math questions: USE MathJax syntax (wrap inline math in $ and block math in $$). Ensure equations are realistic.
3. For Reading & Writing questions: You MUST include a realistic "passage" text containing a short excerpt (50-150 words) that the question refers to.
4. Each question must have exactly 4 multiple-choice options (A, B, C, D).
5. Output MUST be ONLY a JSON object containing a "questions" array. No other text or markdown.

JSON Schema for the output:
{
  "questions": [
    {
      "id": "A unique string ID (e.g. AI_Q1)",
      "text": "The actual question text (use $ for math).",
      "passage": "Optional. The reading passage or extra context (required for R&W).",
      "type": "MC",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "A", // Or B, C, D
      "difficulty": "Easy", // Or Medium, Hard
      "skill": "${topic}"
    }
  ]
}
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
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error Payload:', errorText);
      throw new Error(`Groq API Error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";
    
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({ questions: parsed.questions || [] });
    } catch (e) {
      console.error('Failed to parse Groq response:', content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Generate Quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
