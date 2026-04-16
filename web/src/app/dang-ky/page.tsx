"use client";

import { useState } from "react";
import Link from "next/link";
import { VPA_URL } from "@/lib/constants";

type AccountType = "personal" | "organization";

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;

export default function DangKyPage() {
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    taxCode: "",
  });
  const [error, setError] = useState("");

  function updateField(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.phone || !formData.email || !formData.idNumber || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    if (!PHONE_REGEX.test(formData.phone)) {
      setError("Số điện thoại không hợp lệ (VD: 0912345678)");
      return;
    }
    if (!EMAIL_REGEX.test(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }
    if (!PASSWORD_REGEX.test(formData.password)) {
      setError("Mật khẩu phải từ 8-16 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (accountType === "organization" && (!formData.orgName || !formData.taxCode)) {
      setError("Vui lòng nhập đầy đủ thông tin tổ chức");
      return;
    }

    setError(
      "Chức năng đăng ký cần tích hợp reCAPTCHA và OTP. Vui lòng sử dụng trang chính dgbs.vpa.com.vn"
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
            <p className="text-text-secondary text-sm mt-2">
              Tạo tài khoản để tham gia đấu giá biển số xe
            </p>
          </div>

          {/* Notice */}
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg px-4 py-3 text-sm text-accent-blue mb-4">
            Để đăng ký, vui lòng sử dụng{" "}
            <a
              href={VPA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              dgbs.vpa.com.vn
            </a>{" "}
            (cần reCAPTCHA + OTP)
          </div>

          {/* Account type toggle */}
          <div className="flex bg-bg-input rounded-lg p-1 mb-6">
            <button
              onClick={() => setAccountType("personal")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                accountType === "personal"
                  ? "bg-accent-green text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Cá nhân
            </button>
            <button
              onClick={() => setAccountType("organization")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                accountType === "organization"
                  ? "bg-accent-green text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Tổ chức
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {accountType === "organization" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Tên tổ chức</label>
                  <input type="text" value={formData.orgName} onChange={(e) => updateField("orgName", e.target.value)}
                    placeholder="Nhập tên tổ chức" className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Mã số thuế</label>
                  <input type="text" value={formData.taxCode} onChange={(e) => updateField("taxCode", e.target.value)}
                    placeholder="Nhập mã số thuế" className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {accountType === "personal" ? "Họ và tên" : "Người đại diện"}
              </label>
              <input type="text" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Nhập họ và tên" className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Số CCCD/CMND</label>
              <input type="text" value={formData.idNumber} onChange={(e) => updateField("idNumber", e.target.value)}
                placeholder="Nhập số CCCD/CMND" className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Số điện thoại</label>
                <input type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Nhập SĐT" className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
                <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Nhập email" className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Mật khẩu</label>
                <input type="password" value={formData.password} onChange={(e) => updateField("password", e.target.value)}
                  placeholder="8-16 ký tự" className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Xác nhận mật khẩu</label>
                <input type="password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Nhập lại mật khẩu" className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue" />
              </div>
            </div>

            <p className="text-xs text-text-secondary">
              Mật khẩu: 8-16 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
            </p>

            {error && (
              <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
                {error}
              </div>
            )}

            <button type="submit"
              className="w-full bg-accent-green hover:bg-green-600 text-white py-3 rounded-lg text-sm font-medium transition-colors">
              Đăng ký
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-text-secondary text-xs">HOẶC</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <button className="w-full bg-bg-card hover:bg-bg-input border border-border text-text-primary py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <span className="text-accent-blue font-bold">VNeID</span>
            Đăng ký bằng VNeID
          </button>

          <p className="text-center text-sm text-text-secondary mt-6">
            Đã có tài khoản?{" "}
            <Link href="/dang-nhap" className="text-accent-green hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
