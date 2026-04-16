# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crawl & phân tích dữ liệu từ **dgbs.vpa.com.vn** - nền tảng đấu giá biển số xe ô tô trực tuyến của VPA (Vietnam Plate Auction).

## Commands

```bash
# Crawl dữ liệu công khai (không cần đăng nhập)
node crawl.js

# Crawl tất cả biển số với phân trang
node crawl-all-plates.js

# Crawl với đăng nhập (mở browser, cần giải captcha thủ công)
node crawl-with-login.js
```

## Architecture

- **Runtime**: Node.js + Playwright (Chromium headless)
- **Target**: Next.js SPA tại `dgbs.vpa.com.vn`, Cloudflare protected
- **Approach**: Browser automation + API response interception (Playwright intercepts XHR/fetch responses)
- Output: `data/` (JSON, CSV, screenshots)

### Scripts

| File | Mô tả |
|------|--------|
| `crawl.js` | Crawl tổng quan: trang chủ, kho biển, kết quả đấu giá, quy chế, FAQ, screenshots |
| `crawl-all-plates.js` | Crawl biển số với phân trang tự động, export CSV |
| `crawl-with-login.js` | Crawl dữ liệu cần đăng nhập: tài khoản, giỏ hàng, lịch sử, hồ sơ |

### Data Structure

Dữ liệu được lưu tại `data/`:
- `01_trang_chu_bien_so.json` - Biển số đưa ra đấu giá
- `03_kho_bien_so.json` - Kho biển số chờ yêu cầu
- `09_all_api_responses.json` - Tất cả API responses gốc (JSON)
- `data/screenshots/` - Screenshots các trang
- `data/authenticated/` - Dữ liệu cần đăng nhập

## API Endpoints (dgbs.vpa.com.vn)

### API Gateways
- `/web-api/user-bidding/api` - Gateway chính (prefix cho hầu hết API)
- `/search-api/search/` - Tìm kiếm biển số
- `/api/bidding/public-result/` - Kết quả đấu giá công khai
- `/web-api/user-payment/api/payment` - Thanh toán
- `phongdau.vpa.com.vn` - Phòng đấu giá realtime (SSE)

### Public APIs (không cần auth)
- `GET /administrative/provinces` - Danh sách tỉnh/thành (hoạt động qua curl)
- `POST /search-api/search/list-announcement-plan` - Biển số đưa ra đấu giá (cần Cloudflare cookies)
- `POST /search-api/search/get-all-wh-license-plate` - Kho biển số
- `POST /api/bidding/public-result/history/auction-result-session` - Kết quả đấu giá

### API Response Schemas

**list-announcement-plan** (biển số đấu giá):
```json
{
  "bksId": "5691841951704",
  "bks": "29E55555",
  "provinceName": "Thành phố Hà Nội",
  "vehicleType": "Xe Con",
  "announcementNumber": "Phiên 10",
  "colorCode": 3,
  "startingPrice": 40000000,
  "totalRegisteringPeople": 1
}
```

**get-all-wh-license-plate** (kho biển số):
```json
{
  "whLicensePlateId": "uuid",
  "licensePlate": "30M44441",
  "colorCode": "0",
  "provinceCode": "01",
  "announcementName": "Phiên 6",
  "seqNumber": "44441",
  "plateType": 7
}
```

**auction-result-session** (kết quả đấu giá):
```json
{
  "totalPlate": 495,
  "maxPrice": 1220000000,
  "minPrice": 5000000,
  "licensePlate": "37C56789",
  "auctionDate": "16/04/2026",
  "id": 20260416
}
```

### Lưu ý kỹ thuật
- Cloudflare protection: Hầu hết API trả 403 nếu gọi từ curl, cần browser automation
- CSRF token: Base64 encoded timestamp trong header `csrf`
- Login cần reCAPTCHA v2
- colorCode: `0` = biển trắng (cá nhân), `3` = biển vàng (kinh doanh)
