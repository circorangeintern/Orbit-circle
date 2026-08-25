// services/quizNlpService.ts
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const VALID_TRAITS = [
  'AN', 'CR', 'HL', 'LD', 'CM', 'PR', 'SC', 'BS', 
  'LG', 'VL', 'EM', 'AD', 'OR', 'CI', 'DS', 'IN', 
  'CO', 'RP', 'DT', 'SP', 'PA', 'WF'
];

export interface NlpExtractionOutput {
  extracted_traits: Array<{ trait: string; intensity: number }>;
  feedback_message: string;
  confidence_score: number; // 0 to 100
}

export class QuizNlpService {
  // Lazy-load client to prevent instantiation before environment variables load
  private static getAiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    return new GoogleGenAI({ apiKey });
  }

  static async processFreeText(userText: string, screenIndex: number): Promise<NlpExtractionOutput> {
    const ai = this.getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userText,
      config: {
        systemInstruction: `You are analyzing Screen ${screenIndex} of 3 in a career assessment.
Analyze the user's free-text response and extract dominant traits using ONLY these codes:
${VALID_TRAITS.join(', ')}

Evaluation Rules:
1. Extract 2 to 4 dominant traits max per screen (intensity +1 to +5). Sum <= 12.
2. Calculate a "confidence_score" between 0 and 100 assessing context quality:
   - 80-100: Meaningful, clear detail about habits, passions, or skills.
   - 50-79: Brief or slightly vague answer, but gives some usable context.
   - 30-49: Highly generic or minimal answer (e.g., "I like stuff", "nothing much").
   - 0-29: Unusable, non-answers, or spam (e.g., "lol", "asdfgh", "no").
3. Provide a 1-sentence feedback message acknowledging their input.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extracted_traits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trait: { type: Type.STRING },
                  intensity: { type: Type.NUMBER }
                },
                required: ['trait', 'intensity']
              }
            },
            feedback_message: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER }
          },
          required: ['extracted_traits', 'feedback_message', 'confidence_score']
        }
      }
    });

    if (!response.text) {
      throw new Error('Failed to retrieve structured output from Gemini API');
    }

    return JSON.parse(response.text) as NlpExtractionOutput;
  }
}