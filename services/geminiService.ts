import { GoogleGenAI } from "@google/genai";
import { MODELS } from "../types";

// This class handles API keys dynamically passed from the UI
export class GeminiService {
  private apiKey: string;
  private preferredModel: string;

  constructor(apiKey: string, preferredModel: string = MODELS[0]) {
    this.apiKey = apiKey;
    this.preferredModel = preferredModel;
  }

  private async callModelWithFallback(
    prompt: string,
    modelIndex: number = -1,
    systemInstruction?: string
  ): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error("API Key is missing");
    }

    // Use preferredModel for the first call (modelIndex === -1)
    const modelName = modelIndex === -1 ? this.preferredModel : MODELS[modelIndex];

    // Calculate next fallback index
    let nextIndex = -1;
    if (modelIndex === -1) {
      // Find index of preferred model to know where to go next
      const currentIndex = MODELS.indexOf(this.preferredModel);
      nextIndex = currentIndex + 1;
    } else {
      nextIndex = modelIndex + 1;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          // Low temperature for more deterministic/factual educational content
          temperature: 0.3,
        }
      });

      return response.text || null;

    } catch (error: any) {
      console.error(`Error calling ${modelName}:`, error);

      // Check for 429 (Resource Exhausted) or 503 (Service Unavailable)
      const isTransientError = error.message?.includes('429') || error.message?.includes('503');

      if (isTransientError && nextIndex > 0 && nextIndex < MODELS.length) {
        console.log(`Falling back to ${MODELS[nextIndex]}...`);
        return this.callModelWithFallback(prompt, nextIndex, systemInstruction);
      }

      throw error;
    }
  }

  async getTutorHelp(question: string, context: string): Promise<string> {
    const prompt = `
      Context Passage:
      ${context}

      Student Question: ${question}

      You are a helpful and encouraging English Tutor for Grade 10 students. 
      Answer the student's question based ONLY on the context provided.
      Keep your answer simple, clear, and encouraging. Use emojis occasionally.
      If the answer isn't in the text, say so politely.
    `;

    const response = await this.callModelWithFallback(prompt, -1, "You are a helpful English tutor.");
    return response || "I'm sorry, I couldn't generate a response at the moment. Please check your connection or API key.";
  }

  async generateQuiz(topic: string): Promise<string | null> {
    const prompt = `
      Create a short reading passage (about 150 words) suitable for Grade 10 English students about the topic: "${topic}" related to "New Ways to Learn" (e.g., online learning, blended learning, educational apps).
      
      Then create 3 questions based on this passage:
      1. One True/False question.
      2. Two Multiple Choice questions (4 options A,B,C,D).

      Return the result in strictly valid JSON format with this schema:
      {
        "title": "Title of passage",
        "content": "Full text content...",
        "questions": [
          {
            "text": "Question text",
            "type": "TRUE_FALSE" or "MULTIPLE_CHOICE",
            "options": [{"id": "A", "text": "Option text"}],
            "correctAnswerId": "A" or "true",
            "explanation": "Why this is correct",
            "difficulty": "medium"
          }
        ]
      }
      DO NOT add markdown formatting (like \`\`\`json) around the response. Just the raw JSON string.
    `;

    try {
      const response = await this.callModelWithFallback(prompt);
      // Clean up potential markdown code blocks if the model ignores the instruction
      const cleaned = response?.replace(/```json/g, '').replace(/```/g, '').trim();
      return cleaned || null;
    } catch (e) {
      console.error("Failed to generate quiz", e);
      throw e;
    }
  }
}
