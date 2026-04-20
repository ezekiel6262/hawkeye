export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type RiskScore = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  lines: number[];
  description: string;
  remediation: string;
  category: string;
  cweId?: string;
}

export interface AuditResult {
  riskScore: RiskScore;
  contractName: string;
  summary: string;
  findings: Finding[];
  gasOptimizations?: string[];
  timestamp: string;
}

export const SEVERITY_CONFIG: Record<Severity, {
  label: string; color: string; bg: string; border: string;
}> = {
  CRITICAL: { label: "Critical", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  HIGH:     { label: "High",     color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  MEDIUM:   { label: "Medium",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  LOW:      { label: "Low",      color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  INFO:     { label: "Info",     color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
};

export const RISK_CONFIG: Record<RiskScore, {
  label: string; color: string; bg: string; border: string;
}> = {
  CRITICAL: { label: "Critical Risk",   color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  HIGH:     { label: "High Risk",       color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  MEDIUM:   { label: "Medium Risk",     color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  LOW:      { label: "Low Risk",        color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  SAFE:     { label: "No Issues Found", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
};