import { NextRequest, NextResponse } from "next/server";
import fallbackData from "@/lib/fallback-data.json";

const TARGET = "https://dgbs.vpa.com.vn";

const fallback = fallbackData as Record<string, unknown>;

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

  try {
    const res = await fetch(`${TARGET}${endpoint}`, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
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

  try {
    const body = await request.json();
    const res = await fetch(`${TARGET}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
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
