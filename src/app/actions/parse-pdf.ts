"use server";

if (typeof global !== "undefined" && typeof (global as any).DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {};
}

const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// Represents the schema expected for our database test questions
interface ParsedQuestion {
  id: string;
  module?: string;
  type: 'MCQ' | 'SPR';
  passage?: string;
  passageName?: string;
  passageStartLine?: number;
  question: string;
  options: string[]; // empty for SPR
  correctAnswer: string;
  explanation: string;
  domain: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

export async function parsePdfToQuestions(formData: FormData, groqApiKey: string, targetModule?: string): Promise<{ success: boolean; data?: ParsedQuestion[]; error?: string }> {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No PDF file provided');
    if (!groqApiKey) throw new Error('Groq API Key is missing');

    const buffer = await file.arrayBuffer();
    const pdfData = await pdfParse(Buffer.from(buffer));
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      throw new Error('Could not extract any text from the PDF.');
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // excellent instruction following
        messages: [
          {
            role: 'system',
            content: `You are an expert SAT tutor and data extraction tool.
Your job is to read the raw text extracted from a PDF of a test and convert it into a strict JSON array of question objects.
Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json. Do not include any conversational text.

The JSON array must contain objects with this EXACT structure:
{
  "id": "q1", // generate a unique ID like q1, q2...
  "module": ${targetModule ? `"${targetModule}"` : `"Module 1" | "Module 2", // IMPORTANT: Extract all questions, count them, and split them EVENLY. The first half MUST be "Module 1" and the second half MUST be "Module 2".`},
  "type": "MCQ" | "SPR", // MCQ for multiple choice, SPR for Student-Produced Response (grid-in)
  "passageName": "The title of the passage if this question belongs to a reading passage (e.g. 'The Everyday Life of Abraham Lincoln')",
  "passage": "The exact paragraph text this question is testing. Do NOT summarize. Leave empty for Math.",
  "passageStartLine": 1, // The starting line number of this paragraph if provided in the text, otherwise null.
  "question": "The question text here...",
  "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"], // Exactly 4 options for MCQ, empty array [] for SPR
  "correctAnswer": "A", // The correct option letter (A, B, C, D) for MCQ, or the exact string answer (e.g., "4.5") for SPR
  "explanation": "A step-by-step explanation...",
  "domain": "e.g., Algebra",
  "skill": "e.g., Linear equations",
  "difficulty": "easy" | "medium" | "hard",
  "imageUrl": "" // Leave empty string by default. The teacher will upload images manually.
}`
          },
          {
            role: 'user',
            content: `Here is the raw text extracted from the PDF. Extract all the questions you can find into the requested JSON format (ensure exactly 44 or 54 questions if possible):\n\n${text}`
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to call Groq API');
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim() || '';
    console.log('Groq Response Snippet:', content.substring(0, 500));

    // Strip markdown formatting if the model still included it
    if (content.startsWith('```json')) {
      content = content.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let parsedJson: ParsedQuestion[];
    try {
      parsedJson = JSON.parse(content) as ParsedQuestion[];
    } catch (parseError) {
      console.warn('JSON parse failed. Attempting to repair truncated JSON...');
      // If Groq ran out of tokens, the JSON array is cut off. We find the last complete object.
      const lastBraceIndex = content.lastIndexOf('}');
      if (lastBraceIndex > -1) {
        const repairedContent = content.substring(0, lastBraceIndex + 1) + ']';
        try {
          parsedJson = JSON.parse(repairedContent) as ParsedQuestion[];
        } catch (e2) {
          throw new Error('Failed to parse AI output even after repair.');
        }
      } else {
        throw new Error('Failed to parse AI output: ' + (parseError as Error).message);
      }
    }
    
    // Quick validation
    if (!Array.isArray(parsedJson)) {
      throw new Error('Groq did not return a valid JSON array.');
    }

    if (parsedJson.length === 0) {
      if (text.length < 1000 || !text.includes('?')) {
        throw new Error('Could not find any questions. This PDF might be an image-based scan without readable text.');
      }
      throw new Error('Could not find any questions in this PDF.');
    }

    console.log('Successfully generated', parsedJson.length, 'questions');
    return { success: true, data: parsedJson };
  } catch (error: any) {
    console.error('PDF Parse Error:', error);
    return { success: false, error: error.message };
  }
}
