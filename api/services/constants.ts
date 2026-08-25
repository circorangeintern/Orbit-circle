// services/quiz/constants.ts

// How many top-scoring careers are treated as "still contending" when picking
// the next question and when computing Separation. Widened from 4 (cluster-era)
// to 8 now that we match against 80 careers instead of 16 clusters.
export const CONTENDER_POOL_SIZE = 8;

// A trait is treated as "well understood" after this many questions have
// measured it (used in Trait Uncertainty). Tunable -- not yet validated
// against real quiz runs.
export const TRAIT_CONFIDENCE_SATURATION = 25; // 100 / 4 questions

// Rough max points obtainable per trait across the question bank, used only
// to normalize trait scores into a 0-100 scale for Coverage/Separation.
// This is an approximation (assumes ~4 meaningful hits per trait at ~5pts
// each) -- worth revisiting once we have real completed-attempt data.
export const ASSUMED_MAX_POINTS_PER_TRAIT = 20;

// Priority Score weights (from spec)
export const PRIORITY_WEIGHTS = {
  traitUncertainty: 0.5,
  informationGain: 0.3,
  diversityBonus: 0.2
};

// Confidence formula weights. Originally 0.40/0.30/0.30 per spec, reweighted
// after testing: Separation is structurally capped low (1-7%) even for the
// cleanest possible answer pattern, since many careers in the 80-career set
// genuinely share overlapping trait profiles -- at the original weighting,
// confidence could never realistically reach the 85% stop threshold. Reduced
// Separation's influence and shifted weight to Coverage/Consistency, which
// both behave predictably. Re-validate against testQuizAttempt.ts if the
// career dataset changes significantly.
export const CONFIDENCE_WEIGHTS = {
  coverage: 0.5,
  consistency: 0.35,
  separation: 0.15
};

// Stop rule. Confidence threshold lowered from the original 85% (spec) to 75%
// after testing: even the strongest possible answer pattern (a single trait
// dominating overwhelmingly) only reached ~84% under the reweighted formula,
// so 85% was effectively unreachable regardless of how clean the signal was.
// 75% lets a genuinely strong signal stop early while still requiring real
// separation/consistency, not just high coverage.
export const MIN_QUESTIONS = 15;
export const MAX_QUESTIONS = 18;
export const CONFIDENCE_STOP_THRESHOLD = 75;

// Validation trigger (Stage 4) -- provisional, not yet tuned against real data
export const VALIDATION_TRIGGER_MIN_QUESTIONS = 10;
export const VALIDATION_TRIGGER_MAX_GAP = 10; // percentage points

// Ranking-type scoring: points awarded by rank position (1st place = index 0)
export const RANKING_POINTS = [5, 4, 3, 2, 1];

// Skip penalty: a skipped question subtracts this fraction of each referenced
// trait's average weight across the question's options, treating a skip as
// mild negative evidence rather than a null. Agreed value from product discussion.
export const SKIP_PENALTY_FACTOR = 0.5;