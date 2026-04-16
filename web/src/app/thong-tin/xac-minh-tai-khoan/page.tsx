"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { VPA_URL } from "@/lib/constants";

function getStatusInfo(profileStatus: number) {
  if (profileStatus >= 5) {
    return { label: "Đã xác minh", color: "accent-green", verified: true };
  }
  if (profileStatus >= 1) {
    return { label: "Đang xác minh", color: "accent-orange", verified: false };
  }
  return { label: "Chưa xác minh", color: "accent-red", verified: false };
}

export default function XacMinhTaiKhoanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profileStatus, setProfileStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        const profile = (await getUserProfile()) as Record<string, unknown> | null;
        if (profile && typeof profile.profileStatus === "number") {
          setProfileStatus(profile.profileStatus);
        } else {
          setProfileStatus(0);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "";
        if (message.includes("401")) {
          router.push("/dang-nhap");
          return;
        }
        setError("Không thể tải thông tin xác minh");
        setProfileStatus(0);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Vui lòng đăng nhập để xem trạng thái xác minh</p>
          <Link href="/dang-nhap" className="inline-block bg-accent-green hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-green/30 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  const status = getStatusInfo(profileStatus ?? 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Xác minh tài khoản</h1>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red mb-6">
          {error}
        </div>
      )}

      {/* Verification status badge */}
      <div className={`bg-${status.color}/10 border border-${status.color}/30 rounded-xl px-5 py-4 mb-6 flex items-center gap-3`}>
        <div className={`w-10 h-10 bg-${status.color}/20 rounded-full flex items-center justify-center flex-shrink-0`}>
          {status.verified ? (
            <svg className={`w-5 h-5 text-${status.color}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 text-${status.color}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div>
          <p className={`text-sm font-semibold text-${status.color}`}>{status.label}</p>
          <p className="text-xs text-text-secondary mt-0.5">
            {status.verified
              ? "Tài khoản đã được xác minh. Bạn có thể tham gia đấu giá biển số."
              : profileStatus !== null && profileStatus >= 1
                ? "Hồ sơ xác minh đang được xử lý. Vui lòng chờ kết quả."
                : "Bạn cần xác minh tài khoản trước khi tham gia đấu giá."}
          </p>
        </div>
      </div>

      {/* If verified, show success state */}
      {status.verified ? (
        <div className="bg-bg-secondary rounded-xl border border-border p-8 text-center">
          <div className="w-20 h-20 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-accent-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-accent-green mb-2">Tài khoản đã được xác minh</h2>
          <p className="text-text-secondary text-sm mb-6">
            Tài khoản của bạn đã hoàn tất xác minh danh tính. Bạn có thể tham gia đấu giá biển số xe.
          </p>
          <Link href="/thong-tin/tai-khoan" className="inline-block bg-accent-green hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
            Quay lại tài khoản
          </Link>
        </div>
      ) : (
        <>
          {/* Verification info */}
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-5 py-4 text-sm text-accent-blue mb-6">
            Xác minh tài khoản yêu cầu chụp ảnh CCCD và khuôn mặt (eKYC) hoặc xác thực qua VNeID.
            Vui lòng thực hiện tại{" "}
            <a href={`${VPA_URL}/thong-tin/xac-minh-tai-khoan`} target="_blank" rel="noopener noreferrer"
              className="underline font-medium">dgbs.vpa.com.vn</a>
          </div>

          {/* Verification options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* eKYC */}
            <div className="bg-bg-secondary rounded-xl border border-border p-6">
              <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-accent-green text-xl font-bold">ID</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Xác minh qua eKYC</h3>
              <p className="text-text-secondary text-sm leading-6 mb-4">
                Chụp ảnh CCCD/CMND mặt trước và mặt sau, sau đó chụp ảnh khuôn mặt (selfie) để hệ thống xác minh tự động.
              </p>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex gap-2">
                  <span className="text-accent-green">1.</span>
                  <span>Chụp ảnh CCCD mặt trước</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-accent-green">2.</span>
                  <span>Chụp ảnh CCCD mặt sau</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-accent-green">3.</span>
                  <span>Chụp ảnh khuôn mặt (selfie)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-accent-green">4.</span>
                  <span>Hệ thống xác minh tự động</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-text-secondary italic">
                Vui lòng thực hiện xác minh tại dgbs.vpa.com.vn
              </p>
              <a href={`${VPA_URL}/thong-tin/xac-minh-tai-khoan`} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-block bg-accent-green hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Xác minh eKYC
              </a>
            </div>

            {/* VNeID */}
            <div className="bg-bg-secondary rounded-xl border border-border p-6">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-accent-blue text-sm font-bold">VNeID</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Xác minh qua VNeID</h3>
              <p className="text-text-secondary text-sm leading-6 mb-4">
                Sử dụng ứng dụng Định danh điện tử quốc gia (VNeID) để xác minh nhanh chóng và an toàn.
              </p>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex gap-2">
                  <span className="text-accent-blue">1.</span>
                  <span>Nhấn xác minh qua VNeID</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-accent-blue">2.</span>
                  <span>Chuyển hướng sang cổng VNeID</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-accent-blue">3.</span>
                  <span>Xác thực trên ứng dụng VNeID</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-accent-blue">4.</span>
                  <span>Thông tin tự động cập nhật</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-text-secondary italic">
                Kết nối VNeID tại dgbs.vpa.com.vn
              </p>
              <a href={`${VPA_URL}/thong-tin/xac-minh-tai-khoan`} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-block bg-accent-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Xác minh VNeID
              </a>
            </div>
          </div>

          {/* Note for organizations */}
          <div className="bg-bg-secondary rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-2">Tổ chức / Doanh nghiệp</h3>
            <p className="text-text-secondary text-sm leading-6">
              Đối với tài khoản tổ chức, cần xác minh thêm Đăng ký kinh doanh (ĐKKD) qua hệ thống eKYC.
              Vui lòng chuẩn bị ảnh chụp ĐKKD rõ ràng.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
