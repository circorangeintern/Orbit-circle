import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}
const ai = new GoogleGenAI({ apiKey });

const VALID_TRAITS = [
  'AN', 'CR', 'HL', 'LD', 'CM', 'PR', 'SC', 'BS', 
  'LG', 'VL', 'EM', 'AD', 'OR', 'CI', 'DS', 'IN', 
  'CO', 'RP', 'DT', 'SP', 'PA', 'WF'
];

async function runTest() {
  console.log("Sending discovery prompt to Gemini Flash...");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'I love breaking down complex mathematical problems, finding patterns in data, and figuring out how things work behind the scenes.',
      config: {
        systemInstruction: `You are the CareerMap NLP Extractor. Analyze the user's input.
Map their interests/strengths ONLY to these trait codes: ${VALID_TRAITS.join(', ')}.
Assign an intensity score from +1 to +5 based on adjectives and passion.
Provide a 1-sentence follow-up question targeting unmapped traits.`,
        // Force Gemini to output strictly valid JSON matching your schema
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
                  intensity: { type: Type.NUMBER },
                  justification: { type: Type.STRING }
                },
                required: ['trait', 'intensity']
              }
            },
            follow_up_question: { type: Type.STRING }
          },
          required: ['extracted_traits', 'follow_up_question']
        }
      }
    });

    console.log("\n--- API Call Successful! ---");
    console.log(response.text);
  } catch (error: any) {
    console.error("\n--- API Call Failed ---", error);
  }
}

runTest();