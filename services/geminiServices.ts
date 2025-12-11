
import { GoogleGenAI, Type } from "@google/genai";

// Safely access API key to prevent 'process is not defined' errors in browser environments
const getApiKey = () => {
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("process.env access failed");
  }
  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const suggestProductConcept = async (productName: string, category: string): Promise<{ concept: string; colourScheme: string }> => {
  if (!productName) return { concept: "Please enter a product name first.", colourScheme: "N/A" };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a short, professional product concept and a matching colour scheme description for a product named "${productName}" in the category "${category}". Keep the concept under 20 words and colour scheme under 10 words.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            colourScheme: { type: Type.STRING },
          },
          required: ["concept", "colourScheme"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Suggestion Error:", error);
    return { concept: "Failed to generate suggestion.", colourScheme: "N/A" };
  }
};
