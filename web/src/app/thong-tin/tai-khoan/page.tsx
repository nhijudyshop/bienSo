"use client";

import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/api";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  fullname: string;
  address: string;
  identityNumber: string;
  bankAccount: string;
  bankAccountOwner: string;
  bank: string;
  accountType: number;
  status: number;
  taxCode: string | null;
  companyName: string | null;
  dateOfBirth: string | null;
  profileStatus: number;
  provinceId: string;
  districtId: string | null;
  wardId: string;
  personIssuanceDate: number | null;
  personIssuancePlace: string;
  frontOfIdentityCard: { files: { filename: string; fileUrl: string }[] };
}

type Tab = "info" | "password";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">{label}</div>
      <div className="text-sm bg-bg-input rounded-lg px-3 py-2.5 border border-border text-text-primary">
        {value || "—"}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
      <span className="w-1 h-5 bg-accent-blue rounded-full inline-block" />
      {children}
    </h2>
  );
}

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("vi-VN");
}

function ChangePasswordTab() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    // TODO: call change-password API
    setMessage({ type: "success", text: "Chức năng đổi mật khẩu chưa được kết nối API." });
  };

  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-6 max-w-lg">
      <SectionTitle>Thay đổi mật khẩu</SectionTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full text-sm bg-bg-input rounded-lg px-3 py-2.5 border border-border text-text-primary focus:outline-none focus:border-accent-blue"
            placeholder="Nhập mật khẩu hiện tại"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full text-sm bg-bg-input rounded-lg px-3 py-2.5 border border-border text-text-primary focus:outline-none focus:border-accent-blue"
            placeholder="Nhập mật khẩu mới"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full text-sm bg-bg-input rounded-lg px-3 py-2.5 border border-border text-text-primary focus:outline-none focus:border-accent-blue"
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>

        {message && (
          <div
            className={`text-sm rounded-lg px-3 py-2 ${
              message.type === "error"
                ? "bg-accent-red/10 text-accent-red border border-accent-red/30"
                : "bg-accent-green/10 text-accent-green border border-accent-green/30"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          className="bg-accent-blue hover:bg-accent-blue/80 text-white text-sm font-medium rounded-lg px-6 py-2.5 transition-colors"
        >
          Cập nhật mật khẩu
        </button>
      </form>
    </div>
  );
}

export default function TaiKhoanPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("info");

  useEffect(() => {
    getUserProfile()
      .then((data) => setProfile(data as UserProfile))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center text-text-secondary py-12">Đang tải dữ liệu...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-accent-red text-sm">
        {error.includes("401") || error.includes("UNAUTHENTICATED") ? (
          <span>
            Chưa đăng nhập.{" "}
            <a href="/dang-nhap" className="underline font-medium">
              Đăng nhập ngay
            </a>
          </span>
        ) : (
          `Lỗi: ${error}`
        )}
      </div>
    );
  }

  if (!profile) return null;

  const frontImage = profile.frontOfIdentityCard?.files?.[0];
  const backImage = profile.frontOfIdentityCard?.files?.[1];

  const proxyUrl = (fileUrl: string) =>
    `/api/proxy?path=${encodeURIComponent(fileUrl)}`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "info"
              ? "bg-accent-blue text-white"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
          }`}
        >
          Cập nhật thông tin
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "password"
              ? "bg-accent-blue text-white"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
          }`}
        >
          Thay đổi mật khẩu
        </button>
      </div>

      {activeTab === "password" ? (
        <ChangePasswordTab />
      ) : (
        <div className="space-y-6">
          {/* Thong tin ca nhan */}
          <div className="bg-bg-secondary rounded-xl border border-border p-6">
            <SectionTitle>Thông tin cá nhân</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Số tài khoản" value={profile.username} />
              <InfoField label="Họ và tên" value={profile.fullname} />
              <InfoField label="Số điện thoại" value={profile.phone} />
              <InfoField label="Email" value={profile.email} />
              <InfoField label="Mã số thuế" value={profile.taxCode || "—"} />
              <InfoField label="Căn cước/CCCD" value={profile.identityNumber} />
              <InfoField
                label="Loại tài khoản"
                value={profile.accountType === 1 ? "Cá nhân" : "Tổ chức"}
              />
              {profile.companyName && (
                <InfoField label="Tên tổ chức" value={profile.companyName} />
              )}
            </div>
          </div>

          {/* Dia chi */}
          <div className="bg-bg-secondary rounded-xl border border-border p-6">
            <SectionTitle>Địa chỉ</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Địa chỉ thường trú" value={profile.address} />
              <InfoField label="Tỉnh/Thành phố" value={profile.provinceId ? `Mã: ${profile.provinceId}` : "—"} />
              <InfoField label="Quận/Huyện" value={profile.districtId ? `Mã: ${profile.districtId}` : "—"} />
              <InfoField label="Phường/Xã" value={profile.wardId ? `Mã: ${profile.wardId}` : "—"} />
            </div>
          </div>

          {/* CCCD info */}
          <div className="bg-bg-secondary rounded-xl border border-border p-6">
            <SectionTitle>Thông tin Căn cước/CCCD</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InfoField
                label="Ngày cấp"
                value={formatDate(profile.personIssuanceDate)}
              />
              <InfoField label="Nơi cấp" value={profile.personIssuancePlace} />
            </div>

            {/* CCCD images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-text-secondary mb-2">Ảnh căn cước/CCCD mặt trước</div>
                <div className="bg-bg-input rounded-lg border border-border overflow-hidden h-48 flex items-center justify-center">
                  {frontImage ? (
                    <img
                      src={proxyUrl(frontImage.fileUrl)}
                      alt="CCCD mặt trước"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-text-secondary text-sm">Chưa có ảnh</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary mb-2">Ảnh căn cước/CCCD mặt sau</div>
                <div className="bg-bg-input rounded-lg border border-border overflow-hidden h-48 flex items-center justify-center">
                  {backImage ? (
                    <img
                      src={proxyUrl(backImage.fileUrl)}
                      alt="CCCD mặt sau"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-text-secondary text-sm">Chưa có ảnh</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thong tin ngan hang */}
          <div className="bg-bg-secondary rounded-xl border border-border p-6">
            <SectionTitle>Thông tin ngân hàng</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoField label="Tên tài khoản" value={profile.bankAccountOwner} />
              <InfoField label="Số tài khoản ngân hàng" value={profile.bankAccount} />
              <InfoField label="Ngân hàng" value={profile.bank} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
