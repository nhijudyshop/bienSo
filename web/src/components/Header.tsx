"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/danh-sach-cong-bo", label: "Danh sách công bố" },
  { href: "/kho-bien-so", label: "Kho biển số" },
  { href: "/ket-qua-dau-gia", label: "Kết quả đấu giá" },
  { href: "/quy-che", label: "Quy chế" },
  { href: "/hoi-dap", label: "Hỏi đáp" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-bg-secondary border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-text-primary">VPA</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "text-accent-green"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Trang chủ
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-accent-green"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dang-nhap"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/dang-ky"
              className="bg-accent-green hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
