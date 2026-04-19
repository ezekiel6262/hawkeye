"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Code2 } from "lucide-react";
import { Finding, SEVERITY_CONFIG } from "../types";

interface FindingCardProps {
  finding: Finding;
  index: number;
}

export default function FindingCard({ finding, index }: FindingCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const [copied, setCopied] = useState(false);
  const config = SEVERITY_CONFIG[finding.severity];

  const copyRemediation = async () => {
    await navigator.clipboard.writeText(finding.remediation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="finding-card rounded-lg border overflow-hidden"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
      >
        {/* Severity badge */}
        <div
          className="shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase"
          style={{
            color: config.color,
            border: `1px solid ${config.border}`,
            backgroundColor: `${config.color}18`,
          }}
        >
          {config.label}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-text-primary truncate">
              {finding.title}
            </span>
            {expanded ? (
              <ChevronUp size={14} className="shrink-0 text-text-muted" />
            ) : (
              <ChevronDown size={14} className="shrink-0 text-text-muted" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-text-muted">{finding.category}</span>
            {finding.lines.length > 0 && (
              <span className="text-xs" style={{ color: config.color, opacity: 0.7 }}>
                <Code2 size={10} className="inline mr-1" />
                Line{finding.lines.length > 1 ? "s" : ""} {finding.lines.join(", ")}
              </span>
            )}
            {finding.cweId && (
              <span className="text-xs text-text-muted">{finding.cweId}</span>
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04]">
          {/* Description */}
          <div className="pt-3">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
              Description
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {finding.description}
            </p>
          </div>

          {/* Remediation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Remediation
              </p>
              <button
                onClick={copyRemediation}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                {copied ? (
                  <><Check size={11} /><span>Copied</span></>
                ) : (
                  <><Copy size={11} /><span>Copy</span></>
                )}
              </button>
            </div>
            <div
              className="text-sm leading-relaxed p-3 rounded font-mono text-[12px]"
              style={{
                backgroundColor: "#0A0B0E",
                border: "1px solid #1E2130",
                color: "#A8B4CC",
              }}
            >
              {finding.remediation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
