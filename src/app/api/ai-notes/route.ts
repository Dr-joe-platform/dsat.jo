import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    if (!topic || topic.trim() === '') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const prompt = `
You are an expert Digital SAT tutor creating structured, high-quality study notes for a student.
The student has requested notes on the following topic: "${topic}".

Your goal is to generate comprehensive markdown notes that cover:
1. Core Concepts / Rules
2. Important Formulas or Strategies
3. Common Traps & SAT Tricks
4. Recommended Practice Approach

You MUST respond ONLY with a JSON object. Do NOT include markdown formatting outside the JSON.
The JSON object must contain exactly two keys:
- "subject": A string, strictly either "Math", "R&W", or "General".
- "content": A string containing the markdown formatted study notes.
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
      return NextResponse.json(parsed);
    } catch (e) {
      console.error('Failed to parse Groq JSON:', content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Notes API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
