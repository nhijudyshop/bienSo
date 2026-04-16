"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotifications } from "@/lib/api";

interface Notification {
  uuid: string;
  title: string;
  body: string;
  isSeen: number; // 0=unread, 1=read
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

function timeAgo(ts: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatDate(ts);
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

  const unreadCount = notifications.filter((n) => n.isSeen === 0).length;

  const toggleRead = useCallback((uuid: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.uuid === uuid ? { ...n, isSeen: n.isSeen === 0 ? 1 : 0 } : n
      )
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isSeen: 1 })));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-text-secondary">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Đang tải thông báo...</span>
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="bg-accent-red text-white text-xs font-semibold px-2.5 py-1 rounded-full min-w-[24px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-accent-blue hover:underline transition-colors"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="bg-bg-secondary rounded-xl border border-border p-16 text-center">
          <div className="w-16 h-16 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-secondary opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm">Chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.uuid}
              onClick={() => toggleRead(n.uuid)}
              className={`bg-bg-secondary rounded-xl border p-4 sm:p-5 transition-all cursor-pointer hover:bg-bg-card ${
                n.isSeen === 0
                  ? "border-accent-blue/40 bg-accent-blue/5"
                  : "border-border opacity-75"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Unread indicator */}
                <div className="flex-shrink-0 pt-1.5">
                  <span
                    className={`block w-2.5 h-2.5 rounded-full transition-colors ${
                      n.isSeen === 0 ? "bg-accent-blue" : "bg-transparent border border-border"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3
                      className={`text-sm leading-snug ${
                        n.isSeen === 0 ? "font-semibold text-text-primary" : "font-medium text-text-secondary"
                      }`}
                    >
                      {n.title}
                    </h3>
                    <span className="text-xs text-text-secondary flex-shrink-0 whitespace-nowrap">
                      {timeAgo(n.createdDate)}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                    {n.body}
                  </p>
                </div>
              </div>

              {/* Action hint */}
              <div className="flex justify-end mt-2">
                <span className="text-xs text-text-secondary opacity-60">
                  {n.isSeen === 0 ? "Nhấn để đánh dấu đã đọc" : "Nhấn để đánh dấu chưa đọc"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {notifications.length > 0 && (
        <div className="mt-4 text-center text-xs text-text-secondary">
          {notifications.length} thông báo | {unreadCount} chưa đọc
        </div>
      )}
    </div>
  );
}
