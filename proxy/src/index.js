const TARGET = "https://dgbs.vpa.com.vn";

const ALLOWED_ORIGINS = [
  "https://nhijudyshop.github.io",
  "http://localhost:3000",
  "http://localhost:3001",
];

const ALLOWED_ENDPOINTS = [
  "/web-api/user-bidding/api/administrative/provinces",
  "/web-api/user-bidding/api/administrative/districts",
  "/web-api/user-bidding/api/administrative/wards",
  "/search-api/search/list-announcement-plan",
  "/search-api/search/list-announcement-plan-code",
  "/search-api/search/get-all-wh-license-plate",
  "/search-api/search/list-published-license-plate",
  "/search-api/search/statistic-winner-price-history",
  "/api/bidding/public-result/history/auction-result-session",
  "/api/bidding/public-result/history/detail/auction-result-session",
  "/api/bidding/public-result/list-await-auction/province/view",
  "/api/tin-tuc/faq/get-faq",
  "/api/tin-tuc/public/api/get-public-file",
  "/api/tin-tuc/menu/client-menu/client-get-tree",
  "/api/tin-tuc/public/static-categories",
  "/web-api/time-control/public/time-info",
  "/web-api/user-bidding/api/trending-license-plate",
  "/web-api/user-bidding/api/publish/get-all-publish-detail",
  "/web-api/user-bidding/api/publish/get-current-publish",
  "/web-api/user-bidding/api/publish/get-current-register",
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  };
}

function isAllowed(endpoint) {
  return ALLOWED_ENDPOINTS.some((a) => endpoint.startsWith(a));
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // CORS preflight
    if (request.method === "OPTIONS") {
      const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
      return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
    }

    // Get endpoint from query param
    const endpoint = url.searchParams.get("endpoint");
    if (!endpoint) {
      return Response.json(
        { error: "Missing ?endpoint= parameter", usage: "?endpoint=/search-api/search/list-announcement-plan" },
        { status: 400, headers: corsHeaders(origin || "*") }
      );
    }

    if (!isAllowed(endpoint)) {
      return Response.json(
        { error: "Endpoint not allowed" },
        { status: 403, headers: corsHeaders(origin || "*") }
      );
    }

    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    try {
      // Forward request to VPA
      const fetchOptions = {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "VPA-Proxy/1.0",
        },
      };

      if (request.method === "POST") {
        fetchOptions.body = await request.text();
      }

      const res = await fetch(`${TARGET}${endpoint}`, fetchOptions);
      const data = await res.text();

      return new Response(data, {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(allowedOrigin),
        },
      });
    } catch (err) {
      return Response.json(
        { error: "Proxy failed", message: err.message },
        { status: 502, headers: corsHeaders(allowedOrigin) }
      );
    }
  },
};
