
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import google.generativeai as genai

router = APIRouter()

# Configure GenAI on Server Side
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AnalysisRequest(BaseModel):
    context_data: dict
    prompt_type: str

@router.post("/analyze")
async def analyze_data(request: AnalysisRequest):
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Act as a procurement expert system (Itqan). Analyze the following data JSON:
        {request.context_data}
        
        Task: Provide a concise executive summary in Arabic regarding risks, budget adherence, or anomalies.
        """
        
        response = model.generate_content(prompt)
        return {"text": response.text}
    except Exception as e:
        print(f"AI Error: {e}")
        # Fallback for demo if key is missing or quota exceeded
        return {"text": "النظام يعمل بكفاءة (محاكاة: لم يتم ضبط مفتاح Gemini في السيرفر)."}
