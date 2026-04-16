"use client";

import { VPA_URL } from "@/lib/constants";

export default function XacMinhTaiKhoanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Xác minh tài khoản</h1>

      <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-5 py-4 text-sm text-accent-blue mb-6">
        Xác minh tài khoản yêu cầu chụp ảnh CCCD và khuôn mặt (eKYC) hoặc xác thực qua VNeID.
        Vui lòng thực hiện tại{" "}
        <a href={`${VPA_URL}/thong-tin/xac-minh-tai-khoan`} target="_blank" rel="noopener noreferrer"
          className="underline font-medium">dgbs.vpa.com.vn</a>
      </div>

      {/* eKYC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
          <a href={`${VPA_URL}/thong-tin/xac-minh-tai-khoan`} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-block bg-accent-green hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
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
          <a href={`${VPA_URL}/thong-tin/xac-minh-tai-khoan`} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-block bg-accent-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
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
    </div>
  );
}
