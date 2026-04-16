/**
 * VPA Token Helper - Content Script
 * Chạy trên dgbs.vpa.com.vn
 *
 * 3 cách bắt token:
 * 1. Intercept fetch/XHR responses từ /authenticate
 * 2. Intercept request headers có Authorization: Bearer
 * 3. Scan localStorage (key chứa token, hoặc JSON value chứa token)
 */

let foundToken = null;

// === 1. Intercept fetch() ===
const origFetch = window.fetch;
window.fetch = async function (...args) {
  const res = await origFetch.apply(this, args);
  const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";

  // Bắt token từ authenticate response
  if (url.includes("/authenticate") && !url.includes("refresh")) {
    try {
      const clone = res.clone();
      const data = await clone.json();
      const token = data?.result?.token || data?.token;
      if (token && token.length > 50) {
        onTokenFound(token, "fetch /authenticate");
      }
    } catch (e) { /* ignore */ }
  }

  return res;
};

// === 2. Intercept XMLHttpRequest ===
const origXhrOpen = XMLHttpRequest.prototype.open;
const origXhrSend = XMLHttpRequest.prototype.send;
const origXhrSetHeader = XMLHttpRequest.prototype.setRequestHeader;

XMLHttpRequest.prototype.open = function (method, url) {
  this._url = url;
  this._headers = {};
  return origXhrOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
  this._headers[name.toLowerCase()] = value;
  // Bắt token từ Authorization header
  if (name.toLowerCase() === "authorization" && value.startsWith("Bearer ")) {
    const token = value.replace("Bearer ", "");
    if (token.length > 50) {
      onTokenFound(token, "XHR Authorization header");
    }
  }
  return origXhrSetHeader.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function () {
  this.addEventListener("load", function () {
    if (this._url && this._url.includes("/authenticate") && !this._url.includes("refresh")) {
      try {
        const data = JSON.parse(this.responseText);
        const token = data?.result?.token || data?.token;
        if (token && token.length > 50) {
          onTokenFound(token, "XHR /authenticate");
        }
      } catch (e) { /* ignore */ }
    }
  });
  return origXhrSend.apply(this, arguments);
};

// === 3. Scan localStorage ===
function scanLocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key);
    if (!val) continue;

    // Direct match: key chứa token/auth và value dài
    if (val.length > 100 && /token|auth|jwt/i.test(key)) {
      return val;
    }

    // JSON nested: parse và tìm token bên trong
    try {
      const parsed = JSON.parse(val);
      const nested =
        parsed?.token || parsed?.accessToken || parsed?.access_token ||
        parsed?.result?.token || parsed?.id_token || parsed?.jwtToken;
      if (nested && nested.length > 50) {
        return nested;
      }
    } catch { /* not JSON */ }
  }
  return null;
}

// === Token found handler ===
function onTokenFound(token, source) {
  if (foundToken === token) return; // đã tìm thấy rồi
  foundToken = token;
  console.log(`[VPA Helper] Token found via ${source}`);
  showButton();

  // Auto-send nếu mở từ popup bien-so
  if (window.opener) {
    sendToken(token);
  }
}

// === UI: Floating button ===
function showButton() {
  if (document.getElementById("vpa-token-helper")) return;

  const container = document.createElement("div");
  container.id = "vpa-token-helper";
  container.innerHTML = `
    <style>
      #vpa-token-helper-btn {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        border: none;
        padding: 14px 28px;
        border-radius: 14px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 24px rgba(34, 197, 94, 0.5);
        transition: all 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #vpa-token-helper-btn:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 32px rgba(34, 197, 94, 0.6);
      }
      #vpa-token-helper-btn:active {
        transform: scale(0.98);
      }
      #vpa-token-helper-pulse {
        animation: vpa-pulse 2s infinite;
      }
      @keyframes vpa-pulse {
        0%, 100% { box-shadow: 0 4px 24px rgba(34, 197, 94, 0.5); }
        50% { box-shadow: 0 4px 32px rgba(34, 197, 94, 0.8); }
      }
    </style>
    <div id="vpa-token-helper-pulse" style="position:fixed;bottom:24px;right:24px;z-index:999999;">
      <button id="vpa-token-helper-btn">
        🔑 Gửi token về bien-so
      </button>
    </div>
  `;
  document.body.appendChild(container);

  document.getElementById("vpa-token-helper-btn").addEventListener("click", () => {
    const token = foundToken || scanLocalStorage();
    if (!token) {
      updateButton("❌ Không tìm thấy token!", "#ef4444", false);
      setTimeout(() => updateButton("🔑 Gửi token về bien-so", null, true), 2000);
      return;
    }
    sendToken(token);
  });
}

function updateButton(text, bgColor, pulse) {
  const btn = document.getElementById("vpa-token-helper-btn");
  const pulseEl = document.getElementById("vpa-token-helper-pulse");
  if (btn) {
    btn.textContent = text;
    if (bgColor) btn.style.background = bgColor;
  }
  if (pulseEl) {
    pulseEl.style.animation = pulse ? "vpa-pulse 2s infinite" : "none";
  }
}

function sendToken(token) {
  // postMessage to opener
  if (window.opener) {
    try {
      window.opener.postMessage({ type: "VPA_TOKEN", token }, "*");
    } catch (e) { /* ignore */ }
  }

  // Copy to clipboard
  navigator.clipboard.writeText(token).catch(() => {});

  // Update UI
  updateButton("✅ Đã gửi token!", "#16a34a", false);

  // Close popup
  setTimeout(() => {
    if (window.opener) window.close();
  }, 800);
}

// === Monitor: check periodically ===
function monitor() {
  if (foundToken) return; // đã có rồi

  const lsToken = scanLocalStorage();
  if (lsToken) {
    onTokenFound(lsToken, "localStorage scan");
  }
}

// Run monitor
monitor();
setInterval(monitor, 2000);

// Watch SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(monitor, 1500);
  }
}).observe(document.documentElement, { childList: true, subtree: true });
