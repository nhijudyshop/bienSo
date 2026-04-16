"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnnouncementPlan } from "@/types";
import { getAnnouncementPlans, formatPrice } from "@/lib/api";
import SearchFilters, { type SearchParams } from "@/components/SearchFilters";
import PlateNumber from "@/components/PlateNumber";

export default function TatCaBienSoPage() {
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
      <h1 className="text-2xl font-bold text-center mb-6">TẤT CẢ BIỂN SỐ</h1>

      <SearchFilters onSearch={handleSearch} />

      {loading ? (
        <div className="text-center text-text-secondary py-12">Đang tải...</div>
      ) : plates.length === 0 ? (
        <div className="text-center text-text-secondary py-12">Không có dữ liệu</div>
      ) : (
        <>
          {/* Grid view */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {plates.map((item) => (
              <div
                key={item.bksId}
                className="bg-bg-secondary rounded-xl p-4 border border-border hover:border-accent-green transition-colors"
              >
                <div className="text-center mb-3">
                  <PlateNumber plate={item.bks} colorCode={item.colorCode} size="lg" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Phiên</span>
                    <span>{item.announcementNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Giá KĐ</span>
                    <span className="text-accent-orange">{formatPrice(item.startingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Đăng ký</span>
                    <span>{item.hideTotalRegistered ? "—" : item.totalRegisteringPeople}</span>
                  </div>
                  <div className="text-text-secondary truncate">{item.provinceName}</div>
                </div>
                <a
                  href="https://dgbs.vpa.com.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-3 bg-accent-green hover:bg-green-600 text-white py-1.5 rounded-lg text-xs font-medium transition-colors text-center"
                >
                  Dang ky dau gia
                </a>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-6">
              <button onClick={() => goToPage(Math.max(0, page - 1))} disabled={page === 0}
                className="px-3 py-1.5 rounded-md text-sm border border-border disabled:opacity-40 hover:bg-bg-card">
                &lsaquo;
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = page < 4 ? i : page - 3 + i;
                if (p >= totalPages) return null;
                return (
                  <button key={p} onClick={() => goToPage(p)}
                    className={`px-3 py-1.5 rounded-md text-sm ${p === page ? "bg-accent-blue text-white" : "border border-border hover:bg-bg-card"}`}>
                    {p + 1}
                  </button>
                );
              })}
              <button onClick={() => goToPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-md text-sm border border-border disabled:opacity-40 hover:bg-bg-card">
                &rsaquo;
              </button>
            </div>
          )}

          <div className="text-center text-text-secondary text-sm">Tổng cộng: {total} biển số</div>
        </>
      )}
    </div>
  );
}
