import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { action, questionText, options, studentRequest, phase } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Smart Fallback if no API key is provided
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let reply = "Hello! I'm your AI proctor. I'm here to help if you get stuck!";
      
      if (action === 'auto-hint') {
        reply = "Hint: Look closely at the keywords in the question and eliminate obviously wrong choices.";
      } else if (action === 'active-help') {
        reply = "Here is some help: Make sure you understand what the question is asking before looking at the options. Try solving it step by step!";
      }

      return NextResponse.json({ reply });
    }

    let systemPrompt = "You are a friendly, encouraging AI exam assistant (a floating robot). You are directly talking to the student taking an exam.";
    let userPrompt = "";

    if (action === 'intro') {
      systemPrompt += " Your job right now is to introduce yourself before the exam starts.";
      userPrompt = "Please introduce yourself to the student in 2-3 short sentences. Be encouraging! Tell them you can give them small hints automatically and they can also ask you for direct help up to 5 times.";
    } else if (action === 'auto-hint') {
      systemPrompt += " Your job right now is to provide a very brief, single-sentence hint for a question. DO NOT give the answer. Just a tiny nudge in the right direction.";
      userPrompt = `Question: ${questionText}\nOptions: ${JSON.stringify(options)}\n\nProvide a very short 1-2 sentence hint. DO NOT give the answer away.`;
    } else if (action === 'active-help') {
      systemPrompt += " Your job right now is to help the student who is stuck on a question. They have explicitly asked for help.";
      userPrompt = `Question: ${questionText}\nOptions: ${JSON.stringify(options)}\nStudent's specific request (if any): ${studentRequest || 'I need help with this question'}\n\nProvide a helpful, educational response. Guide them to the answer without just giving it to them immediately. Keep it concise.`;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: formattedMessages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error Payload:', errorText);
      throw new Error(`Groq API Error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error('AI Character API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
