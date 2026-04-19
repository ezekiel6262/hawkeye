"use client";

export default function HawkeyeLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle cx="16" cy="16" r="14" stroke="#E8B84B" strokeWidth="1" opacity="0.4" />
      {/* Eye shape */}
      <path
        d="M4 16C4 16 9 8 16 8C23 8 28 16 28 16C28 16 23 24 16 24C9 24 4 16 4 16Z"
        stroke="#E8B84B"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Iris */}
      <circle cx="16" cy="16" r="5" stroke="#E8B84B" strokeWidth="1.2" fill="#E8B84B11" />
      {/* Pupil */}
      <circle cx="16" cy="16" r="2.5" fill="#E8B84B" />
      {/* Scan line */}
      <line
        x1="8"
        y1="16"
        x2="24"
        y2="16"
        stroke="#E8B84B"
        strokeWidth="0.5"
        opacity="0.3"
        strokeDasharray="2 2"
      />
      {/* Crosshair ticks */}
      <line x1="16" y1="3" x2="16" y2="6" stroke="#E8B84B" strokeWidth="1" opacity="0.5" />
      <line x1="16" y1="26" x2="16" y2="29" stroke="#E8B84B" strokeWidth="1" opacity="0.5" />
      <line x1="3" y1="16" x2="6" y2="16" stroke="#E8B84B" strokeWidth="1" opacity="0.5" />
      <line x1="26" y1="16" x2="29" y2="16" stroke="#E8B84B" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
