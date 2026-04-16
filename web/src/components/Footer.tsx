import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">VPA</span>
            </div>
            <p className="text-text-secondary text-sm leading-6">
              Nền tảng đấu giá biển số xe ô tô trực tuyến chính thức
            </p>
            <p className="text-text-secondary text-sm mt-2 leading-6">
              NO2-T4.03, tầng 4 tòa nhà NO2 - TNL Plaza Goldseason, số 47
              Nguyễn Tuân, Thanh Xuân, Hà Nội
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-text-primary">Đấu giá</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Danh sách biển số" },
                { href: "/kho-bien-so", label: "Kho biển số" },
                { href: "/ket-qua-dau-gia", label: "Kết quả đấu giá" },
                { href: "/danh-sach-cong-bo", label: "Danh sách công bố" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-green text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-text-primary">Hỗ trợ</h4>
            <ul className="space-y-2">
              {[
                { href: "/hoi-dap", label: "Hoi dap" },
                { href: "/quy-che", label: "Quy che dau gia" },
                { href: "/danh-sach-cong-bo", label: "Huong dan dau gia" },
                { href: "/quy-che", label: "Dieu khoan su dung" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent-green text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h4 className="font-semibold mb-4 text-text-primary">
              Tải ứng dụng
            </h4>
            <div className="space-y-3">
              <div className="bg-bg-card rounded-lg px-4 py-3 flex items-center gap-3 border border-border">
                <div className="text-2xl">📱</div>
                <div>
                  <div className="text-xs text-text-secondary">
                    Tải trên
                  </div>
                  <div className="text-sm font-medium">App Store</div>
                </div>
              </div>
              <div className="bg-bg-card rounded-lg px-4 py-3 flex items-center gap-3 border border-border">
                <div className="text-2xl">📱</div>
                <div>
                  <div className="text-xs text-text-secondary">
                    Tải trên
                  </div>
                  <div className="text-sm font-medium">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-text-secondary text-sm">
            © 2024 VPA - Vietnam Plate Auction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
