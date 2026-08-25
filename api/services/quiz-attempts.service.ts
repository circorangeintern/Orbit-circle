// services/quiz/quizAttemptService.ts
import QuizAttempt from '../models/quiz-attempts.model';
import QuizScoringService, { SubmitAnswerInput } from './quiz-scoring.service';
import QuizSelectionService from './quiz-selection.service';
import QuizConfidenceService from './quiz-confidence.service';
import QuizResultsService from './quiz-result.service';
import { QuizNlpService } from './quizNlpService';
import { calculateRequiredPoolAQuestions } from '../utils/quizConfidence.util';
import { NLP_DISCOVERY_PROMPTS } from '../constants/nlpDiscoveryPrompts';

class QuizAttemptService {

  static async startAttempt(userId: string) {
    const attempt = await QuizAttempt.findInProgressForUser(userId) ?? (await QuizAttempt.create(userId));

    const currentTurn = attempt.nlp_turn_count || 0;
    
    if (attempt.current_phase === 'nlp_discovery' || currentTurn < 3) {
      const promptConfig = NLP_DISCOVERY_PROMPTS[currentTurn];
      if (!promptConfig) {
        throw new Error(`Invalid NLP discovery turn: ${currentTurn}`);
      }

      const fullQuestionText = `${promptConfig.title}\n\n${promptConfig.subtitle}${
        promptConfig.hint ? `\n\n💡 ${promptConfig.hint}` : ''
      }`;

      const nlpQuestion = {
        id: 99901 + currentTurn,
        question_type: "reflection_text",
        screen_index: promptConfig.screen,
        question_text: fullQuestionText,
        placeholder: promptConfig.placeholder,
        maxLength: promptConfig.maxLength,
        isCompulsory: promptConfig.isCompulsory
      };

      return { attempt, question: nlpQuestion, resumedQuestionId: null };
    }

    if (attempt.pending_question_id) {
      return { attempt, question: null, resumedQuestionId: attempt.pending_question_id };
    }

    const question = await QuizSelectionService.pickNextQuestion(attempt.id);
    if (question) {
      await QuizAttempt.setPendingQuestion(attempt.id, question.id);
    }
    return { attempt, question, resumedQuestionId: null };
  }

  static async submitAnswer(input: SubmitAnswerInput) {
    await QuizScoringService.submitAnswer(input);
    return this.afterScoringUpdate(input.attemptId);
  }

  static async skipQuestion(attemptId: string, questionId: number) {
    await QuizScoringService.submitSkip(attemptId, questionId);
    return this.afterScoringUpdate(attemptId);
  }

  private static async afterScoringUpdate(attemptId: string) {
    const shouldStop = await QuizConfidenceService.shouldStopQuiz(attemptId);
    if (shouldStop) {
      const results = await QuizResultsService.finalizeResults(attemptId);
      return { done: true, results };
    }

    const nextQuestion = await QuizSelectionService.pickNextQuestion(attemptId);
    if (!nextQuestion) {
      const results = await QuizResultsService.finalizeResults(attemptId);
      return { done: true, results };
    }

    await QuizAttempt.setPendingQuestion(attemptId, nextQuestion.id);

    return { done: false, nextQuestion };
  }

  static async submitNlpResponse(attemptId: string, userText?: string, skipped: boolean = false) {
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) throw new Error('Quiz attempt not found');

    const currentTurn = (attempt.nlp_turn_count || 0) + 1;

    if (currentTurn === 1 && skipped) {
      throw new Error('Screen 1 is compulsory.');
    }

    let updatedScores = { ...(attempt.trait_scores_raw || {}) };
    let feedbackMessage = '';
    let extractedTraits: Array<{ trait: string; intensity: number }> = [];
    let confidenceScore = attempt.confidence || 0;

    if (!skipped && userText && userText.trim().length > 0) {
      let nlpResult;
      try {
        nlpResult = await QuizNlpService.processFreeText(userText, currentTurn);
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || error?.message?.includes('429');
        const isUnavailable = error?.status >= 500 || error?.code === 'ECONNREFUSED';

        if (isRateLimit || isUnavailable) {
          console.warn("⚠️ Gemini NLP service unavailable. Transitioning attempt directly to structured Pool A questions.");

          // 1. Force the attempt phase to transition into structured questions
          await QuizAttempt.updateNlpState(attemptId, {
            trait_scores_raw: updatedScores,
            current_phase: 'structured_questions',
            nlp_turn_count: currentTurn
          });

          // 2. Fetch the first Pool A question using existing selection engine
          const nextQuestion = await QuizSelectionService.pickPoolAQuestion(attemptId);
          if (nextQuestion) {
            await QuizAttempt.setPendingQuestion(attemptId, nextQuestion.id);
          }

          // 3. Return transition response for the frontend UI
          return {
            phase: 'structured_questions',
            transitioned: true,
            currentTurn,
            confidenceScore,
            extractedTraits: [],
            feedbackMessage: "Let's move straight into a few structured questions!",
            nextQuestion
          };
        }

        throw error;
      }
      
      for (const item of nlpResult.extracted_traits) {
        updatedScores[item.trait] = (updatedScores[item.trait] || 0) + item.intensity;
      }
      
      feedbackMessage = nlpResult.feedback_message;
      extractedTraits = nlpResult.extracted_traits;
      
      const totalTraitIntensity = (Object.values(updatedScores) as number[]).reduce((a, b) => a + b, 0);
      confidenceScore = Math.min(100, Math.round((totalTraitIntensity / 15) * 100));
    }

    const isDiscoveryComplete = currentTurn >= 3;
    const nextPhase = isDiscoveryComplete ? 'structured_questions' : 'nlp_discovery';

    await QuizAttempt.updateNlpState(attemptId, {
      trait_scores_raw: updatedScores,
      nlp_turn_count: currentTurn,
      current_phase: nextPhase,
      confidence: confidenceScore
    });

    if (isDiscoveryComplete) {
      const nextQuestion = await QuizSelectionService.pickNextQuestion(attemptId);

      if (nextQuestion) {
        await QuizAttempt.setPendingQuestion(attemptId, nextQuestion.id);
      }

      return {
        phase: 'structured_questions',
        transitioned: true,
        currentTurn,
        confidenceScore,
        extractedTraits,
        nextQuestion
      };
    }

    return {
      phase: 'nlp_discovery',
      transitioned: false,
      currentTurn,
      confidenceScore,
      feedbackMessage,
      extractedTraits
    };
  }
}

export default QuizAttemptService;