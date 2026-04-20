"use client";

import { useState } from "react";
import { ChevronDown, Copy, Check, MapPin, Tag } from "lucide-react";
import { Finding, SEVERITY_CONFIG } from "../types";

export default function FindingCard({ finding, index }: { finding: Finding; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [copied, setCopied] = useState(false);
  const cfg = SEVERITY_CONFIG[finding.severity];

  const copy = async () => {
    await navigator.clipboard.writeText(finding.remediation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="finding-enter"
      style={{
        borderRadius: 12,
        border: `1px solid ${cfg.border}`,
        overflow: "hidden",
        marginBottom: 12,
        boxShadow: "0 1px 3px rgba(11,31,58,0.04)",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: cfg.color }} />

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "14px 16px",
          background: cfg.bg,
          border: "none",
          cursor: "pointer",
          display: "block",
        }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
            letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 5,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
            flexShrink: 0,
          }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0B1F3A", lineHeight: 1.4, flex: 1 }}>
            {finding.title}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: "#CBD5E1", flexShrink: 0, marginTop: 2,
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
          {finding.lines.length > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: cfg.color, fontWeight: 500 }}>
              <MapPin size={11} />
              Line{finding.lines.length > 1 ? "s" : ""} {finding.lines.join(", ")}
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B" }}>
            <Tag size={11} style={{ opacity: 0.5 }} />
            {finding.category}
          </span>
          {finding.cweId && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              background: "white", border: "1px solid #E2E8F0",
              borderRadius: 4, padding: "1px 6px", color: "#64748B",
            }}>
              {finding.cweId}
            </span>
          )}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${cfg.border}`, background: "white" }}>
          <div style={{ padding: 16 }}>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
                letterSpacing: "0.1em", color: "#94A3B8", marginBottom: 8,
              }}>
                What's the issue
              </p>
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#475569" }}>
                {finding.description}
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#F1F5F9", margin: "16px 0" }} />

            {/* Remediation */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
                  letterSpacing: "0.1em", color: "#94A3B8",
                }}>
                  How to fix it
                </p>
                <button
                  onClick={copy}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 11, fontWeight: 500,
                    color: copied ? "#16A34A" : "#64748B",
                    background: "white",
                    border: `1px solid ${copied ? "#BBF7D0" : "#E2E8F0"}`,
                    borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                  }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? "Copied!" : "Copy fix"}
                </button>
              </div>
              <div style={{
                background: "#F8FAFC", border: "1px solid #E2E8F0",
                borderRadius: 8, padding: "12px 14px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, lineHeight: 1.8,
                color: "#334155", whiteSpace: "pre-wrap" as const,
                wordBreak: "break-word" as const,
              }}>
                {finding.remediation}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}