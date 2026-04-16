"use client";

import { useState, useEffect } from "react";
import { getOrdersPaymentStatus, formatPrice } from "@/lib/api";
import PlateNumber from "@/components/PlateNumber";

interface OrderItem {
  orderId: string;
  orderCode: string;
  plateNumber: string;
  totalAmount: number;
  deposit: number;
  quantity: number;
  paymentStatus: number;
  requestRefundStatus: number;
  dueDate: number;
  paymentDate: number | null;
  auctionFromTime: number;
  auctionToTime: number;
  announcementNumber: string;
  colorCode: number;
  timeEndRegister: number;
}

const PAYMENT_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: "Chưa thanh toán", color: "text-accent-orange" },
  1: { label: "Chưa thanh toán", color: "text-accent-orange" },
  2: { label: "Đã thanh toán", color: "text-accent-green" },
  3: { label: "Hết hạn", color: "text-accent-red" },
};

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

export default function GioHangPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrdersPaymentStatus()
      .then((data) => {
        const d = data as { success: boolean; result: { content: OrderItem[]; totalElements: number } };
        setOrders(d.result?.content ?? []);
        setTotal(d.result?.totalElements ?? 0);
      })
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
      <h1 className="text-2xl font-bold mb-6">Danh sách biển số của bạn</h1>

      {/* Tabs placeholder */}
      <div className="flex gap-2 mb-4">
        <button className="bg-accent-green/20 text-accent-green px-4 py-2 rounded-lg text-sm font-medium">
          Chưa thanh toán ({total})
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-bg-secondary rounded-xl border border-border p-12 text-center text-text-secondary">
          Không có biển số nào
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary w-12">STT</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Mã đơn hàng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biển số</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Phiên đấu</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Tiền cọc</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Thời gian đấu giá</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Hạn thanh toán</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item, idx) => {
                  const status = PAYMENT_STATUS[item.paymentStatus] ?? PAYMENT_STATUS[0];
                  return (
                    <tr key={item.orderId} className="border-b border-border hover:bg-bg-card transition-colors">
                      <td className="px-4 py-3 text-sm">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-mono text-accent-blue">{item.orderCode}</td>
                      <td className="px-4 py-3">
                        <PlateNumber plate={item.plateNumber} colorCode={item.colorCode} />
                      </td>
                      <td className="px-4 py-3 text-sm">{item.announcementNumber}</td>
                      <td className="px-4 py-3 text-sm text-right text-accent-orange">{formatPrice(item.deposit)}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(item.auctionFromTime)}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(item.dueDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-center text-text-secondary text-sm mt-4">
        Tổng cộng: {total} biển số
      </div>
    </div>
  );
}
