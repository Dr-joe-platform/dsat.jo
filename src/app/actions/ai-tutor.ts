"use server";

export async function explainQuestionAction(questionText: string, optionsText: string, groqKey: string) {
  if (!groqKey) {
    return { success: false, error: "Please enter your Groq API key in Settings or local storage to use the AI Tutor." };
  }

  try {
    const prompt = `You are an expert, empathetic, and encouraging SAT tutor. A student got the following Digital SAT question wrong and wants to understand why, and how to solve it correctly.
    
Question:
${questionText}

Options:
${optionsText}

Please provide a clear, step-by-step explanation. Start by explaining the core concept tested. Then, show how to arrive at the correct answer. Keep your tone supportive and encouraging! Do NOT just give the answer right away; explain the "why". Use markdown formatting.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Failed to fetch explanation from Groq");
    }

    return { success: true, data: data.choices[0].message.content };
  } catch (error: any) {
    console.error("AI Tutor Error:", error);
    return { success: false, error: error.message || "Failed to generate explanation." };
  }
}
