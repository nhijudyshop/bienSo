/**
 * VPA Token Helper - Content Script
 * Chạy trên dgbs.vpa.com.vn
 * - Detect khi user đã đăng nhập (token có trong localStorage)
 * - Hiện nút "Gửi token" floating
 * - Bấm → postMessage token về window.opener (bien-so.vercel.app) → tự đóng
 */

const ALLOWED_ORIGINS = [
  "https://bien-so.vercel.app",
  "http://localhost:3000",
];

function findToken() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key);
    if (val && val.length > 100 && (key.toLowerCase().includes("token") || key.toLowerCase().includes("auth"))) {
      return val;
    }
  }
  return null;
}

function createButton() {
  // Avoid duplicate
  if (document.getElementById("vpa-token-btn")) return;

  const btn = document.createElement("div");
  btn.id = "vpa-token-btn";
  btn.innerHTML = `
    <button id="vpa-send-token" style="
      background: #22c55e;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
      transition: all 0.2s;
    ">
      🔑 Gửi token về bien-so
    </button>
  `;
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
  `;
  document.body.appendChild(btn);

  const sendBtn = document.getElementById("vpa-send-token");
  sendBtn.addEventListener("mouseenter", () => {
    sendBtn.style.transform = "scale(1.05)";
    sendBtn.style.boxShadow = "0 6px 24px rgba(34, 197, 94, 0.5)";
  });
  sendBtn.addEventListener("mouseleave", () => {
    sendBtn.style.transform = "scale(1)";
    sendBtn.style.boxShadow = "0 4px 20px rgba(34, 197, 94, 0.4)";
  });

  sendBtn.addEventListener("click", () => {
    const token = findToken();
    if (!token) {
      sendBtn.textContent = "❌ Chưa tìm thấy token";
      sendBtn.style.background = "#ef4444";
      setTimeout(() => {
        sendBtn.innerHTML = "🔑 Gửi token về bien-so";
        sendBtn.style.background = "#22c55e";
      }, 2000);
      return;
    }

    // Send via postMessage to opener (popup flow)
    if (window.opener) {
      try {
        window.opener.postMessage({ type: "VPA_TOKEN", token }, "*");
      } catch (e) { /* ignore */ }
    }

    // Also copy to clipboard
    navigator.clipboard.writeText(token).catch(() => {});

    // Show success
    sendBtn.innerHTML = "✓ Đã gửi token!";
    sendBtn.style.background = "#16a34a";

    // Close popup after short delay
    setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 800);
  });
}

function removeButton() {
  const btn = document.getElementById("vpa-token-btn");
  if (btn) btn.remove();
}

// Check periodically for token (user might just finished logging in)
function checkAndShow() {
  const token = findToken();
  if (token) {
    createButton();

    // Auto-send if opened from bien-so popup
    if (window.opener) {
      // Auto-send after a short delay to let user see the button
      // Only auto-send if not on login page (meaning login just completed)
      if (!window.location.pathname.includes("dang-nhap") && !window.location.pathname.includes("dang-ky")) {
        setTimeout(() => {
          try {
            window.opener.postMessage({ type: "VPA_TOKEN", token }, "*");
            navigator.clipboard.writeText(token).catch(() => {});
            const sendBtn = document.getElementById("vpa-send-token");
            if (sendBtn) {
              sendBtn.innerHTML = "✓ Token đã gửi tự động!";
              sendBtn.style.background = "#16a34a";
            }
            setTimeout(() => window.close(), 1000);
          } catch (e) { /* ignore */ }
        }, 1500);
      }
    }
  } else {
    removeButton();
  }
}

// Initial check
checkAndShow();

// Re-check when page navigates (SPA)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(checkAndShow, 1000);
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// Also check periodically (token might appear after API response)
setInterval(checkAndShow, 3000);
