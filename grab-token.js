/**
 * grab-token.js
 *
 * Mở browser -> bạn đăng nhập thủ công (giải captcha)
 * -> script TỰ ĐỘNG phát hiện JWT token khi login thành công
 * -> lưu vào web/.env.local + crawl dữ liệu authenticated
 *
 * Chạy: node grab-token.js
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://dgbs.vpa.com.vn";
const ENV_FILE = path.join(__dirname, "web", ".env.local");
const AUTH_DIR = path.join(__dirname, "data", "authenticated");

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

function saveJSON(filename, data) {
  const filepath = path.join(AUTH_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  Saved: ${filepath}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== VPA Token Grabber (auto-detect) ===\n");

  const browser = await chromium.launch({
    headless: false,
    args: ["--no-sandbox"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "vi-VN",
  });

  const page = await context.newPage();

  let jwtToken = null;
  let csrfToken = null;
  const authApiData = {};

  // Bắt JWT từ request headers
  page.on("request", (request) => {
    const headers = request.headers();
    if (headers["authorization"] && headers["authorization"].startsWith("Bearer ")) {
      const token = headers["authorization"].replace("Bearer ", "");
      if (token.length > 50) {
        jwtToken = token;
        console.log(`  [TOKEN] JWT from request header`);
      }
    }
    if (headers["csrf"]) {
      csrfToken = headers["csrf"];
    }
  });

  // Bắt JWT từ authenticate response
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/authenticate") && response.status() === 200) {
      try {
        const data = await response.json();
        if (data.result?.token || data.token) {
          jwtToken = data.result?.token || data.token;
          console.log(`  [TOKEN] JWT from auth response`);
        }
      } catch {}
    }
    // Lưu API responses
    if (url.includes("/web-api/") || url.includes("/api/")) {
      try {
        const data = await response.json();
        const urlPath = new URL(url).pathname;
        if (!authApiData[urlPath]) authApiData[urlPath] = [];
        authApiData[urlPath].push({ status: response.status(), data, ts: Date.now() });
      } catch {}
    }
  });

  // Mở trang đăng nhập
  console.log("1. Mở trang đăng nhập...");
  await page.goto(`${BASE_URL}/dang-nhap`, { waitUntil: "domcontentloaded", timeout: 60000 });

  console.log("\n   Vui lòng ĐĂNG NHẬP trong trình duyệt vừa mở.");
  console.log("   Script sẽ tự động phát hiện khi đăng nhập thành công...\n");

  // Chờ tự động: poll cho đến khi có JWT hoặc URL thay đổi (redirect sau login)
  const maxWait = 180000; // 3 phút
  const start = Date.now();
  while (!jwtToken && Date.now() - start < maxWait) {
    await sleep(2000);

    // Kiểm tra URL đã chuyển khỏi /dang-nhap chưa
    const currentUrl = page.url();
    if (!currentUrl.includes("/dang-nhap") && !currentUrl.includes("/dang-ky")) {
      console.log(`  Đã redirect sang: ${currentUrl}`);
      await sleep(3000);
      break;
    }

    // Thử lấy từ localStorage
    if (!jwtToken) {
      jwtToken = await page.evaluate(() => {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const val = localStorage.getItem(key);
          if (val && val.length > 100 && (key.includes("token") || key.includes("auth") || key.includes("jwt"))) {
            return val;
          }
          try {
            const parsed = JSON.parse(val);
            if (parsed?.token && parsed.token.length > 50) return parsed.token;
            if (parsed?.accessToken && parsed.accessToken.length > 50) return parsed.accessToken;
            if (parsed?.result?.token && parsed.result.token.length > 50) return parsed.result.token;
          } catch {}
        }
        return null;
      }).catch(() => null);

      if (jwtToken) {
        console.log(`  [TOKEN] JWT from localStorage`);
      }
    }

    const elapsed = Math.round((Date.now() - start) / 1000);
    if (elapsed % 10 === 0) {
      console.log(`  Đang chờ đăng nhập... (${elapsed}s)`);
    }
  }

  if (!jwtToken) {
    // Thử navigate tới trang cần auth để trigger
    console.log("  Chưa bắt được JWT, thử truy cập trang tài khoản...");
    await page.goto(`${BASE_URL}/thong-tin/tai-khoan`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(5000);

    // Check localStorage một lần nữa
    jwtToken = await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(val);
          if (parsed?.token && parsed.token.length > 50) return parsed.token;
          if (parsed?.accessToken && parsed.accessToken.length > 50) return parsed.accessToken;
          if (parsed?.result?.token && parsed.result.token.length > 50) return parsed.result.token;
        } catch {
          if (val && val.length > 100 && !val.includes("<")) return val;
        }
      }
      return null;
    }).catch(() => null);
  }

  // Lấy cookies
  const cookies = await context.cookies();
  const cfClearance = cookies.find((c) => c.name === "cf_clearance");

  console.log(`\n2. Kết quả:`);
  console.log(`  Cookies: ${cookies.length}`);
  console.log(`  cf_clearance: ${cfClearance ? "có" : "không"}`);
  console.log(`  JWT token: ${jwtToken ? "CÓ" : "KHÔNG"}`);
  console.log(`  CSRF token: ${csrfToken ? "có" : "không"}`);

  if (!jwtToken) {
    // In localStorage để debug
    const lsKeys = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = (localStorage.getItem(key) || "").substring(0, 80);
      }
      return data;
    }).catch(() => ({}));
    console.log("\n  localStorage keys (debug):");
    for (const [k, v] of Object.entries(lsKeys)) {
      console.log(`    ${k}: ${v}...`);
    }
  }

  // Crawl dữ liệu authenticated
  console.log("\n3. Crawl dữ liệu authenticated...");

  const pagesToCrawl = [
    { url: "/thong-tin/tai-khoan", name: "tai_khoan" },
    { url: "/thong-tin/gio-hang", name: "gio_hang" },
    { url: "/thong-tin/bien-da-dang-ky", name: "bien_da_dang_ky" },
    { url: "/thong-tin/lich-su-dau-gia", name: "lich_su_dau_gia" },
    { url: "/thong-tin/thong-bao", name: "thong_bao" },
    { url: "/thong-tin/quan-ly-ho-so", name: "ho_so" },
  ];

  for (const p of pagesToCrawl) {
    console.log(`  Crawling ${p.url}...`);
    try {
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await sleep(4000);
      await page.screenshot({ path: path.join(AUTH_DIR, `screenshot_${p.name}.png`), fullPage: true });
    } catch (err) {
      console.log(`    Lỗi: ${err.message}`);
    }
  }

  // Lưu tất cả
  saveJSON("api_responses.json", authApiData);
  saveJSON("cookies.json", cookies);

  const allLocalStorage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  }).catch(() => ({}));
  saveJSON("localStorage.json", allLocalStorage);

  // Ghi .env.local
  const envLines = [`API_TARGET=${BASE_URL}`];
  if (jwtToken) envLines.push(`VPA_JWT_TOKEN=${jwtToken}`);
  if (csrfToken) envLines.push(`VPA_CSRF_TOKEN=${csrfToken}`);

  const cookieStr = cookies
    .filter((c) => ["cf_clearance", "__cf_bm", "JSESSIONID"].includes(c.name) || c.name.includes("token"))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (cookieStr) envLines.push(`VPA_COOKIES=${cookieStr}`);

  fs.writeFileSync(ENV_FILE, envLines.join("\n") + "\n", "utf-8");
  console.log(`\n4. Đã lưu: ${ENV_FILE}`);
  envLines.forEach((l) => console.log(`  ${l.substring(0, 80)}${l.length > 80 ? "..." : ""}`));

  console.log("\n=== Hoàn tất! ===");

  await browser.close();
}

main().catch((err) => {
  console.error("Lỗi:", err.message);
  process.exit(1);
});
