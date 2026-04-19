"use client";

import { Shield, AlertTriangle, CheckCircle, Clock, Download } from "lucide-react";
import { AuditResult, SEVERITY_CONFIG, RISK_SCORE_CONFIG, Severity } from "../types";
import FindingCard from "./FindingCard";

interface AuditReportProps {
  result: AuditResult;
}

export default function AuditReport({ result }: AuditReportProps) {
  const riskConfig = RISK_SCORE_CONFIG[result.riskScore];

  // Count findings by severity
  const counts = result.findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<Severity, number>
  );

  // Sort findings by severity
  const severityOrder: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
  const sorted = [...result.findings].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  const handleExport = () => {
    const lines: string[] = [
      "╔══════════════════════════════════════════════════╗",
      "║           HAWKEYE SECURITY AUDIT REPORT          ║",
      "╚══════════════════════════════════════════════════╝",
      "",
      `Contract:   ${result.contractName}`,
      `Risk Score: ${result.riskScore}`,
      `Generated:  ${new Date(result.timestamp).toLocaleString()}`,
      `Findings:   ${result.findings.length} issue(s)`,
      "",
      "EXECUTIVE SUMMARY",
      "─".repeat(50),
      result.summary,
      "",
      "FINDINGS",
      "─".repeat(50),
    ];

    sorted.forEach((f) => {
      lines.push(`\n[${f.severity}] ${f.title}`);
      lines.push(`Category: ${f.category}`);
      if (f.lines.length > 0) lines.push(`Lines: ${f.lines.join(", ")}`);
      if (f.cweId) lines.push(`CWE: ${f.cweId}`);
      lines.push(`\nDescription:\n${f.description}`);
      lines.push(`\nRemediation:\n${f.remediation}`);
      lines.push("\n" + "─".repeat(50));
    });

    if (result.gasOptimizations?.length) {
      lines.push("\nGAS OPTIMIZATIONS");
      lines.push("─".repeat(50));
      result.gasOptimizations.forEach((opt, i) => {
        lines.push(`${i + 1}. ${opt}`);
      });
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hawkeye-audit-${result.contractName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Report header */}
      <div
        className="shrink-0 p-4 rounded-lg mb-3 border"
        style={{
          backgroundColor: `${riskConfig.color}0D`,
          borderColor: riskConfig.bg,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {result.riskScore === "SAFE" ? (
              <CheckCircle size={18} style={{ color: riskConfig.color }} />
            ) : (
              <AlertTriangle size={18} style={{ color: riskConfig.color }} />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: riskConfig.color }}>
                  {riskConfig.label}
                </span>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs text-text-muted">{result.contractName}</span>
              </div>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-text-muted border border-border hover:border-border-bright hover:text-text-secondary transition-all"
          >
            <Download size={11} />
            Export
          </button>
        </div>

        {/* Severity summary pills */}
        {result.findings.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {severityOrder.map((sev) =>
              counts[sev] ? (
                <div
                  key={sev}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{
                    color: SEVERITY_CONFIG[sev].color,
                    backgroundColor: `${SEVERITY_CONFIG[sev].color}15`,
                    border: `1px solid ${SEVERITY_CONFIG[sev].border}`,
                  }}
                >
                  <span>{counts[sev]}</span>
                  <span>{SEVERITY_CONFIG[sev].label}</span>
                </div>
              ) : null
            )}
            <div className="flex items-center gap-1 ml-auto text-xs text-text-muted">
              <Clock size={11} />
              {new Date(result.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Findings list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-text-muted">
            <CheckCircle size={24} className="text-green-500 mb-2" />
            <p className="text-sm">No vulnerabilities found</p>
          </div>
        ) : (
          sorted.map((finding, i) => (
            <FindingCard key={finding.id} finding={finding} index={i} />
          ))
        )}

        {/* Gas optimizations */}
        {result.gasOptimizations && result.gasOptimizations.length > 0 && (
          <div className="rounded-lg border border-border p-4 bg-bg-card mt-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield size={11} />
              Gas Optimizations
            </p>
            <ul className="space-y-1">
              {result.gasOptimizations.map((opt, i) => (
                <li key={i} className="text-xs text-text-secondary flex gap-2">
                  <span className="text-hawk-muted shrink-0">→</span>
                  <span>{opt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
