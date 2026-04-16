"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAuctionResultDetail, formatPrice } from "@/lib/api";
import { VPA_URL } from "@/lib/constants";
import PlateNumber from "@/components/PlateNumber";

interface ResultDetail {
  licensePlate: string;
  winnerPrice: number;
  provinceName: string;
  vehicleType: string;
  colorCode?: number;
}

export default function KetQuaChiTietPage() {
  const params = useParams();
  const id = Number(params.id);
  const [details, setDetails] = useState<ResultDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAuctionResultDetail(id)
      .then((data: unknown) => {
        const d = data as { content?: ResultDetail[] };
        setDetails(d.content ?? []);
      })
      .catch(() => setDetails([]))
      .finally(() => setLoading(false));
  }, [id]);

  const dateStr = String(id);
  const formattedDate =
    dateStr.length === 8
      ? `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}/${dateStr.slice(0, 4)}`
      : String(id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/ket-qua-dau-gia" className="text-accent-blue hover:underline text-sm">
          &laquo; Kết quả đấu giá
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-center mb-6">
        KẾT QUẢ ĐẤU GIÁ NGÀY {formattedDate}
      </h1>

      <div className="bg-bg-secondary rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary w-16">STT</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Biển số</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tỉnh, thành phố</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Loại xe</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Giá trúng</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">Đang tải dữ liệu...</td>
                </tr>
              ) : details.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                    Không có dữ liệu chi tiết. Dữ liệu có thể chưa được cập nhật hoặc cần đăng nhập tại{" "}
                    <a href={VPA_URL} target="_blank" rel="noopener noreferrer" className="text-accent-blue underline">dgbs.vpa.com.vn</a>
                  </td>
                </tr>
              ) : (
                details.map((item, idx) => (
                  <tr key={item.licensePlate || idx} className="border-b border-border hover:bg-bg-card transition-colors">
                    <td className="px-4 py-3 text-sm">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <PlateNumber plate={item.licensePlate} colorCode={item.colorCode ?? 0} />
                    </td>
                    <td className="px-4 py-3 text-sm">{item.provinceName}</td>
                    <td className="px-4 py-3 text-sm">{item.vehicleType}</td>
                    <td className="px-4 py-3 text-sm text-right text-accent-orange font-semibold">
                      {formatPrice(item.winnerPrice)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-text-secondary text-sm mt-4">{details.length} biển số</div>
    </div>
  );
}
