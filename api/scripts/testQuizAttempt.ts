// scripts/testQuizAttempt.ts
//
// Runs a full mock quiz attempt end-to-end through the real service layer
// (not HTTP) against the live database. Prints every question asked, the
// answer chosen, running trait scores, and the final top-3 results.
//
// Usage: npx tsx scripts/testQuizAttempt.ts [persona]
// personas: random | analytical | helper | creative
//
// "random" picks uniformly at random -- sanity-checks nothing crashes and
// the engine terminates. The trait personas always pick whichever option
// scores highest on a target trait -- sanity-checks the matching actually
// converges toward plausible careers for a consistent answer pattern,
// rather than producing noise.

import { pool } from '../config/db';
import QuizAttemptService from '../services/quiz-attempts.service';
import QuizAnswerOption from '../models/quiz-options.model';
import QuizAttempt from '../models/quiz-attempts.model';
import QuizQuestion from '../models/quiz-question.model';

const PERSONAS: Record<string, string | null> = {
  random: null,
  analytical: 'AN',
  helper: 'HL',
  creative: 'CR'
};

const TEST_USER_ID = 'tst1'; // 4 chars, matches VARCHAR(4)

async function ensureTestUser() {
  const existing = await pool.query('SELECT id FROM users WHERE id = $1', [TEST_USER_ID]);
  if (existing.rows.length > 0) return;
  await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash) VALUES ($1, $2, $3, $4)`,
    [TEST_USER_ID, 'Test Runner', 'test-runner@example.com', 'not-a-real-hash']
  );
}

function pickOption(options: any[], targetTrait: string | null) {
  if (!targetTrait) {
    return options[Math.floor(Math.random() * options.length)];
  }
  let best = options[0];
  let bestWeight = -Infinity;
  for (const opt of options) {
    const w = Number(opt.trait_weights[targetTrait] ?? -1);
    if (w > bestWeight) {
      bestWeight = w;
      best = opt;
    }
  }
  return best;
}

async function answerQuestion(attemptId: string, question: any, targetTrait: string | null) {
  const options = await QuizAnswerOption.findByQuestion(question.id);

  let input: any = { attemptId, questionId: question.id };

  switch (question.question_type) {
    case 'single_choice':
    case 'scenario': {
      const chosen = pickOption(options, targetTrait);
      input.selectedOptionIds = [chosen.id];
      console.log(`   -> "${chosen.option_label}"`);
      break;
    }
    case 'multiple_choice': {
      // pick top 2 by target trait (or 2 random) to simulate a realistic multi-select
      const sorted = targetTrait
        ? [...options].sort((a, b) => Number(b.trait_weights[targetTrait] ?? -1) - Number(a.trait_weights[targetTrait] ?? -1))
        : [...options].sort(() => Math.random() - 0.5);
      const chosen = sorted.slice(0, 2);
      input.selectedOptionIds = chosen.map(o => o.id);
      console.log(`   -> [${chosen.map(o => o.option_label).join(', ')}]`);
      break;
    }
    case 'ranking': {
      const sorted = targetTrait
        ? [...options].sort((a, b) => Number(b.trait_weights[targetTrait] ?? -1) - Number(a.trait_weights[targetTrait] ?? -1))
        : [...options].sort(() => Math.random() - 0.5);
      input.rankingOrder = sorted.map(o => o.id);
      console.log(`   -> ranked: [${sorted.map(o => o.option_label).join(' > ')}]`);
      break;
    }
    case 'scale': {
      // lean high (4-5) for the persona trait, mid-random otherwise
      const value = targetTrait ? 4 + Math.round(Math.random()) : 1 + Math.floor(Math.random() * 5);
      input.scaleValue = value;
      console.log(`   -> scale: ${value}`);
      break;
    }
    default:
      throw new Error(`Unhandled question type in test script: ${question.question_type}`);
  }

  return QuizAttemptService.submitAnswer(input);
}

async function run() {
  const personaArg = process.argv[2] ?? 'analytical';
  const targetTrait = PERSONAS[personaArg];
  if (targetTrait === undefined) {
    console.error(`Unknown persona "${personaArg}". Options: ${Object.keys(PERSONAS).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n=== Running mock quiz attempt (persona: ${personaArg}) ===\n`);

  await ensureTestUser();

  const startResult = await QuizAttemptService.startAttempt(TEST_USER_ID);
  const attempt = startResult.attempt;
  let firstQuestion = startResult.question;
  if (!firstQuestion && startResult.resumedQuestionId) {
    firstQuestion = await QuizQuestion.findById(startResult.resumedQuestionId);
  }

  console.log(`Started attempt ${attempt.id}\n`);

  let questionCount = 0;
  let result: any = { done: false, nextQuestion: firstQuestion };

  // let the engine drive the questions (Pool A, then adaptive)
  while (result.nextQuestion && !result.done) {
    questionCount++;
    const q = result.nextQuestion;
    console.log(`Q${questionCount} [${q.pool}/${q.question_type}]: ${q.question_text}`);
    result = await answerQuestion(attempt.id, q, targetTrait);

    if (questionCount > 25) {
      console.error('\n!! Exceeded 25 questions without stopping -- likely a bug in shouldStopQuiz or pickNextQuestion.');
      break;
    }
  }

  console.log(`\n=== Finished after ${questionCount} questions ===\n`);

  const finalAttempt = await QuizAttempt.findById(attempt.id);
  console.log('Confidence breakdown:', {
    coverage: finalAttempt.coverage,
    consistency: finalAttempt.consistency,
    separation: finalAttempt.separation,
    confidence: finalAttempt.confidence
  });

  console.log('\nTop trait scores (raw):');
  const sortedTraits = Object.entries(finalAttempt.trait_scores_raw as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  console.table(sortedTraits.map(([code, score]) => ({ trait: code, score: Math.round(score * 100) / 100 })));

  if (result.done && result.results) {
    console.log('\nTop 3 recommended careers:');
    console.table(
      result.results.map((r: any) => ({
        title: r.title,
        matchPercent: r.matchPercent
      }))
    );
  } else {
    console.log('\n!! Quiz did not finish cleanly -- no results returned.');
  }

  await pool.end();
}

run().catch(async (err) => {
  console.error('\n!! Test script failed:', err);
  await pool.end();
  process.exit(1);
});