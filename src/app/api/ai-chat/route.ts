import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey || groqApiKey.includes('djs9Nn57sa')) { // also check if it's the old cached key
      return NextResponse.json({ 
        reply: "معلش يا بطل، مفتاح الـ API مش شغال دلوقتي أو محتاج ترستر السيرفر (npm run dev) عشان يقرأ المفتاح الجديد."
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        max_tokens: 250,
        temperature: 0.7
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ 
        reply: "يا وحش، شكل الـ API Key خلصان أو فيه مشكلة. راجع الإعدادات بتاعتك وجرب تاني!"
      });
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'AI request timed out. Please try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: error.message || 'Error generating response' }, { status: 500 });
  }
}
