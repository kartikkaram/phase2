import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import { apiError } from "./apiError.js";
dotenv.config();


// Replace these with your actual API keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;





const sendToGemini = async (prompt) => {

  try {

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY});

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text  || "Gemini failed to respond.";

  } catch (error) {
    console.error("Gemini API error:", error?.response?.data || error.message);
    throw new apiError(404, "no response recieved from gemini")
  }
};




export { sendToGemini };

