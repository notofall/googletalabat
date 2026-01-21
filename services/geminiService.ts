
import { GoogleGenAI } from "@google/genai";

export const getProcurementInsight = async (data: any) => {
  try {
    // Fixed: Always use process.env.API_KEY directly when initializing the SDK
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بناءً على البيانات التالية لنظام المشتريات، قدم تحليلاً مختصراً بالعربية عن أداء المشتريات أو أي تنبيهات لمخاطر تجاوز الميزانية: ${JSON.stringify(data)}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Property .text is used correctly here
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "تعذر الحصول على تحليل ذكي حالياً.";
  }
};
