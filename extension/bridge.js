/**
 * Bridge: content script on bien-so.vercel.app (ISOLATED world)
 * Listens for VPA_REQUEST from interceptor.js (MAIN world)
 * Forwards to background service worker via chrome.runtime.sendMessage
 */

window.addEventListener("message", (e) => {
  if (e.source !== window || e.data?.type !== "VPA_REQUEST") return;

  const { id, endpoint, method, body, token } = e.data;

  chrome.runtime.sendMessage(
    { type: "VPA_PROXY", endpoint, method, body, token },
    (response) => {
      if (chrome.runtime.lastError) {
        window.postMessage(
          {
            type: "VPA_RESPONSE",
            id,
            ok: false,
            status: 0,
            error: chrome.runtime.lastError.message,
          },
          "*"
        );
        return;
      }
      window.postMessage(
        {
          type: "VPA_RESPONSE",
          id,
          ok: response.ok,
          status: response.status,
          data: response.data,
          error: response.error,
        },
        "*"
      );
    }
  );
});
