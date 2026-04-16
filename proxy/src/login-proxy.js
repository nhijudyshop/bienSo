/**
 * CF Worker: Full reverse proxy for VPA login page.
 * - Proxies dgbs.vpa.com.vn → strips X-Frame-Options & CSP frame-ancestors
 * - Injects script to intercept JWT token after login → postMessage to parent
 * - Allows embedding in iframe on bien-so.vercel.app
 */

const VPA_ORIGIN = "https://dgbs.vpa.com.vn";
const ALLOWED_PARENT_ORIGINS = [
  "https://bien-so.vercel.app",
  "http://localhost:3000",
];

// Script injected into every HTML page to intercept auth token
const INJECT_SCRIPT = `
<script>
(function() {
  // Intercept fetch to capture JWT from authenticate response
  const origFetch = window.fetch;
  window.fetch = async function(...args) {
    const res = await origFetch.apply(this, args);
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    if (url.includes('/account/authenticate') && !url.includes('refresh')) {
      try {
        const clone = res.clone();
        const data = await clone.json();
        if (data.success && data.result && data.result.token) {
          window.parent.postMessage({
            type: 'VPA_LOGIN_SUCCESS',
            token: data.result.token
          }, '*');
        }
      } catch(e) {}
    }
    return res;
  };

  // Also intercept XHR
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
      if (this._url && this._url.includes('/account/authenticate') && !this._url.includes('refresh')) {
        try {
          const data = JSON.parse(this.responseText);
          if (data.success && data.result && data.result.token) {
            window.parent.postMessage({
              type: 'VPA_LOGIN_SUCCESS',
              token: data.result.token
            }, '*');
          }
        } catch(e) {}
      }
    });
    return origSend.apply(this, arguments);
  };

  // Watch localStorage for token changes
  const origSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    origSetItem.apply(this, arguments);
    if (key.toLowerCase().includes('token') && value && value.length > 100) {
      window.parent.postMessage({
        type: 'VPA_LOGIN_SUCCESS',
        token: value
      }, '*');
    }
  };
})();
</script>
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const workerOrigin = url.origin;

    // Health check
    if (url.pathname === "/__health") {
      return new Response("ok");
    }

    // Build target URL - proxy to VPA
    const targetUrl = VPA_ORIGIN + url.pathname + url.search;

    // Clone and modify request headers
    const headers = new Headers(request.headers);
    headers.set("Host", "dgbs.vpa.com.vn");
    headers.set("Origin", VPA_ORIGIN);
    headers.set("Referer", VPA_ORIGIN + url.pathname);
    headers.delete("CF-Connecting-IP");
    headers.delete("CF-IPCountry");
    headers.delete("CF-Ray");
    headers.delete("CF-Visitor");

    const fetchOptions = {
      method: request.method,
      headers,
      redirect: "follow",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = request.body;
    }

    try {
      const res = await fetch(targetUrl, fetchOptions);

      // Build response headers - strip frame restrictions
      const responseHeaders = new Headers(res.headers);
      responseHeaders.delete("x-frame-options");
      responseHeaders.delete("content-security-policy");
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "*");

      const contentType = res.headers.get("content-type") || "";

      // For HTML responses, rewrite URLs and inject script
      if (contentType.includes("text/html")) {
        let html = await res.text();

        // Inject our token-capture script right after <head>
        html = html.replace(/<head([^>]*)>/i, `<head$1>${INJECT_SCRIPT}`);

        // Rewrite absolute VPA URLs to go through our proxy
        html = html.replace(/https:\/\/dgbs\.vpa\.com\.vn/g, workerOrigin);

        responseHeaders.set("Content-Type", "text/html; charset=utf-8");
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");

        return new Response(html, {
          status: res.status,
          headers: responseHeaders,
        });
      }

      // For JS responses, rewrite VPA origin references
      if (contentType.includes("javascript")) {
        let js = await res.text();
        js = js.replace(/https:\/\/dgbs\.vpa\.com\.vn/g, workerOrigin);

        responseHeaders.set("Content-Type", "application/javascript; charset=utf-8");
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("content-length");

        return new Response(js, {
          status: res.status,
          headers: responseHeaders,
        });
      }

      // Pass through other resources (CSS, images, fonts, etc.)
      return new Response(res.body, {
        status: res.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Proxy failed", message: err.message }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
