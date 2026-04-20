import { NextRequest, NextResponse } from "next/server";

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  base:     8453,
  polygon:  137,
  arbitrum: 42161,
  optimism: 10,
  bsc:      56,
};

export async function POST(req: NextRequest) {
  try {
    const { address, chain = "ethereum" } = await req.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "No address provided" }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      return NextResponse.json({ error: "Invalid contract address format" }, { status: 400 });
    }

    const chainId = CHAIN_IDS[chain];
if (!chainId) {
  return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
}

    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Etherscan API key not configured" }, { status: 500 });
    }

    const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${address.trim()}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "1" || !data.result?.[0]) {
      return NextResponse.json({ error: "Contract not found or not verified on this chain" }, { status: 404 });
    }

    const result = data.result[0];

    if (!result.SourceCode || result.SourceCode === "") {
      return NextResponse.json({ error: "Contract source code is not verified on Etherscan" }, { status: 404 });
    }

    // Handle multi-file contracts (Etherscan wraps them in {{ }})
    let sourceCode = result.SourceCode;
    if (sourceCode.startsWith("{{")) {
      try {
        const parsed = JSON.parse(sourceCode.slice(1, -1));
        // Flatten all files into one string with file headers
        sourceCode = Object.entries(parsed.sources || {})
          .map(([filename, content]: [string, any]) =>
            `// File: ${filename}\n${content.content}`
          )
          .join("\n\n");
      } catch {
        // If parsing fails, use raw source
      }
    } else if (sourceCode.startsWith("{")) {
      try {
        const parsed = JSON.parse(sourceCode);
        sourceCode = Object.entries(parsed.sources || {})
          .map(([filename, content]: [string, any]) =>
            `// File: ${filename}\n${content.content}`
          )
          .join("\n\n");
      } catch {
        // Use raw source as fallback
      }
    }

    return NextResponse.json({
      contractName: result.ContractName || "Unknown",
      sourceCode,
      compiler:     result.CompilerVersion || "Unknown",
      chain,
      address:      address.trim(),
      optimization: result.OptimizationUsed === "1",
      runs:         result.Runs || "0",
      proxy:        result.Proxy === "1",
      implementation: result.Implementation || null,
    });

  } catch (err) {
    console.error("Fetch contract error:", err);
    return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 });
  }
}