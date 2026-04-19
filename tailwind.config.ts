import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-display)", "serif"],
      },
      colors: {
        bg: {
          primary: "#0A0B0E",
          secondary: "#0F1117",
          tertiary: "#161820",
          card: "#12141A",
          hover: "#1A1D26",
        },
        border: {
          DEFAULT: "#1E2130",
          bright: "#2A2F45",
          accent: "#3A4060",
        },
        hawk: {
          primary: "#E8B84B",
          secondary: "#C49830",
          muted: "#8A6B1E",
          glow: "#E8B84B33",
        },
        severity: {
          critical: "#FF4444",
          "critical-bg": "#1A0A0A",
          "critical-border": "#3D1010",
          high: "#FF8C00",
          "high-bg": "#1A0F00",
          "high-border": "#3D2200",
          medium: "#FFD700",
          "medium-bg": "#1A1700",
          "medium-border": "#3D3800",
          low: "#4CAF50",
          "low-bg": "#0A1A0A",
          "low-border": "#103D10",
          info: "#60A5FA",
          "info-bg": "#0A0F1A",
          "info-border": "#10203D",
        },
        text: {
          primary: "#E8ECF4",
          secondary: "#8892A4",
          muted: "#4A5568",
          code: "#A8B4CC",
        },
      },
      animation: {
        "scan-line": "scan 2s linear infinite",
        "fade-up": "fadeUp 0.4s ease forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "hawk-glow": "hawkGlow 3s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        hawkGlow: {
          "0%, 100%": { boxShadow: "0 0 20px #E8B84B22" },
          "50%": { boxShadow: "0 0 40px #E8B84B44" },
        },
      },
      boxShadow: {
        "hawk-sm": "0 0 12px #E8B84B22",
        hawk: "0 0 24px #E8B84B33",
        "hawk-lg": "0 0 48px #E8B84B44",
        card: "0 1px 3px #00000080, 0 0 0 1px #1E2130",
      },
    },
  },
  plugins: [],
};

export default config;
