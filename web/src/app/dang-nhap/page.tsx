"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { VPA_URL } from "@/lib/constants";

// Bookmarklet: khi chạy trên dgbs.vpa.com.vn sẽ tìm token trong localStorage và copy
const BOOKMARKLET_CODE = `javascript:void(function(){var t='';for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i),v=localStorage.getItem(k);if(v&&v.length>100&&(k.toLowerCase().includes('token')||k.toLowerCase().includes('auth'))){t=v;break}}if(!t){alert('Không tìm thấy token. Hãy đăng nhập trước.')}else{navigator.clipboard.writeText(t).then(function(){alert('Đã copy token! Quay lại bien-so.vercel.app để dán.')}).catch(function(){prompt('Copy token bên dưới:',t)})}})()`;

export default function DangNhapPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  if (user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
            <div className="w-16 h-16 bg-accent-green rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h2 className="text-xl font-bold mb-2">
              Xin chào, {user.fullName || user.phoneNumber || "bạn"}
            </h2>
            <p className="text-text-secondary text-sm mb-6">Bạn đã đăng nhập thành công</p>
            <Link
              href="/thong-tin/tai-khoan"
              className="inline-block bg-accent-green hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Đi đến tài khoản
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleTokenLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = token.trim();
    if (!trimmed) {
      setError("Vui lòng dán token");
      return;
    }
    if (trimmed.length < 50) {
      setError("Token không hợp lệ (quá ngắn)");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ token: trimmed });
      if (result.success) {
        router.push("/thong-tin/tai-khoan");
      } else {
        setError(result.error || "Token không hợp lệ");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-bg-secondary rounded-2xl p-8 border border-border">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent-green rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
            <p className="text-text-secondary text-sm mt-2">
              Đăng nhập vào hệ thống đấu giá biển số xe
            </p>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setStep(1)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === 1 ? "bg-accent-green/20 text-accent-green" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? "bg-accent-green text-white" : "bg-bg-card text-text-secondary"
              }`}>1</span>
              Đăng nhập VPA
            </button>
            <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
            <button
              onClick={() => setStep(2)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === 2 ? "bg-accent-green/20 text-accent-green" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2 ? "bg-accent-green text-white" : "bg-bg-card text-text-secondary"
              }`}>2</span>
              Dán token
            </button>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="bg-bg-card border border-border rounded-lg p-4 text-sm text-text-secondary space-y-3">
                <p>
                  Do VPA yêu cầu reCAPTCHA (giới hạn domain <code className="text-xs bg-bg-input px-1 py-0.5 rounded">dgbs.vpa.com.vn</code>),
                  bạn cần đăng nhập trực tiếp trên VPA rồi lấy token.
                </p>
              </div>

              {/* Step 1: Open VPA */}
              <a
                href={`${VPA_URL}/dang-nhap`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-accent-green hover:bg-green-600 text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
                Mở trang đăng nhập VPA
              </a>

              {/* Step 2: Copy token */}
              <div className="bg-bg-card border border-border rounded-lg p-4 text-sm space-y-3">
                <p className="font-medium text-text-primary">Sau khi đăng nhập xong, lấy token bằng 1 trong 2 cách:</p>

                <div className="space-y-2">
                  <p className="text-text-secondary text-xs font-medium">Cách 1: Bookmarklet (nhanh nhất)</p>
                  <p className="text-text-secondary text-xs">
                    Kéo nút bên dưới vào thanh bookmark. Sau khi đăng nhập VPA, bấm bookmark để tự copy token:
                  </p>
                  <a
                    href={BOOKMARKLET_CODE}
                    onClick={(e) => e.preventDefault()}
                    draggable
                    className="inline-block bg-accent-blue/20 text-accent-blue px-3 py-1.5 rounded text-xs font-medium border border-accent-blue/30 cursor-grab"
                  >
                    📋 Copy VPA Token
                  </a>
                </div>

                <div className="border-t border-border pt-3 space-y-1">
                  <p className="text-text-secondary text-xs font-medium">Cách 2: DevTools</p>
                  <ol className="text-text-secondary text-xs list-decimal list-inside space-y-0.5">
                    <li>Mở DevTools (F12) trên trang VPA</li>
                    <li>Tab <strong>Application</strong> &rarr; <strong>Local Storage</strong></li>
                    <li>Tìm key chứa &quot;token&quot; &rarr; copy giá trị</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-bg-card hover:bg-bg-input border border-border text-text-primary py-3 rounded-lg text-sm font-medium transition-colors"
              >
                Đã có token → Tiếp tục
              </button>
            </div>
          ) : (
            <form onSubmit={handleTokenLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  JWT Token
                </label>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Dán JWT token tại đây..."
                  rows={4}
                  autoFocus
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-blue font-mono text-xs"
                />
              </div>

              {error && (
                <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-green hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Đang xác thực..." : "Đăng nhập"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                ← Quay lại hướng dẫn
              </button>
            </form>
          )}

          {/* Register link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Chưa có tài khoản?{" "}
            <Link
              href="/dang-ky"
              className="text-accent-green hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
