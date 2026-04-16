"use client";

import { useState, useEffect } from "react";
import type { PublicFile } from "@/types";
import { getPublicFiles } from "@/lib/api";

export default function QuyChePage() {
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicFiles()
      .then((data) => setFiles(data.result ?? []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">QUY CHẾ ĐẤU GIÁ</h1>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-green text-2xl mb-2">01</div>
          <h3 className="font-semibold mb-2">Đăng ký tài khoản</h3>
          <p className="text-text-secondary text-sm">
            Tạo tài khoản và xác minh danh tính qua eKYC hoặc VNeID
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-blue text-2xl mb-2">02</div>
          <h3 className="font-semibold mb-2">Đăng ký đấu giá</h3>
          <p className="text-text-secondary text-sm">
            Chọn biển số, đóng tiền đặt trước và chấp thuận quy chế
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-orange text-2xl mb-2">03</div>
          <h3 className="font-semibold mb-2">Tham gia đấu giá</h3>
          <p className="text-text-secondary text-sm">
            Vào phòng đấu giá trực tuyến và đặt giá theo thời gian thực
          </p>
        </div>
      </div>

      {/* Thủ tục sau đấu giá */}
      <div className="bg-bg-secondary rounded-xl p-6 border border-border mb-8">
        <h2 className="text-lg font-semibold mb-4">Thủ tục sau đấu giá</h2>
        <ol className="space-y-3 text-sm text-text-secondary">
          <li className="flex gap-3">
            <span className="bg-accent-green/20 text-accent-green rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
            <span>Xác nhận Biên bản đấu giá trực tuyến trong thời hạn quy định tại Quy chế đấu giá</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-accent-green/20 text-accent-green rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
            <span>Nộp toàn bộ số tiền trúng đấu giá (trừ tiền đặt trước) trong 30 ngày kể từ ngày có Thông báo kết quả</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-accent-green/20 text-accent-green rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
            <span>Nhận hóa đơn điện tử và Quyết định xác nhận biển số xe trúng đấu giá qua email</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-accent-green/20 text-accent-green rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
            <span>Đăng ký biển số tại Phòng CSGT cấp tỉnh/thành phố nơi cư trú</span>
          </li>
        </ol>
      </div>

      {/* Documents */}
      <div className="bg-bg-secondary rounded-xl overflow-hidden border border-border">
        <h2 className="text-lg font-semibold px-6 py-4 border-b border-border">
          Tài liệu quy chế
        </h2>
        {loading ? (
          <div className="px-4 py-8 text-center text-text-secondary">Đang tải dữ liệu...</div>
        ) : (
          <div className="divide-y divide-border">
            {files.map((file, idx) => (
              <div key={idx} className="px-6 py-3 hover:bg-bg-card transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-accent-red text-xs font-bold">PDF</span>
                  <span className="text-sm">{file.nameFile}</span>
                </div>
                <a href={file.documentFile} target="_blank" rel="noopener noreferrer"
                  className="text-accent-blue hover:underline text-xs flex-shrink-0">
                  Tải xuống
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
