"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "input" | "otp";

export default function QuenMatKhauPage() {
  const [step, setStep] = useState<Step>("input");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!contact.trim()) {
      setError("Vui lòng nhập số điện thoại hoặc email");
      return;
    }

    // Placeholder: feature not yet available
    setInfo("Chức năng đang phát triển. Vui lòng liên hệ hotline 1900.0091 để được hỗ trợ đặt lại mật khẩu.");
  }

  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }

    // Placeholder
    setInfo("Chức năng đang phát triển. Vui lòng liên hệ hotline 1900.0091");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent-orange/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
            <p className="text-text-secondary text-sm mt-2">
              Nhập thông tin để lấy lại mật khẩu
            </p>
          </div>

          {info && (
            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg px-4 py-3 text-sm text-accent-blue mb-4">
              {info}
            </div>
          )}

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red mb-4">
              {error}
            </div>
          )}

          {step === "input" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Số điện thoại hoặc Email
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Nhập số điện thoại hoặc email đã đăng ký"
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent-green hover:bg-green-600 text-white py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Gửi mã OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("otp");
                  setError("");
                  setInfo("");
                }}
                className="w-full text-text-secondary hover:text-text-primary text-xs transition-colors py-1"
              >
                Đã có mã OTP? Nhập tại đây
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Mã OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP đã nhận"
                  maxLength={6}
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue text-center tracking-widest font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent-green hover:bg-green-600 text-white py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Đặt lại mật khẩu
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setError("");
                  setInfo("");
                }}
                className="w-full text-text-secondary hover:text-text-primary text-sm transition-colors py-2"
              >
                ← Quay lại
              </button>
            </form>
          )}

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-text-secondary">
              Nhớ mật khẩu?{" "}
              <Link href="/dang-nhap" className="text-accent-green hover:underline font-medium">
                Đăng nhập
              </Link>
            </p>
            <p className="text-xs text-text-secondary">
              Hotline hỗ trợ:{" "}
              <a href="tel:19000091" className="text-accent-blue hover:underline font-medium">
                1900.0091
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
