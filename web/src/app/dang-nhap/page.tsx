"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { VPA_URL } from "@/lib/constants";

// Bookmarklet: chạy trên VPA → đọc token → postMessage về opener → đóng popup
const BOOKMARKLET_CODE = `javascript:void(function(){var t='';for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i),v=localStorage.getItem(k);if(v&&v.length>100&&(k.toLowerCase().includes('token')||k.toLowerCase().includes('auth'))){t=v;break}}if(!t){alert('Không tìm thấy token. Hãy đăng nhập trước.')}else if(window.opener){window.opener.postMessage({type:'VPA_TOKEN',token:t},'*');window.close()}else{navigator.clipboard.writeText(t).then(function(){alert('Đã copy token!')}).catch(function(){prompt('Copy token:',t)})}})()`;

type PageState = "idle" | "waiting" | "token";

export default function DangNhapPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [state, setState] = useState<PageState>("idle");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen for postMessage from popup
  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === "VPA_TOKEN" && e.data.token) {
      setToken(e.data.token);
      setState("token");
      // Auto-submit
      submitToken(e.data.token);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [handleMessage]);

  async function submitToken(jwt: string) {
    setError("");
    setLoading(true);
    try {
      const result = await login({ token: jwt });
      if (result.success) {
        router.push("/thong-tin/tai-khoan");
      } else {
        setError(result.error || "Token không hợp lệ");
        setState("token");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setState("token");
    } finally {
      setLoading(false);
    }
  }

  function openVpaLogin() {
    // Open popup centered
    const w = 500, h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      `${VPA_URL}/dang-nhap`,
      "vpa_login",
      `width=${w},height=${h},left=${left},top=${top},toolbar=yes,menubar=no,scrollbars=yes`
    );

    if (popup) {
      popupRef.current = popup;
      setState("waiting");

      // Poll to detect popup closed
      pollRef.current = setInterval(() => {
        if (popup.closed) {
          if (pollRef.current) clearInterval(pollRef.current);
          // If no token received yet, switch to manual paste
          if (!token) {
            setState("token");
          }
        }
      }, 500);
    } else {
      // Popup blocked
      setError("Popup bị chặn. Hãy cho phép popup trong trình duyệt.");
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed || trimmed.length < 50) {
      setError("Token không hợp lệ");
      return;
    }
    submitToken(trimmed);
  }

  // Already logged in
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

          {state === "idle" && (
            <div className="space-y-4">
              {/* Main action */}
              <button
                onClick={openVpaLogin}
                className="w-full bg-accent-green hover:bg-green-600 text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
                Đăng nhập qua VPA
              </button>

              <div className="bg-bg-card border border-border rounded-lg p-4 text-xs text-text-secondary space-y-2">
                <p>Mở trang đăng nhập VPA trong popup → đăng nhập bình thường → token tự động chuyển về.</p>
                <div className="border-t border-border pt-2 mt-2">
                  <p className="font-medium text-text-primary mb-1">Chuẩn bị (chỉ cần làm 1 lần):</p>
                  <p>Kéo nút bên dưới vào <strong>thanh bookmark</strong>. Sau khi đăng nhập VPA, bấm bookmark này để lấy token:</p>
                  <a
                    href={BOOKMARKLET_CODE}
                    onClick={(e) => e.preventDefault()}
                    draggable
                    className="inline-block mt-1 bg-accent-blue/20 text-accent-blue px-3 py-1.5 rounded text-xs font-medium border border-accent-blue/30 cursor-grab active:cursor-grabbing"
                  >
                    🔑 Lấy VPA Token
                  </a>
                </div>
              </div>

              {/* Manual token input toggle */}
              <button
                onClick={() => setState("token")}
                className="w-full text-text-secondary hover:text-text-primary text-sm transition-colors py-2"
              >
                Đã có token? Dán trực tiếp →
              </button>
            </div>
          )}

          {state === "waiting" && (
            <div className="space-y-4 text-center">
              {/* Waiting animation */}
              <div className="py-6">
                <div className="w-12 h-12 border-4 border-accent-green/30 border-t-accent-green rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-primary font-medium">Đang chờ đăng nhập...</p>
                <p className="text-text-secondary text-sm mt-1">
                  Đăng nhập trên cửa sổ VPA vừa mở
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-bg-card border border-border rounded-lg p-4 text-left text-xs text-text-secondary space-y-2">
                <p className="font-medium text-text-primary">Sau khi đăng nhập xong:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Bấm bookmark <strong>&quot;🔑 Lấy VPA Token&quot;</strong> trên thanh bookmark</li>
                  <li>Token sẽ tự động chuyển về đây</li>
                </ol>
                <div className="border-t border-border pt-2 mt-2">
                  <p className="text-text-secondary">Hoặc mở Console (F12) trên popup VPA và chạy:</p>
                  <code className="block bg-bg-input p-2 rounded text-[10px] mt-1 break-all select-all">
                    {`window.opener.postMessage({type:'VPA_TOKEN',token:Object.values(localStorage).find(v=>v.length>100)},'*');close()`}
                  </code>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    popupRef.current?.focus();
                  }}
                  className="flex-1 bg-bg-card hover:bg-bg-input border border-border text-text-primary py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Mở lại popup
                </button>
                <button
                  onClick={() => setState("token")}
                  className="flex-1 bg-bg-card hover:bg-bg-input border border-border text-text-secondary py-2.5 rounded-lg text-sm transition-colors"
                >
                  Dán token thủ công
                </button>
              </div>
            </div>
          )}

          {state === "token" && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
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
                onClick={() => { setState("idle"); setError(""); }}
                className="w-full text-text-secondary hover:text-text-primary text-sm transition-colors py-2"
              >
                ← Quay lại
              </button>
            </form>
          )}

          {/* Error for idle state */}
          {state === "idle" && error && (
            <div className="mt-4 bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
              {error}
            </div>
          )}

          {/* Register link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Chưa có tài khoản?{" "}
            <Link href="/dang-ky" className="text-accent-green hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
