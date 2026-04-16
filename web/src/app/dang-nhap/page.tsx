"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { VPA_URL } from "@/lib/constants";

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const RECAPTCHA_V2_SITEKEY = "6LdivZIpAAAAAMjGvwJU60ZjdyyZ-BVx7vW62DM-";

type LoginMode = "password" | "token";

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: string | HTMLElement, params: Record<string, unknown>) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
      ready?: (cb: () => void) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

export default function DangNhapPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [mode, setMode] = useState<LoginMode>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const renderCaptcha = useCallback(() => {
    if (!window.grecaptcha || !captchaRef.current || widgetIdRef.current !== null) return;
    try {
      widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
        sitekey: RECAPTCHA_V2_SITEKEY,
        callback: (token: string) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => setCaptchaError(true),
        theme: "dark",
      });
      setCaptchaLoaded(true);
    } catch {
      setCaptchaError(true);
    }
  }, []);

  useEffect(() => {
    if (user || mode !== "password") return;

    // Load reCAPTCHA script
    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      if (window.grecaptcha) renderCaptcha();
      return;
    }

    window.onRecaptchaLoad = () => renderCaptcha();

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
    script.async = true;
    script.defer = true;
    script.onerror = () => setCaptchaError(true);
    document.head.appendChild(script);

    return () => {
      window.onRecaptchaLoad = undefined;
    };
  }, [user, mode, renderCaptcha]);

  // Re-render captcha when switching back to password mode
  useEffect(() => {
    if (mode === "password" && window.grecaptcha && captchaRef.current && widgetIdRef.current === null) {
      renderCaptcha();
    }
  }, [mode, renderCaptcha]);

  if (user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
            <div className="w-16 h-16 bg-accent-green rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h2 className="text-xl font-bold mb-2">
              Xin chào, {user.fullName || user.phoneNumber || "bạn"}
            </h2>
            <p className="text-text-secondary text-sm mb-6">Bạn đã đăng nhập thành công</p>
            <Link
              href="/thong-tin/tai-khoan"
              className="inline-block bg-accent-green hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Đi đến tài khoản
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
      setError("Số điện thoại không hợp lệ (VD: 0912345678)");
      return;
    }
    if (password.length < 8 || password.length > 16) {
      setError("Mật khẩu phải từ 8-16 ký tự");
      return;
    }
    if (!captchaToken) {
      setError("Vui lòng xác nhận reCAPTCHA");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ username: phone, password, captcha: captchaToken });
      if (result.success) {
        router.push("/thong-tin/tai-khoan");
      } else {
        setError(result.error || "Đăng nhập thất bại");
        // Reset captcha after failed attempt
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
          setCaptchaToken("");
        }
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTokenLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = token.trim();
    if (!trimmed) {
      setError("Vui lòng nhập token");
      return;
    }
    if (trimmed.length < 50) {
      setError("Token không hợp lệ (quá ngắn)");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ token: trimmed });
      if (result.success) {
        router.push("/thong-tin/tai-khoan");
      } else {
        setError(result.error || "Token không hợp lệ");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-green rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
            <p className="text-text-secondary text-sm mt-2">
              Đăng nhập vào hệ thống đấu giá biển số xe
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-lg bg-bg-card border border-border p-1 mb-6">
            <button
              onClick={() => { setMode("password"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "password"
                  ? "bg-accent-green text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Mật khẩu
            </button>
            <button
              onClick={() => { setMode("token"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "token"
                  ? "bg-accent-green text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Token
            </button>
          </div>

          {mode === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm pr-12 focus:outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary text-sm"
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              {/* reCAPTCHA */}
              <div>
                {captchaError ? (
                  <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-lg px-4 py-3 text-sm text-accent-orange">
                    reCAPTCHA không tải được (do giới hạn domain). Hãy dùng tab{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("token"); setError(""); }}
                      className="underline font-medium"
                    >
                      Token
                    </button>{" "}
                    để đăng nhập.
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div ref={captchaRef} />
                    {!captchaLoaded && (
                      <div className="text-text-secondary text-sm py-3">Đang tải reCAPTCHA...</div>
                    )}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (!captchaToken && !captchaError)}
                className="w-full bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTokenLogin} className="space-y-4">
              {/* Token instructions */}
              <div className="bg-bg-card border border-border rounded-lg p-4 text-sm text-text-secondary space-y-2">
                <p className="font-medium text-text-primary">Hướng dẫn lấy token:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Đăng nhập tại{" "}
                    <a href={VPA_URL} target="_blank" rel="noopener noreferrer" className="text-accent-blue underline">
                      dgbs.vpa.com.vn
                    </a>
                  </li>
                  <li>Mở DevTools (F12) &rarr; tab Application</li>
                  <li>Local Storage &rarr; tìm key chứa &quot;token&quot;</li>
                  <li>Copy giá trị token và dán vào đây</li>
                </ol>
              </div>

              {/* Token input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  JWT Token
                </label>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Dán JWT token tại đây..."
                  rows={4}
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue font-mono text-xs"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Đang xác thực..." : "Đăng nhập bằng token"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-text-secondary text-xs">HOẶC</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* VPA direct login */}
          <a
            href={`${VPA_URL}/dang-nhap`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-bg-card hover:bg-bg-input border border-border text-text-primary py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            Đăng nhập trên dgbs.vpa.com.vn
          </a>

          {/* Register link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Chưa có tài khoản?{" "}
            <Link
              href="/dang-ky"
              className="text-accent-green hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
