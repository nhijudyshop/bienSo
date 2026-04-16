"use client";

import { useState } from "react";
import { getAnnouncementPlans, formatPrice, addToCart } from "@/lib/api";
import { VPA_URL } from "@/lib/constants";
import type { AnnouncementPlan } from "@/types";
import PlateNumber from "@/components/PlateNumber";

export default function DangKyDauGiaPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AnnouncementPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await getAnnouncementPlans({ search: search.trim(), size: 20 });
      setResults(data.content ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(bksId: string) {
    setAddingIds((prev) => new Set(prev).add(bksId));
    setMessage(null);
    try {
      await addToCart(bksId);
      setAddedIds((prev) => new Set(prev).add(bksId));
      setMessage({ type: "success", text: "Đã thêm biển số vào giỏ hàng thành công!" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể thêm vào giỏ hàng";
      setMessage({ type: "error", text: msg.includes("401") ? "Vui lòng đăng nhập để thêm giỏ hàng" : msg });
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(bksId);
        return next;
      });
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-2">ĐĂNG KÝ ĐẤU GIÁ</h1>
      <p className="text-text-secondary text-center text-sm mb-8">
        Tìm biển số và đăng ký tham gia đấu giá
      </p>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        {[
          { step: "1", title: "Tìm biển số", desc: "Nhập biển số bạn muốn đấu giá", color: "text-accent-green" },
          { step: "2", title: "Thêm giỏ hàng", desc: "Nhấn Đăng ký đấu giá", color: "text-accent-blue" },
          { step: "3", title: "Thanh toán cọc", desc: "Quét QR hoặc chuyển khoản", color: "text-accent-orange" },
          { step: "4", title: "Vào phòng đấu", desc: "Đấu giá theo lịch", color: "text-accent-red" },
        ].map((s) => (
          <div key={s.step} className="bg-bg-secondary rounded-xl border border-border p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.step}</div>
            <div className="text-sm font-semibold mb-1">{s.title}</div>
            <div className="text-xs text-text-secondary">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Toast message */}
      {message && (
        <div className={`rounded-xl px-5 py-3 text-sm mb-4 border ${
          message.type === "success"
            ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
            : "bg-accent-red/10 border-accent-red/30 text-accent-red"
        }`}>
          {message.text}
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-bg-secondary rounded-xl p-5 mb-6 border border-border">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nhập biển số xe cần tìm (VD: 30A12345, 50H)"
            className="flex-1 bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
          />
          <button type="submit" disabled={loading}
            className="bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="px-4 py-12 text-center text-text-secondary">Đang tải dữ liệu...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-12 text-center text-text-secondary">
              Không tìm thấy biển số phù hợp
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biển số</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Phiên</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tỉnh/TP</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Giá khởi điểm</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => {
                    const isAdding = addingIds.has(item.bksId);
                    const isAdded = addedIds.has(item.bksId);
                    return (
                      <tr key={item.bksId} className="border-b border-border hover:bg-bg-card transition-colors">
                        <td className="px-4 py-3">
                          <PlateNumber plate={item.bks} colorCode={item.colorCode} />
                        </td>
                        <td className="px-4 py-3 text-sm">{item.announcementNumber}</td>
                        <td className="px-4 py-3 text-sm">{item.provinceName}</td>
                        <td className="px-4 py-3 text-sm text-right text-accent-orange">{formatPrice(item.startingPrice)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAddToCart(item.bksId)}
                            disabled={isAdding || isAdded}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors inline-block ${
                              isAdded
                                ? "bg-gray-600 text-gray-300 cursor-default"
                                : "bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white"
                            }`}
                          >
                            {isAdding ? (
                              <span className="flex items-center gap-1">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Đang thêm...
                              </span>
                            ) : isAdded ? (
                              "Đã thêm ✓"
                            ) : (
                              "Thêm giỏ hàng"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Notice */}
      <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-5 py-4 text-sm text-accent-blue mt-6">
        Để hoàn tất đăng ký đấu giá (thanh toán cọc, chấp thuận quy chế), vui lòng thao tác tại{" "}
        <a href={VPA_URL} target="_blank" rel="noopener noreferrer" className="underline font-medium">dgbs.vpa.com.vn</a>
      </div>
    </div>
  );
}
