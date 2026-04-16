"use client";

import { useState, useEffect } from "react";
import { getOrdersWaitAuction, formatPrice } from "@/lib/api";
import PlateNumber from "@/components/PlateNumber";

interface WaitAuctionOrder {
  orderId: string;
  orderCode: string;
  plateNumber: string;
  colorCode: number;
  announcementNumber: string;
  auctionFromTime: number;
  auctionToTime: number;
  deposit: number;
}

function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PhongDauGiaPage() {
  const [orders, setOrders] = useState<WaitAuctionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrdersWaitAuction()
      .then((data) => {
        const d = data as { success: boolean; result: { content: WaitAuctionOrder[] } };
        setOrders(d.result?.content ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-2">PHÒNG ĐẤU GIÁ</h1>
      <p className="text-text-secondary text-center text-sm mb-8">
        Phòng đấu giá trực tuyến hoạt động tại{" "}
        <a
          href="https://phongdau.vpa.com.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-blue underline"
        >
          phongdau.vpa.com.vn
        </a>
      </p>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-green text-2xl font-bold mb-2">01</div>
          <h3 className="font-semibold mb-2">Đăng nhập phòng đấu</h3>
          <p className="text-text-secondary text-sm">
            Vào phòng đấu giá bằng tài khoản đã đăng ký, nhập mã xác thực nhận qua SMS/email
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-blue text-2xl font-bold mb-2">02</div>
          <h3 className="font-semibold mb-2">Đặt giá</h3>
          <p className="text-text-secondary text-sm">
            Xem bảng giá hiện tại và đặt giá mới. Giá sau phải cao hơn giá trước. Không giới hạn số lần trả giá
          </p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-5 border border-border">
          <div className="text-accent-orange text-2xl font-bold mb-2">03</div>
          <h3 className="font-semibold mb-2">Kết quả</h3>
          <p className="text-text-secondary text-sm">
            Khi hết thời gian, người có giá cao nhất sẽ trúng đấu giá. Kết quả công bố tại trang Kết quả đấu giá
          </p>
        </div>
      </div>

      {/* Orders waiting for auction */}
      <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Biển số chờ đấu giá của bạn</h2>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-text-secondary">Đang tải...</div>
        ) : error ? (
          <div className="px-6 py-8 text-center">
            <p className="text-text-secondary text-sm mb-4">
              {error.includes("401")
                ? "Đăng nhập để xem biển số chờ đấu giá"
                : "Không thể tải dữ liệu"}
            </p>
            <a
              href="https://dgbs.vpa.com.vn/dang-nhap"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent-green text-white px-4 py-2 rounded-lg text-sm inline-block"
            >
              Đăng nhập tại dgbs.vpa.com.vn
            </a>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-4 py-12 text-center text-text-secondary">
            Bạn chưa có biển số nào chờ đấu giá
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.orderId} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <PlateNumber plate={order.plateNumber} colorCode={order.colorCode} />
                  <div>
                    <div className="text-sm font-medium">{order.announcementNumber}</div>
                    <div className="text-xs text-text-secondary">{formatDate(order.auctionFromTime)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-accent-orange">{formatPrice(order.deposit)}</div>
                  <a
                    href="https://phongdau.vpa.com.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-blue hover:underline"
                  >
                    Vào phòng đấu giá
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
