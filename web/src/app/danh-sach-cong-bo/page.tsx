"use client";

import { useState, useEffect } from "react";
import type { PublicFile } from "@/types";
import { getPublicFiles } from "@/lib/api";

export default function DanhSachCongBoPage() {
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicFiles()
      .then((data) => setFiles(data.result ?? []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">DANH SÁCH CÔNG BỐ</h1>

      <div className="bg-bg-secondary rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center text-text-secondary">Đang tải dữ liệu...</div>
        ) : files.length === 0 ? (
          <div className="px-4 py-12 text-center text-text-secondary">Không có thông báo nào</div>
        ) : (
          <div className="divide-y divide-border">
            {files.map((file, idx) => {
              const date = new Date(file.timePublic);
              return (
                <div key={idx} className="px-6 py-4 hover:bg-bg-card transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent-red/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-red text-sm font-bold">PDF</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">{file.nameFile}</h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Ngày công bố: {date.toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.documentFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-accent-blue hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                  >
                    Tải xuống
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
