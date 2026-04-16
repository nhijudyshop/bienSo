"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { VPA_URL } from "@/lib/constants";

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

type LoginMode = "password" | "token";

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
  const [needsCaptcha, setNeedsCaptcha] = useState(false);

  // Already logged in
  if (user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
            <div className="w-16 h-16 bg-accent-green rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h2 className="text-xl font-bold mb-2">
              Xin chao, {user.fullName || user.phoneNumber || "ban"}
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Ban da dang nhap thanh cong
            </p>
            <Link
              href="/thong-tin/tai-khoan"
              className="inline-block bg-accent-green hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Di den tai khoan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsCaptcha(false);

    if (!phone || !password) {
      setError("Vui long nhap day du thong tin");
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
      setError("So dien thoai khong hop le (VD: 0912345678)");
      return;
    }
    if (password.length < 8 || password.length > 16) {
      setError("Mat khau phai tu 8-16 ky tu");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ username: phone, password });
      if (result.success) {
        router.push("/thong-tin/tai-khoan");
      } else {
        setError(result.error || "Dang nhap that bai");
        if (result.needsCaptcha) {
          setNeedsCaptcha(true);
        }
      }
    } catch {
      setError("Loi ket noi. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTokenLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = token.trim();
    if (!trimmed) {
      setError("Vui long nhap token");
      return;
    }
    if (trimmed.length < 50) {
      setError("Token khong hop le (qua ngan)");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ token: trimmed });
      if (result.success) {
        router.push("/thong-tin/tai-khoan");
      } else {
        setError(result.error || "Token khong hop le");
      }
    } catch {
      setError("Loi ket noi. Vui long thu lai.");
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
            <h1 className="text-2xl font-bold">Dang nhap</h1>
            <p className="text-text-secondary text-sm mt-2">
              Dang nhap vao he thong dau gia bien so xe
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
              Mat khau
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
                  So dien thoai
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhap so dien thoai"
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Mat khau
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhap mat khau"
                    className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm pr-12 focus:outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary text-sm"
                  >
                    {showPassword ? "An" : "Hien"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
                  {error}
                </div>
              )}

              {/* Captcha hint */}
              {needsCaptcha && (
                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg px-4 py-3 text-sm text-accent-blue">
                  VPA yeu cau reCAPTCHA khi dang nhap bang mat khau. Hay chuyen sang tab{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("token"); setError(""); setNeedsCaptcha(false); }}
                    className="underline font-medium"
                  >
                    Token
                  </button>{" "}
                  de dang nhap.
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Dang dang nhap..." : "Dang nhap"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTokenLogin} className="space-y-4">
              {/* Token instructions */}
              <div className="bg-bg-card border border-border rounded-lg p-4 text-sm text-text-secondary space-y-2">
                <p className="font-medium text-text-primary">Huong dan lay token:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Dang nhap tai{" "}
                    <a href={VPA_URL} target="_blank" rel="noopener noreferrer" className="text-accent-blue underline">
                      dgbs.vpa.com.vn
                    </a>
                  </li>
                  <li>Mo DevTools (F12) &rarr; tab Application</li>
                  <li>Local Storage &rarr; tim key chua &quot;token&quot;</li>
                  <li>Copy gia tri token va dan vao day</li>
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
                  placeholder="Dan JWT token tai day..."
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
                {loading ? "Dang xac thuc..." : "Dang nhap bang token"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-text-secondary text-xs">HOAC</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* VNeID */}
          <a
            href={`${VPA_URL}/dang-nhap`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-bg-card hover:bg-bg-input border border-border text-text-primary py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            Dang nhap tren dgbs.vpa.com.vn
          </a>

          {/* Register link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Chua co tai khoan?{" "}
            <Link
              href="/dang-ky"
              className="text-accent-green hover:underline font-medium"
            >
              Dang ky ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
