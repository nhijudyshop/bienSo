"use client";

import { useState } from "react";
import Link from "next/link";

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

export default function DangNhapPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

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
    setTimeout(() => {
      setError(
        "Chuc nang dang nhap can tich hop reCAPTCHA va Cloudflare. Vui long su dung trang chinh dgbs.vpa.com.vn"
      );
      setLoading(false);
    }, 1000);
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

          {/* Notice */}
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg px-4 py-3 text-sm text-accent-blue mb-4">
            De dang nhap, vui long su dung{" "}
            <a
              href="https://dgbs.vpa.com.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              dgbs.vpa.com.vn
            </a>{" "}
            (can reCAPTCHA)
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Remember */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-text-secondary">Ghi nho dang nhap</span>
              </label>
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
              {loading ? "Dang dang nhap..." : "Dang nhap"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-text-secondary text-xs">HOAC</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* VNeID */}
          <button className="w-full bg-bg-card hover:bg-bg-input border border-border text-text-primary py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <span className="text-accent-blue font-bold">VNeID</span>
            Dang nhap bang VNeID
          </button>

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
