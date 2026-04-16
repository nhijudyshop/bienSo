"use client";

import { useState, useEffect } from "react";
import { getDocuments } from "@/lib/api";

interface Document {
  documentId: string;
  fileName: string;
  documentType: string;
  createdDate: number;
  status: number; // 0=pending, 1=approved, 2=rejected
}

function formatDate(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: number): { text: string; className: string } {
  switch (status) {
    case 0:
      return { text: "Chờ duyệt", className: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" };
    case 1:
      return { text: "Đã duyệt", className: "bg-accent-green/15 text-accent-green border-accent-green/30" };
    case 2:
      return { text: "Từ chối", className: "bg-accent-red/15 text-accent-red border-accent-red/30" };
    default:
      return { text: "Không rõ", className: "bg-bg-card text-text-secondary border-border" };
  }
}

export default function QuanLyHoSoPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadMsg, setShowUploadMsg] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-text-secondary">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-accent-red text-sm">
        {error.includes("401") ? (
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Quản lý hồ sơ</h1>
        <button
          onClick={() => setShowUploadMsg(true)}
          className="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Tải lên
        </button>
      </div>

      {/* Upload placeholder message */}
      {showUploadMsg && (
        <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-4 py-3 text-sm text-accent-blue mb-4 flex items-center justify-between">
          <span>Chức năng upload đang phát triển</span>
          <button
            onClick={() => setShowUploadMsg(false)}
            className="text-accent-blue hover:text-blue-400 ml-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Empty state */}
      {docs.length === 0 ? (
        <div className="bg-bg-secondary rounded-xl border border-border p-16 text-center">
          <div className="w-16 h-16 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-secondary opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm">Chưa có hồ sơ nào</p>
        </div>
      ) : (
        <>
          {/* Mobile: card layout */}
          <div className="sm:hidden space-y-3">
            {docs.map((doc) => {
              const st = statusLabel(doc.status);
              return (
                <div
                  key={doc.documentId}
                  className="bg-bg-secondary rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-text-primary truncate">
                        {doc.fileName}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {doc.documentType}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${st.className}`}
                    >
                      {st.text}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {formatDate(doc.createdDate)}
                    </span>
                    <a
                      href={`/api/proxy?endpoint=${encodeURIComponent(
                        `/web-api/user-bidding/api/document/v2/download?documentId=${doc.documentId}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent-blue hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Tải về
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden sm:block bg-bg-secondary rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Tên tệp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((doc) => {
                  const st = statusLabel(doc.status);
                  return (
                    <tr key={doc.documentId} className="hover:bg-bg-card transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <span className="text-sm text-text-primary truncate max-w-[200px]">
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {doc.documentType}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {formatDate(doc.createdDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border ${st.className}`}
                        >
                          {st.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`/api/proxy?endpoint=${encodeURIComponent(
                            `/web-api/user-bidding/api/document/v2/download?documentId=${doc.documentId}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent-blue hover:underline inline-flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Tải về
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 text-center text-xs text-text-secondary">
            {docs.length} hồ sơ
          </div>
        </>
      )}
    </div>
  );
}
