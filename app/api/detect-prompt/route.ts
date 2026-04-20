import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert AI image prompt engineer with deep knowledge of Midjourney, DALL-E 3, and Stable Diffusion. Your job is to reverse-engineer images and generate prompts that would reproduce them as closely as possible in each tool.

Analyse every visual detail of the image:
- Subject matter and composition
- Art style (photorealistic, illustration, oil painting, anime, etc.)
- Lighting (golden hour, studio, dramatic, soft, neon, etc.)
- Color palette and mood
- Camera perspective and depth of field
- Textures and materials
- Background and environment
- Any notable techniques or effects

Then generate three optimised prompts — one for each tool — following their specific syntax and best practices.

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences:
{
  "analysis": "2-3 sentence description of what you see in the image",
  "style": "One-word or short phrase describing the dominant style",
  "mood": "One-word or short phrase for the mood",
  "dominantColors": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
  "prompts": {
    "midjourney": {
      "prompt": "detailed prompt text here",
      "parameters": "--ar 16:9 --v 6.1 --style raw",
      "tips": "One specific tip for Midjourney"
    },
    "dalle": {
      "prompt": "detailed prompt text here",
      "tips": "One specific tip for DALL-E 3"
    },
    "stableDiffusion": {
      "prompt": "detailed prompt text here",
      "negativePrompt": "blurry, bad anatomy, worst quality, low quality, ugly, deformed",
      "tips": "One specific tip for Stable Diffusion"
    }
  }
}

Midjourney prompt style: descriptive, comma-separated, vivid adjectives, artist references if relevant
DALL-E 3 prompt style: natural language sentences, descriptive paragraphs work better than comma lists
Stable Diffusion prompt style: weighted keywords with (parentheses), detailed technical descriptors`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large. Maximum size is 5MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: "Analyse this image and generate optimised prompts for Midjourney, DALL-E 3, and Stable Diffusion that would reproduce it as closely as possible.",
          },
        ],
      }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response");

    const raw = content.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(raw);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Prompt detection error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Failed to parse response. Try again." }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to analyse image. Please try again." }, { status: 500 });
  }
}