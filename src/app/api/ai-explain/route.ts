import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { questionText, passage, options, correctAnswer, studentAnswer } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.warn('Groq API Error: No API Key provided in ai-explain.');
      return NextResponse.json({ explanation: "Based on the options and context, the correct answer is indeed " + correctAnswer + ". Try carefully analyzing the question again and eliminating the obviously incorrect choices one by one." });
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

Please provide a highly detailed, comprehensive, and step-by-step explanation of how to arrive at the correct answer. 
- Break down the problem logically so the student can fully understand the underlying concepts.
- Explain clearly and thoroughly why the correct answer is right.
- If options are provided, provide a detailed explanation of why EACH distractor (incorrect option) is wrong.
- Use simple, encouraging, and educational language.
- Format the response in standard Markdown. You may use paragraphs and formatting to make it highly readable.
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

    let content = "";
    if (!response.ok) {
      console.warn('Groq API Error in ai-explain. Using fallback response.');
      content = "Based on the options and context, the correct answer is indeed " + correctAnswer + ". Try carefully analyzing the question again and eliminating the obviously incorrect choices one by one.";
    } else {
      const data = await response.json();
      content = data.choices?.[0]?.message?.content || "No explanation generated.";
    }

    return NextResponse.json({ explanation: content });

  } catch (error) {
    console.error('AI Explain API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
