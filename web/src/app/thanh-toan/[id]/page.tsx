"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getOrderDetail, getOnlinePaymentMethods, getBankQr, formatPrice } from "@/lib/api";
import PlateNumber from "@/components/PlateNumber";
import { VPA_URL } from "@/lib/constants";

interface OrderDetail {
  orderId: string;
  orderCode: string;
  plateNumber: string;
  totalAmount: number;
  deposit: number;
  paymentStatus: number;
  dueDate: number;
  paymentDate: number | null;
  announcementNumber: string;
  colorCode: number;
  bankName: string;
  bankAccount: string;
  bankAccountOwner: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  type: string;
  logo: string;
  description: string;
}

interface BankQrResponse {
  success: boolean;
  result: {
    qrCodeUrl: string;
    bankName: string;
    bankAccount: string;
    bankAccountOwner: string;
    amount: number;
    content: string;
  };
}

const PAYMENT_STATUS: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: "Chưa thanh toán", color: "text-accent-orange", bg: "bg-accent-orange/10 border-accent-orange/30" },
  1: { label: "Chưa thanh toán", color: "text-accent-orange", bg: "bg-accent-orange/10 border-accent-orange/30" },
  2: { label: "Đã thanh toán", color: "text-accent-green", bg: "bg-accent-green/10 border-accent-green/30" },
  3: { label: "Hết hạn", color: "text-accent-red", bg: "bg-accent-red/10 border-accent-red/30" },
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

export default function ThanhToanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<BankQrResponse["result"] | null>(null);
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    loadData();
  }, [orderId]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [orderRes, methodsRes] = await Promise.all([
        getOrderDetail(orderId),
        getOnlinePaymentMethods(),
      ]);
      const orderData = orderRes as { success: boolean; result: OrderDetail };
      setOrder(orderData.result ?? (orderRes as OrderDetail));
      const methodsData = methodsRes as { success: boolean; result: PaymentMethod[] };
      setMethods(methodsData.result ?? (methodsRes as PaymentMethod[]));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi tải thông tin đơn hàng";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetBankQr() {
    setQrLoading(true);
    setQrError("");
    setQrData(null);
    try {
      const res = await getBankQr({ orderId }) as BankQrResponse;
      setQrData(res.result ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể tạo mã QR";
      setQrError(msg);
    } finally {
      setQrLoading(false);
    }
  }

  function handleSelectMethod(code: string) {
    setSelectedMethod(code);
    setQrData(null);
    setQrError("");
    if (code === "BANK_QR" || code === "QR") {
      handleGetBankQr();
    }
  }

  const status = order ? (PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS[0]) : null;
  const isPending = order ? (order.paymentStatus === 0 || order.paymentStatus === 1) : false;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center text-text-secondary py-20">Đang tải thông tin thanh toán...</div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes("401");
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/thong-tin/gio-hang" className="text-accent-blue hover:underline text-sm">
            &laquo; Giỏ hàng
          </Link>
        </div>
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-accent-red text-sm">
          {isAuthError ? (
            <span>Chưa đăng nhập. <a href="/dang-nhap" className="underline font-medium">Đăng nhập ngay</a></span>
          ) : (
            `Lỗi: ${error}`
          )}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-bg-secondary rounded-xl border border-border p-12 text-center text-text-secondary">
          Không tìm thấy đơn hàng
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Navigation */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/thong-tin/gio-hang" className="text-accent-blue hover:underline text-sm">
          &laquo; Giỏ hàng
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-center mb-2">THANH TOÁN</h1>
      <p className="text-text-secondary text-center text-sm mb-6">
        Mã đơn hàng: <span className="font-mono text-text-primary">{order.orderCode}</span>
      </p>

      {/* Payment status banner */}
      {status && (
        <div className={`border rounded-xl px-5 py-4 text-sm mb-6 flex items-center justify-between ${status.bg}`}>
          <span className={`font-medium ${status.color}`}>{status.label}</span>
          {order.paymentDate && (
            <span className="text-text-secondary text-xs">
              Thanh toán lúc: {formatDate(order.paymentDate)}
            </span>
          )}
        </div>
      )}

      {/* Order info */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Biển số</span>
            <PlateNumber plate={order.plateNumber} colorCode={order.colorCode} size="lg" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Phiên đấu giá</span>
            <span className="text-sm font-medium">{order.announcementNumber}</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Tiền cọc</span>
            <span className="text-sm font-medium text-accent-orange">{formatPrice(order.deposit)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Tổng thanh toán</span>
            <span className="text-lg font-bold text-accent-green">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Hạn thanh toán</span>
            <span className="text-sm font-medium">{formatDate(order.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Bank transfer info */}
      {(order.bankName || order.bankAccount) && (
        <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin chuyển khoản</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Ngân hàng</span>
              <span className="text-sm font-medium">{order.bankName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Số tài khoản</span>
              <span className="text-sm font-mono font-medium text-accent-blue">{order.bankAccount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Chủ tài khoản</span>
              <span className="text-sm font-medium">{order.bankAccountOwner}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment methods - only show if pending */}
      {isPending && (
        <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>

          {methods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {methods.map((method) => (
                <button
                  key={method.code || method.id}
                  onClick={() => handleSelectMethod(method.code)}
                  className={`bg-bg-card rounded-xl border p-4 text-center transition-colors hover:border-accent-blue ${
                    selectedMethod === method.code
                      ? "border-accent-blue ring-1 ring-accent-blue"
                      : "border-border"
                  }`}
                >
                  {method.logo && (
                    <img
                      src={method.logo}
                      alt={method.name}
                      className="w-10 h-10 mx-auto mb-2 object-contain"
                    />
                  )}
                  <h3 className="text-sm font-semibold mb-1">{method.name}</h3>
                  {method.description && (
                    <p className="text-xs text-text-secondary">{method.description}</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { code: "BANK_QR", icon: "🏦", title: "QR Code ngân hàng", desc: "Quét mã QR từ ứng dụng ngân hàng" },
                { code: "EWALLET", icon: "📱", title: "QR ví điện tử", desc: "Thanh toán qua ví MoMo, ZaloPay..." },
                { code: "TRANSFER", icon: "💳", title: "Chuyển khoản", desc: "Chuyển khoản theo thông tin hiển thị" },
              ].map((m) => (
                <button
                  key={m.code}
                  onClick={() => handleSelectMethod(m.code)}
                  className={`bg-bg-card rounded-xl border p-4 text-center transition-colors hover:border-accent-blue ${
                    selectedMethod === m.code
                      ? "border-accent-blue ring-1 ring-accent-blue"
                      : "border-border"
                  }`}
                >
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <h3 className="text-sm font-semibold mb-1">{m.title}</h3>
                  <p className="text-xs text-text-secondary">{m.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Code section */}
      {selectedMethod && isPending && (
        <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Thanh toán</h2>

          {qrLoading && (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-accent-blue" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-text-secondary text-sm">Đang tạo mã QR...</p>
            </div>
          )}

          {qrError && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl px-5 py-4 text-sm text-accent-red mb-4">
              {qrError}
            </div>
          )}

          {qrData && (
            <div className="text-center">
              {qrData.qrCodeUrl && (
                <div className="bg-white rounded-xl p-4 inline-block mb-4">
                  <img
                    src={qrData.qrCodeUrl}
                    alt="QR Code thanh toán"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              )}

              <div className="bg-bg-card rounded-xl border border-border p-4 text-left space-y-3 max-w-md mx-auto">
                {qrData.bankName && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Ngân hàng</span>
                    <span className="text-sm font-medium">{qrData.bankName}</span>
                  </div>
                )}
                {qrData.bankAccount && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Số tài khoản</span>
                    <span className="text-sm font-mono font-medium text-accent-blue">{qrData.bankAccount}</span>
                  </div>
                )}
                {qrData.bankAccountOwner && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Chủ tài khoản</span>
                    <span className="text-sm font-medium">{qrData.bankAccountOwner}</span>
                  </div>
                )}
                {qrData.amount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Số tiền</span>
                    <span className="text-sm font-bold text-accent-green">{formatPrice(qrData.amount)}</span>
                  </div>
                )}
                {qrData.content && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Nội dung CK</span>
                    <span className="text-sm font-mono font-medium">{qrData.content}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!qrLoading && !qrData && !qrError && (selectedMethod === "TRANSFER" || selectedMethod === "EWALLET") && (
            <div className="text-center py-4">
              <button
                onClick={handleGetBankQr}
                className="bg-accent-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Lấy thông tin thanh toán
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warning */}
      {isPending && (
        <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-xl px-5 py-4 text-sm text-accent-orange mb-6">
          <strong>Lưu ý:</strong> Không được thay đổi số tiền và nội dung chuyển khoản sau khi quét mã QR thanh toán.
        </div>
      )}

      {/* Redirect to VPA */}
      <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-5 py-4 text-sm text-accent-blue mb-6">
        Thanh toán yêu cầu xác thực bảo mật (QR Code, OTP). Vui lòng thanh toán trực tiếp tại{" "}
        <a
          href={`${VPA_URL}/thanh-toan/${orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
        >
          dgbs.vpa.com.vn
        </a>
      </div>

      <div className="text-center">
        <a
          href={`${VPA_URL}/thanh-toan/${orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent-green hover:bg-green-600 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
        >
          Thanh toán tại dgbs.vpa.com.vn
        </a>
      </div>
    </div>
  );
}
