const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://dgbs.vpa.com.vn";
const OUTPUT_DIR = path.join(__dirname, "data");

// Tạo thư mục output
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function saveJSON(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved: ${filepath} (${Array.isArray(data) ? data.length + " items" : "object"})`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function crawl() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "vi-VN",
  });

  const page = await context.newPage();

  // Lưu trữ tất cả API responses đã intercept
  const interceptedData = {};

  // Intercept tất cả API responses
  page.on("response", async (response) => {
    const url = response.url();
    if (
      url.includes("/web-api/") ||
      url.includes("/search-api/") ||
      url.includes("/api/bidding/") ||
      url.includes("/api/tin-tuc/")
    ) {
      try {
        const data = await response.json();
        const urlPath = new URL(url).pathname;
        if (!interceptedData[urlPath]) {
          interceptedData[urlPath] = [];
        }
        interceptedData[urlPath].push({
          status: response.status(),
          data: data,
          timestamp: new Date().toISOString(),
        });
        console.log(`[API] ${response.status()} ${urlPath}`);
      } catch {
        // Skip non-JSON responses
      }
    }
  });

  console.log("=== Bắt đầu crawl dgbs.vpa.com.vn ===\n");

  // 1. Trang chủ - Danh sách biển số đưa ra đấu giá
  console.log("1. Crawling trang chủ...");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(8000);

  // Lấy dữ liệu bảng biển số từ DOM
  const homePlates = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr");
    const data = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 6) {
        data.push({
          stt: cells[0]?.textContent?.trim(),
          bienSo: cells[1]?.textContent?.trim(),
          phienDau: cells[2]?.textContent?.trim(),
          soNguoiDangKy: cells[3]?.textContent?.trim(),
          tinhThanhPho: cells[4]?.textContent?.trim(),
          ngayDauGia: cells[5]?.textContent?.trim(),
        });
      }
    });
    return data;
  });
  saveJSON("01_trang_chu_bien_so.json", homePlates);

  // 2. Danh sách công bố
  console.log("\n2. Crawling danh sách công bố...");
  await page.goto(`${BASE_URL}/danh-sach-cong-bo`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);

  const congBo = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr");
    const data = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        data.push({
          stt: cells[0]?.textContent?.trim(),
          content: Array.from(cells).map((c) => c.textContent?.trim()),
        });
      }
    });
    return data;
  });
  saveJSON("02_danh_sach_cong_bo.json", congBo);

  // 3. Kho biển số
  console.log("\n3. Crawling kho biển số...");
  await page.goto(`${BASE_URL}/kho-bien-so`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);

  const khoBienSo = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr");
    const data = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        data.push({
          stt: cells[0]?.textContent?.trim(),
          content: Array.from(cells).map((c) => c.textContent?.trim()),
        });
      }
    });
    return data;
  });
  saveJSON("03_kho_bien_so.json", khoBienSo);

  // 4. Kết quả đấu giá
  console.log("\n4. Crawling kết quả đấu giá...");
  await page.goto(`${BASE_URL}/ket-qua-dau-gia`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);

  const ketQua = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr");
    const data = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        data.push({
          content: Array.from(cells).map((c) => c.textContent?.trim()),
        });
      }
    });
    return data;
  });
  saveJSON("04_ket_qua_dau_gia.json", ketQua);

  // 5. Tất cả biển số - crawl nhiều trang
  console.log("\n5. Crawling tất cả biển số (nhiều trang)...");
  await page.goto(`${BASE_URL}/tat-ca-bien-so`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);

  const allPlates = await page.evaluate(() => {
    // Lấy dữ liệu từ cards hoặc table
    const cards = document.querySelectorAll("[class*='plate'], [class*='card'], [class*='item']");
    const data = [];
    cards.forEach((card) => {
      const text = card.textContent?.trim();
      if (text && text.length < 500) {
        data.push(text);
      }
    });

    // Fallback: lấy từ table
    const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr");
    const tableData = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        tableData.push({
          content: Array.from(cells).map((c) => c.textContent?.trim()),
        });
      }
    });

    return { cards: data, table: tableData };
  });
  saveJSON("05_tat_ca_bien_so.json", allPlates);

  // 6. Quy chế
  console.log("\n6. Crawling quy chế đấu giá...");
  await page.goto(`${BASE_URL}/quy-che`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);

  const quyChe = await page.evaluate(() => {
    const content = document.querySelector("main, .content, article, [class*='content']");
    return content ? content.textContent?.trim() : document.body.textContent?.trim()?.substring(0, 10000);
  });
  saveJSON("06_quy_che.json", { content: quyChe });

  // 7. Hỏi đáp / FAQ
  console.log("\n7. Crawling hỏi đáp...");
  await page.goto(`${BASE_URL}/hoi-dap`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);

  const faq = await page.evaluate(() => {
    const items = document.querySelectorAll("[class*='faq'], [class*='question'], [class*='collapse'], .ant-collapse-item");
    const data = [];
    items.forEach((item) => {
      data.push(item.textContent?.trim());
    });
    return data.length > 0 ? data : document.querySelector("main")?.textContent?.trim()?.substring(0, 10000);
  });
  saveJSON("07_hoi_dap.json", { content: faq });

  // 8. Thủ tục sau đấu giá
  console.log("\n8. Crawling thủ tục sau đấu giá...");
  await page.goto(`${BASE_URL}/thu-tuc-sau-dau-gia`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3000);

  const thuTuc = await page.evaluate(() => {
    const content = document.querySelector("main, .content, article");
    return content ? content.textContent?.trim() : document.body.textContent?.trim()?.substring(0, 10000);
  });
  saveJSON("08_thu_tuc_sau_dau_gia.json", { content: thuTuc });

  // 9. Lưu tất cả API responses đã intercept
  console.log("\n9. Lưu tất cả API responses đã intercept...");
  saveJSON("09_all_api_responses.json", interceptedData);

  // 10. Chụp screenshots
  console.log("\n10. Chụp screenshots các trang...");
  const screenshotDir = path.join(OUTPUT_DIR, "screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const pages = [
    { url: "/", name: "trang_chu" },
    { url: "/danh-sach-cong-bo", name: "danh_sach_cong_bo" },
    { url: "/kho-bien-so", name: "kho_bien_so" },
    { url: "/ket-qua-dau-gia", name: "ket_qua_dau_gia" },
    { url: "/tat-ca-bien-so", name: "tat_ca_bien_so" },
  ];

  for (const p of pages) {
    await page.goto(`${BASE_URL}${p.url}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(2000);
    await page.screenshot({
      path: path.join(screenshotDir, `${p.name}.png`),
      fullPage: true,
    });
    console.log(`Screenshot: ${p.name}.png`);
  }

  await browser.close();

  console.log("\n=== Crawl hoàn tất! ===");
  console.log(`Dữ liệu đã lưu tại: ${OUTPUT_DIR}`);
}

crawl().catch((err) => {
  console.error("Lỗi:", err.message);
  process.exit(1);
});
