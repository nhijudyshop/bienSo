/**
 * Bridge: content script on bien-so.vercel.app (ISOLATED world)
 * Injects a script into the page that intercepts fetch → sends to background worker
 */

// Inject the fetch interceptor into the page's MAIN world
const script = document.createElement("script");
script.textContent = `
(function() {
  const _fetch = window.fetch;
  window.__VPA_EXTENSION = true;
  window.__VPA_PENDING = {};
  let reqId = 0;

  window.addEventListener("message", function(e) {
    if (e.source !== window || e.data?.type !== "VPA_RESPONSE") return;
    const { id, ok, status, data, error } = e.data;
    const pending = window.__VPA_PENDING[id];
    if (pending) {
      delete window.__VPA_PENDING[id];
      if (error) {
        pending.reject(new Error(error));
      } else {
        pending.resolve(new Response(data, {
          status: status,
          headers: { "Content-Type": "application/json" },
        }));
      }
    }
  });

  window.fetch = function(...args) {
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
      const token = document.cookie.match(/(?:^|;\\s*)vpa_token=([^;]*)/)?.[1];

      const id = ++reqId;
      return new Promise(function(resolve, reject) {
        window.__VPA_PENDING[id] = { resolve, reject };
        window.postMessage({
          type: "VPA_REQUEST",
          id, endpoint, method,
          body: init.body || null,
          token: token ? decodeURIComponent(token) : null,
        }, "*");

        // Timeout fallback to original proxy after 10s
        setTimeout(function() {
          if (window.__VPA_PENDING[id]) {
            delete window.__VPA_PENDING[id];
            resolve(_fetch.apply(window, args));
          }
        }, 10000);
      });
    } catch(e) {
      return _fetch.apply(this, args);
    }
  };

  console.log("[VPA Bridge] 🟢 Active - all API calls proxied via extension");
})();
`;
document.documentElement.appendChild(script);
script.remove();

// Listen for requests from page, forward to background service worker
window.addEventListener("message", (e) => {
  if (e.source !== window || e.data?.type !== "VPA_REQUEST") return;

  const { id, endpoint, method, body, token } = e.data;

  chrome.runtime.sendMessage(
    { type: "VPA_PROXY", endpoint, method, body, token },
    (response) => {
      if (chrome.runtime.lastError) {
        window.postMessage({
          type: "VPA_RESPONSE", id,
          ok: false, status: 0, error: chrome.runtime.lastError.message,
        }, "*");
        return;
      }
      window.postMessage({
        type: "VPA_RESPONSE", id,
        ok: response.ok, status: response.status,
        data: response.data, error: response.error,
      }, "*");
    }
  );
});
