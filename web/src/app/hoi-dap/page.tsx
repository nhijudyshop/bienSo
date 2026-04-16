"use client";

import { useState, useEffect } from "react";
import type { FaqItem } from "@/types";
import { getFaq } from "@/lib/api";

export default function HoiDapPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    getFaq()
      .then(setFaqs)
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">HỎI ĐÁP</h1>

      {loading ? (
        <div className="text-center text-text-secondary py-12">Đang tải dữ liệu...</div>
      ) : faqs.length === 0 ? (
        <div className="text-center text-text-secondary py-12">Chưa có câu hỏi nào</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-bg-card transition-colors"
              >
                <span className="text-sm font-medium pr-4">{faq.question}</span>
                <span className={`text-text-secondary transition-transform flex-shrink-0 ${openId === faq.id ? "rotate-180" : ""}`}>
                  &#9662;
                </span>
              </button>
              {openId === faq.id && (
                <div className="px-6 pb-4 border-t border-border pt-4">
                  <p className="text-sm text-text-secondary whitespace-pre-line leading-6">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
