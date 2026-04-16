"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { AuctionResultSession } from "@/types";
import { getAuctionResults, formatPrice } from "@/lib/api";
import PlateNumber from "@/components/PlateNumber";

export default function KetQuaDauGiaPage() {
  const [results, setResults] = useState<AuctionResultSession[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(0);
  }, []);

  async function fetchData(p: number) {
    setLoading(true);
    try {
      const data = await getAuctionResults({ page: p, size: 10 });
      setResults(data.content ?? []);
      setTotal(data.totalElements ?? 0);
      setPage(p);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">KẾT QUẢ ĐẤU GIÁ</h1>

      <div className="bg-bg-secondary rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary w-16">STT</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Ngày đấu giá</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Tổng biển số</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biển giá cao nhất</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Giá cao nhất</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Giá thấp nhất</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                results.map((item, idx) => (
                  <tr key={item.id} className="border-b border-border hover:bg-bg-card transition-colors">
                    <td className="px-4 py-3 text-sm">{page * 10 + idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.auctionDate}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full text-xs font-medium">
                        {item.totalPlate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PlateNumber plate={item.licensePlate} colorCode={item.colorCode ?? 0} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-accent-orange font-semibold">
                      {formatPrice(item.maxPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-text-secondary">
                      {formatPrice(item.minPrice)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/ket-qua-dau-gia/chi-tiet?id=${item.id}`}
                        className="text-accent-blue hover:underline text-sm"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4 border-t border-border">
            <button onClick={() => fetchData(Math.max(0, page - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded-md text-sm border border-border disabled:opacity-40 hover:bg-bg-card">
              &lsaquo;
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = page < 4 ? i : page - 3 + i;
              if (p >= totalPages) return null;
              return (
                <button key={p} onClick={() => fetchData(p)}
                  className={`px-3 py-1.5 rounded-md text-sm ${p === page ? "bg-accent-blue text-white" : "border border-border hover:bg-bg-card"}`}>
                  {p + 1}
                </button>
              );
            })}
            <button onClick={() => fetchData(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-md text-sm border border-border disabled:opacity-40 hover:bg-bg-card">
              &rsaquo;
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-text-secondary text-sm mt-4">
        Tổng cộng: {total} phiên đấu giá
      </div>
    </div>
  );
}
