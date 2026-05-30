import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { word } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    if (!word) {
      return NextResponse.json({ error: 'Missing word' }, { status: 400 });
    }

    const prompt = `
You are a helpful English-to-Arabic dictionary and SAT vocabulary tutor.
The user wants to add the following English word or short phrase to their vocabulary list:
"${word}"

Please provide its Arabic meaning and a simple, clear English example sentence demonstrating its usage.
Return ONLY valid JSON format. Do not use markdown wrappers around the JSON, just the raw JSON object.

Format:
{
  "definition": "Arabic meaning here",
  "example": "English example sentence here"
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
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error Payload:', errorText);
      throw new Error(`Groq API Error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;
    
    if (!content) {
       throw new Error("No content from AI");
    }

    // Parse the JSON just to validate
    const parsed = JSON.parse(content);
    
    if (!parsed.definition || !parsed.example) {
        throw new Error("Invalid response schema from AI");
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error('API Define Word Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
