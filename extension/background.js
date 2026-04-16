/**
 * Background Service Worker - proxy VPA API calls (no CORS restriction)
 */

const VPA = "https://dgbs.vpa.com.vn";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "VPA_PROXY") return false;

  const { endpoint, method, body, token } = msg;
  const csrf = btoa(Date.now().toString());
  const isWrite = method === "POST" || method === "PUT" || method === "DELETE";

  const headers = {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
    Referer: "https://dgbs.vpa.com.vn/",
    Origin: "https://dgbs.vpa.com.vn",
    csrf,
  };

  // Only set Content-Type for requests with body
  if (isWrite) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOpts = { method: method || "GET", headers };
  if (body && isWrite) {
    fetchOpts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  fetch(`${VPA}${endpoint}`, fetchOpts)
    .then(async (res) => {
      const text = await res.text();
      sendResponse({ ok: res.ok, status: res.status, data: text });
    })
    .catch((err) => {
      sendResponse({ ok: false, status: 0, error: err.message });
    });

  return true; // async response
});

console.log("[VPA Background] 🟢 Service worker ready");
