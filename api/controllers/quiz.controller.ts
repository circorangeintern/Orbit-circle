// controllers/quizController.ts
import QuizAttemptService from '../services/quiz-attempts.service';
import QuizAttempt from '../models/quiz-attempts.model';
import QuizResultsService from '../services/quiz-result.service';
//import { HTTP_STATUS } from '../utils/const';
import QuizQuestion from '../models/quiz-question.model';
import QuizAnswerOption from '../models/quiz-options.model';
import type { Request, Response } from 'express';
import { NLP_DISCOVERY_PROMPTS } from '../constants/nlpDiscoveryPrompts';


function getUserId(req: Request): string {
  return (req as any).user.id;
}

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') {
    const err: any = new Error(`Missing or invalid route parameter: ${name}`);
    err.status = 400;
    throw err;
  }
  return value;
}

async function hydrateQuestion(question: any) {
  if (question.question_type === 'scale' || question.question_type === 'reflection_text') {
    return question;
  }
  const options = await QuizAnswerOption.findByQuestion(question.id);
  return {
    ...question,
    options: options.map((o: any) => ({ id: o.id, label: o.option_label }))
  };
}

async function assertOwnsAttempt(attemptId: string, userId: string) {
  const attempt = await QuizAttempt.findById(attemptId);
  if (!attempt) {
    const err: any = new Error('Quiz attempt not found');
    err.status = 404;
    throw err;
  }
  if (attempt.user_id !== userId) {
    const err: any = new Error('This quiz attempt does not belong to you');
    err.status = 403;
    throw err;
  }
  return attempt;
}

// qiuz start controller
export const startQuiz = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { attempt, question, resumedQuestionId } = await QuizAttemptService.startAttempt(userId);

  let questionToReturn = question;
  if (!questionToReturn && resumedQuestionId) {
    questionToReturn = await QuizQuestion.findById(resumedQuestionId);
  }

  res.status(200).json({
    attempt: {
      id: attempt.id,
      startedAt: attempt.started_at,
      askedQuestionIds: attempt.asked_question_ids
    },
    // single question, same shape every other step returns -- null only if
    // the attempt is somehow already complete with nothing left to resume
    nextQuestion: questionToReturn ? await hydrateQuestion(questionToReturn) : null
  });
};

export const getAttemptStatus = async (req: Request, res: Response) => {
  try {
    const attempt = await assertOwnsAttempt(getParam(req, 'attemptId'), getUserId(req));

    let pendingQuestion = null;
    if (attempt.pending_question_id) {
      const question = await QuizQuestion.findById(attempt.pending_question_id);
      if (question) pendingQuestion = await hydrateQuestion(question);
    }

    res.status(200).json({
      id: attempt.id,
      completed: !!attempt.completed_at,
      questionsAnswered: attempt.asked_question_ids.length,
      confidence: attempt.confidence,
      pendingQuestion
    });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
};



export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const attemptId = getParam(req, 'attemptId');
    const attempt = await assertOwnsAttempt(attemptId, getUserId(req));

    const { questionId, selectedOptionIds, rankingOrder, scaleValue, reflectionText } = req.body;
    if (!questionId) {
      return res.status(400).json({ message: 'questionId is required' });
    }

    if (reflectionText !== undefined || attempt.current_phase === 'nlp_discovery') {
      const nlpResult = await QuizAttemptService.submitNlpResponse(attemptId, reflectionText, false);

      if (nlpResult.transitioned && nlpResult.nextQuestion) {
        return res.status(200).json({
          done: false,
          phase: nlpResult.phase,
          // ⚡ DEBUG METRICS
          debug: {
            confidenceScore: nlpResult.confidenceScore ?? (nlpResult as any).confidence ?? null,
            confidenceMet: nlpResult.transitioned,
            currentTurn: nlpResult.currentTurn,
            extractedTraits: (nlpResult as any).extractedTraits ?? (nlpResult as any).traits ?? [],
            attemptPhase: attempt.current_phase
          },
          nextQuestion: await hydrateQuestion(nlpResult.nextQuestion)
        });
      }

      const nextTurn = nlpResult.currentTurn; // Turn 1 or 2
      const promptConfig = NLP_DISCOVERY_PROMPTS[nextTurn];
      if (!promptConfig) {
        throw new Error('Invalid NLP discovery turn');
      }

      const fullQuestionText = `${promptConfig.title}\n\n${promptConfig.subtitle}${
        promptConfig.hint ? `\n\n💡 ${promptConfig.hint}` : ''
      }`;

      const nextNlpQuestion = {
        id: 99901 + nextTurn,
        question_type: "reflection_text",
        screen_index: promptConfig.screen,
        question_text: fullQuestionText,
        placeholder: promptConfig.placeholder,
        maxLength: promptConfig.maxLength,
        isCompulsory: promptConfig.isCompulsory
      };

      return res.status(200).json({
        done: false,
        phase: 'nlp_discovery',
        aiFeedback: nlpResult.feedbackMessage,
        // ⚡ DEBUG METRICS
        debug: {
          confidenceScore: (nlpResult as any).confidenceScore ?? (nlpResult as any).confidence ?? null,
          confidenceMet: (nlpResult as any).confidenceMet ?? false,
          currentTurn: nextTurn,
          extractedTraits: (nlpResult as any).extractedTraits ?? (nlpResult as any).traits ?? [],
          attemptPhase: attempt.current_phase
        },
        nextQuestion: nextNlpQuestion
      });
    }

    const result = await QuizAttemptService.submitAnswer({
      attemptId,
      questionId,
      selectedOptionIds,
      rankingOrder,
      scaleValue,
      reflectionText
    });

    if (result.done) {
      return res.status(200).json({ 
        done: true, 
        results: result.results,
        // ⚡ DEBUG METRICS
        debug: {
          confidenceScore: (result as any).confidenceScore ?? null,
          confidenceMet: true,
          attemptPhase: attempt.current_phase
        }
      });
    }

    res.status(200).json({ 
      done: false, 
      // ⚡ DEBUG METRICS
      debug: {
        confidenceScore: (result as any).confidenceScore ?? null,
        extractedTraits: (result as any).extractedTraits ?? [],
        attemptPhase: attempt.current_phase
      },
      nextQuestion: await hydrateQuestion(result.nextQuestion) 
    });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
};

export const skipQuestion = async (req: Request, res: Response) => {
  try {
    const attemptId = getParam(req, 'attemptId');
    await assertOwnsAttempt(attemptId, getUserId(req));

    const { questionId } = req.body;
    if (!questionId) {
      return res.status(400).json({ message: 'questionId is required' });
    }

    const result = await QuizAttemptService.skipQuestion(attemptId, questionId);

    if (result.done) {
      return res.status(200).json({ done: true, results: result.results });
    }

    res.status(200).json({ done: false, nextQuestion: await hydrateQuestion(result.nextQuestion) });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
};

export const getResults = async (req: Request, res: Response) => {
  try {
    const attemptId = getParam(req, 'attemptId');
    await assertOwnsAttempt(attemptId, getUserId(req));
    const results = await QuizResultsService.getStoredResults(attemptId);
    res.status(200).json({ results });
  } catch (err: any) {
    res.status(err.status ?? 200).json({ message: err.message });
  }

};

// controllers/quizController.ts

export const submitNlpDiscovery = async (req: Request, res: Response) => {
  try {
    const attemptId = getParam(req, 'attemptId');
    await assertOwnsAttempt(attemptId, getUserId(req));

    const { text, skipped } = req.body;

    // Validate text presence if not explicitly skipping
    if (!skipped && (!text || typeof text !== 'string' || text.trim().length === 0)) {
      return res.status(400).json({ message: 'Text input is required unless skipping.' });
    }

    const result = await QuizAttemptService.submitNlpResponse(attemptId, text, !!skipped);

    if (result.transitioned && result.nextQuestion) {
      return res.status(200).json({
        phase: result.phase,
        transitioned: true,
        nextQuestion: await hydrateQuestion(result.nextQuestion)
      });
    }

    return res.status(200).json({
      phase: result.phase,
      transitioned: false,
      currentTurn: result.currentTurn,
      feedbackMessage: result.feedbackMessage,
      extractedTraits: result.extractedTraits
    });
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
};