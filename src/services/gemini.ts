import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function summarizeNotes(content: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              text: `Please summarize the following notes/document. 
              Provide a concise summary with key takeaways, bullet points, and a brief conclusion.
              Use clear headings and maintain a professional tone.
              
              CONTENT:
              ${content}`
            }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error summarizing notes:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
}
