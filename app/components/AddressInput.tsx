"use client";

import { useState } from "react";
import { Search, Loader2, ExternalLink, ChevronDown } from "lucide-react";

const CHAINS = [
  { id: "ethereum", label: "Ethereum",  short: "ETH",  color: "#627EEA", explorer: "https://etherscan.io" },
  { id: "base",     label: "Base",      short: "BASE", color: "#0052FF", explorer: "https://basescan.org" },
  { id: "polygon",  label: "Polygon",   short: "POL",  color: "#8247E5", explorer: "https://polygonscan.com" },
  { id: "arbitrum", label: "Arbitrum",  short: "ARB",  color: "#12AAFF", explorer: "https://arbiscan.io" },
  { id: "optimism", label: "Optimism",  short: "OP",   color: "#FF0420", explorer: "https://optimistic.etherscan.io" },
  { id: "bsc",      label: "BNB Chain", short: "BNB",  color: "#F0B90B", explorer: "https://bscscan.com" },
];

interface AddressInputProps {
  onFetched: (code: string, name: string, meta: FetchedMeta) => void;
  onError:   (err: string) => void;
}

export interface FetchedMeta {
  address:        string;
  chain:          string;
  chainLabel:     string;
  compiler:       string;
  proxy:          boolean;
  implementation: string | null;
}

export default function AddressInput({ onFetched, onError }: AddressInputProps) {
  const [address, setAddress]       = useState("");
  const [chain, setChain]           = useState("ethereum");
  const [loading, setLoading]       = useState(false);
  const [showChains, setShowChains] = useState(false);

  const selectedChain = CHAINS.find(c => c.id === chain) || CHAINS[0];
  const explorerUrl   = `${selectedChain.explorer}/address/${address}`;

  const fetchContract = async () => {
    if (!address.trim()) return;
    setLoading(true);
    onError("");
    try {
      const res = await fetch("/api/fetch-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim(), chain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch contract");
      onFetched(data.sourceCode, data.contractName, {
        address:        data.address,
        chain:          data.chain,
        chainLabel:     selectedChain.label,
        compiler:       data.compiler,
        proxy:          data.proxy,
        implementation: data.implementation,
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to fetch contract");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchContract();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      <div style={{ display: "flex", gap: 8 }}>

        {/* Chain selector */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setShowChains(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              height: 40, padding: "0 10px",
              border: "1px solid #E2E8F0", borderRadius: 8,
              background: "white", cursor: "pointer",
              fontSize: 12, fontWeight: 600, color: "#334155",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedChain.color }} />
            {selectedChain.short}
            <ChevronDown
              size={11}
              style={{
                color: "#94A3B8",
                transform: showChains ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {showChains && (
            <div style={{
              position: "absolute", top: "100%", left: 0, marginTop: 4,
              width: 160, background: "white", borderRadius: 10,
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 24px rgba(11,31,58,0.12)",
              overflow: "hidden", zIndex: 40,
            }}>
              {CHAINS.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setChain(c.id); setShowChains(false); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "8px 12px",
                    fontSize: 12, fontWeight: 500,
                    color: chain === c.id ? "#0B1F3A" : "#64748B",
                    background: chain === c.id ? "#F4F9FD" : "transparent",
                    display: "flex", alignItems: "center", gap: 8,
                    border: "none", borderBottom: "1px solid #F1F5F9",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (chain !== c.id) e.currentTarget.style.background = "#F8FAFC"; }}
                  onMouseLeave={e => { if (chain !== c.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  {c.label}
                  {chain === c.id && (
                    <span style={{ marginLeft: "auto", color: "#2563A8", fontSize: 10 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Address input */}
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={handleKey}
            placeholder="0x... contract address"
            style={{
              width: "100%", height: 40,
              padding: "0 40px 0 12px",
              border: "1px solid #E2E8F0", borderRadius: 8,
              background: "white", fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#334155", outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#3B82C4")}
            onBlur={e  => (e.currentTarget.style.borderColor = "#E2E8F0")}
          />
          {address.length > 0 && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: "absolute", right: 10,
                top: "50%", transform: "translateY(-50%)",
                color: "#94A3B8", lineHeight: 0,
              }}
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Fetch button */}
        <button
          onClick={fetchContract}
          disabled={loading || !address.trim()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            height: 40, padding: "0 16px",
            borderRadius: 8, border: "none", flexShrink: 0,
            background: !address.trim() ? "#E2E8F0" : "#0B1F3A",
            color: !address.trim() ? "#94A3B8" : "white",
            fontSize: 13, fontWeight: 600,
            cursor: address.trim() && !loading ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          {loading
            ? <Loader2 size={13} className="animate-spin" />
            : <Search size={13} />}
          {loading ? "Fetching…" : "Fetch"}
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>
        Contract must be verified on {selectedChain.label} — source fetched directly from Etherscan
      </p>
    </div>
  );
}