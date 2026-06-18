import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.post("/api/estimate", async (req, res) => {
    try {
      const { propertyDetails } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Act as a real estate pricing AI for Lagos, Nigeria. The user will provide property details. Give a realistic estimated rent range in NGN per year, a short 2-sentence market analysis, and a confidence score out of 100%. Return only a JSON object matching this structure: {"estimatedRange": "₦X,XXX,XXX - ₦Y,YYY,YYY", "analysis": "...", "confidence": 85}. Details: ${propertyDetails}`,
        config: {
          responseMimeType: "application/json",
        }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error(error);
      const isQuota = error.status === 429 || error.message?.includes('429');
      res.status(isQuota ? 429 : 500).json({ error: isQuota ? "I'm currently receiving too many requests. Please try again in a few seconds." : error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: message,
        config: {
          systemInstruction: `You are an AI assistant for TenTrust, a real estate platform connecting verified tenants and landlords in Lagos, Nigeria. 
          CRITICAL INSTRUCTION: You must strictly ONLY answer questions related to real estate, property information, renting, and the TenTrust platform solutions. 
          If a user asks about any other topic (e.g. programming, weather, general knowledge), politely decline and state that you can only help with real estate and TenTrust.
          Use this context about properties and the platform: ${context}.
          Be helpful and keep answers concise.`,
        }
      });
      res.json({ reply: response.text });
    } catch (error: any) {
      console.error(error);
      const isQuota = error.status === 429 || error.message?.includes('429');
      res.status(isQuota ? 429 : 500).json({ error: isQuota ? "I'm currently receiving too many requests. Please try again in a few seconds." : error.message });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Notice Express version in prompt says to use * for v4 and *all for v5
    // Actually the package.json has express ^4.22.2 so * is fine. Let's use *
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
