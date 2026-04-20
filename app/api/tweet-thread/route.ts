import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a blockchain security educator who explains smart contract vulnerabilities in simple, engaging Twitter/X threads. Your audience is developers and crypto enthusiasts who want to learn — not necessarily security experts.

Write threads that:
- Start with a hook tweet that grabs attention
- Explain each finding simply — no jargon, use analogies
- Use real-world comparisons (e.g. "it's like leaving your front door unlocked")
- End with a summary and call to action
- Keep each tweet under 270 characters (leave room for the numbering)
- Use line breaks within tweets for readability
- Add relevant emojis sparingly (1-2 per tweet max)

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences:
{
  "title": "Short thread title",
  "tweets": [
    { "number": 1, "text": "tweet text here" },
    { "number": 2, "text": "tweet text here" }
  ],
  "totalTweets": 8
}

Thread structure:
- Tweet 1: Hook — what contract was audited and the headline risk
- Tweets 2-N: One tweet per major finding (Critical/High), explained simply
- Tweet N+1: Medium/Low findings summarized briefly  
- Tweet N+2: Key lessons — what developers should always do
- Last tweet: Summary + "Audited by @HawkeyeSecurity 🦅"

Aim for 6-10 tweets total. Never exceed 270 characters per tweet.`;

export async function POST(req: NextRequest) {
  try {
    const { contractName, riskScore, summary, findings, gasOptimizations } = await req.json();

    if (!contractName || !findings) {
      return NextResponse.json({ error: "Missing audit data" }, { status: 400 });
    }

    const findingsSummary = findings
      .map((f: any) => `[${f.severity}] ${f.title}: ${f.description}`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Generate an educational Twitter thread about this smart contract audit:

Contract: ${contractName}
Risk Level: ${riskScore}
Summary: ${summary}

Findings:
${findingsSummary}

${gasOptimizations?.length ? `Gas Issues: ${gasOptimizations.join(", ")}` : ""}

Write a thread that teaches developers what went wrong and how to avoid it.`,
      }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response");

    const raw = content.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(raw);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Thread error:", err);
    return NextResponse.json({ error: "Failed to generate thread" }, { status: 500 });
  }
}