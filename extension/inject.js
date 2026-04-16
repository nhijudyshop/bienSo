/**
 * VPA Token Helper - Main World Script
 * Chạy trong main world của dgbs.vpa.com.vn (KHÔNG phải isolated world)
 * → có thể intercept fetch/XHR thật của trang
 */

let foundToken = null;

// === 1. Intercept fetch() ===
const _fetch = window.fetch;
window.fetch = async function (...args) {
  const res = await _fetch.apply(this, args);
  const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";

  if (url.includes("/authenticate") && !url.includes("refresh")) {
    try {
      const clone = res.clone();
      const data = await clone.json();
      const t = data?.result?.token || data?.token;
      if (t && t.length > 50) onToken(t, "fetch");
    } catch {}
  }

  // Check Authorization header in request init
  const init = args[1];
  if (init?.headers) {
    const h = init.headers instanceof Headers ? Object.fromEntries(init.headers) : init.headers;
    const auth = h["Authorization"] || h["authorization"];
    if (auth && auth.startsWith("Bearer ")) {
      const t = auth.slice(7);
      if (t.length > 50) onToken(t, "fetch-header");
    }
  }

  return res;
};

// === 2. Intercept XMLHttpRequest ===
const _xhrOpen = XMLHttpRequest.prototype.open;
const _xhrSend = XMLHttpRequest.prototype.send;
const _xhrSetHeader = XMLHttpRequest.prototype.setRequestHeader;

XMLHttpRequest.prototype.open = function (m, url) {
  this.__url = url;
  return _xhrOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
  if (name.toLowerCase() === "authorization" && value.startsWith("Bearer ")) {
    const t = value.slice(7);
    if (t.length > 50) onToken(t, "xhr-header");
  }
  return _xhrSetHeader.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function () {
  this.addEventListener("load", function () {
    if (this.__url?.includes("/authenticate") && !this.__url.includes("refresh")) {
      try {
        const data = JSON.parse(this.responseText);
        const t = data?.result?.token || data?.token;
        if (t && t.length > 50) onToken(t, "xhr");
      } catch {}
    }
  });
  return _xhrSend.apply(this, arguments);
};

// === 3. Watch localStorage ===
const _setItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
  _setItem.apply(this, arguments);
  if (typeof value === "string" && value.length > 100 && /token|auth|jwt/i.test(key)) {
    onToken(value, "localStorage.setItem");
  }
  // JSON nested
  try {
    const p = JSON.parse(value);
    const t = p?.token || p?.accessToken || p?.result?.token;
    if (t && t.length > 50) onToken(t, "localStorage.setItem-json");
  } catch {}
};

// === Token handler ===
async function onToken(token, source) {
  if (foundToken === token) return;
  foundToken = token;
  console.log(`[VPA Helper] ✅ Token found via ${source} (${token.length} chars)`);
  showButton();

  if (window.opener) {
    // Send token first so parent page knows we're logged in
    try { window.opener.postMessage({ type: "VPA_TOKEN", token }, "*"); } catch {}

    // Sync data BEFORE closing (parent caches it in sessionStorage)
    await syncData(token);

    // Now close
    updateBtn("✅ Đã gửi token + data!", "#16a34a");
    setTimeout(() => window.close(), 500);
  }
}

// === Send token ===
function sendToken(token) {
  if (window.opener) {
    try { window.opener.postMessage({ type: "VPA_TOKEN", token }, "*"); } catch {}
  }
  navigator.clipboard.writeText(token).catch(() => {});
  updateBtn("✅ Đã gửi token!", "#16a34a");

  // Manual button click - sync + close
  syncData(token).then(() => {
    if (window.opener) setTimeout(() => window.close(), 500);
  });
}

// === UI ===
function showButton() {
  if (document.getElementById("__vpa_helper")) return;

  const el = document.createElement("div");
  el.id = "__vpa_helper";
  el.innerHTML = `
<div style="position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:-apple-system,sans-serif;">
  <button id="__vpa_btn" style="
    background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;
    padding:14px 24px;border-radius:14px;font-size:15px;font-weight:700;
    cursor:pointer;display:flex;align-items:center;gap:8px;
    box-shadow:0 4px 24px rgba(34,197,94,.5);transition:all .2s;
    animation:__vpa_pulse 2s infinite;
  ">🔑 Gửi token về bien-so</button>
</div>
<style>
@keyframes __vpa_pulse{0%,100%{box-shadow:0 4px 24px rgba(34,197,94,.5)}50%{box-shadow:0 4px 32px rgba(34,197,94,.9)}}
#__vpa_btn:hover{transform:translateY(-2px) scale(1.03)}
</style>`;
  document.body.appendChild(el);

  document.getElementById("__vpa_btn").onclick = () => {
    const t = foundToken || scanLS();
    if (!t) { updateBtn("❌ Chưa có token!", "#ef4444"); setTimeout(() => updateBtn("🔑 Gửi token về bien-so", null), 2000); return; }
    sendToken(t);
  };
}

function updateBtn(text, bg) {
  const b = document.getElementById("__vpa_btn");
  if (b) { b.textContent = text; if (bg) b.style.background = bg; }
}

// === Scan localStorage ===
function scanLS() {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i), v = localStorage.getItem(k);
    if (!v) continue;
    if (v.length > 100 && /token|auth|jwt/i.test(k)) return v;
    try {
      const p = JSON.parse(v);
      const t = p?.token || p?.accessToken || p?.access_token || p?.result?.token || p?.jwtToken;
      if (t && t.length > 50) return t;
    } catch {}
  }
  return null;
}

// Periodic scan
function tick() {
  if (foundToken) return;
  const t = scanLS();
  if (t) onToken(t, "scan");
}
setInterval(tick, 2000);

// SPA navigation watch
let _url = location.href;
new MutationObserver(() => {
  if (location.href !== _url) { _url = location.href; setTimeout(tick, 1000); }
}).observe(document.documentElement, { childList: true, subtree: true });

// === Sync authenticated data to bien-so ===
const SYNC_TARGET = "https://bien-so.vercel.app";
const SYNC_ENDPOINTS = [
  { endpoint: "/web-api/user-bidding/api/user/get-profile", method: "GET" },
  { endpoint: "/web-api/user-bidding/api/cart/get-all-items", method: "GET" },
  { endpoint: "/web-api/user-bidding/api/cart/get-items-count", method: "GET" },
  { endpoint: "/web-api/user-bidding/api/notification/get-unread-count", method: "GET" },
  { endpoint: "/web-api/user-bidding/api/order/get-orders-payment-status", method: "GET" },
  { endpoint: "/web-api/user-bidding/api/order/get-orders-wait-auction", method: "GET" },
  { endpoint: "/web-api/user-bidding/api/user/auction-result/get-history-and-result", method: "GET" },
  { endpoint: "/web-api/user-bidding/api/notification/get-all-user-notification", method: "GET" },
  { endpoint: "/web-api/user-bidding/api/document/v2/user/all", method: "GET" },
];

async function syncData(token) {
  console.log("[VPA Helper] 🔄 Syncing authenticated data...");
  const csrf = btoa(Date.now().toString());
  const results = {};

  for (const { endpoint, method } of SYNC_ENDPOINTS) {
    try {
      const res = await _fetch(`https://dgbs.vpa.com.vn${endpoint}`, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          csrf,
        },
      });
      if (res.ok) {
        results[endpoint] = await res.json();
      }
    } catch {}
  }

  // Send cached data to opener (bien-so page) via postMessage
  if (window.opener) {
    try {
      window.opener.postMessage({ type: "VPA_SYNC", data: results }, "*");
      console.log("[VPA Helper] ✅ Synced", Object.keys(results).length, "endpoints to opener");
    } catch (e) {
      console.log("[VPA Helper] ⚠️ postMessage sync failed:", e.message);
    }
  }
}

console.log("[VPA Helper] 🟢 Loaded - intercepting fetch/XHR/localStorage");
