import { NextRequest, NextResponse } from "next/server";

const TARGET = process.env.API_TARGET || "https://dgbs.vpa.com.vn";
const COOKIES = process.env.VPA_COOKIES || "";

function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      fullName: payload.sub,
      phoneNumber: payload.sub,
      userId: payload.userId,
      roles: payload.roles,
    };
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("vpa_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  // Try VPA API first
  try {
    const res = await fetch(
      `${TARGET}/web-api/user-bidding/api/user/get-profile`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(COOKIES ? { Cookie: COOKIES } : {}),
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        authenticated: true,
        user: data.result,
      });
    }
  } catch {
    // VPA unreachable - fall through to JWT decode
  }

  // Fallback: decode JWT payload
  const user = decodeJwt(token);
  if (user) {
    return NextResponse.json({ authenticated: true, user });
  }

  // Token invalid - clear cookie
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set("vpa_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
