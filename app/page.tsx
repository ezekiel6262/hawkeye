"use client";

import { useState, useRef, useCallback } from "react";
import { Shield, Play, ChevronDown, Loader2, X, Zap, Eye } from "lucide-react";
import HawkeyeLogo from "./components/HawkeyeLogo";
import AuditReport from "./components/AuditReport";
import { SAMPLE_CONTRACTS } from "./components/samples";
import { AuditResult } from "./types";

type AppState = "idle" | "scanning" | "done" | "error";

const PLACEHOLDER = `// Paste your Solidity contract here
// or load a sample from the dropdown above

pragma solidity ^0.8.0;

contract YourContract {
    // ...
}`;

export default function Home() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [showSamples, setShowSamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runAudit = useCallback(async () => {
    if (!code.trim()) { setError("Paste a Solidity contract first."); return; }
    setState("scanning"); setError(""); setResult(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data); setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setState("error");
    }
  }, [code]);

  const loadSample = (sample: (typeof SAMPLE_CONTRACTS)[0]) => {
    setCode(sample.code); setShowSamples(false);
    setState("idle"); setResult(null); setError("");
    textareaRef.current?.focus();
  };

  const clearAll = () => { setCode(""); setState("idle"); setResult(null); setError(""); };
  const lineCount = code ? code.split("\n").length : 0;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="shrink-0 border-b border-border bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HawkeyeLogo size={28} />
            <div>
              <span className="text-base font-bold tracking-tight text-text-primary" style={{ fontFamily: "'Syne', sans-serif" }}>
                Hawkeye
              </span>
              <span className="ml-2 text-xs text-text-muted hidden sm:inline">AI Smart Contract Auditor</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted border border-border rounded px-2.5 py-1">
            <Zap size={11} className="text-hawk-primary" />
            <span>Powered by Claude</span>
          </div>
        </div>
      </header>

      <div className="shrink-0 border-b border-border bg-bg-secondary">
        <div className="max-w-[1400px] mx-auto px-5 py-5 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Spot vulnerabilities <span className="text-hawk-primary">others miss.</span>
            </h1>
            <p className="text-sm text-text-muted mt-0.5">Paste any Solidity contract. Get a structured CVE-style security report in seconds.</p>
          </div>
          <div className="hidden md:flex items-center gap-6 shrink-0">
            {[{ label: "Vulnerability Classes", value: "40+" }, { label: "Avg Audit Time", value: "~8s" }, { label: "Severity Levels", value: "5" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold text-hawk-primary" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
                <div className="text-[11px] text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-5 py-5">
        <div className="flex gap-5 h-[calc(100vh-220px)] min-h-[500px]">
          <div className="flex flex-col w-[48%] min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setShowSamples(!showSamples)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-text-secondary border border-border hover:border-border-bright hover:text-text-primary transition-all">
                    <Eye size={11} /> Load sample <ChevronDown size={11} className={showSamples ? "rotate-180 transition-transform" : "transition-transform"} />
                  </button>
                  {showSamples && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-bg-card border border-border rounded-lg shadow-card overflow-hidden z-30">
                      {SAMPLE_CONTRACTS.map((s) => (
                        <button key={s.label} onClick={() => loadSample(s)} className="w-full text-left px-3 py-2.5 text-xs text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors border-b border-border last:border-0">{s.label}</button>
                      ))}
                    </div>
                  )}
                </div>
                {code && (
                  <button onClick={clearAll} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-text-muted hover:text-text-secondary border border-border hover:border-border-bright transition-all">
                    <X size={11} /> Clear
                  </button>
                )}
              </div>
              {lineCount > 0 && <span className="text-xs text-text-muted">{lineCount} line{lineCount !== 1 ? "s" : ""}</span>}
            </div>

            <div className="flex-1 relative rounded-lg border border-border bg-bg-card overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-bg-secondary border-r border-border flex flex-col pt-4 overflow-hidden select-none" aria-hidden="true">
                {(code || PLACEHOLDER).split("\n").map((_, i) => (
                  <div key={i} className="text-right pr-2.5 text-[11px] leading-[1.7] text-text-muted" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={PLACEHOLDER}
                className="code-input absolute inset-0 w-full h-full bg-transparent text-text-code pl-14 pr-4 pt-4 pb-4 placeholder-text-muted/30"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
              />
              {state === "scanning" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                  <div className="scan-line" />
                  <div className="absolute inset-0 bg-hawk-glow/5 animate-pulse rounded-lg" />
                </div>
              )}
            </div>

            <button
              onClick={runAudit}
              disabled={state === "scanning" || !code.trim()}
              className={`mt-3 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-sm transition-all ${
                state === "scanning"
                  ? "bg-hawk-primary/20 text-hawk-primary cursor-not-allowed border border-hawk-muted"
                  : code.trim()
                  ? "bg-hawk-primary text-bg-primary hover:bg-hawk-secondary active:scale-[0.99] shadow-hawk"
                  : "bg-bg-tertiary text-text-muted border border-border cursor-not-allowed"
              }`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {state === "scanning" ? (<><Loader2 size={15} className="animate-spin" />Scanning contract...</>) : (<><Play size={15} />Run Audit</>)}
            </button>
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2 mb-2 h-[30px]">
              <Shield size={13} className="text-text-muted" />
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Audit Report</span>
              {state === "done" && result && (
                <span className="ml-auto text-xs text-text-muted">{result.findings.length} finding{result.findings.length !== 1 ? "s" : ""}</span>
              )}
            </div>

            <div className="flex-1 rounded-lg border border-border bg-bg-card overflow-hidden">
              <div className="h-full overflow-y-auto p-4">
                {state === "idle" && (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                    <div className="opacity-30"><HawkeyeLogo size={48} /></div>
                    <div>
                      <p className="text-sm text-text-muted">Ready to scan</p>
                      <p className="text-xs text-text-muted/60 mt-1">Paste a Solidity contract and hit Run Audit</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-text-muted max-w-xs">
                      {["Reentrancy attacks", "Integer overflow", "Access control", "Unchecked calls", "Flash loan vectors", "Gas optimizations"].map((item) => (
                        <div key={item} className="flex items-center gap-1.5 bg-bg-tertiary rounded px-2 py-1.5">
                          <div className="w-1 h-1 rounded-full bg-hawk-muted shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {state === "scanning" && (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <HawkeyeLogo size={40} />
                    <div className="text-center">
                      <p className="text-sm text-hawk-primary font-medium">Analyzing contract...</p>
                      <p className="text-xs text-text-muted mt-1">Running security checks</p>
                    </div>
                    <div className="flex gap-1.5">
                      {[0,1,2,3,4].map((i) => (<div key={i} className="w-1.5 h-1.5 rounded-full bg-hawk-muted animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />))}
                    </div>
                    <div className="text-xs text-text-muted space-y-1 text-center">
                      {["Checking reentrancy patterns...", "Scanning access control...", "Validating integer arithmetic..."].map((msg, i) => (
                        <p key={msg} className="animate-pulse" style={{ animationDelay: `${i * 600}ms` }}>{msg}</p>
                      ))}
                    </div>
                  </div>
                )}
                {state === "error" && (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-severity-critical-bg border border-severity-critical-border flex items-center justify-center">
                      <X size={18} className="text-severity-critical" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-severity-critical font-medium">Audit failed</p>
                      <p className="text-xs text-text-muted mt-1 max-w-xs">{error}</p>
                    </div>
                    <button onClick={runAudit} className="text-xs text-hawk-primary hover:text-hawk-secondary underline">Try again</button>
                  </div>
                )}
                {state === "done" && result && <AuditReport result={result} />}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 border-t border-border py-3 px-5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-xs text-text-muted">
          <span>Hawkeye · AI-powered contract security</span>
          <span>Not a substitute for a professional audit</span>
        </div>
      </footer>
    </div>
  );
}
