"use client";

import { useState, useEffect } from "react";
import type { Province, AnnouncementPlanCode } from "@/types";
import { getProvinces, getAnnouncementPlanCodes } from "@/lib/api";

interface SearchFiltersProps {
  onSearch: (filters: SearchParams) => void;
  showSession?: boolean;
  showColor?: boolean;
  showDate?: boolean;
}

export interface SearchParams {
  search: string;
  provinceCode: string;
  announcementCode: string;
  colorCode: string;
  dateFrom: string;
  dateTo: string;
}

export default function SearchFilters({
  onSearch,
  showSession = true,
  showColor = true,
  showDate = true,
}: SearchFiltersProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [sessions, setSessions] = useState<AnnouncementPlanCode[]>([]);
  const [filters, setFilters] = useState<SearchParams>({
    search: "",
    provinceCode: "",
    announcementCode: "",
    colorCode: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch((err) => console.warn("Failed to load provinces:", err));
    if (showSession) {
      getAnnouncementPlanCodes()
        .then(setSessions)
        .catch((err) => console.warn("Failed to load sessions:", err));
    }
  }, [showSession]);

  // Debounced auto-search when any filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(filters);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.provinceCode, filters.announcementCode, filters.colorCode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(filters);
  }

  function updateFilter(key: keyof SearchParams, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-secondary rounded-xl p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Tìm biển số */}
        <input
          type="text"
          placeholder="Biển số xe cần tìm"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="bg-bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-blue"
        />

        {/* Tỉnh thành */}
        <select
          value={filters.provinceCode}
          onChange={(e) => updateFilter("provinceCode", e.target.value)}
          className="bg-bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
        >
          <option value="">Tỉnh, thành phố</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.fullName}
            </option>
          ))}
        </select>

        {/* Ngày đấu giá */}
        {showDate && (
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="bg-bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            placeholder="Ngày đấu giá"
          />
        )}

        {/* Phiên đấu giá */}
        {showSession && (
          <select
            value={filters.announcementCode}
            onChange={(e) => updateFilter("announcementCode", e.target.value)}
            className="bg-bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
          >
            <option value="">Tìm kiếm phiên</option>
            {sessions.map((s) => (
              <option key={s.announcementCode} value={s.announcementCode}>
                {s.announcementPlanCode}
              </option>
            ))}
          </select>
        )}

        {/* Màu biển */}
        {showColor && (
          <select
            value={filters.colorCode}
            onChange={(e) => updateFilter("colorCode", e.target.value)}
            className="bg-bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
          >
            <option value="">Màu biển</option>
            <option value="0">Biển trắng</option>
            <option value="3">Biển vàng</option>
          </select>
        )}
      </div>

      <div className="flex justify-end mt-3">
        <button
          type="submit"
          className="bg-accent-green hover:bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
