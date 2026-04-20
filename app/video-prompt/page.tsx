"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import HawkeyeLogo from "../components/HawkeyeLogo";
import {
  Upload, Loader2, Copy, Check, BookOpen,
  Sparkles, ArrowLeft, Video, Zap, RefreshCw, Play
} from "lucide-react";

interface VideoPromptResult {
  analysis: string;
  style: string;
  mood: string;
  cameraMovement: string;
  dominantColors: string[];
  prompts: {
    runway: { prompt: string; tips: string };
    pika:   { prompt: string; parameters: string; tips: string };
    sora:   { prompt: string; tips: string };
  };
}

const TOOLS = [
  { id: "runway", label: "Runway Gen-3", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "pika",   label: "Pika Labs",    color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { id: "sora",   label: "Sora",         color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
];

export default function VideoPromptDetector() {
  const [video, setVideo]           = useState<string | null>(null);
  const [videoFile, setVideoFile]   = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<VideoPromptResult | null>(null);
  const [error, setError]           = useState("");
  const [copied, setCopied]         = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState("runway");
  const [dragging, setDragging]     = useState(false);
  const [progress, setProgress]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const PROGRESS_STEPS = [
    "Uploading video…",
    "Analysing visual style…",
    "Detecting camera movement…",
    "Extracting color palette…",
    "Generating Runway prompt…",
    "Generating Pika prompt…",
    "Generating Sora prompt…",
    "Finalising results…",
  ];

  const handleFile = (file: File) => {
    const validExts = /\.(mp4|webm|mov|mpeg)$/i;
    if (!file.type.startsWith("video/") && !validExts.test(file.name)) {
      setError("Please upload a video file (MP4, WebM, MOV)");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Video too large. Maximum size is 50MB.");
      return;
    }
    setError("");
    setResult(null);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideo(url);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const analyse = async () => {
    if (!videoFile) return;
    setLoading(true);
    setError("");
    setResult(null);

    // Cycle through progress messages
    let stepIdx = 0;
    setProgress(PROGRESS_STEPS[0]);
    const progressInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % PROGRESS_STEPS.length;
      setProgress(PROGRESS_STEPS[stepIdx]);
    }, 2000);

    try {
      const form = new FormData();
      form.append("video", videoFile);
      const res = await fetch("/api/detect-video-prompt", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setActiveTool("runway");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress("");
    }
  };

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const reset = () => {
    setVideo(null);
    setVideoFile(null);
    setResult(null);
    setError("");
  };

  const activeTool_ = TOOLS.find(t => t.id === activeTool)!;
  const activePrompt = result?.prompts[activeTool as keyof typeof result.prompts];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#0B1F3A", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <HawkeyeLogo size={32} />
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: "white", letterSpacing: "-0.01em" }}>
                Hawkeye
              </span>
            </Link>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, background: "rgba(37,99,168,0.5)", color: "#7EB3D8", border: "1px solid rgba(59,130,196,0.3)", borderRadius: 4, padding: "2px 6px" }}>
              Beta
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
              <ArrowLeft size={12} /> Contract Auditor
            </Link>
            <Link href="/prompt" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
              Image Prompts
            </Link>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
              <BookOpen size={12} /> Documentation
            </a>
          </div>

          <a href="https://github.com/ezekiel6262/hawkeye" target="_blank" rel="noopener"
            style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 12px", textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "#0B1F3A", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 24px 36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: "rgba(37,99,168,0.3)", color: "#7EB3D8", border: "1px solid rgba(59,130,196,0.25)", marginBottom: 14 }}>
            <Sparkles size={10} /> Native video understanding
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 34, fontWeight: 500, color: "white", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 12 }}>
            Reverse-engineer any video<br />
            <em style={{ color: "#7EB3D8", fontStyle: "italic" }}>into a perfect prompt.</em>
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.45)", maxWidth: 520, margin: 0 }}>
            Upload any video and get tailored prompts for Runway Gen-3, Pika Labs, and Sora with camera movement, style, and mood analysis built in.
          </p>
        </div>
      </div>

      {/* MAIN */}
      <main style={{ flex: 1, maxWidth: 1440, margin: "0 auto", width: "100%", padding: "24px" }}>
        <div style={{ display: "flex", gap: 20, minHeight: 600 }}>

          {/* LEFT: upload */}
          <div style={{ width: "42%", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !video && fileRef.current?.click()}
              style={{
                flex: video ? "none" : 1,
                minHeight: video ? "auto" : 300,
                border: `2px dashed ${dragging ? "#3B82C4" : video ? "#E2E8F0" : "#CBD5E1"}`,
                borderRadius: 16,
                background: dragging ? "#EFF6FF" : "white",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: video ? "default" : "pointer",
                transition: "all 0.2s",
                padding: video ? 0 : 32,
                overflow: "hidden",
              }}
            >
              {!video ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Video size={22} style={{ color: "#94A3B8" }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Drop a video here</p>
                  <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>or click to browse</p>
                  <p style={{ fontSize: 11, color: "#CBD5E1" }}>MP4, WebM, MOV · max 50MB</p>
                </div>
              ) : (
                <video
                  src={video}
                  controls
                  style={{ width: "100%", borderRadius: 14, display: "block", maxHeight: 360, background: "#000" }}
                />
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/mov,video/quicktime,.mp4,.webm,.mov"
              style={{ display: "none" }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {/* File meta */}
            {video && videoFile && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "white", border: "1px solid #E2E8F0", borderRadius: 10 }}>
                <Video size={14} style={{ color: "#94A3B8", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{videoFile.name}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>{(videoFile.size / (1024 * 1024)).toFixed(1)} MB · {videoFile.type.split("/")[1]?.toUpperCase()}</p>
                </div>
                <button onClick={reset}
                  style={{ fontSize: 11, color: "#94A3B8", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#DC2626")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}>
                  <RefreshCw size={11} /> Change
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: "#DC2626" }}>{error}</p>
              </div>
            )}

            {/* Analyse button */}
            <button
              onClick={analyse}
              disabled={!video || loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 600,
                background: !video ? "#E2E8F0" : loading ? "#2563A8" : "#0B1F3A",
                color: !video ? "#94A3B8" : "white",
                cursor: video && !loading ? "pointer" : "not-allowed",
                transition: "all 0.15s",
              }}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> {progress || "Analysing…"}</>
                : <><Zap size={14} /> Generate Video Prompts</>}
            </button>

            {/* Gemini badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#1D4ED8" }}>Powered by Gemini 1.5</p>
                <p style={{ fontSize: 11, color: "#3B82F6" }}>Enjoy your perfect prompt!</p>
              </div>
            </div>

            {/* How it works */}
            {!result && !loading && (
              <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#94A3B8", marginBottom: 12 }}>How it works</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { n: "1", text: "Upload any video (AI-generated, cinematic, animation, screen recording)" },
                    { n: "2", text: "Gemini 1.5 natively understands the full video - motion, timing, style" },
                    { n: "3", text: "Get tailored prompts for Runway, Pika, and Sora" },
                    { n: "4", text: "Copy and reproduce the video with any AI tool" },
                  ].map(s => (
                    <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E8F2FA", color: "#2563A8", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</span>
                      <p style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.5 }}>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: results */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Empty state */}
            {!result && !loading && (
              <div style={{ flex: 1, background: "white", border: "1px solid #E2E8F0", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: "#E8F2FA", border: "1px solid #BAD6EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HawkeyeLogo size={36} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 500, color: "#0B1F3A", marginBottom: 6 }}>Ready to reverse-engineer</p>
                  <p style={{ fontSize: 13, color: "#94A3B8" }}>Upload a video to generate prompts</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, width: "100%", maxWidth: 380 }}>
                  {TOOLS.map(t => (
                    <div key={t.id} style={{ padding: "10px 12px", borderRadius: 10, background: t.bg, border: `1px solid ${t.border}`, textAlign: "center" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: t.color, opacity: 0.7, marginTop: 2 }}>prompt</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ flex: 1, background: "white", border: "1px solid #E2E8F0", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <div style={{ position: "relative" }}>
                  <div className="pulse-ring" style={{ position: "absolute", inset: -12, borderRadius: 22, background: "#E8F2FA" }} />
                  <div style={{ position: "relative", width: 64, height: 64, borderRadius: 16, background: "#E8F2FA", border: "1px solid #BAD6EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HawkeyeLogo size={36} />
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 500, color: "#0B1F3A", marginBottom: 6 }}>Analysing video</p>
                  <p style={{ fontSize: 13, color: "#94A3B8", minHeight: 20, transition: "all 0.5s" }}>{progress}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="animate-bounce" style={{ width: 6, height: 6, borderRadius: "50%", background: "#BAD6EC", animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "#CBD5E1", maxWidth: 260, textAlign: "center", lineHeight: 1.6 }}>
                  Gemini is watching the full video — this may take 10–30 seconds depending on length
                </p>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <>
                {/* Analysis card */}
                <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#94A3B8", marginBottom: 10 }}>Video Analysis</p>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#475569", marginBottom: 12 }}>{result.analysis}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#F1F5F9", color: "#334155" }}>{result.style}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#F1F5F9", color: "#334155" }}>{result.mood}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "#EFF6FF", color: "#2563EB" }}>
                      📷 {result.cameraMovement}
                    </span>
                    {result.dominantColors?.map((color, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 6, background: "#F1F5F9", color: "#334155" }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: "1px solid rgba(0,0,0,0.1)" }} />
                        {color}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tool tabs */}
                <div style={{ display: "flex", gap: 2, background: "#F1F5F9", borderRadius: 10, padding: 3 }}>
                  {TOOLS.map(tool => (
                    <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                      style={{
                        flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                        background: activeTool === tool.id ? "white" : "transparent",
                        color: activeTool === tool.id ? tool.color : "#64748B",
                        boxShadow: activeTool === tool.id ? "0 1px 3px rgba(11,31,58,0.08)" : "none",
                      }}>
                      {tool.label}
                    </button>
                  ))}
                </div>

                {activePrompt && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

                    {/* Main prompt */}
                    <div style={{ background: "white", border: `1px solid ${activeTool_.border}`, borderRadius: 14, overflow: "hidden" }}>
                      <div style={{ height: 4, background: activeTool_.color }} />
                      <div style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#94A3B8" }}>
                            {activeTool_.label} Prompt
                          </p>
                          <button onClick={() => copy(activePrompt.prompt, "prompt")}
                            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: "white", color: copied === "prompt" ? "#16A34A" : "#64748B", cursor: "pointer" }}>
                            {copied === "prompt" ? <Check size={11} /> : <Copy size={11} />}
                            {copied === "prompt" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#1E293B", margin: 0 }}>
                          {activePrompt.prompt}
                        </p>
                      </div>
                    </div>

                    {/* Pika parameters */}
                    {"parameters" in activePrompt && (
                      <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#94A3B8" }}>Parameters</p>
                          <button onClick={() => copy((activePrompt as any).parameters, "params")}
                            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: "white", color: copied === "params" ? "#16A34A" : "#64748B", cursor: "pointer" }}>
                            {copied === "params" ? <Check size={11} /> : <Copy size={11} />}
                            {copied === "params" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <code style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#7C3AED", background: "#F5F3FF", padding: "6px 10px", borderRadius: 6, display: "block" }}>
                          {(activePrompt as any).parameters}
                        </code>
                      </div>
                    )}

                    {/* Pro tip */}
                    <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: 14 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#92400E", marginBottom: 6 }}>Pro Tip</p>
                      <p style={{ fontSize: 13, color: "#78350F", lineHeight: 1.6, margin: 0 }}>{activePrompt.tips}</p>
                    </div>

                    {/* Copy full */}
                    <button
                      onClick={() => {
                        const full = activeTool === "pika"
                          ? `${activePrompt.prompt} ${"parameters" in activePrompt ? (activePrompt as any).parameters : ""}`
                          : activePrompt.prompt;
                        copy(full, "full");
                      }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "12px", borderRadius: 10, border: "none",
                        background: activeTool_.color, color: "white",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {copied === "full"
                        ? <><Check size={14} /> Copied!</>
                        : <><Copy size={14} /> Copy full {activeTool_.label} prompt</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ background: "white", borderTop: "1px solid #F1F5F9", flexShrink: 0, marginTop: 24 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HawkeyeLogo size={22} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Hawkeye</span>
            <span style={{ color: "#E2E8F0" }}>·</span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>Video Prompt Detector</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94A3B8" }}>
            <Sparkles size={10} style={{ color: "#2563A8" }} />
            Powered by Hawkeye
          </div>
        </div>
      </footer>
    </div>
  );
}