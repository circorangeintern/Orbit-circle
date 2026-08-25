// services/quiz/quizConfidenceService.ts
import QuizAttempt from '../models/quiz-attempts.model';
//import QuizQuestion from '../models/quiz-question.model';
import QuizResponse from '../models/quiz-response.model';
//import CareerTraitWeight from '../models/career-trait-weights.model';
import QuizSelectionService from './quiz-selection.service';
import {
  ASSUMED_MAX_POINTS_PER_TRAIT,
  CONFIDENCE_WEIGHTS,
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  CONFIDENCE_STOP_THRESHOLD
} from './constants';


function stdDev(values: number[]) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

class QuizConfidenceService {
  static async coverage(attemptId: string) {
    const attempt = await QuizAttempt.findById(attemptId);
    // "Questions available" means the ceiling for THIS attempt (MAX_QUESTIONS),
    // not the size of the entire static question bank. Using the full bank
    // (~112 questions) here made Coverage -- and therefore Confidence -- stay
    // near 15% for the entire quiz, making the 85% stop threshold unreachable
    // within the intended 15-18 question range. Caught via testQuizAttempt.ts.
    return Math.min(100, (attempt.asked_question_ids.length / MAX_QUESTIONS) * 100);
  }

  // For every trait measured by 2+ answered questions, compute the "rate"
  // (points awarded / assumed max points for that trait) per instance, then
  // measure agreement via (1 - stdDev). Traits measured once are excluded.
  static async consistency(attemptId: string) {
    const history = await QuizResponse.findTraitHistoryForAttempt(attemptId);

    const ratesByTrait: Record<string, number[]> = {};
    for (const response of history) {
      if (!response.trait_points_awarded) continue;
      for (const [traitCode, points] of Object.entries(response.trait_points_awarded as Record<string, number>)) {
        const rate = Math.min(1, Number(points) / ASSUMED_MAX_POINTS_PER_TRAIT);
        if (!ratesByTrait[traitCode]) ratesByTrait[traitCode] = [];
        ratesByTrait[traitCode].push(rate);
      }
    }

    const traitConsistencies: number[] = [];
    for (const rates of Object.values(ratesByTrait)) {
      if (rates.length < 2) continue; // need 2+ instances to measure consistency
      traitConsistencies.push(100 * (1 - stdDev(rates)));
    }

    if (traitConsistencies.length === 0) return 100; // not enough data yet -- don't penalize early
    return traitConsistencies.reduce((a, b) => a + b, 0) / traitConsistencies.length;
  }

  // Highest career score minus second-highest, normalized as a percentage of
  // the leader's score (0-100). Simplified normalization -- see constants.ts note.
  static async separation(attemptId: string) {
    const attempt = await QuizAttempt.findById(attemptId);
    const { top } = await QuizSelectionService.getTopContenders(attempt.trait_scores_raw);
    const [first, second] = top;
    if (!first || !second || first.score === 0) return 0;
    return Math.min(100, ((first.score - second.score) / first.score) * 100);
  }

  static async computeConfidence(attemptId: string) {
    const [coverage, consistency, separation] = await Promise.all([
      this.coverage(attemptId),
      this.consistency(attemptId),
      this.separation(attemptId)
    ]);

    const confidence =
      CONFIDENCE_WEIGHTS.coverage * coverage +
      CONFIDENCE_WEIGHTS.consistency * consistency +
      CONFIDENCE_WEIGHTS.separation * separation;

    await QuizAttempt.updateConfidence(attemptId, coverage, consistency, separation, confidence);

    return { coverage, consistency, separation, confidence };
  }

  static async shouldStopQuiz(attemptId: string) {
    const attempt = await QuizAttempt.findById(attemptId);
    const questionsAsked = attempt.asked_question_ids.length;

    // Always compute confidence first, even when the hard cap is about to fire --
    // otherwise the stored coverage/consistency/separation/confidence numbers are
    // stale by one question (caught via testQuizAttempt.ts: coverage was showing
    // 94.44% = 17/18 instead of 100% = 18/18 at the true final state).
    const { confidence } = await this.computeConfidence(attemptId);

    if (questionsAsked >= MAX_QUESTIONS) return true;
    if (questionsAsked < MIN_QUESTIONS) return false;

    return confidence >= CONFIDENCE_STOP_THRESHOLD;
  }
}

export default QuizConfidenceService;