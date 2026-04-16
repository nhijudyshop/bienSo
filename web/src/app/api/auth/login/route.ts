import { NextRequest, NextResponse } from "next/server";

const TARGET = process.env.API_TARGET || "https://dgbs.vpa.com.vn";
const COOKIES = process.env.VPA_COOKIES || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, token } = body;

    // Mode 1: Direct token paste (user provides JWT directly)
    if (token) {
      // Validate token by calling get-profile
      try {
        const profileRes = await fetch(
          `${TARGET}/web-api/user-bidding/api/user/get-profile`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              ...(COOKIES ? { Cookie: COOKIES } : {}),
            },
          }
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const res = NextResponse.json({
            success: true,
            message: "Đăng nhập thành công",
            user: profileData.result,
          });
          res.cookies.set("vpa_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
          });
          return res;
        }
      } catch {
        // Token validation failed, fall through to error
      }
      return NextResponse.json(
        { success: false, error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      );
    }

    // Mode 2: Username + Password login via VPA API
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin đăng nhập" },
        { status: 400 }
      );
    }

    const csrfToken = Buffer.from(`${Date.now()}`).toString("base64");

    const authRes = await fetch(
      `${TARGET}/web-api/user-bidding/api/account/authenticate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          csrf: csrfToken,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          ...(COOKIES ? { Cookie: COOKIES } : {}),
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe: true,
          firstTimeToken: "",
          captcha: "",
          version: "ver2",
        }),
      }
    );

    const data = await authRes.json();

    if (authRes.ok && data.success && data.result?.token) {
      const jwt = data.result.token;
      const res = NextResponse.json({
        success: true,
        message: "Đăng nhập thành công",
      });
      res.cookies.set("vpa_token", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return res;
    }

    // API returned error - likely captcha required
    const errorMsg =
      data.message || data.error || "Đăng nhập thất bại";
    const needsCaptcha =
      errorMsg.toLowerCase().includes("captcha") ||
      authRes.status === 400;

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        needsCaptcha,
        hint: needsCaptcha
          ? "VPA yêu cầu reCAPTCHA. Hãy dùng phương thức đăng nhập bằng token."
          : undefined,
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Lỗi kết nối đến VPA" },
      { status: 502 }
    );
  }
}
