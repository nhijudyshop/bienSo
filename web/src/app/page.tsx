"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnnouncementPlan } from "@/types";
import { getAnnouncementPlans, formatPrice } from "@/lib/api";
import SearchFilters, { type SearchParams } from "@/components/SearchFilters";
import PlateNumber from "@/components/PlateNumber";

export default function HomePage() {
  const [plates, setPlates] = useState<AnnouncementPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<SearchParams | undefined>();

  const fetchData = useCallback(async (filters?: SearchParams, p = 0) => {
    setLoading(true);
    try {
      const data = await getAnnouncementPlans({
        search: filters?.search,
        provinceCode: filters?.provinceCode,
        announcementCode: filters?.announcementCode,
        colorCode: filters?.colorCode,
        page: p,
        size: 25,
      });
      setPlates(data.content ?? []);
      setTotal(data.totalElements ?? 0);
      setPage(p);
    } catch {
      setPlates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleSearch(f: SearchParams) {
    setCurrentFilters(f);
    fetchData(f, 0);
  }

  function goToPage(p: number) {
    fetchData(currentFilters, p);
  }

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        DANH SÁCH BIỂN SỐ XE ĐƯA RA ĐẤU GIÁ
      </h1>

      <SearchFilters onSearch={handleSearch} />

      <div className="bg-bg-secondary rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary w-16">STT</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biển số</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Phiên đấu</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Số người đăng ký</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Giá khởi điểm</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tỉnh, thành phố</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Ngày đấu giá</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Lựa chọn</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : plates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                plates.map((item, idx) => (
                  <tr key={item.bksId} className="border-b border-border hover:bg-bg-card transition-colors">
                    <td className="px-4 py-3 text-sm">{page * 25 + idx + 1}</td>
                    <td className="px-4 py-3">
                      <PlateNumber plate={item.bks} colorCode={item.colorCode} />
                    </td>
                    <td className="px-4 py-3 text-sm">{item.announcementNumber}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {item.hideTotalRegistered ? "—" : item.totalRegisteringPeople}
                    </td>
                    <td className="px-4 py-3 text-sm text-accent-orange">{formatPrice(item.startingPrice)}</td>
                    <td className="px-4 py-3 text-sm">{item.provinceName}</td>
                    <td className="px-4 py-3 text-sm">{item.auctionDate || "Chưa có lịch"}</td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href="https://dgbs.vpa.com.vn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-accent-green hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors inline-block"
                      >
                        Dang ky dau gia
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4 border-t border-border">
            <button
              onClick={() => goToPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-md text-sm border border-border disabled:opacity-40 hover:bg-bg-card transition-colors"
            >
              &lsaquo;
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = page < 4 ? i : page - 3 + i;
              if (p >= totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    p === page ? "bg-accent-blue text-white" : "border border-border hover:bg-bg-card"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-md text-sm border border-border disabled:opacity-40 hover:bg-bg-card transition-colors"
            >
              &rsaquo;
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-text-secondary text-sm mt-4">
        Tổng cộng: {total} biển số
      </div>
    </div>
  );
}
