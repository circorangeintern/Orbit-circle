import dotenv from 'dotenv';
dotenv.config();

import { QuizNlpService } from '../services/quizNlpService';
import { calculateRequiredPoolAQuestions } from '../utils/quizConfidence.util';

// 1. Defined Test Cases
const testCases = [
  {
    name: 'Case 1: Enthusiastic & Detailed Student (Expected: High Confidence -> 0 Pool A)',
    responses: [
      'I build web apps, play competitive strategy games, and love troubleshooting broken code for my friends.',
      'I would spend the entire day writing TypeScript, automating tasks, and designing system architecture.',
      'People come to me whenever their laptops break, or when they need complex technical math concepts explained simply.'
    ]
  },
  {
    name: 'Case 2: Short & Generic Answers (Expected: Moderate Confidence -> 2 or 4 Pool A)',
    responses: [
      'I like playing video games and watching videos.',
      'Chilling out, maybe hanging with friends.',
      'They say I am good at listening.'
    ]
  },
  {
    name: 'Case 3: Silly / Low Effort / Trolling (Expected: Low Confidence -> 7 Pool A)',
    responses: [
      'gaming and memes lol',
      'idk bro sleeping all day',
      'lol nothing'
    ]
  },
  {
    name: 'Case 4: Mixed Flow (Screen 1 Answered -> Screen 2 Skipped -> Screen 3 Detailed)',
    responses: [
      'I enjoy drawing digital illustrations, painting, and editing video clips.',
      null, // Indicates skipped turn
      'People ask me to design logos, posters, and help organize event decorations.'
    ]
  }
];

// 2. Execution Loop
async function runNlpTests() {
  console.log('====================================================');
  console.log('       STARTING GEMINI NLP FLOW TEST SUITE          ');
  console.log('====================================================\n');

  for (const test of testCases) {
    console.log(`----------------------------------------------------`);
    console.log(`RUNNING: ${test.name}`);
    console.log(`----------------------------------------------------`);

    let accumulatedScores: Record<string, number> = {};
    let totalConfidence = 0;
    let validTurnsCount = 0;

    for (let turn = 0; turn < test.responses.length; turn++) {
      const screenIndex = turn + 1;
      const userText = test.responses[turn];

      console.log(`\n--- Screen ${screenIndex} ---`);

      if (!userText) {
        console.log(`[USER CLICKED SKIP]`);
        continue; // Skip Gemini API call
      }

      console.log(`User Input: "${userText}"`);

      try {
        // Send request to live Gemini Flash API
        const result = await QuizNlpService.processFreeText(userText, screenIndex);

        // Accumulate traits
        for (const item of result.extracted_traits) {
          accumulatedScores[item.trait] = (accumulatedScores[item.trait] || 0) + item.intensity;
        }

        totalConfidence += result.confidence_score;
        validTurnsCount++;

        console.log(`Gemini Feedback: "${result.feedback_message}"`);
        console.log(`Confidence Score: ${result.confidence_score}/100`);
        console.log(`Extracted Traits:`, result.extracted_traits);

      } catch (err: any) {
        console.error(`API Error on Screen ${screenIndex}:`, err.message);
      }
    }

    // Evaluate final transition logic after Screen 3
    const avgConfidence = validTurnsCount > 0 ? Math.round(totalConfidence / validTurnsCount) : 0;
    const requiredPoolA = calculateRequiredPoolAQuestions(avgConfidence);

    console.log(`\n🎉 DISCOVERY PHASE SUMMARY FOR THIS CASE:`);
    console.log(`- Final Average Confidence: ${avgConfidence}/100`);
    console.log(`- Required Pool A Questions Fallback: ${requiredPoolA}`);
    console.log(`- Accumulated Trait Dictionary:`, accumulatedScores);
    console.log(`\n`);
  }

  console.log('====================================================');
  console.log('            ALL TEST CASES COMPLETED                ');
  console.log('====================================================');
}

runNlpTests();