import { NextRequest, NextResponse } from "next/server";

const TARGET = process.env.API_TARGET || "https://dgbs.vpa.com.vn";
const COOKIES = process.env.VPA_COOKIES || "";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("vpa_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

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

    // Token expired or invalid - clear cookie
    const response = NextResponse.json({ authenticated: false });
    response.cookies.set("vpa_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
