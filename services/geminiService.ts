import { GoogleGenAI, Type } from "@google/genai";
import { FlirtyResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = 'gemini-2.5-flash';

export const getFlirtyComment = async (
  equation: string,
  result: string
): Promise<FlirtyResponse> => {
  if (!apiKey) {
    return {
      message: "I need an API key to flirt properly! 😉",
      emoji: "🤐"
    };
  }

  try {
    const prompt = `
      The user just calculated this equation: "${equation} = ${result}".
      Act as a flirty, cute, and charming calculator companion.
      Generate a short, witty, and romantic comment connecting the math result to love, dating, or how amazing the user is.
      Keep it PG-13, adorable, and brief (max 1 sentence).
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            emoji: { type: Type.STRING },
          },
          required: ["message", "emoji"],
        },
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as FlirtyResponse;
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("Gemini failed to flirt:", error);
    return {
      message: "You're so hot I forgot how to do math.",
      emoji: "🔥"
    };
  }
};

export const getPickUpLine = async (): Promise<FlirtyResponse> => {
    if (!apiKey) {
        return {
          message: "I'd ask for your number, but I need an API key first.",
          emoji: "😉"
        };
      }
    
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: "Give me a cheesy, cute math-related pick-up line.",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                message: { type: Type.STRING },
                emoji: { type: Type.STRING },
              },
              required: ["message", "emoji"],
            },
          },
        });
    
        if (response.text) {
            return JSON.parse(response.text) as FlirtyResponse;
        }
        throw new Error("No response text");
    
      } catch (error) {
        console.error("Gemini failed to flirt:", error);
        return {
          message: "Are you a 90 degree angle? Because you're looking right.",
          emoji: "📐"
        };
      }
}
