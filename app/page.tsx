"use client";

import { useState, useRef, useCallback } from "react";
import { Play, ChevronDown, Loader2, X, BookOpen, Layers, ShieldAlert, CheckCircle2, Sparkles } from "lucide-react";
import HawkeyeLogo from "./components/HawkeyeLogo";
import AuditReport from "./components/AuditReport";
import { SAMPLE_CONTRACTS } from "./components/samples";
import { AuditResult } from "./types";

type AppState = "idle" | "scanning" | "done" | "error";

const SCAN_STEPS = [
  "Parsing contract structure…",
  "Checking reentrancy patterns…",
  "Scanning access control…",
  "Validating arithmetic safety…",
  "Reviewing external calls…",
  "Compiling findings…",
];

const CAPABILITIES = [
  "Reentrancy attacks",
  "Integer overflow / underflow",
  "Access control bypass",
  "Unchecked return values",
  "Flash loan vectors",
  "Front-running exposure",
  "Gas optimizations",
  "Outdated compiler flags",
];

export default function Home() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [showSamples, setShowSamples] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runAudit = useCallback(async () => {
    if (!code.trim()) return;
    setState("scanning");
    setError("");
    setResult(null);
    setScanStep(0);
    intervalRef.current = setInterval(() => setScanStep(s => (s + 1) % SCAN_STEPS.length), 1600);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
      setState("error");
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [code]);

  const loadSample = (s: typeof SAMPLE_CONTRACTS[0]) => {
    setCode(s.code);
    setShowSamples(false);
    setState("idle");
    setResult(null);
    setError("");
    textareaRef.current?.focus();
  };

  const clear = () => { setCode(""); setState("idle"); setResult(null); setError(""); };
  const lineCount = code ? code.split("\n").length : 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: "#0B1F3A",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HawkeyeLogo size={32} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: "white", letterSpacing: "-0.01em" }}>
                Hawkeye
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, background: "rgba(37,99,168,0.5)", color: "#7EB3D8", border: "1px solid rgba(59,130,196,0.3)", borderRadius: 4, padding: "2px 6px" }}>
                Beta
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {[{ label: "Documentation", icon: <BookOpen size={12} /> }, { label: "Examples", icon: <Layers size={12} /> }].map(item => (
              <a key={item.label} href="#"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
                {item.icon}{item.label}
              </a>
            ))}
          </div>

          {/* GitHub */}
          <a href="https://github.com/ezekiel6262/hawkeye" target="_blank" rel="noopener"
            style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 12px", textDecoration: "none", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ background: "#0B1F3A", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "36px 24px 40px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>

            {/* Headline */}
            <div style={{ maxWidth: 520 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: "rgba(37,99,168,0.3)", color: "#7EB3D8", border: "1px solid rgba(59,130,196,0.25)", marginBottom: 16 }}>
                <Sparkles size={10} />
                AI-powered · Instant analysis
              </div>
              <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 500, color: "white", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 14 }}>
                Smart contract security,{" "}
                <em style={{ color: "#7EB3D8", fontStyle: "italic" }}>redefined.</em>
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                Paste any Solidity contract and receive a structured CVE-style security report with severity ratings, affected lines, and actionable fixes in seconds.
              </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              {[
                { n: "40+",  label: "Vulnerability\nclasses" },
                { n: "<10s", label: "Average\naudit time" },
                { n: "5",    label: "Severity\nlevels" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 20px", textAlign: "center", minWidth: 105 }}>
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: "white", marginBottom: 4 }}>{s.n}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4, whiteSpace: "pre-line" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, maxWidth: 1440, margin: "0 auto", width: "100%", padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 20, height: "calc(100vh - 250px)", minHeight: 560 }}>

          {/* LEFT: editor */}
          <div style={{ display: "flex", flexDirection: "column", width: "46%", minWidth: 0 }}>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowSamples(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#64748B", border: "1px solid #E2E8F0", background: "white", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                    <Layers size={11} />
                    Load sample
                    <ChevronDown size={10} style={{ transform: showSamples ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                  {showSamples && (
                    <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, width: 240, background: "white", borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(11,31,58,0.12)", overflow: "hidden", zIndex: 30 }}>
                      {SAMPLE_CONTRACTS.map((s, i) => (
                        <button key={s.label} onClick={() => loadSample(s)}
                          style={{ width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, color: "#334155", borderBottom: i < SAMPLE_CONTRACTS.length - 1 ? "1px solid #F1F5F9" : "none", background: "transparent", cursor: "pointer", display: "block" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {code && (
                  <button onClick={clear}
                    style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#64748B", border: "1px solid #E2E8F0", background: "white", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                    <X size={11} /> Clear
                  </button>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {lineCount > 0 && (
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#CBD5E1" }}>{lineCount} lines</span>
                )}
                <div style={{ display: "flex", gap: 5 }}>
                  {["#FE5F57", "#FEBC2E", "#2BC840"].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.65 }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Code box */}
            <div style={{
              flex: 1,
              position: "relative",
              borderRadius: 12,
              background: "white",
              overflow: "hidden",
              border: state === "scanning" ? "1px solid #3B82C4" : "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(11,31,58,0.06)",
              transition: "border-color 0.3s",
            }}>
              {/* Gutter */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 44, background: "#F8FAFC", borderRight: "1px solid #F1F5F9", display: "flex", flexDirection: "column", paddingTop: 16, overflow: "hidden", userSelect: "none" }}>
                {(code || "x\nx\nx\nx\nx\nx\nx\nx").split("\n").map((_, i) => (
                  <div key={i} style={{ textAlign: "right", paddingRight: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, lineHeight: "1.8", color: "#CBD5E1" }}>
                    {i + 1}
                  </div>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={"// Paste your Solidity contract here\n// or choose a sample above\n\npragma solidity ^0.8.20;\n\ncontract Example {\n    // Your code...\n}"}
                className="code-input"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", paddingLeft: 52, paddingRight: 20, paddingTop: 16, paddingBottom: 64 }}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />

              {state === "scanning" && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: 12 }}>
                  <div className="scan-line" />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(37,99,168,0.015)" }} />
                </div>
              )}

              {/* Bottom fade */}
              <div style={{ position: "absolute", bottom: 0, left: 44, right: 0, height: 56, background: "linear-gradient(to top, white, transparent)", pointerEvents: "none" }} />
            </div>

            {/* Run button */}
            <button
              onClick={runAudit}
              disabled={state === "scanning" || !code.trim()}
              className={`btn-primary ${state === "scanning" ? "scanning" : ""}`}
              style={{ marginTop: 10, width: "100%", padding: "14px", borderRadius: 12, fontSize: 14 }}>
              {state === "scanning"
                ? <><Loader2 size={15} className="animate-spin" /> Scanning contract…</>
                : <><Play size={13} fill="currentColor" /> Run Security Audit</>}
            </button>
          </div>

          {/* RIGHT: report */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, height: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldAlert size={13} style={{ color: "#2563A8" }} />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#94A3B8" }}>
                  Audit Report
                </span>
              </div>
              {state === "done" && result && (
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: "#E8F2FA", color: "#2563A8", borderRadius: 5, padding: "2px 8px" }}>
                  {result.findings.length} finding{result.findings.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Panel body */}
            <div style={{ flex: 1, borderRadius: 12, background: "white", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(11,31,58,0.06)" }}>
              <div style={{ height: "100%", overflowY: "auto", padding: 20 }}>

                {/* IDLE */}
                {state === "idle" && (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "#E8F2FA", border: "1px solid #BAD6EC" }}>
                      <HawkeyeLogo size={36} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, color: "#0B1F3A", marginBottom: 6 }}>
                        Ready to audit
                      </p>
                      <p style={{ fontSize: 13, color: "#94A3B8" }}>
                        Paste a Solidity contract and hit Run Security Audit
                      </p>
                    </div>
                    <div style={{ width: "100%", maxWidth: 300 }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#CBD5E1", marginBottom: 10 }}>
                        What we detect
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {CAPABILITIES.map(item => (
                          <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, borderRadius: 8, padding: "7px 10px", fontSize: 11.5, background: "#F8FAFC", border: "1px solid #F1F5F9", color: "#64748B" }}>
                            <CheckCircle2 size={11} style={{ color: "#3B82C4", flexShrink: 0 }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SCANNING */}
                {state === "scanning" && (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
                    <div style={{ position: "relative" }}>
                      <div className="pulse-ring" style={{ position: "absolute", inset: -12, borderRadius: 22, background: "#E8F2FA" }} />
                      <div style={{ position: "relative", width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "#E8F2FA", border: "1px solid #BAD6EC" }}>
                        <HawkeyeLogo size={36} />
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, color: "#0B1F3A", marginBottom: 6 }}>
                        Analysing contract
                      </p>
                      <p style={{ fontSize: 13, color: "#94A3B8", minHeight: 20, transition: "all 0.5s" }}>
                        {SCAN_STEPS[scanStep]}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {SCAN_STEPS.map((_, i) => (
                        <div key={i} style={{ borderRadius: 3, transition: "all 0.3s", width: i === scanStep ? 20 : 6, height: 6, background: i === scanStep ? "#2563A8" : "#E2E8F0" }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ERROR */}
                {state === "error" && (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "#FEF2F2", border: "1px solid #FECACA" }}>
                      <X size={22} style={{ color: "#DC2626" }} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, color: "#DC2626", marginBottom: 6 }}>Audit failed</p>
                      <p style={{ fontSize: 13, color: "#64748B", maxWidth: 280, lineHeight: 1.6 }}>{error}</p>
                    </div>
                    <button onClick={runAudit} className="btn-primary" style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13 }}>
                      <Play size={12} fill="currentColor" /> Try again
                    </button>
                  </div>
                )}

                {state === "done" && result && <AuditReport result={result} />}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "white", borderTop: "1px solid #F1F5F9", flexShrink: 0 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HawkeyeLogo size={22} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Hawkeye</span>
            <span style={{ color: "#E2E8F0" }}>·</span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>Smart Contract Security Auditor</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 11, color: "#CBD5E1" }}>Not a substitute for a professional audit</span>
            <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5, color: "#94A3B8" }}>
              <Sparkles size={10} style={{ color: "#2563A8" }} />
              Powered by Claude
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}