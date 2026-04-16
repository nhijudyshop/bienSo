/**
 * Fetch interceptor - chạy trong MAIN world trên bien-so.vercel.app
 * Intercept /api/proxy → background worker → VPA
 * Nếu VPA trả lỗi → fallback về Vercel proxy
 */

const _fetch = window.fetch;
window.__VPA_EXTENSION = true;
window.__VPA_PENDING = {};
let reqId = 0;

window.addEventListener("message", function (e) {
  if (e.source !== window || e.data?.type !== "VPA_RESPONSE") return;
  const { id, ok, data } = e.data;
  const pending = window.__VPA_PENDING[id];
  if (!pending) return;
  delete window.__VPA_PENDING[id];

  if (ok && data) {
    // VPA trả OK → dùng response
    pending.resolve(
      new Response(data, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  } else {
    // VPA trả lỗi → fallback về Vercel proxy
    pending.resolve(_fetch.apply(window, pending.originalArgs));
  }
});

window.fetch = function (...args) {
  const input = args[0];
  const url = typeof input === "string" ? input : input?.url || "";

  if (!url.includes("/api/proxy?endpoint=")) {
    return _fetch.apply(this, args);
  }

  try {
    const urlObj = new URL(url, location.origin);
    const endpoint = urlObj.searchParams.get("endpoint");
    if (!endpoint) return _fetch.apply(this, args);

    const init = args[1] || {};
    const method = init.method || "GET";
    const tokenMatch = document.cookie.match(/(?:^|;\s*)vpa_token=([^;]*)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    const id = ++reqId;
    return new Promise(function (resolve, reject) {
      window.__VPA_PENDING[id] = { resolve, reject, originalArgs: args };
      window.postMessage(
        {
          type: "VPA_REQUEST",
          id,
          endpoint,
          method,
          body: init.body || null,
          token,
        },
        "*"
      );

      // Timeout: fallback to original proxy after 8s
      setTimeout(function () {
        if (window.__VPA_PENDING[id]) {
          delete window.__VPA_PENDING[id];
          resolve(_fetch.apply(window, args));
        }
      }, 8000);
    });
  } catch (e) {
    return _fetch.apply(this, args);
  }
};

console.log("[VPA Bridge] 🟢 Interceptor active - VPA direct with Vercel fallback");
