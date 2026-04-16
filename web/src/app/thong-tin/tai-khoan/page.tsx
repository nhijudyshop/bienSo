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
}

export default function TaiKhoanPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserProfile()
      .then((data) => setProfile(data as UserProfile))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-text-secondary py-12">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-accent-red text-sm">
        {error.includes("401") || error.includes("UNAUTHENTICATED")
          ? <span>Chua dang nhap. <a href="/dang-nhap" className="underline font-medium">Dang nhap ngay</a></span>
          : `Loi: ${error}`}
      </div>
    );
  }

  if (!profile) return null;

  const fields = [
    { label: "Họ và tên", value: profile.fullname },
    { label: "Số điện thoại", value: profile.phone },
    { label: "Email", value: profile.email },
    { label: "Số CCCD/CMND", value: profile.identityNumber },
    { label: "Địa chỉ", value: profile.address },
    { label: "Ngày sinh", value: profile.dateOfBirth || "—" },
    { label: "Loại tài khoản", value: profile.accountType === 1 ? "Cá nhân" : "Tổ chức" },
    ...(profile.companyName ? [{ label: "Tên tổ chức", value: profile.companyName }] : []),
    ...(profile.taxCode ? [{ label: "Mã số thuế", value: profile.taxCode }] : []),
  ];

  const bankFields = [
    { label: "Chủ tài khoản", value: profile.bankAccountOwner || "—" },
    { label: "Số tài khoản", value: profile.bankAccount || "—" },
    { label: "Ngân hàng", value: profile.bank || "—" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản</h1>

      {/* Personal info */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <div className="text-xs text-text-secondary mb-1">{f.label}</div>
              <div className="text-sm bg-bg-input rounded-lg px-3 py-2.5 border border-border">
                {f.value || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank info */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin ngân hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankFields.map((f) => (
            <div key={f.label}>
              <div className="text-xs text-text-secondary mb-1">{f.label}</div>
              <div className="text-sm bg-bg-input rounded-lg px-3 py-2.5 border border-border">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
