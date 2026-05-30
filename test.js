const fs = require('fs');
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

async function run() {
  const buf = fs.readFileSync('C:/Users/elnim/Downloads/JUNE REAL EXAM VER 2 DSATuz-56-102.pdf');
  const pdfData = await pdfParse(buf);
  console.log('Extracted text length:', pdfData.text.length);
  console.log('Sample text:', pdfData.text.substring(0, 200));

  const groqApiKey = "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";
  
  console.log('Calling groq...');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SAT tutor and data extraction tool. Return a JSON array.'
        },
        {
          role: 'user',
          content: `Extract questions:\n\n${pdfData.text.substring(0, 5000)}`
        }
      ],
      temperature: 0.1,
    })
  });
  
  const data = await response.json();
  console.log('Groq Response:', data.choices?.[0]?.message?.content);
}
run();
