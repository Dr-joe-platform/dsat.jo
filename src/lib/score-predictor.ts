export interface PredictedScore {
  min: number;
  max: number;
  totalScore: number;
  subjectScore: string;
}

/**
 * Predicts the SAT score (200-800 per subject, 400-1600 total) based on performance.
 * 
 * @param correctCount Number of correct answers
 * @param totalQuestions Total questions in the exam
 * @param subject The subject ('math', 'reading_writing', or 'full')
 * @returns An object containing the min, max, and a single predicted total score.
 */
export function predictSATScore(
  correctCount: number, 
  totalQuestions: number, 
  subject: 'math' | 'reading_writing' | 'full'
): PredictedScore {
  if (totalQuestions === 0) return { min: 400, max: 400, totalScore: 400, subjectScore: '200' };

  const percentage = correctCount / totalQuestions;

  // The SAT is not purely linear, but we approximate the curve.
  // Below 20% correct is basically the minimum score (200/400).
  // Above 95% correct is basically a perfect score (800/1600).
  
  const calculateSubjectScore = (percent: number) => {
    if (percent < 0.1) return 200;
    if (percent > 0.96) return 800;
    
    // A simple curved approximation where middle scores are compressed slightly
    const base = 200;
    const curveFactor = Math.pow(percent, 0.85); // slight boost for mid-range
    return Math.round((base + curveFactor * 600) / 10) * 10;
  };

  let predictedTotal = 0;
  let minDiff = 0;
  let maxDiff = 0;

  if (subject === 'full') {
    // Assuming equal weight if full
    const estimatedMath = calculateSubjectScore(percentage);
    const estimatedRW = calculateSubjectScore(percentage);
    predictedTotal = estimatedMath + estimatedRW;
    minDiff = 30;
    maxDiff = 40;
  } else {
    // Single subject
    predictedTotal = calculateSubjectScore(percentage);
    minDiff = 20;
    maxDiff = 30;
  }

  // Ensure bounds
  const maxPossible = subject === 'full' ? 1600 : 800;
  const minPossible = subject === 'full' ? 400 : 200;

  const min = Math.max(minPossible, predictedTotal - minDiff);
  const max = Math.min(maxPossible, predictedTotal + maxDiff);

  return {
    min,
    max,
    totalScore: predictedTotal,
    subjectScore: subject === 'full' ? `${predictedTotal / 2} M / ${predictedTotal / 2} RW` : `${predictedTotal}`,
  };
}
