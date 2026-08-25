// services/quiz/quizResultsService.ts
import QuizAttempt from '../models/quiz-attempts.model';
import Career from '../models/career.model';
import CareerTraitWeight from '../models/career-trait-weights.model';
import { rarityMultiplier } from './traitRarityService';
import { ASSUMED_MAX_POINTS_PER_TRAIT } from './constants';
import { getConfidenceBand } from '../utils/confidenceBand.util';

class QuizResultsService {
  // Trait Score = Earned Points / Maximum Possible Points * 100 (per spec)
  static normalizeTraitScores(traitScoresRaw: Record<string, number>) {
    const normalized: Record<string, number> = {};
    for (const [traitCode, points] of Object.entries(traitScoresRaw)) {
      normalized[traitCode] = Math.max(-100, Math.min(100, (points / ASSUMED_MAX_POINTS_PER_TRAIT) * 100));
    }
    return normalized;
  }

  // Career Match Score = sum of (normalized trait score * career's trait weight)
  static computeCareerMatchScores(
    normalizedTraitScores: Record<string, number>,
    matrix: Record<string, Record<string, number>>
  ) {
    const scores: { careerId: string; matchPercent: number }[] = [];
    for (const [careerId, weights] of Object.entries(matrix)) {
      let weightedSum = 0;
      let totalWeight = 0;
      for (const [traitCode, weight] of Object.entries(weights)) {
        weightedSum += (normalizedTraitScores[traitCode] ?? 0) * weight * rarityMultiplier(traitCode);
        totalWeight += weight * rarityMultiplier(traitCode);
      }
      // weights per career already sum to ~100 (from the cleaned dataset),
      // so dividing by totalWeight keeps the result on a clean 0-100 scale
      // even if a career's rows don't sum to exactly 100 after content edits.
      const matchPercent = totalWeight > 0 ? weightedSum / totalWeight : 0;
      scores.push({ careerId, matchPercent: Math.max(0, Math.min(100, matchPercent)) });
    }
    return scores.sort((a, b) => b.matchPercent - a.matchPercent);
  }

  static async finalizeResults(attemptId: string) {
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) throw new Error('Quiz attempt not found');

    const normalizedTraitScores = this.normalizeTraitScores(attempt.trait_scores_raw);
    const matrix = await CareerTraitWeight.findAllAsMatrix();
    const ranked = this.computeCareerMatchScores(normalizedTraitScores, matrix);

    // fixed top 3, per product decision -- not confidence-tiered
    const top3 = ranked.slice(0, 3);
    const top3CareerIds = top3.map(r => r.careerId);

    await QuizAttempt.finalize(attemptId, normalizedTraitScores, top3CareerIds);

    return this.hydrateResults(top3CareerIds, top3.map(r => r.matchPercent), attempt.confidence);
  }

  // re-fetch results for an attempt that was already finalized, without recomputing
  static async getStoredResults(attemptId: string) {
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) throw new Error('Quiz attempt not found');
    if (!attempt.completed_at || !attempt.final_recommended_careers) {
      throw new Error('This quiz attempt has not been completed yet');
    }
    // match percentages aren't stored per-career separately, so recompute from
    // the already-normalized trait scores (cheap -- no re-ranking needed, just re-scoring the top 3)
    const matrix = await CareerTraitWeight.findAllAsMatrix();
    const percents = attempt.final_recommended_careers.map((careerId: string) => {
      const weights = matrix[careerId] ?? {};
      let weightedSum = 0;
      let totalWeight = 0;
      for (const [traitCode, weight] of Object.entries(weights)) {
        weightedSum += (attempt.trait_scores_normalized?.[traitCode] ?? 0) * weight * rarityMultiplier(traitCode);
        totalWeight += weight * rarityMultiplier(traitCode);
      }
      return totalWeight > 0 ? Math.max(0, Math.min(100, weightedSum / totalWeight)) : 0;
    });
    return this.hydrateResults(attempt.final_recommended_careers, percents, attempt.confidence);
  }

  private static async hydrateResults(careerIds: string[], matchPercents: number[], confidence?: number) {
    const careers = await Career.findByIds(careerIds);
    const careersById = new Map(careers.map((c: any) => [c.id, c]));
    const confidenceBand = confidence !== undefined ? getConfidenceBand(confidence) : undefined;
    return careerIds.map((id, i) => ({
      ...careersById.get(id),
      matchPercent: Math.round(matchPercents[i] ?? 0),
      confidence: confidence !== undefined ? Math.round(confidence) : undefined,
      confidenceBand
    }));
  }
}

export default QuizResultsService;