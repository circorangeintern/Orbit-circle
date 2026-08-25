// utils/quizConfidence.util.ts
export const calculateRequiredPoolAQuestions = (confidenceScore: number) => {
  if (confidenceScore >= 30) return 0; // Skip Pool A if score is >= 30
  if (confidenceScore >= 20) return 2;
  if (confidenceScore >= 10) return 4;
  return 7;
};