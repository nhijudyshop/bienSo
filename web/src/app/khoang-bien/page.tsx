"use client";

import { useState } from "react";
import type { AnnouncementPlan } from "@/types";
import { getAnnouncementPlans, formatPrice } from "@/lib/api";
import PlateNumber from "@/components/PlateNumber";

export default function KhoangBienPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<AnnouncementPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!from && !to) return;

    setLoading(true);
    setSearched(true);
    try {
      // Search by range using the search param
      const searchTerm = from || to;
      const data = await getAnnouncementPlans({
        search: searchTerm,
        page: 0,
        size: 50,
      });

      let filtered = data.content ?? [];
      // Filter by numeric range if both from and to are provided
      if (from && to) {
        const fromNum = parseInt(from.replace(/\D/g, ""));
        const toNum = parseInt(to.replace(/\D/g, ""));
        if (!isNaN(fromNum) && !isNaN(toNum)) {
          filtered = filtered.filter((p) => {
            const numPart = parseInt(p.bks.replace(/\D/g, ""));
            return numPart >= fromNum && numPart <= toNum;
          });
        }
      }

      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">TÌM KIẾM KHOẢNG BIỂN</h1>
      <p className="text-text-secondary text-center text-sm mb-6">
        Tìm biển số xe theo khoảng số (VD: từ 100 đến 199)
      </p>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Từ số</label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="VD: 50A100 hoặc 100"
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Đến số</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="VD: 50A199 hoặc 199"
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div className="bg-bg-secondary rounded-xl overflow-hidden border border-border">
          {loading ? (
            <div className="px-4 py-12 text-center text-text-secondary">Đang tìm kiếm...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-12 text-center text-text-secondary">
              Không tìm thấy biển số trong khoảng này
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border text-sm text-text-secondary">
                Tìm thấy {results.length} biển số
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                {results.map((item) => (
                  <div key={item.bksId} className="bg-bg-card rounded-xl p-4 border border-border hover:border-accent-green transition-colors">
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
                      <div className="text-text-secondary truncate">{item.provinceName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
