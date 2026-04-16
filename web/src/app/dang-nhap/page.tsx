"use client";

import { useState } from "react";
import Link from "next/link";

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
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    // Simulate login - in production this would call the real API
    setTimeout(() => {
      setError("Chức năng đăng nhập cần tích hợp reCAPTCHA và Cloudflare. Vui lòng sử dụng trang chính dgbs.vpa.com.vn");
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
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
            <p className="text-text-secondary text-sm mt-2">
              Đăng nhập vào hệ thống đấu giá biển số xe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-text-secondary">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/quen-mat-khau" className="text-sm text-accent-blue hover:underline">
                Quên mật khẩu?
              </Link>
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
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-text-secondary text-xs">HOẶC</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* VNeID */}
          <button className="w-full bg-bg-card hover:bg-bg-input border border-border text-text-primary py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <span className="text-accent-blue font-bold">VNeID</span>
            Đăng nhập bằng VNeID
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Chưa có tài khoản?{" "}
            <Link href="/dang-ky" className="text-accent-green hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
