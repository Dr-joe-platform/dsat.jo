import Papa from 'papaparse';

export interface ParsedQuestion {
  id: string;
  type: 'MCQ' | 'SPR';
  passage?: string; // New! For English texts
  question: string;
  options: string[]; // Length 4 for MCQ
  correctAnswer: string;
  explanation: string;
  domain: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  module?: string | number;
}

export function downloadCSVTemplate(subject: 'Math' | 'English' | 'Mixed') {
  let csvContent = "";
  
  if (subject === 'English') {
    csvContent = `Type,Passage,Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Explanation,Domain,Skill,Difficulty\n` +
      `MCQ,"This is a sample passage containing multiple sentences. It can have ""quotes"" and commas.","What is the main idea?","Idea A","Idea B","Idea C","Idea D",A,"Because A summarizes it best.",Information and Ideas,Central Ideas and Details,medium\n` +
      `SPR,"Another passage...","What year is mentioned?",,,,1994,"The text says 1994 explicitly.",Information and Ideas,Command of Evidence,easy\n`;
  } else {
    // Math doesn't strictly need a passage, but the column can be there (or left empty)
    csvContent = `Type,Passage,Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Explanation,Domain,Skill,Difficulty\n` +
      `MCQ,,"If $2x + 3 = 7$, what is $x$?","1","2","3","4",B,"Subtract 3 to get $2x = 4$, then divide by 2.",Algebra,Linear equations in one variable,easy\n` +
      `SPR,,"Solve for $y$: $y^2 = 16$. (Assume $y > 0$)",,,,4,"Since $y > 0$, the square root of 16 is 4.",Advanced Math,Nonlinear functions,medium\n`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `dsat_${subject.toLowerCase()}_template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseQuestionsCSV(file: File, targetModule?: string): Promise<ParsedQuestion[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const questions: ParsedQuestion[] = [];
          
          results.data.forEach((row: any, index: number) => {
            const type = (row['Type'] || 'MCQ').toString().toUpperCase().trim();
            const qType: 'MCQ' | 'SPR' = type === 'SPR' ? 'SPR' : 'MCQ';
            
            const passage = row['Passage'] ? row['Passage'].toString().trim() : '';
            const question = row['Question'] ? row['Question'].toString().trim() : '';
            
            if (!question) return; // Skip if no question text
            
            let options: string[] = [];
            if (qType === 'MCQ') {
              options = [
                row['Option_A']?.toString().trim() || '',
                row['Option_B']?.toString().trim() || '',
                row['Option_C']?.toString().trim() || '',
                row['Option_D']?.toString().trim() || ''
              ];
            }
            
            const correctRaw = (row['Correct_Answer'] || '').toString().trim();
            let correctAnswer = correctRaw;
            // Standardize MCQ answers to A, B, C, D
            if (qType === 'MCQ' && /^[A-D]$/i.test(correctRaw)) {
              correctAnswer = correctRaw.toUpperCase();
            }

            const diff = (row['Difficulty'] || 'medium').toString().toLowerCase().trim();
            const difficulty = ['easy', 'medium', 'hard'].includes(diff) ? diff as 'easy'|'medium'|'hard' : 'medium';
            const explanation = row['Explanation']?.toString().trim() || '';
            const domain = row['Domain']?.toString().trim() || 'Uncategorized';
            const skill = row['Skill']?.toString().trim() || 'General';

            if (question && correctAnswer) {
              questions.push({
                id: `csv_${Date.now()}_${index}`,
                type: qType,
                passage: passage || undefined,
                question,
                options,
                correctAnswer,
                explanation,
                domain,
                skill,
                difficulty,
                module: targetModule || (row['Module'] ? row['Module'].toString() : undefined)
              });
            }
          });
          
          resolve(questions);
        } catch (err: any) {
          reject(new Error("Error parsing CSV data: " + err.message));
        }
      },
      error: (error: any) => {
        reject(new Error("CSV Parse Error: " + error.message));
      }
    });
  });
}
