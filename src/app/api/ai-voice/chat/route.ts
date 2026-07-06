import { NextResponse } from 'next/server';

const EGYPTIAN_TUTOR_PROMPT = `أنت مدرس لامتحانات الـ Digital SAT وصديق مقرب للطالب. اسمك "شادي" أو "ندى" حسب ما تفضل. 
تتحدث باللهجة المصرية العامية البسيطة والودودة، كأنك تكلم صاحبك على التليفون أو في مكالمة واتساب.
إجاباتك يجب أن تكون قصيرة جداً، مباشرة، وبعيدة عن التعقيد لأنها ستُنطق صوتياً، ولا تستخدم تنسيقات معقدة مثل الـ Markdown أو القوائم الطويلة.
شجع الطالب دائما بكلمات مصرية مثل (يا بطل، يا وحش، ركز معايا، ولا يهمك).`;

export async function POST(req: Request) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ 
        reply: "معلش يا بطل، مفتاح الـ API مش شغال دلوقتي عشان كده مش هقدر أرد عليك بصوتي الحقيقي.",
        history: [...conversationHistory, { role: 'user', content: message }, { role: 'assistant', content: "معلش يا بطل، مفتاح الـ API مش شغال دلوقتي عشان كده مش هقدر أرد عليك بصوتي الحقيقي." }]
      });
    }

    const messages = [
      { role: 'system', content: EGYPTIAN_TUTOR_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Very fast model for real-time
        messages: messages,
        max_tokens: 150, // Keep responses short for voice
        temperature: 0.8
      })
    });

    if (!response.ok) {
      console.error(`Groq API error: ${response.statusText}`);
      return NextResponse.json({ 
        reply: "يا وحش، شكل الـ API Key خلصان أو فيه مشكلة. راجع الإعدادات بتاعتك وجرب تاني!",
        history: [...messages, { role: 'assistant', content: "يا وحش، شكل الـ API Key خلصان أو فيه مشكلة. راجع الإعدادات بتاعتك وجرب تاني!" }]
      });
    }

    const data = await response.json();
    return NextResponse.json({ 
      reply: data.choices[0].message.content,
      history: [...messages, { role: 'assistant', content: data.choices[0].message.content }]
    });
  } catch (error: any) {
    console.error('AI Voice Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Error generating response' }, { status: 500 });
  }
}
