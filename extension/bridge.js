/**
 * Bridge: chạy trên bien-so.vercel.app (MAIN world)
 * Intercept ALL fetch calls đến /api/proxy → gọi VPA trực tiếp từ browser
 * CORS được bypass bởi declarativeNetRequest rules trong extension
 */

const VPA = "https://dgbs.vpa.com.vn";

function getToken() {
  const m = document.cookie.match(/(?:^|;\s*)vpa_token=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

const _fetch = window.fetch;

window.fetch = async function (...args) {
  const input = args[0];
  const url = typeof input === "string" ? input : input?.url || "";

  // Only intercept /api/proxy calls
  if (!url.includes("/api/proxy?endpoint=")) {
    return _fetch.apply(this, args);
  }

  const urlObj = new URL(url, location.origin);
  const endpoint = urlObj.searchParams.get("endpoint");
  if (!endpoint) return _fetch.apply(this, args);

  const token = getToken();
  const csrf = btoa(Date.now().toString());
  const init = args[1] || {};
  const method = init.method || "GET";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    csrf,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const vpaRes = await _fetch(`${VPA}${endpoint}`, {
      method,
      headers,
      body: method !== "GET" && method !== "HEAD" ? init.body : undefined,
    });

    // Clone response to return to caller
    const data = await vpaRes.text();
    return new Response(data, {
      status: vpaRes.status,
      statusText: vpaRes.statusText,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.warn("[VPA Bridge] Direct call failed, falling back to proxy:", err.message);
    // Fallback to original Vercel proxy
    return _fetch.apply(this, args);
  }
};

window.__VPA_EXTENSION = true;
console.log("[VPA Bridge] 🟢 Active - all API calls go directly to VPA (CORS bypassed by extension)");
