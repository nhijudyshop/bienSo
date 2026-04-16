"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { VPA_URL } from "@/lib/constants";

const BANKS = [
  "BIDV", "Techcombank", "VPBank", "Vietinbank", "ACB",
  "Agribank", "MB Bank", "VIB", "OCB", "Vietcombank",
];

export default function ThanhToanPage() {
  const params = useParams();
  const orderId = params.id as string;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/thong-tin/gio-hang" className="text-accent-blue hover:underline text-sm">
          &laquo; Giỏ hàng
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-center mb-2">THANH TOÁN</h1>
      <p className="text-text-secondary text-center text-sm mb-8">
        Mã đơn hàng: <span className="font-mono text-text-primary">{orderId}</span>
      </p>

      <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-5 py-4 text-sm text-accent-blue mb-6">
        Thanh toán yêu cầu xác thực bảo mật (QR Code, OTP). Vui lòng thanh toán trực tiếp tại{" "}
        <a href={`${VPA_URL}/thanh-toan/${orderId}`} target="_blank" rel="noopener noreferrer"
          className="underline font-medium">dgbs.vpa.com.vn</a>
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "QR", title: "QR Code ngân hàng", desc: "Quét mã QR từ ứng dụng ngân hàng" },
            { icon: "E-W", title: "QR ví điện tử", desc: "Thanh toán qua ví MoMo, ZaloPay..." },
            { icon: "CK", title: "Chuyển khoản", desc: "Chuyển khoản theo thông tin hiển thị" },
          ].map((m) => (
            <div key={m.title} className="bg-bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-accent-blue mb-2">{m.icon}</div>
              <h3 className="text-sm font-semibold mb-1">{m.title}</h3>
              <p className="text-xs text-text-secondary">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Ngân hàng hỗ trợ</h2>
        <div className="flex flex-wrap gap-3">
          {BANKS.map((bank) => (
            <span key={bank} className="bg-bg-card border border-border px-3 py-1.5 rounded-lg text-sm">{bank}</span>
          ))}
        </div>
      </div>

      <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-xl px-5 py-4 text-sm text-accent-orange mb-6">
        <strong>Lưu ý:</strong> Không được thay đổi số tiền và nội dung chuyển khoản sau khi quét mã QR thanh toán.
      </div>

      <div className="text-center">
        <a href={`${VPA_URL}/thanh-toan/${orderId}`} target="_blank" rel="noopener noreferrer"
          className="inline-block bg-accent-green hover:bg-green-600 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors">
          Thanh toán tại dgbs.vpa.com.vn
        </a>
      </div>
    </div>
  );
}
