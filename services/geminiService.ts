
// This now calls our Backend API instead of Google directly
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export const getProcurementInsight = async (data: any) => {
  try {
    const userStr = sessionStorage.getItem('proc_user');
    const token = userStr ? JSON.parse(userStr).access_token : null;
    
    const response = await fetch(`${API_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            data: data.data || data,
            context: data.context || "General Analysis"
        })
    });

    if (!response.ok) return "Service Unavailable";
    const res = await response.json();
    return res.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "تعذر الحصول على تحليل ذكي حالياً.";
  }
};
