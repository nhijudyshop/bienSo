"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/danh-sach-cong-bo", label: "Danh sách công bố" },
  { href: "/danh-sach-bien", label: "Danh sách chính thức" },
  { href: "/kho-bien-so", label: "Kho biển số" },
  { href: "/ket-qua-dau-gia", label: "Kết quả đấu giá" },
  { href: "/phong-dau-gia", label: "Phòng đấu giá" },
  { href: "/quy-che", label: "Quy chế" },
  { href: "/hoi-dap", label: "Hỏi đáp" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <nav className="hidden lg:flex items-center gap-0.5">
            <Link
              href="/"
              className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/" ? "text-accent-green" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Trang chủ
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "text-accent-green"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/thong-tin/tai-khoan"
              className={`hidden sm:block text-sm transition-colors ${
                pathname.startsWith("/thong-tin")
                  ? "text-accent-green font-medium"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Tài khoản
            </Link>
            <Link
              href="/dang-ky"
              className="bg-accent-green hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Đăng ký
            </Link>
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-text-secondary hover:text-text-primary p-1"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="lg:hidden border-t border-border py-3 space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm ${pathname === "/" ? "text-accent-green font-medium" : "text-text-secondary"}`}>
              Trang chủ
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm ${pathname === item.href ? "text-accent-green font-medium" : "text-text-secondary"}`}>
                {item.label}
              </Link>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <Link href="/thong-tin/tai-khoan" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-text-secondary">Tài khoản</Link>
              <Link href="/tiep-nhan-y-kien" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-text-secondary">Góp ý / Khiếu nại</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
