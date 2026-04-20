import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Hawkeye, an expert Solidity smart contract security auditor with deep knowledge of EVM vulnerabilities, DeFi attack vectors, and Solidity best practices.

Analyze the provided Solidity code and return a structured JSON security audit report. Be thorough, precise, and actionable.

IMPORTANT: Return ONLY valid JSON — no markdown, no code fences, no preamble. The JSON must match this exact schema:

{
  "riskScore": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "contractName": "string (extracted from contract keyword, or 'Unknown')",
  "summary": "2-3 sentence executive summary of the overall security posture",
  "findings": [
    {
      "id": "F1",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "title": "Short vulnerability title",
      "lines": [array of affected line numbers, empty array if N/A],
      "description": "Clear explanation of the vulnerability and its impact",
      "remediation": "Specific, actionable fix with code example if helpful",
      "category": "e.g. Reentrancy, Access Control, Integer Overflow, etc.",
      "cweId": "CWE-XXX if applicable, else omit"
    }
  ],
  "gasOptimizations": ["Optional array of 1-3 gas optimization suggestions"],
  "timestamp": "ISO 8601 timestamp"
}

Severity guidelines:
- CRITICAL: Funds can be stolen or contract destroyed (reentrancy, unchecked calls, selfdestruct)
- HIGH: Significant security risk (access control bypass, integer overflow, front-running)
- MEDIUM: Moderate risk requiring specific conditions (missing input validation, denial of service)
- LOW: Minor risk or best practice violations (outdated compiler, event missing)
- INFO: Code quality, style, gas optimizations

If the code has no issues, return an empty findings array with riskScore "SAFE".
If the input is not valid Solidity, set riskScore to "INFO" and explain in a finding.`;

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    if (code.trim().length < 10) {
      return NextResponse.json({ error: "Code too short to analyze" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Audit this Solidity contract:\n\n\`\`\`solidity\n${code}\n\`\`\`\n\nProvide the complete security audit as JSON.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Strip any accidental markdown fences
    const raw = content.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(raw);

    // Ensure timestamp
    if (!result.timestamp) {
      result.timestamp = new Date().toISOString();
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Audit error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Audit failed. Please check your API key and try again." },
      { status: 500 }
    );
  }
}
