"use client";

import { useState } from "react";

const TOPICS = [
  "Đăng ký tài khoản",
  "Xác minh tài khoản (eKYC/VNeID)",
  "Đăng ký đấu giá",
  "Thanh toán",
  "Phòng đấu giá",
  "Kết quả đấu giá",
  "Hoàn tiền",
  "Thủ tục sau đấu giá",
  "Lỗi hệ thống",
  "Khác",
];

export default function TiepNhanYKienPage() {
  const [formData, setFormData] = useState({
    topic: "",
    title: "",
    content: "",
    email: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function updateField(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.topic || !formData.title || !formData.content) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // In production, this would call /web-api/user-bidding/complaint/create-customer-complaint
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-bg-secondary rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-accent-green text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Đã gửi thành công</h2>
          <p className="text-text-secondary text-sm mb-6">
            Cảm ơn bạn đã gửi ý kiến. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.
          </p>
          <p className="text-text-secondary text-xs mb-6">
            Lưu ý: Để gửi khiếu nại chính thức, vui lòng sử dụng{" "}
            <a href="https://dgbs.vpa.com.vn/tiep-nhan-y-kien" target="_blank" rel="noopener noreferrer"
              className="text-accent-blue underline">dgbs.vpa.com.vn</a>
          </p>
          <button onClick={() => { setSubmitted(false); setFormData({ topic: "", title: "", content: "", email: "", phone: "" }); }}
            className="bg-accent-blue text-white px-4 py-2 rounded-lg text-sm">
            Gửi ý kiến khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-2">TIẾP NHẬN Ý KIẾN</h1>
      <p className="text-text-secondary text-center text-sm mb-8">
        Gửi khiếu nại, góp ý hoặc yêu cầu hỗ trợ
      </p>

      <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl px-4 py-3 text-sm text-accent-blue mb-6">
        Để gửi khiếu nại chính thức (có xác thực), vui lòng sử dụng{" "}
        <a href="https://dgbs.vpa.com.vn/tiep-nhan-y-kien" target="_blank" rel="noopener noreferrer"
          className="underline font-medium">dgbs.vpa.com.vn</a>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-secondary rounded-xl border border-border p-6">
        <div className="space-y-4">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Chủ đề <span className="text-accent-red">*</span>
            </label>
            <select
              value={formData.topic}
              onChange={(e) => updateField("topic", e.target.value)}
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
            >
              <option value="">Chọn chủ đề</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Tiêu đề <span className="text-accent-red">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Nhập tiêu đề"
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nội dung <span className="text-accent-red">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="Mô tả chi tiết vấn đề của bạn"
              rows={5}
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue resize-none"
            />
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email liên hệ</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="0912345678"
                className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
              {error}
            </div>
          )}

          <button type="submit"
            className="w-full bg-accent-green hover:bg-green-600 text-white py-3 rounded-lg text-sm font-medium transition-colors">
            Gửi ý kiến
          </button>
        </div>
      </form>
    </div>
  );
}
