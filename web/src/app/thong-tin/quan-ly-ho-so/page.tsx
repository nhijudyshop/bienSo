"use client";

import { useState, useEffect } from "react";
import { getDocuments } from "@/lib/api";

interface Document {
  documentId: string;
  fileName: string;
  documentType: string;
  createdDate: number;
  status: number;
}

function formatDate(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("vi-VN");
}

export default function QuanLyHoSoPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDocuments()
      .then((data) => {
        const d = data as { content?: Document[] } | Document[];
        if (Array.isArray(d)) {
          setDocs(d);
        } else {
          setDocs((d as { content?: Document[] }).content ?? []);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-text-secondary py-12">Đang tải dữ liệu...</div>;

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-accent-red text-sm">
        {error.includes("401") ? "Chưa đăng nhập. Chạy: node grab-token.js" : `Lỗi: ${error}`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tài liệu của tôi</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["Tự nguyện", "Căn cước", "Phiếu đấu", "Nhập biển số", "Biên bản đấu giá", "Trạng thái"].map((tab) => (
          <button
            key={tab}
            className="px-3 py-1.5 rounded-lg text-xs border border-border text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
          >
            {tab}
          </button>
        ))}
      </div>

      {docs.length === 0 ? (
        <div className="bg-bg-secondary rounded-xl border border-border p-16 text-center">
          <div className="text-4xl mb-4 opacity-30">📄</div>
          <p className="text-text-secondary">Không tìm thấy tài liệu nào</p>
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biển số</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Phiên đấu</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Ngày đấu giá</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biên bản đấu giá</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-bg-card">
                  <td className="px-4 py-3 text-sm">{doc.fileName ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{doc.documentType ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(doc.createdDate)}</td>
                  <td className="px-4 py-3 text-sm">—</td>
                  <td className="px-4 py-3 text-sm">{doc.status ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
