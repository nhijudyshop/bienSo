import type {
  Province,
  AnnouncementPlan,
  WarehousePlate,
  AuctionResultSession,
  AnnouncementPlanCode,
  FaqItem,
  PublicFile,
  PaginatedResponse,
} from "@/types";

const BASE = "/api/proxy";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(endpoint: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const ts = parseInt(sessionStorage.getItem("vpa_cache_ts") || "0");
    if (Date.now() - ts > CACHE_TTL) return null;
    const cache = JSON.parse(sessionStorage.getItem("vpa_cache") || "{}");
    return cache[endpoint] ?? null;
  } catch { return null; }
}

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}?endpoint=${encodeURIComponent(endpoint)}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    // Try sessionStorage cache (synced by extension)
    const cached = getCachedData(endpoint);
    if (cached) return cached as T;
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

async function poster<T>(endpoint: string, body: unknown): Promise<T> {
  return fetcher<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// --- Public APIs ---

export async function getProvinces(): Promise<Province[]> {
  const data = await fetcher<{ success: boolean; result: Province[] }>(
    "/web-api/user-bidding/api/administrative/provinces"
  );
  return data.result;
}

export async function getAnnouncementPlanCodes(): Promise<AnnouncementPlanCode[]> {
  return fetcher<AnnouncementPlanCode[]>(
    "/search-api/search/list-announcement-plan-code"
  );
}

export async function getAnnouncementPlans(params?: {
  provinceCode?: string;
  announcementCode?: string;
  search?: string;
  colorCode?: string;
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<AnnouncementPlan>> {
  return poster<PaginatedResponse<AnnouncementPlan>>(
    "/search-api/search/list-announcement-plan",
    {
      provinceCode: params?.provinceCode ?? "",
      announcementCode: params?.announcementCode ?? "",
      search: params?.search ?? "",
      colorCode: params?.colorCode ?? "",
      page: params?.page ?? 0,
      size: params?.size ?? 25,
    }
  );
}

export async function getWarehousePlates(params?: {
  provinceCode?: string;
  search?: string;
  announcementCode?: string;
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<WarehousePlate>> {
  return poster<PaginatedResponse<WarehousePlate>>(
    "/search-api/search/get-all-wh-license-plate",
    {
      provinceCode: params?.provinceCode ?? "",
      search: params?.search ?? "",
      announcementCode: params?.announcementCode ?? "",
      page: params?.page ?? 0,
      size: params?.size ?? 25,
    }
  );
}

export async function getAuctionResults(params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<AuctionResultSession>> {
  return poster<PaginatedResponse<AuctionResultSession>>(
    "/api/bidding/public-result/history/auction-result-session",
    {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    }
  );
}

export async function getAuctionResultDetail(id: number): Promise<unknown> {
  return poster(
    "/api/bidding/public-result/history/detail/auction-result-session",
    { id, page: 0, size: 50 }
  );
}

export async function getFaq(): Promise<FaqItem[]> {
  return fetcher<FaqItem[]>("/api/tin-tuc/faq/get-faq");
}

export async function getPublicFiles(): Promise<{ result: PublicFile[] }> {
  return fetcher<{ result: PublicFile[] }>(
    "/api/tin-tuc/public/api/get-public-file"
  );
}

export async function getServerTime(): Promise<number> {
  return fetcher<number>("/web-api/time-control/public/time-info");
}

// --- Authenticated APIs ---

export async function getUserProfile(): Promise<unknown> {
  const data = await fetcher<{ success: boolean; result: unknown }>(
    "/web-api/user-bidding/api/user/get-profile"
  );
  return data.result;
}

export async function getCartItems(): Promise<unknown[]> {
  const data = await fetcher<{ success: boolean; result: unknown[] }>(
    "/web-api/user-bidding/api/cart/get-all-items"
  );
  return data.result ?? [];
}

export async function getCartCount(): Promise<number> {
  const data = await fetcher<{ success: boolean; result: number }>(
    "/web-api/user-bidding/api/cart/get-items-count"
  );
  return data.result ?? 0;
}

export async function getWishlistItems(): Promise<unknown[]> {
  const data = await fetcher<{ success: boolean; result: unknown[] }>(
    "/web-api/user-bidding/api/wishlist/get-all-items"
  );
  return data.result ?? [];
}

export async function getOrdersPaymentStatus(): Promise<unknown> {
  return fetcher("/web-api/user-bidding/api/order/get-orders-payment-status");
}

export async function getOrdersWaitAuction(): Promise<unknown> {
  return fetcher("/web-api/user-bidding/api/order/get-orders-wait-auction");
}

export async function getAuctionHistory(): Promise<unknown> {
  return fetcher("/web-api/user-bidding/api/user/auction-result/get-history-and-result");
}

export async function getNotifications(): Promise<unknown[]> {
  const data = await fetcher<{ success: boolean; result: { content: unknown[] } }>(
    "/web-api/user-bidding/api/notification/get-all-user-notification"
  );
  return data.result?.content ?? [];
}

export async function getUnreadCount(): Promise<number> {
  const data = await fetcher<{ success: boolean; result: number }>(
    "/web-api/user-bidding/api/notification/get-unread-count"
  );
  return data.result ?? 0;
}

export async function getDocuments(): Promise<unknown[]> {
  const data = await fetcher<{ success: boolean; result: unknown[] }>(
    "/web-api/user-bidding/api/document/v2/user/all"
  );
  return data.result ?? [];
}

export async function getPublishDetails(): Promise<unknown> {
  return fetcher("/web-api/user-bidding/api/publish/get-all-publish-detail");
}

export async function getCurrentPublish(): Promise<unknown> {
  return fetcher("/web-api/user-bidding/api/publish/get-current-publish");
}

export async function getCurrentRegister(): Promise<unknown> {
  return fetcher("/web-api/user-bidding/api/publish/get-current-register");
}

export async function getWinnerPriceHistory(params: {
  licensePlate?: string;
  page?: number;
  size?: number;
}): Promise<unknown> {
  return poster("/search-api/search/statistic-winner-price-history", {
    licensePlate: params.licensePlate ?? "",
    page: params.page ?? 0,
    size: params.size ?? 25,
  });
}

// --- Helpers ---

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
}

export function formatPlate(raw: string): string {
  if (!raw) return "";
  const clean = raw.replace(/[^A-Za-z0-9]/g, "");
  // Match patterns like 29E55555 or 50AA80308
  const m = clean.match(/^(\d{2})([A-Z]{1,2})(\d+)$/i);
  if (!m) return raw;
  const [, prov, seri, num] = m;
  const formatted =
    num.length >= 4
      ? `${num.slice(0, num.length - 2)}.${num.slice(num.length - 2)}`
      : num;
  return `${prov}${seri}-${formatted}`;
}
