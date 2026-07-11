import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // ignore
      }
    }
    const { propertyDetails } = body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Act as a real estate pricing AI for Lagos, Nigeria. The user will provide property details. Give a realistic estimated rent range in NGN per year, a short 2-sentence market analysis, and a confidence score out of 100%. Return only a JSON object matching this structure: {"estimatedRange": "₦X,XXX,XXX - ₦Y,YYY,YYY", "analysis": "...", "confidence": 85}. Details: ${propertyDetails}`,
      config: {
        responseMimeType: "application/json",
      }
    });
    res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
