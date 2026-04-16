"use client";

import { useState, useEffect } from "react";
import { getCartItems, getOrdersPaymentStatus, formatPrice, removeFromCart, createOrder } from "@/lib/api";
import PlateNumber from "@/components/PlateNumber";

interface CartItem {
  bksId: string;
  bks: string;
  provinceName: string;
  announcementNumber: string;
  startingPrice: number;
  colorCode: number;
  vehicleType: string;
}

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
  const [activeTab, setActiveTab] = useState<"cart" | "orders">("cart");

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Orders state
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    loadCart();
    loadOrders();
  }, []);

  async function loadCart() {
    setCartLoading(true);
    setCartError("");
    try {
      const items = await getCartItems();
      setCartItems(items as CartItem[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi tải giỏ hàng";
      setCartError(msg);
    } finally {
      setCartLoading(false);
    }
  }

  async function loadOrders() {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await getOrdersPaymentStatus();
      const d = data as { success: boolean; result: { content: OrderItem[]; totalElements: number } };
      setOrders(d.result?.content ?? []);
      setOrdersTotal(d.result?.totalElements ?? 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi tải đơn hàng";
      setOrdersError(msg);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleRemoveFromCart(bksId: string) {
    setRemovingIds((prev) => new Set(prev).add(bksId));
    setCartMessage(null);
    try {
      await removeFromCart(bksId);
      setCartItems((prev) => prev.filter((item) => item.bksId !== bksId));
      setCartMessage({ type: "success", text: "Đã xóa biển số khỏi giỏ hàng" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể xóa";
      setCartMessage({ type: "error", text: msg });
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(bksId);
        return next;
      });
    }
  }

  async function handleCreateOrder() {
    if (cartItems.length === 0) return;
    setCreatingOrder(true);
    setCartMessage(null);
    try {
      await createOrder({ bksIds: cartItems.map((item) => item.bksId) });
      setCartMessage({ type: "success", text: "Đã tạo đơn hàng thành công! Chuyển sang tab Đơn hàng để xem." });
      setCartItems([]);
      loadOrders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể tạo đơn hàng";
      setCartMessage({ type: "error", text: msg });
    } finally {
      setCreatingOrder(false);
    }
  }

  const authError = (error: string) =>
    error.includes("401") ? (
      <span>Chưa đăng nhập. <a href="/dang-nhap" className="underline font-medium">Đăng nhập ngay</a></span>
    ) : (
      `Lỗi: ${error}`
    );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng & Đơn hàng</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("cart")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "cart"
              ? "bg-accent-blue/20 text-accent-blue"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          Giỏ hàng ({cartItems.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "orders"
              ? "bg-accent-green/20 text-accent-green"
              : "bg-bg-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          Đơn hàng ({ordersTotal})
        </button>
      </div>

      {/* Cart message */}
      {cartMessage && activeTab === "cart" && (
        <div className={`rounded-xl px-5 py-3 text-sm mb-4 border ${
          cartMessage.type === "success"
            ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
            : "bg-accent-red/10 border-accent-red/30 text-accent-red"
        }`}>
          {cartMessage.text}
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === "cart" && (
        <>
          {cartLoading ? (
            <div className="text-center text-text-secondary py-12">Đang tải giỏ hàng...</div>
          ) : cartError ? (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-accent-red text-sm">
              {authError(cartError)}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-bg-secondary rounded-xl border border-border p-12 text-center">
              <div className="text-text-secondary mb-4">Giỏ hàng trống</div>
              <a href="/dang-ky-dau-gia"
                className="bg-accent-green hover:bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors inline-block">
                Tìm biển số đấu giá
              </a>
            </div>
          ) : (
            <>
              <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary w-12">STT</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biển số</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Phiên đấu</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tỉnh/TP</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Giá khởi điểm</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, idx) => (
                        <tr key={item.bksId} className="border-b border-border hover:bg-bg-card transition-colors">
                          <td className="px-4 py-3 text-sm">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <PlateNumber plate={item.bks} colorCode={item.colorCode} />
                          </td>
                          <td className="px-4 py-3 text-sm">{item.announcementNumber}</td>
                          <td className="px-4 py-3 text-sm">{item.provinceName}</td>
                          <td className="px-4 py-3 text-sm text-right text-accent-orange">
                            {formatPrice(item.startingPrice)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveFromCart(item.bksId)}
                              disabled={removingIds.has(item.bksId)}
                              className="bg-accent-red/20 hover:bg-accent-red/30 text-accent-red px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {removingIds.has(item.bksId) ? "Đang xóa..." : "Xóa"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-text-secondary text-sm">
                  {cartItems.length} biển số trong giỏ hàng
                </div>
                <button
                  onClick={handleCreateOrder}
                  disabled={creatingOrder || cartItems.length === 0}
                  className="bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {creatingOrder ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang tạo đơn...
                    </>
                  ) : (
                    "Tạo đơn hàng"
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <>
          {ordersLoading ? (
            <div className="text-center text-text-secondary py-12">Đang tải đơn hàng...</div>
          ) : ordersError ? (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-6 text-accent-red text-sm">
              {authError(ordersError)}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-bg-secondary rounded-xl border border-border p-12 text-center text-text-secondary">
              Không có đơn hàng nào
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
            Tổng cộng: {ordersTotal} đơn hàng
          </div>
        </>
      )}
    </div>
  );
}
