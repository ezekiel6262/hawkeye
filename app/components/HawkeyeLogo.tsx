"use client";

export default function HawkeyeLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 4L6 11V24C6 33.5 14 41.5 24 44C34 41.5 42 33.5 42 24V11L24 4Z"
        fill="#0B1F3A"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.5"
      />
      <path
        d="M24 8L10 14V24C10 31.8 16.4 38.4 24 40.8C31.6 38.4 38 31.8 38 24V14L24 8Z"
        fill="#1A3A5C"
      />
      <ellipse cx="24" cy="24" rx="10" ry="7" fill="white" opacity="0.95"/>
      <circle cx="24" cy="24" r="4.5" fill="#2563A8"/>
      <circle cx="24" cy="24" r="2.2" fill="#0B1F3A"/>
      <circle cx="25.2" cy="22.8" r="0.9" fill="white"/>
      <line x1="14" y1="24" x2="34" y2="24" stroke="white" strokeWidth="0.5" opacity="0.3" strokeDasharray="1.5 1.5"/>
    </svg>
  );
}