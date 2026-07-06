import { getAllAvailableQuestions } from './questions-pool';

async function test() {
  const pool = await getAllAvailableQuestions();
  const rwQuestions = pool.filter(q => q._subject === 'Reading&Writing');
  
  console.log(`Total questions: ${pool.length}`);
  console.log(`R&W questions: ${rwQuestions.length}`);
  console.log(`Math questions: ${pool.length - rwQuestions.length}`);
  
  // Look for any R&W questions that are actually math
  const fakeEng = rwQuestions.filter(q => !q.passage && !q.domain);
  if (fakeEng.length > 0) {
    console.log(`Found ${fakeEng.length} R&W questions that have no passage/domain!`);
    console.log(fakeEng.slice(0, 5));
  } else {
    console.log('No fake English questions found based on passage/domain!');
  }
}

test();
