// services/quiz/quizScoringService.ts
import QuizAttempt from '../models/quiz-attempts.model';
import QuizQuestion from '../models/quiz-question.model';
import QuizAnswerOption from '../models/quiz-options.model';
import QuizResponse from '../models/quiz-response.model';
import { RANKING_POINTS, SKIP_PENALTY_FACTOR } from './constants';


type TraitScores = Record<string, number>; // keyed by trait_id as string

export interface SubmitAnswerInput {
  attemptId: string;
  questionId: number;
  selectedOptionIds?: number[]; // single_choice / scenario (1) / multiple_choice (N)
  rankingOrder?: number[];      // ranking type: option ids, best -> worst
  scaleValue?: number;          // scale type: 1-5
  reflectionText?: string;      // reflection_text type: never scored
}

class QuizScoringService {
  static async submitAnswer(input: SubmitAnswerInput) {
    const attempt = await QuizAttempt.findById(input.attemptId);
    if (!attempt) throw new Error('Quiz attempt not found');

    const question = await QuizQuestion.findById(input.questionId);
    if (!question) throw new Error('Question not found');

    const pointsAwarded: TraitScores = {};

    switch (question.question_type) {
      case 'single_choice':
      case 'scenario': {
        const optionId = input.selectedOptionIds?.[0];
        if (!optionId) throw new Error('An option must be selected for this question type');
        const option = await QuizAnswerOption.findById(optionId);
        if (!option) throw new Error('Answer option not found');
        for (const [traitCode, weight] of Object.entries(option.trait_weights)) {
          pointsAwarded[traitCode] = (pointsAwarded[traitCode] ?? 0) + Number(weight);
        }
        break;
      }

      case 'multiple_choice': {
        if (!input.selectedOptionIds?.length) {
          throw new Error('At least one option must be selected for this question type');
        }
        const options = await QuizAnswerOption.findByIds(input.selectedOptionIds);

        const hasNota = options.some(o => o.option_label === 'None of the above');
        if (hasNota && options.length > 1) {
          throw new Error(
            '"None of the above" cannot be combined with other selections -- choose either specific options or "None of the above", not both'
          );
        }

        for (const option of options) {
          for (const [traitCode, weight] of Object.entries(option.trait_weights)) {
            pointsAwarded[traitCode] = (pointsAwarded[traitCode] ?? 0) + Number(weight);
          }
        }
        break;
      }

      case 'ranking': {
        if (!input.rankingOrder?.length) {
          throw new Error('A ranking order must be provided for this question type');
        }
        const options = await QuizAnswerOption.findByIds(input.rankingOrder);
        const byId = new Map(options.map(o => [o.id, o]));
        input.rankingOrder.forEach((optionId, index) => {
          const option = byId.get(optionId);
          if (!option) return;
          const rankPoints = RANKING_POINTS[index] ?? 1;
          // ranking-type options store a base weight of 1 per trait --
          // multiply by rank-position points (5,4,3,2,1) at submission time
          for (const [traitCode, baseWeight] of Object.entries(option.trait_weights)) {
            pointsAwarded[traitCode] = (pointsAwarded[traitCode] ?? 0) + Number(baseWeight) * rankPoints;
          }
        });
        break;
      }

      case 'scale': {
        if (input.scaleValue == null) {
          throw new Error('A scale value must be provided for this question type');
        }
        // scale-type options are pre-seeded per value 1-5, each with the correct
        // trait_weights for that value -- find the matching option by its stored order
        const options = await QuizAnswerOption.findByQuestion(question.id);
        const matched = options.find(o => o.option_order === input.scaleValue)
          ?? options[input.scaleValue - 1]; // fallback: assume seeded in 1-5 order
        if (!matched) throw new Error('No matching scale option found');
        for (const [traitCode, weight] of Object.entries(matched.trait_weights)) {
          pointsAwarded[traitCode] = (pointsAwarded[traitCode] ?? 0) + Number(weight);
        }
        break;
      }

      case 'reflection_text':
        // never scored -- just stored
        break;

      default:
        throw new Error(`Unknown question type: ${question.question_type}`);
    }

    const updatedScores: TraitScores = { ...attempt.trait_scores_raw };
    for (const [traitCode, points] of Object.entries(pointsAwarded)) {
      updatedScores[traitCode] = (updatedScores[traitCode] ?? 0) + points;
    }

    const updatedAskedIds = [...attempt.asked_question_ids, question.id];

    await QuizAttempt.updateAfterAnswer(attempt.id, updatedScores, updatedAskedIds);

    await QuizResponse.create({
      attempt_id: attempt.id,
      question_id: question.id,
      selected_option_ids: input.selectedOptionIds,
      ranking_order: input.rankingOrder,
      scale_value: input.scaleValue,
      reflection_text: input.reflectionText,
      trait_points_awarded: pointsAwarded
    });

    return { updatedScores, pointsAwarded };
  }

  // Skip acts as mild negative evidence: subtract a fraction of each referenced
  // trait's average weight across this question's options, rather than storing
  // a null. Traits not touched by this question are left alone.
  static async submitSkip(attemptId: string, questionId: number) {
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) throw new Error('Quiz attempt not found');

    const question = await QuizQuestion.findById(questionId);
    if (!question) throw new Error('Question not found');

    if (question.question_type === 'reflection_text') {
      throw new Error('Reflection questions cannot be skipped -- they are already optional');
    }

    if (!['ranking', 'scale'].includes(question.question_type)) {
      throw new Error(
        `Skip is not available for ${question.question_type} questions -- select "None of the above" instead`
      );
    }

    const options = await QuizAnswerOption.findByQuestion(questionId);
    if (options.length === 0) throw new Error('This question has no options to compute a skip penalty from');

    const traitCodes = new Set<string>();
    for (const option of options) {
      Object.keys(option.trait_weights).forEach(code => traitCodes.add(code));
    }

    const pointsAwarded: TraitScores = {};
    for (const traitCode of traitCodes) {
      const weightsAcrossOptions = options.map(o => Number(o.trait_weights[traitCode] ?? 0));
      const avgWeight = weightsAcrossOptions.reduce((a, b) => a + b, 0) / weightsAcrossOptions.length;
      pointsAwarded[traitCode] = -avgWeight * SKIP_PENALTY_FACTOR;
    }

    const updatedScores: TraitScores = { ...attempt.trait_scores_raw };
    for (const [traitCode, points] of Object.entries(pointsAwarded)) {
      // allowed to go negative -- clamped only at display/normalization time, not here
      updatedScores[traitCode] = (updatedScores[traitCode] ?? 0) + points;
    }

    const updatedAskedIds = [...attempt.asked_question_ids, question.id];
    await QuizAttempt.updateAfterAnswer(attempt.id, updatedScores, updatedAskedIds);

    await QuizResponse.create({
      attempt_id: attempt.id,
      question_id: question.id,
      trait_points_awarded: pointsAwarded,
      is_skipped: true
    });

    return { updatedScores, pointsAwarded };
  }
}

export default QuizScoringService;