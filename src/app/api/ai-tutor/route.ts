import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Smart Fallback if no API key is provided
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const lastMsg = messages[messages.length - 1].text.toLowerCase();
      let reply = "That's a great question! Let me break it down for you:\n\n**Key concept:** Focus on the specific wording used in the question stem. The SAT often uses precise language that gives you clues about what they're looking for.\n\n**Strategy tip:** Always eliminate 2 wrong answers first, then compare the remaining choices against the text.";
      
      if (lastMsg.includes('math') || lastMsg.includes('quadratic') || lastMsg.includes('solve')) {
        reply = "For math problems like this, the easiest approach is often to plug in the answer choices or use the specific formula. \n\nFor the quadratic formula, remember: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$.\n\nAlways make sure your equation is in the standard form $$ax^2 + bx + c = 0$$ before you start identifying your a, b, and c values! Would you like to try an example?";
      } else if (lastMsg.includes('reading') || lastMsg.includes('context') || lastMsg.includes('vocab')) {
        reply = "For Reading & Writing questions, especially 'Words in Context', the blank is always defined by another part of the sentence. \n\n**Strategy:**\n1. Ignore the answer choices.\n2. Read the sentence and come up with your own word for the blank.\n3. Find the answer choice that most closely matches your word.\n\nLet's try one together if you want!";
      }

      reply += "\n\n*(Note: To enable real AI responses, please add GROQ_API_KEY to your .env.local file)*";

      return NextResponse.json({ reply });
    }

    let validMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.text
    }));

    if (validMessages.length > 0 && validMessages[0].role === 'assistant') {
      validMessages.shift();
    }

    const formattedMessages = [
      {
        role: "system",
        content: "You are an expert Digital SAT tutor. Your goal is to help students understand SAT concepts (Math and Reading/Writing), solve problems, and provide test-taking strategies. Keep your answers clear, encouraging, and format math using LaTeX (e.g. $$x^2$$). Use markdown for styling."
      },
      ...validMessages
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
    console.error('AI Tutor API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
