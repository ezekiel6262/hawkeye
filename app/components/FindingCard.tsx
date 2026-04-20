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
      className="finding-enter rounded-xl overflow-hidden bg-white"
      style={{
        border: `1px solid ${cfg.border}`,
        boxShadow: "0 1px 3px rgba(11,31,58,0.05)",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Accent bar */}
      <div style={{ height: "3px", background: cfg.color }} />

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left transition-colors"
        style={{ background: expanded ? cfg.bg : "white" }}
      >
        <div className="p-4 flex items-start gap-3">
          <span
            className="shrink-0 mt-0.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] font-semibold leading-snug" style={{ color: "#0B1F3A" }}>
                {finding.title}
              </p>
              <ChevronDown
                size={14}
                style={{
                  color: "#CBD5E1",
                  transform: expanded ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "#94A3B8" }}>
                <Tag size={9} />{finding.category}
              </span>
              {finding.lines.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: cfg.color }}>
                  <MapPin size={9} />
                  Line{finding.lines.length > 1 ? "s" : ""} {finding.lines.join(", ")}
                </span>
              )}
              {finding.cweId && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: "#F1F5F9", color: "#64748B" }}>
                  {finding.cweId}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${cfg.border}`, background: `${cfg.bg}70` }}>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "#94A3B8" }}>
                What's the issue
              </p>
              <p className="text-[12.5px] leading-relaxed" style={{ color: "#475569" }}>
                {finding.description}
              </p>
            </div>
            <div style={{ height: "1px", background: cfg.border }} />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#94A3B8" }}>
                  How to fix it
                </p>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    color: copied ? "#16A34A" : "#64748B",
                    background: "white",
                    border: `1px solid ${copied ? "#BBF7D0" : "#E2E8F0"}`,
                  }}
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {copied ? "Copied!" : "Copy fix"}
                </button>
              </div>
              <div
                className="rounded-lg p-3.5 text-[11.5px] leading-relaxed font-mono"
                style={{
                  background: "white",
                  border: "1px solid #E2E8F0",
                  color: "#475569",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {finding.remediation}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}