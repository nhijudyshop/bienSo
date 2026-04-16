"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_ITEMS = [
  { href: "/thong-tin/tai-khoan", label: "Thông tin tài khoản" },
  { href: "/thong-tin/gio-hang", label: "Giỏ hàng" },
  { href: "/thong-tin/bien-da-dang-ky", label: "Biển số chờ đấu giá" },
  { href: "/thong-tin/lich-su-dau-gia", label: "Lịch sử đấu giá" },
  { href: "/thong-tin/thong-bao", label: "Thông báo" },
  { href: "/thong-tin/quan-ly-ho-so", label: "Tài liệu của tôi" },
];

export default function ThongTinLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <nav className="bg-bg-secondary rounded-xl border border-border p-3 sticky top-20">
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-accent-green/20 text-accent-green font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
