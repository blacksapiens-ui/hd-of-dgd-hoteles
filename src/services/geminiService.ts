import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let ai: any = null;

if (apiKey && !apiKey.includes('...')) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Failed to initialize Gemini AI", e);
  }
} else {
  console.warn("Gemini API Key is missing or invalid. Chat features will be disabled.");
}

export const sendMessageToGemini = async (message: string, history: { role: string; parts: { text: string }[] }[]): Promise<string> => {
  if (!ai) {
    return "El asistente no está disponible en este momento (API Key faltante).";
  }
  try {
    const chat = ai.chats.create({
      model: 'gemini-1.5-flash', // Updated to a known stable model if 'gemini-3-pro' is not available
      config: {
        systemInstruction: "You are a helpful and professional travel assistant for DGD Hoteles. You assist agents with hotel information, travel tips, and operational questions. Keep responses concise and business-friendly.",
      },
      history: history
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Lo siento, no pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Ocurrió un error al conectar con el asistente. Por favor intente más tarde.";
  }
};