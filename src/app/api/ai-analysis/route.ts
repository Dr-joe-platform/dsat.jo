import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { results } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    if (!results || results.length === 0) {
      return NextResponse.json({ insights: [] });
    }

    const historyText = results.map((r: any, idx: number) => {
      // Safely calculate scores, fallback to basic percentage logic if needed
      let mathScore = 400;
      let rwScore = 400;
      
      if (r.score) {
        mathScore = Math.round(r.score.math * 800);
        rwScore = Math.round(r.score.rw * 800);
      } else {
        // Fallback for older results format
        if (r.subject === 'math') {
          mathScore = Math.round(r.percentage * 800);
          rwScore = 400; // unknown
        } else if (r.subject === 'reading_writing') {
          rwScore = Math.round(r.percentage * 800);
          mathScore = 400; // unknown
        }
      }
      return `Test ${idx + 1}: Math ${mathScore}, Reading & Writing ${rwScore}, Total ${mathScore + rwScore}`;
    }).join('\n');

    const prompt = `
You are an expert Digital SAT tutor analyzing a student's score history.
Here is their recent test performance:
${historyText}

Based on this data, provide exactly 3 concise insights for the student.
Each insight should have:
1. "title": A short catchy title (e.g. "Strong Performance", "Focus Area", "Score Prediction").
2. "text": 2-3 sentences of specific analysis or advice.
3. "color": A hex color code representing the mood (e.g. "#22c55e" for good, "#f59e0b" for warning, "#6366f1" for info).
4. "icon": A single emoji representing the insight.

You MUST respond ONLY with a valid JSON object containing a single key "insights" which is an array of 3 objects containing the keys: title, text, color, icon. Do not include markdown formatting.
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
      return NextResponse.json({ insights: parsed.insights || [] });
    } catch (e) {
      console.error('Failed to parse Groq JSON:', content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Analysis API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
