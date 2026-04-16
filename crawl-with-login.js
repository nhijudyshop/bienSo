const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const BASE_URL = "https://dgbs.vpa.com.vn";
const API_BASE = "/web-api/user-bidding/api";
const OUTPUT_DIR = path.join(__dirname, "data", "authenticated");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function saveJSON(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved: ${filepath}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function crawlWithLogin() {
  const phone = await prompt("Số điện thoại: ");
  const password = await prompt("Mật khẩu: ");

  const browser = await chromium.launch({
    headless: false, // Hiển thị browser để giải captcha thủ công
    args: ["--no-sandbox"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "vi-VN",
  });

  const page = await context.newPage();

  // Intercept API responses
  const apiResponses = {};
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/web-api/") || url.includes("/api/")) {
      try {
        const data = await response.json();
        const urlPath = new URL(url).pathname;
        apiResponses[urlPath] = apiResponses[urlPath] || [];
        apiResponses[urlPath].push({ status: response.status(), data, ts: Date.now() });
        console.log(`[API] ${response.status()} ${urlPath}`);
      } catch {}
    }
  });

  // Bước 1: Mở trang đăng nhập
  console.log("\n1. Mở trang đăng nhập...");
  await page.goto(`${BASE_URL}/dang-nhap`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(2000);

  // Bước 2: Điền thông tin đăng nhập
  console.log("2. Điền thông tin đăng nhập...");
  const phoneInput = await page.$('input[placeholder*="điện thoại"], input[name*="phone"], input[name*="username"], input[type="text"]');
  if (phoneInput) {
    await phoneInput.fill(phone);
  }

  const passwordInput = await page.$('input[type="password"]');
  if (passwordInput) {
    await passwordInput.fill(password);
  }

  // Bước 3: Chờ người dùng giải captcha và nhấn đăng nhập
  console.log("\n>>> VUI LÒNG GIẢI CAPTCHA VÀ NHẤN ĐĂNG NHẬP TRONG TRÌNH DUYỆT <<<");
  console.log(">>> Sau khi đăng nhập thành công, nhấn Enter ở đây để tiếp tục crawl <<<\n");
  await prompt("Nhấn Enter khi đã đăng nhập thành công...");

  await sleep(3000);

  // Bước 4: Kiểm tra đăng nhập thành công
  const cookies = await context.cookies();
  const authCookie = cookies.find((c) => c.name.includes("token") || c.name.includes("auth"));
  console.log(`Cookies: ${cookies.length} cookies`);

  // Bước 5: Crawl dữ liệu sau đăng nhập

  // 5.1 Tài khoản
  console.log("\n5.1 Crawling thông tin tài khoản...");
  await page.goto(`${BASE_URL}/thong-tin/tai-khoan`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);
  const accountInfo = await page.evaluate(() => {
    const main = document.querySelector("main, [class*='content'], [class*='profile']");
    return main ? main.textContent?.trim() : null;
  });
  saveJSON("01_tai_khoan.json", { content: accountInfo });

  // 5.2 Giỏ hàng
  console.log("5.2 Crawling giỏ hàng...");
  await page.goto(`${BASE_URL}/thong-tin/gio-hang`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);
  const cart = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr");
    return Array.from(rows).map((row) => {
      const cells = row.querySelectorAll("td");
      return Array.from(cells).map((c) => c.textContent?.trim());
    });
  });
  saveJSON("02_gio_hang.json", cart);

  // 5.3 Biển đã đăng ký
  console.log("5.3 Crawling biển đã đăng ký...");
  await page.goto(`${BASE_URL}/thong-tin/bien-da-dang-ky`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);
  const registered = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr");
    return Array.from(rows).map((row) => {
      const cells = row.querySelectorAll("td");
      return Array.from(cells).map((c) => c.textContent?.trim());
    });
  });
  saveJSON("03_bien_da_dang_ky.json", registered);

  // 5.4 Lịch sử đấu giá
  console.log("5.4 Crawling lịch sử đấu giá...");
  await page.goto(`${BASE_URL}/thong-tin/lich-su-dau-gia`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);
  const history = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr");
    return Array.from(rows).map((row) => {
      const cells = row.querySelectorAll("td");
      return Array.from(cells).map((c) => c.textContent?.trim());
    });
  });
  saveJSON("04_lich_su_dau_gia.json", history);

  // 5.5 Thông báo
  console.log("5.5 Crawling thông báo...");
  await page.goto(`${BASE_URL}/thong-tin/thong-bao`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);
  const notifications = await page.evaluate(() => {
    const items = document.querySelectorAll("[class*='notification'], [class*='noti'], li");
    return Array.from(items)
      .map((item) => item.textContent?.trim())
      .filter((t) => t && t.length > 5);
  });
  saveJSON("05_thong_bao.json", notifications);

  // 5.6 Quản lý hồ sơ
  console.log("5.6 Crawling quản lý hồ sơ...");
  await page.goto(`${BASE_URL}/thong-tin/quan-ly-ho-so`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);
  const documents = await page.evaluate(() => {
    const main = document.querySelector("main, [class*='content']");
    return main ? main.textContent?.trim() : null;
  });
  saveJSON("06_quan_ly_ho_so.json", { content: documents });

  // Lưu tất cả API responses
  saveJSON("99_all_api_responses.json", apiResponses);

  // Lưu cookies cho session sau
  const allCookies = await context.cookies();
  saveJSON("99_cookies.json", allCookies);

  console.log("\n=== Crawl (authenticated) hoàn tất! ===");
  console.log(`Dữ liệu tại: ${OUTPUT_DIR}`);

  await browser.close();
}

crawlWithLogin().catch((err) => {
  console.error("Lỗi:", err.message);
  process.exit(1);
});
