import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { intensity, focus, level, stats } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `
You are an expert Digital SAT study planner.
Create a 5-day study plan for a student based on these preferences:
- Intensity: ${intensity}
- Focus Area: ${focus}
- Student's Self-Reported Level: ${level || 'Not specified'}
- Student's current Math average: ${stats.math}%
- Student's current R&W average: ${stats.rw}%

CRITICAL INSTRUCTION: Tailor the difficulty of the topics to the student's level and percentages. 
- If the student is a Beginner (or has low averages), focus on foundational concepts (e.g., basic grammar rules, linear equations).
- If the student is Intermediate, focus on standard SAT question types.
- If the student is Advanced, focus strictly on hard/tricky topics (e.g., advanced trigonometry, rhetoric and synthesis, complex punctuation).

You MUST respond ONLY with a valid JSON object. Do not include markdown formatting outside the JSON.
The JSON object must have exactly one key: "plan", which is an array of 5 arrays. 
Each of the 5 arrays represents a day's tasks.
Each task is an object with exactly three keys:
- "type": Strictly one of "Math", "R&W", "Vocab", or "Practice".
- "label": A short, descriptive string (e.g., "Advanced Trig Practice" or "Foundations of Algebra").
- "questions": An integer representing the number of questions to do (between 10 and 100 based on intensity).

Output strictly the JSON object.
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
    console.error('AI Study Plan API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
