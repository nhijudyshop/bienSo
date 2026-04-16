"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { changePassword } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function DoiMatKhauPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setError("Mật khẩu phải từ 8-16 ký tự");
      return;
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setError("Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đổi mật khẩu thất bại";
      if (message.includes("401")) {
        router.push("/dang-nhap");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
            <p className="text-text-secondary mb-4">Vui lòng đăng nhập để đổi mật khẩu</p>
            <Link href="/dang-nhap" className="inline-block bg-accent-green hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
            <p className="text-text-secondary text-sm mt-2">
              Cập nhật mật khẩu tài khoản của bạn
            </p>
          </div>

          {success && (
            <div className="bg-accent-green/10 border border-accent-green/30 rounded-lg px-4 py-3 text-sm text-accent-green mb-4">
              Đổi mật khẩu thành công!
            </div>
          )}

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
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

            {/* Password requirements */}
            <div className="bg-bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-xs font-medium text-text-secondary mb-2">Yêu cầu mật khẩu:</p>
              <ul className="text-xs text-text-secondary space-y-1">
                <li className={newPassword.length >= 8 && newPassword.length <= 16 ? "text-accent-green" : ""}>
                  - Từ 8 đến 16 ký tự
                </li>
                <li className={/[A-Z]/.test(newPassword) ? "text-accent-green" : ""}>
                  - Ít nhất 1 chữ cái viết hoa (A-Z)
                </li>
                <li className={/[a-z]/.test(newPassword) ? "text-accent-green" : ""}>
                  - Ít nhất 1 chữ cái viết thường (a-z)
                </li>
                <li className={/[0-9]/.test(newPassword) ? "text-accent-green" : ""}>
                  - Ít nhất 1 chữ số (0-9)
                </li>
                <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) ? "text-accent-green" : ""}>
                  - Ít nhất 1 ký tự đặc biệt (!@#$%...)
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            <Link href="/thong-tin/tai-khoan" className="text-accent-green hover:underline font-medium">
              ← Quay lại tài khoản
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
