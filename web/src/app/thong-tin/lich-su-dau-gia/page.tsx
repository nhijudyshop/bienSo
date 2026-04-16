"use client";

import { useState, useEffect } from "react";
import { getAuctionHistory } from "@/lib/api";

export default function LichSuDauGiaPage() {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuctionHistory()
      .then((data) => {
        const d = data as { success: boolean; result: { content: unknown[] } };
        setItems(d.result?.content ?? []);
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
      <h1 className="text-2xl font-bold mb-6">Lịch sử đấu giá</h1>

      {items.length === 0 ? (
        <div className="bg-bg-secondary rounded-xl border border-border p-16 text-center">
          <div className="text-4xl mb-4 opacity-30">📋</div>
          <p className="text-text-secondary">Chưa có lịch sử đấu giá</p>
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-xl border border-border p-6">
          <pre className="text-sm text-text-secondary overflow-auto">
            {JSON.stringify(items, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
