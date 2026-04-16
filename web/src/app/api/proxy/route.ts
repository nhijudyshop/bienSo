import { NextRequest, NextResponse } from "next/server";
import fallbackData from "@/lib/fallback-data.json";

const TARGET = process.env.API_TARGET || "https://dgbs.vpa.com.vn";

const fallback = fallbackData as Record<string, unknown>;

const ALLOWED_ENDPOINTS = [
  "/web-api/user-bidding/api/administrative/provinces",
  "/search-api/search/list-announcement-plan",
  "/search-api/search/list-announcement-plan-code",
  "/search-api/search/get-all-wh-license-plate",
  "/api/bidding/public-result/history/auction-result-session",
  "/api/bidding/public-result/history/detail/auction-result-session",
  "/api/tin-tuc/faq/get-faq",
  "/api/tin-tuc/public/api/get-public-file",
  "/web-api/time-control/public/time-info",
];

function isAllowedEndpoint(endpoint: string): boolean {
  return ALLOWED_ENDPOINTS.some((allowed) => endpoint === allowed);
}

function getFallback(endpoint: string): unknown | null {
  if (fallback[endpoint]) return fallback[endpoint];
  for (const key of Object.keys(fallback)) {
    if (endpoint.includes(key) || key.includes(endpoint)) return fallback[key];
  }
  return null;
}

export async function GET(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }
  if (!isAllowedEndpoint(endpoint)) {
    return NextResponse.json({ error: "Endpoint not allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(`${TARGET}${endpoint}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "VPA-Web-Proxy/1.0",
      },
    });

    if (!res.ok) {
      const fb = getFallback(endpoint);
      if (fb) return NextResponse.json(fb);
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    const fb = getFallback(endpoint);
    if (fb) return NextResponse.json(fb);
    return NextResponse.json({ error: "Proxy fetch failed" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }
  if (!isAllowedEndpoint(endpoint)) {
    return NextResponse.json({ error: "Endpoint not allowed" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${TARGET}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "VPA-Web-Proxy/1.0",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const fb = getFallback(endpoint);
      if (fb) return NextResponse.json(fb);
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    const fb = getFallback(endpoint);
    if (fb) return NextResponse.json(fb);
    return NextResponse.json({ error: "Proxy fetch failed" }, { status: 502 });
  }
}
