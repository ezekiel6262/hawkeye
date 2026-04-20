import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT = 5;        // max requests
const WINDOW_MS = 60_000;    // per 60 seconds

const ipMap = new Map<string, { count: number; resetAt: number }>();

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/audit")) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/audit",
};