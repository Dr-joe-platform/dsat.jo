import { DSATQuestion, ALL_TEST_QUESTIONS } from '@/lib/questions-data';
import { getTestBanks, getUserResults } from '@/lib/db';

export async function getAllAvailableQuestions(
  userId?: string, 
  userSubject?: 'math'|'english'|'both'|string
): Promise<DSATQuestion[]> {
  let pool: DSATQuestion[] = [];
  const seenIds = new Set<string>();

  // 1. Gather seen question IDs from the user's past tests
  const seenQuestionIds = new Set<string>();
  if (userId) {
    const results = await getUserResults(userId);
    results.forEach(r => {
      (r.correctQuestionIds || []).forEach(id => seenQuestionIds.add(id));
      (r.wrongQuestionIds || []).forEach(id => seenQuestionIds.add(id));
      (r.unansweredQuestionIds || []).forEach(id => seenQuestionIds.add(id));
    });
  }

  // 1. Add static mock tests from ALL_TEST_QUESTIONS
  Object.entries(ALL_TEST_QUESTIONS).forEach(([key, test]) => {
    const isMathMock = key.toLowerCase().includes('math');
    const isEngMock = key.toLowerCase().includes('eng');

    const assignSubject = (questions: DSATQuestion[] | undefined, fallbackSubject: 'Math' | 'Reading&Writing') => {
      if (!questions) return;
      questions.forEach(q => {
        // ONLY add if the user has seen this question!
        if (!seenIds.has(q.id) && seenQuestionIds.has(q.id)) {
          // Intelligently determine true subject from domain and passage
          const dom = (q.domain || '').toLowerCase();
          const hasPassage = !!q.passage;
          const isMathDom = dom.includes('algebra') || dom.includes('math') || dom.includes('geometry') || dom.includes('data');
          const isEngDom = dom.includes('craft') || dom.includes('expression') || dom.includes('english') || dom.includes('information') || dom.includes('boundaries');
          
          let trueSubject = fallbackSubject;
          
          if (isMathDom) {
            trueSubject = 'Math';
          } else if (isEngDom) {
            trueSubject = 'Reading&Writing';
          } else if (!hasPassage && !dom) {
            trueSubject = 'Math';
          } else if (hasPassage) {
            trueSubject = 'Reading&Writing';
          }

          pool.push({ ...q, _subject: trueSubject });
          seenIds.add(q.id);
        }
      });
    };

    if (isMathMock) {
      assignSubject(test.M1, 'Math');
      assignSubject(test.M2H, 'Math');
      assignSubject(test.M2E, 'Math');
    } else if (isEngMock) {
      assignSubject(test.M1, 'Reading&Writing');
      assignSubject(test.M2H, 'Reading&Writing');
      assignSubject(test.M2E, 'Reading&Writing');
    } else {
      assignSubject(test.M1, 'Reading&Writing');
      assignSubject(test.M2H, 'Reading&Writing');
      assignSubject(test.M2E, 'Reading&Writing');
      assignSubject(test.MATH_M1, 'Math');
      assignSubject(test.MATH_M2H, 'Math');
      assignSubject(test.MATH_M2E, 'Math');
    }
  });

  // 2. Fetch dynamic tests from Firebase assigned to this user
  if (userId) {
    try {
      const dynamicTests = await getTestBanks(userId, 'student', userSubject);
      
      dynamicTests.forEach(test => {
        if (test.content) {
          try {
            const parsed = JSON.parse(test.content);
            const testSubject = test.subject;
            let currentPassage: string | undefined;
            let currentPassageName: string | undefined;
            let currentPassageStartLine: number | undefined;

            parsed.forEach((q: any) => {
              if (q.passage) {
                currentPassage = q.passage;
                currentPassageName = q.passageName;
                currentPassageStartLine = q.passageStartLine;
              }

              // Only add if we haven't seen this ID and user has seen this question
              if (seenIds.has(q.id) || !seenQuestionIds.has(q.id)) return;

              const formattedQ: DSATQuestion = {
                id: q.id,
                domain: q.domain || '',
                skill: q.skill || 'General',
                text: q.question || q.text || '',
                passage: q.passage || currentPassage || undefined,
                passageName: q.passageName || currentPassageName || undefined,
                passageStartLine: q.passageStartLine !== undefined ? q.passageStartLine : currentPassageStartLine,
                options: q.options && q.options.length > 0 ? q.options : undefined,
                correctAnswer: String(typeof q.correctAnswer === 'number' ? ['A','B','C','D'][q.correctAnswer] || q.correctAnswer : (q.answer !== undefined ? ['A','B','C','D'][q.answer] : (q.correctAnswer || 'A'))),
                explanation: q.explanation,
                type: (q.type === 'SPR' ? 'SPR' : 'MC') as 'MC' | 'SPR',
                module: 1,
                difficulty: 'Medium',
              };

              let qSubject: 'Math' | 'Reading&Writing' = 'Math';
              const dom = (formattedQ.domain || '').toLowerCase();
              const isMathDom = dom.includes('algebra') || dom.includes('math') || dom.includes('geometry') || dom.includes('data');
              const isEngDom = dom.includes('craft') || dom.includes('expression') || dom.includes('english') || dom.includes('information');

              if (isMathDom) {
                qSubject = 'Math';
              } else if (isEngDom) {
                qSubject = 'Reading&Writing';
              } else if (testSubject === 'Math') {
                qSubject = 'Math';
              } else if (testSubject === 'English') {
                qSubject = 'Reading&Writing';
              } else {
                const mod = (q.module || '').toString().toUpperCase();
                if (mod.includes('MATH')) qSubject = 'Math';
                else if (mod.includes('M1') || mod.includes('M2')) qSubject = 'Reading&Writing';
              }

              if (!formattedQ.domain) {
                formattedQ.domain = qSubject === 'Math' ? 'General Math' : 'General English';
              }
              formattedQ._subject = qSubject;

              pool.push(formattedQ);
              seenIds.add(q.id);
            });
          } catch (e) {
            console.error("Failed to parse dynamic question", e);
          }
        }
      });
    } catch (e) {
      console.error('Failed to fetch dynamic tests for question bank', e);
    }
  }

  return pool;
}
