import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize Gemini client on the server-side with required User-Agent
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined in the environment. AI reflections will be disabled or fall back to static text.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini client:", error);
}

// API endpoint to generate Tafsir, background context, and spiritual reflection
app.post("/api/reflect", async (req, res) => {
  const { surahName, surahNumber, ayahNumber, arabicText, englishTranslation, translationEdition } = req.body;

  if (!arabicText || !englishTranslation) {
    return res.status(400).json({ error: "Arabic text and English translation are required." });
  }

  if (!ai) {
    return res.status(503).json({ 
      error: "AI reflection service is currently unavailable.",
      fallback: true
    });
  }

  try {
    const prompt = `
You are a highly respectful, knowledgeable, and objective Quran scholar and spiritual companion.
Analyze the following Quranic verse (Ayah) and generate historical context, brief Tafsir (scholarly explanation), and an uplifting practical reflection for daily life.

---
Surah: ${surahName || "Unknown"} (Chapter ${surahNumber || "Unknown"}), Ayah: ${ayahNumber || "Unknown"}
Arabic Text: "${arabicText}"
English Translation (${translationEdition || "Sahih International"}): "${englishTranslation}"
---

Please generate:
1. Historical context / background: Where and why was this Surah or Ayah revealed?
2. Brief Tafsir / Explanation: A clear, easy-to-understand explanation of key terms, theological concepts, or core message.
3. Daily Reflection / Spiritual Insight: A beautiful, non-preachy, practical application or moral lesson for modern daily life.
4. Keywords: 3-4 simple tag words representing the core themes of the verse (e.g. Faith, Patience, Gratitude, Hope).

You must output valid JSON matching the requested schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a scholarly, reverent, and objective Quran Companion. Output brief, highly readable, respectful summaries in JSON. Do not include any preaching or personal bias.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            context: {
              type: Type.STRING,
              description: "Short 1-2 sentence background or historical context of this verse or its Surah.",
            },
            reflection: {
              type: Type.STRING,
              description: "A beautiful, deep, respectful 2-3 sentence spiritual lesson or practical life application for daily reflection.",
            },
            explanation: {
              type: Type.STRING,
              description: "A brief, clear, respectful Tafsir or explanation of key terms, concepts, or themes in the verse.",
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "3-4 relevant spiritual tags or categories representing the core themes of the verse (e.g. Faith, Patience, Gratitude).",
            }
          },
          required: ["context", "reflection", "explanation", "keywords"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini.");
    }

    const reflectionData = JSON.parse(resultText.trim());
    return res.json(reflectionData);

  } catch (error: any) {
    console.error("Gemini analysis failed:", error);
    return res.status(500).json({ 
      error: "Failed to generate reflection from Gemini.",
      details: error.message || error,
      fallback: true
    });
  }
});

// Setup Vite Dev Server / Static File Serving
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Serve index.html for all SPA routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start the Express + Vite server:", err);
});
