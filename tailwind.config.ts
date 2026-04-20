import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A", 800: "#122848", 700: "#1A3A5C",
          600: "#1E4976", 500: "#2563A8", 400: "#3B82C4",
          300: "#7EB3D8", 200: "#BAD6EC", 100: "#E8F2FA", 50: "#F4F9FD"
        },
        slate: {
          DEFAULT: "#64748B", 700: "#334155", 600: "#475569",
          500: "#64748B", 400: "#94A3B8", 300: "#CBD5E1",
          200: "#E2E8F0", 100: "#F1F5F9", 50: "#F8FAFC"
        },
        sev: {
          critical: "#DC2626", "critical-bg": "#FEF2F2", "critical-border": "#FECACA",
          high:     "#EA580C", "high-bg":     "#FFF7ED", "high-border":     "#FED7AA",
          medium:   "#D97706", "medium-bg":   "#FFFBEB", "medium-border":   "#FDE68A",
          low:      "#16A34A", "low-bg":      "#F0FDF4", "low-border":      "#BBF7D0",
          info:     "#2563EB", "info-bg":     "#EFF6FF", "info-border":     "#BFDBFE",
        },
      },
      fontFamily: {
        sans:    ["'DM Sans'", "system-ui", "sans-serif"],
display: ["'Fraunces'", "Georgia", "serif"],
mono:    ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        xs:    "0 1px 2px rgba(11,31,58,0.06)",
        sm:    "0 1px 3px rgba(11,31,58,0.08), 0 1px 2px rgba(11,31,58,0.04)",
        md:    "0 4px 6px rgba(11,31,58,0.07), 0 2px 4px rgba(11,31,58,0.04)",
        lg:    "0 10px 24px rgba(11,31,58,0.10), 0 4px 8px rgba(11,31,58,0.04)",
        navy:  "0 0 0 3px rgba(37,99,168,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;