import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are an expert AI video prompt engineer with deep knowledge of Runway Gen-3, Pika Labs, and Sora. Your job is to reverse-engineer videos and generate prompts that would reproduce them as closely as possible in each tool.

Analyse every visual detail of the video:
- Subject matter and main action/movement
- Visual style (cinematic, animated, documentary, abstract, etc.)
- Camera movement (static, pan, zoom, dolly, handheld, drone, etc.)
- Lighting and color grading
- Mood and atmosphere
- Pacing and timing
- Scene transitions if any
- Background and environment
- Any notable visual effects or techniques

Then generate three optimised prompts — one for each tool — following their specific syntax and best practices.

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences:
{
  "analysis": "2-3 sentence description of what happens in the video",
  "style": "Short phrase describing the dominant visual style",
  "mood": "Short phrase for the mood/atmosphere",
  "cameraMovement": "Describe the camera movement",
  "dominantColors": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
  "prompts": {
    "runway": {
      "prompt": "detailed prompt text optimised for Runway Gen-3",
      "tips": "One specific tip for Runway Gen-3"
    },
    "pika": {
      "prompt": "detailed prompt text optimised for Pika Labs",
      "parameters": "-ar 16:9 -motion 2",
      "tips": "One specific tip for Pika Labs"
    },
    "sora": {
      "prompt": "detailed prompt text optimised for Sora",
      "tips": "One specific tip for Sora"
    }
  }
}

Runway prompt style: cinematic language, camera direction terms, lighting descriptions, motion descriptors
Pika prompt style: concise action descriptions, style keywords, motion intensity
Sora prompt style: detailed scene descriptions in natural language, physics-aware descriptions`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    const validTypes = ["video/mp4", "video/webm", "video/mov", "video/quicktime", "video/mpeg"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mpeg)$/i)) {
      return NextResponse.json({ error: "Invalid file type. Use MP4, WebM, or MOV." }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Video too large. Maximum size is 50MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = (file.type || "video/mp4") as string;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      SYSTEM_PROMPT + "\n\nAnalyse this video and generate optimised prompts for Runway Gen-3, Pika Labs, and Sora that would reproduce it as closely as possible.",
    ]);

    const text = result.response.text();
    const raw = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Video prompt detection error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Failed to parse response. Try again." }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to analyse video. Please try again." }, { status: 500 });
  }
}