const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://dgbs.vpa.com.vn";
const OUTPUT_DIR = path.join(__dirname, "data");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function crawlAllPlates() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "vi-VN",
  });

  const page = await context.newPage();
  const allPlates = [];
  const allApiData = [];

  // Intercept API responses để lấy dữ liệu gốc
  page.on("response", async (response) => {
    const url = response.url();
    if (
      url.includes("list-await-auction") ||
      url.includes("get-all-publish") ||
      url.includes("get-all-wh-license") ||
      url.includes("list-published") ||
      url.includes("list-announcement")
    ) {
      try {
        const data = await response.json();
        allApiData.push({
          url: new URL(url).pathname,
          status: response.status(),
          data: data,
        });
        console.log(`[API] Intercepted: ${new URL(url).pathname}`);
      } catch {}
    }
  });

  console.log("=== Crawl tất cả biển số xe ===\n");

  // Trang chủ - lấy biển số đấu giá
  console.log("1. Trang chủ - biển số đấu giá...");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(5000);

  // Lấy tổng số trang
  let pageNum = 1;
  let hasNextPage = true;

  while (hasNextPage && pageNum <= 50) {
    console.log(`   Trang ${pageNum}...`);

    const plates = await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr, .ant-table-tbody tr, [class*='table'] tr");
      const data = [];
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 5) {
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

    if (plates.length > 0) {
      allPlates.push(...plates);
      console.log(`   -> ${plates.length} biển số`);
    }

    // Tìm và click nút trang tiếp theo
    const nextBtn = await page.$(
      '.ant-pagination-next:not(.ant-pagination-disabled), [class*="next"]:not([class*="disabled"]), button[aria-label="Next"]'
    );

    if (nextBtn) {
      const isDisabled = await nextBtn.evaluate((el) => {
        return (
          el.classList.contains("ant-pagination-disabled") ||
          el.getAttribute("disabled") !== null ||
          el.getAttribute("aria-disabled") === "true"
        );
      });

      if (isDisabled) {
        hasNextPage = false;
      } else {
        await nextBtn.click();
        await sleep(2000);
        await page.waitForLoadState("networkidle").catch(() => {});
        pageNum++;
      }
    } else {
      hasNextPage = false;
    }
  }

  console.log(`\nTổng: ${allPlates.length} biển số từ ${pageNum} trang`);

  // Lưu kết quả
  const timestamp = new Date().toISOString().split("T")[0];
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `bien_so_dau_gia_${timestamp}.json`),
    JSON.stringify(allPlates, null, 2),
    "utf-8"
  );
  console.log(`Saved: bien_so_dau_gia_${timestamp}.json`);

  // Lưu API data
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `api_data_${timestamp}.json`),
    JSON.stringify(allApiData, null, 2),
    "utf-8"
  );
  console.log(`Saved: api_data_${timestamp}.json`);

  // Export CSV
  if (allPlates.length > 0) {
    const csvHeader = "STT,Biển số,Phiên đấu,Số người đăng ký,Tỉnh/Thành phố,Ngày đấu giá\n";
    const csvRows = allPlates
      .map(
        (p) =>
          `"${p.stt || ""}","${p.bienSo || ""}","${p.phienDau || ""}","${p.soNguoiDangKy || ""}","${p.tinhThanhPho || ""}","${p.ngayDauGia || ""}"`
      )
      .join("\n");
    fs.writeFileSync(path.join(OUTPUT_DIR, `bien_so_dau_gia_${timestamp}.csv`), csvHeader + csvRows, "utf-8");
    console.log(`Saved: bien_so_dau_gia_${timestamp}.csv`);
  }

  await browser.close();
  console.log("\n=== Hoàn tất! ===");
}

crawlAllPlates().catch((err) => {
  console.error("Lỗi:", err.message);
  process.exit(1);
});
