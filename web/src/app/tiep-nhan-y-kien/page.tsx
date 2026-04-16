"use client";

import { useState, useEffect } from "react";
import { getComplaintTopics, createComplaint } from "@/lib/api";

interface Topic {
  id: string;
  name: string;
}

export default function TiepNhanYKienPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [formData, setFormData] = useState({
    topicId: "",
    fullName: "",
    phone: "",
    email: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getComplaintTopics()
      .then((data) => setTopics(data as Topic[]))
      .catch(() => setTopics([]))
      .finally(() => setTopicsLoading(false));
  }, []);

  function updateField(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.topicId) {
      setError("Vui lòng chọn chủ đề");
      return;
    }
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    if (!formData.email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!formData.content.trim()) {
      setError("Vui lòng nhập nội dung");
      return;
    }

    setSubmitting(true);
    try {
      await createComplaint({
        topicId: formData.topicId,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        content: formData.content.trim(),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      if (message.includes("401")) {
        setError("Chưa đăng nhập. Vui lòng đăng nhập để gửi ý kiến.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(false);
    setFormData({ topicId: "", fullName: "", phone: "", email: "", content: "" });
    setError("");
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-bg-secondary rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Gửi thành công</h2>
          <p className="text-text-secondary text-sm mb-6">
            Cảm ơn bạn đã gửi ý kiến. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.
          </p>
          <button
            onClick={resetForm}
            className="bg-accent-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Gửi ý kiến khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
        Tiếp nhận ý kiến
      </h1>
      <p className="text-text-secondary text-center text-sm mb-8">
        Gửi khiếu nại, góp ý hoặc yêu cầu hỗ trợ
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-secondary rounded-xl border border-border p-6"
      >
        <div className="space-y-5">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Chủ đề <span className="text-accent-red">*</span>
            </label>
            {topicsLoading ? (
              <div className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm text-text-secondary">
                Đang tải danh sách chủ đề...
              </div>
            ) : (
              <select
                value={formData.topicId}
                onChange={(e) => updateField("topicId", e.target.value)}
                className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
              >
                <option value="">-- Chọn chủ đề --</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Họ và tên <span className="text-accent-red">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="Nhập họ và tên"
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Số điện thoại <span className="text-accent-red">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="0912345678"
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Email <span className="text-accent-red">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
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
              placeholder="Mô tả chi tiết vấn đề của bạn..."
              rows={5}
              className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-blue resize-none transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
              {error.includes("401") || error.includes("đăng nhập") ? (
                <span>
                  {error}{" "}
                  <a href="/dang-nhap" className="underline font-medium">
                    Đăng nhập ngay
                  </a>
                </span>
              ) : (
                error
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent-green hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang gửi...
              </>
            ) : (
              "Gửi ý kiến"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
