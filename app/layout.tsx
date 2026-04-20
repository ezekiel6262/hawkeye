import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hawkeye — Smart Contract Security Auditor",
  description: "AI-powered Solidity security analysis. Structured CVE-style reports in seconds.",
  keywords: ["smart contract", "solidity", "security audit", "vulnerability scanner", "web3"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        
      </head>
      <body>{children}</body>
    </html>
  );
}