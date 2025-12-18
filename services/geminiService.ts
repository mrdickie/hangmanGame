
import { GoogleGenAI, Type } from "@google/genai";
import { Challenge } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIChallenge = async (): Promise<Challenge> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate a word or short phrase for a hangman game. CRITICAL: No single word in the phrase may exceed 18 characters. The total length of the entire phrase MUST be under 48 characters. Provide a category and a subtle clue.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The word or phrase to guess, uppercase, no single word > 18 chars, total length < 48 chars, no special characters except spaces." },
          category: { type: Type.STRING, description: "A broad category." },
          clue: { type: Type.STRING, description: "A helpful clue." },
        },
        required: ["word", "category", "clue"],
      },
    },
  });

  try {
    const data = JSON.parse(response.text);
    const word = data.word.toUpperCase().trim();
    return {
      word,
      category: data.category,
      clue: data.clue
    };
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return {
      word: "GALAXY",
      category: "Space",
      clue: "A massive system of stars, gas, and dust."
    };
  }
};

export const getSmartHint = async (word: string, guessedLetters: string[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The player is playing Hangman. The word is "${word}". They have guessed: ${guessedLetters.join(", ") || "nothing yet"}. Provide a witty and helpful hint without revealing the letters directly.`,
  });
  return response.text || "Keep thinking!";
};
