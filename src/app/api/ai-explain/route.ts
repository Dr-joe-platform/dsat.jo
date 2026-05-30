import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { questionText, passage, options, correctAnswer, studentAnswer } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    if (!questionText) {
      return NextResponse.json({ error: 'Missing question text' }, { status: 400 });
    }

    const prompt = `
You are an expert Digital SAT (DSAT) tutor. A student got the following question wrong or asked for an explanation.

${passage ? `Context Passage:\n${passage}\n` : ''}
Question:
${questionText}

Options:
${options ? options.map((o: string, i: number) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n') : 'N/A (Student-produced response)'}

Correct Answer: ${correctAnswer}

Please provide a concise, step-by-step explanation of how to arrive at the correct answer. 
- Do not repeat the prompt.
- Explain clearly why the correct answer is right.
- If options are provided, briefly explain why the distractors are wrong.
- Use simple, encouraging language.
- Format the response in standard Markdown.
- If there is math, wrap inline math in $ and block math in $$.
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
        temperature: 0.5,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error Payload:', errorText);
      throw new Error(`Groq API Error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "No explanation generated.";

    return NextResponse.json({ explanation: content });

  } catch (error) {
    console.error('AI Explain API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
