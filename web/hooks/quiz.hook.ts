// hooks/quiz.hook.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { getToken } from './auth.hook';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
const QUIZ_BASE = `${API_URL}/quiz`;

async function quizFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${QUIZ_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }

  return response.json();
}

export interface QuizOption {
  id: number;
  label: string;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: 'single_choice' | 'scenario' | 'multiple_choice' | 'ranking' | 'scale' | 'reflection_text';
  options?: QuizOption[];
  max_selections?: number | null;
  placeholder?: string;
  maxLength?: number;
  // Dynamic NLP context fields
  screen_index?: number;
  ai_feedback?: string;
  confidence_score?: number;
}

export interface QuizResult {
  id: string;
  cluster_id: number | null;
  title: string;
  why_this_summary: string | null;
  description: string | null;
  daily_tasks: string[] | null;
  key_skills: string[] | null;
  salary_local_min: number | null;
  salary_local_max: number | null;
  salary_local_currency: string;
  salary_intl_min: number | null;
  salary_intl_max: number | null;
  salary_intl_currency: string;
  created_at: string;
  matchPercent: number;
  confidence?: number;
  confidenceBand?: "High" | "Medium" | "Low";
}

export function useStartQuiz() {
  return useMutation({
    mutationFn: (): Promise<{
      attempt: { id: string; startedAt: string; askedQuestionIds: number[] };
      nextQuestion: QuizQuestion | null;
    }> => quizFetch('/start', { method: 'POST' })
  });
}

export function useAttemptStatus(attemptId: string | null) {
  return useQuery({
    queryKey: ['quiz-attempt-status', attemptId],
    queryFn: (): Promise<{
      id: string;
      completed: boolean;
      questionsAnswered: number;
      confidence: number | null;
      pendingQuestion: QuizQuestion | null;
    }> => quizFetch(`/${attemptId}`),
    enabled: !!attemptId,
    retry: false
  });
}

interface SubmitAnswerPayload {
  attemptId: string;
  questionId: number;
  selectedOptionIds?: number[];
  rankingOrder?: number[];
  scaleValue?: number;
  reflectionText?: string;
}

type AnswerResponse =
  | { done: false; nextQuestion: QuizQuestion; aiFeedback?: string; confidenceScore?: number }
  | { done: true; results: QuizResult[] };

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({ attemptId, ...body }: SubmitAnswerPayload): Promise<AnswerResponse> =>
      quizFetch(`/${attemptId}/answer`, {
        method: 'POST',
        body: JSON.stringify(body)
      })
  });
}

export function useSkipQuestion() {
  return useMutation({
    mutationFn: ({
      attemptId,
      questionId
    }: {
      attemptId: string;
      questionId: number;
    }): Promise<AnswerResponse> =>
      quizFetch(`/${attemptId}/skip`, {
        method: 'POST',
        body: JSON.stringify({ questionId })
      })
  });
}

export function useQuizResults(attemptId: string | null) {
  return useQuery({
    queryKey: ['quiz-results', attemptId],
    queryFn: (): Promise<{ results: QuizResult[] }> => quizFetch(`/${attemptId}/results`),
    enabled: !!attemptId
  });
}