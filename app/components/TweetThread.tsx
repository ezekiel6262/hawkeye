"use client";

import { useState } from "react";
import { AuditResult } from "../types";
import { Copy, Check, X, Loader2 } from "lucide-react";

const TwitterIcon = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
interface Tweet {
  number: number;
  text: string;
}

interface ThreadData {
  title: string;
  tweets: Tweet[];
  totalTweets: number;
}

interface TweetThreadProps {
  result: AuditResult;
  onClose: () => void;
}

export default function TweetThread({ result, onClose }: TweetThreadProps) {
  const [loading, setLoading]     = useState(false);
  const [thread, setThread]       = useState<ThreadData | null>(null);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState<number | "all" | null>(null);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tweet-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractName:     result.contractName,
          riskScore:        result.riskScore,
          summary:          result.summary,
          findings:         result.findings,
          gasOptimizations: result.gasOptimizations,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setThread(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyTweet = async (text: string, id: number | "all") => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    if (!thread) return;
    const full = thread.tweets
      .map(t => `${t.number}/${thread.totalTweets}\n${t.text}`)
      .join("\n\n");
    copyTweet(full, "all");
  };

  const charCount = (text: string) => text.length;
  const isOver    = (text: string) => text.length > 280;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(11,31,58,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "white", borderRadius: 16,
        width: "100%", maxWidth: 560,
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(11,31,58,0.2)",
        border: "1px solid #E2E8F0",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "#E7F0FD", border: "1px solid #BFDBFE",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <TwitterIcon size={15} style={{ color: "#1D4ED8" }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1F3A" }}>Tweet Thread Generator</p>
              <p style={{ fontSize: 11, color: "#94A3B8" }}>{result.contractName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

          {/* Initial state */}
          {!thread && !loading && !error && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
                background: "#EFF6FF", border: "1px solid #BFDBFE",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <TwitterIcon size={24} style={{ color: "#2563EB" }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1F3A", marginBottom: 8, fontFamily: "'Fraunces', serif" }}>
                Generate a tweet thread
              </p>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, maxWidth: 340, margin: "0 auto 24px" }}>
                Turn this audit report into an educational Twitter/X thread that explains the vulnerabilities simply.
              </p>
              <button
                onClick={generate}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 10, border: "none",
                  background: "#0B1F3A", color: "white",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                <TwitterIcon size={14} /> Generate Thread
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Loader2 size={28} style={{ color: "#2563EB", animation: "spin 1s linear infinite", marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: "#64748B" }}>Writing your thread…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#DC2626" }}>{error}</p>
            </div>
          )}

          {/* Thread */}
          {thread && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  {thread.totalTweets} tweets · {thread.title}
                </p>
                <button
                  onClick={copyAll}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, fontWeight: 500, padding: "6px 12px",
                    borderRadius: 7, border: "1px solid #E2E8F0",
                    background: "white", color: "#64748B", cursor: "pointer",
                  }}
                >
                  {copied === "all" ? <Check size={11} style={{ color: "#16A34A" }} /> : <Copy size={11} />}
                  {copied === "all" ? "Copied!" : "Copy all"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {thread.tweets.map(tweet => (
                  <div key={tweet.number} style={{
                    border: "1px solid #E2E8F0", borderRadius: 12,
                    overflow: "hidden", background: "white",
                  }}>
                    {/* Tweet header */}
                    <div style={{
                      padding: "8px 12px", background: "#F8FAFC",
                      borderBottom: "1px solid #F1F5F9",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6,
                          background: "#E7F0FD", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <TwitterIcon size={11} style={{ color: "#2563EB" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>
                          {tweet.number}/{thread.totalTweets}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 500,
                          color: isOver(tweet.text) ? "#DC2626" : "#94A3B8",
                        }}>
                          {charCount(tweet.text)}/280
                        </span>
                        <button
                          onClick={() => copyTweet(`${tweet.number}/${thread.totalTweets}\n${tweet.text}`, tweet.number)}
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            fontSize: 11, fontWeight: 500, padding: "3px 8px",
                            borderRadius: 5, border: "1px solid #E2E8F0",
                            background: "white", color: "#64748B", cursor: "pointer",
                          }}
                        >
                          {copied === tweet.number
                            ? <><Check size={10} style={{ color: "#16A34A" }} /> Copied</>
                            : <><Copy size={10} /> Copy</>}
                        </button>
                      </div>
                    </div>

                    {/* Tweet body */}
                    <div style={{ padding: "12px 14px" }}>
                      <p style={{
                        fontSize: 13.5, lineHeight: 1.65, color: "#1E293B",
                        whiteSpace: "pre-wrap", margin: 0,
                      }}>
                        {tweet.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={generate}
                style={{
                  display: "flex", alignItems: "center", gap: 6, marginTop: 16,
                  padding: "8px 16px", borderRadius: 8, border: "1px solid #E2E8F0",
                  background: "white", color: "#64748B", cursor: "pointer",
                  fontSize: 12, fontWeight: 500, width: "100%", justifyContent: "center",
                }}
              >
                <TwitterIcon size={12} /> Regenerate thread
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}