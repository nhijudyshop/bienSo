"use client";

import { useState, useEffect, useCallback } from "react";
import type { WarehousePlate } from "@/types";
import { getWarehousePlates } from "@/lib/api";
import SearchFilters, { type SearchParams } from "@/components/SearchFilters";
import PlateNumber from "@/components/PlateNumber";

const PROVINCE_MAP: Record<string, string> = {
  "01": "Thành phố Hà Nội",
  "79": "Thành phố Hồ Chí Minh",
  "48": "Thành phố Đà Nẵng",
  "31": "Thành phố Hải Phòng",
  "92": "Thành phố Cần Thơ",
};

export default function KhoBienSoPage() {
  const [plates, setPlates] = useState<WarehousePlate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<SearchParams | undefined>();

  const fetchData = useCallback(async (filters?: SearchParams, p = 0) => {
    setLoading(true);
    try {
      const data = await getWarehousePlates({
        search: filters?.search,
        provinceCode: filters?.provinceCode,
        announcementCode: filters?.announcementCode,
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
      <h1 className="text-2xl font-bold text-center mb-6">KHO BIỂN SỐ</h1>

      <SearchFilters onSearch={handleSearch} showDate={false} showColor={false} />

      <div className="bg-bg-secondary rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary w-16">STT</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Phiên</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biển số</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tỉnh, thành phố</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Lựa chọn</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : plates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                plates.map((item, idx) => (
                  <tr key={item.whLicensePlateId} className="border-b border-border hover:bg-bg-card transition-colors">
                    <td className="px-4 py-3 text-sm">{page * 25 + idx + 1}</td>
                    <td className="px-4 py-3 text-sm">{item.announcementName}</td>
                    <td className="px-4 py-3">
                      <PlateNumber plate={item.licensePlate} colorCode={item.colorCode} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {PROVINCE_MAP[item.provinceCode] || `Mã tỉnh: ${item.provinceCode}`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="bg-accent-blue hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        Yêu cầu đấu giá
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4 border-t border-border">
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
      </div>

      <div className="text-center text-text-secondary text-sm mt-4">Tổng cộng: {total} biển số</div>
    </div>
  );
}
