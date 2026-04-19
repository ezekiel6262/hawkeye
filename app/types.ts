export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

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
  riskScore: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";
  contractName: string;
  summary: string;
  findings: Finding[];
  gasOptimizations?: string[];
  timestamp: string;
}

export const SEVERITY_CONFIG: Record<Severity, {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}> = {
  CRITICAL: {
    label: "Critical",
    color: "#FF4444",
    bg: "#1A0A0A",
    border: "#3D1010",
    dot: "bg-red-500",
  },
  HIGH: {
    label: "High",
    color: "#FF8C00",
    bg: "#1A0F00",
    border: "#3D2200",
    dot: "bg-orange-500",
  },
  MEDIUM: {
    label: "Medium",
    color: "#FFD700",
    bg: "#1A1700",
    border: "#3D3800",
    dot: "bg-yellow-400",
  },
  LOW: {
    label: "Low",
    color: "#4CAF50",
    bg: "#0A1A0A",
    border: "#103D10",
    dot: "bg-green-500",
  },
  INFO: {
    label: "Info",
    color: "#60A5FA",
    bg: "#0A0F1A",
    border: "#10203D",
    dot: "bg-blue-400",
  },
};

export const RISK_SCORE_CONFIG = {
  CRITICAL: { label: "Critical Risk", color: "#FF4444", bg: "#3D1010" },
  HIGH:     { label: "High Risk",     color: "#FF8C00", bg: "#3D2200" },
  MEDIUM:   { label: "Medium Risk",   color: "#FFD700", bg: "#3D3800" },
  LOW:      { label: "Low Risk",      color: "#4CAF50", bg: "#103D10" },
  SAFE:     { label: "No Issues",     color: "#4CAF50", bg: "#103D10" },
};
