"use client";

import { useState, useEffect } from "react";
import { getNotifications } from "@/lib/api";

interface Notification {
  uuid: string;
  title: string;
  body: string;
  isSeen: number;
  createdDate: number;
  click_action: string;
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

export default function ThongBaoPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getNotifications()
      .then((data) => setNotifications(data as Notification[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-text-secondary py-12">Đang tải dữ liệu...</div>;

  if (error) {
    return (
      <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-accent-red text-sm">
        {error.includes("401") ? <span>Chưa đăng nhập. <a href="/dang-nhap" className="underline font-medium">Đăng nhập ngay</a></span> : `Lỗi: ${error}`}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        {notifications.some((n) => n.isSeen === 0) && (
          <span className="bg-accent-red text-white text-xs px-2 py-1 rounded-full">
            {notifications.filter((n) => n.isSeen === 0).length} chưa đọc
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-bg-secondary rounded-xl border border-border p-16 text-center">
          <div className="text-4xl mb-4 opacity-30">🔔</div>
          <p className="text-text-secondary">Chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.uuid}
              className={`bg-bg-secondary rounded-xl border p-5 transition-colors ${
                n.isSeen === 0
                  ? "border-accent-blue/40 bg-accent-blue/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {n.isSeen === 0 && (
                      <span className="w-2 h-2 bg-accent-blue rounded-full flex-shrink-0" />
                    )}
                    <h3 className="text-sm font-semibold">{n.title}</h3>
                  </div>
                  <p className="text-sm text-text-secondary leading-6">{n.body}</p>
                </div>
                <span className="text-xs text-text-secondary flex-shrink-0">
                  {formatDate(n.createdDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
