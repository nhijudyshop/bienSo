# Tổng quan hệ thống dgbs.vpa.com.vn

## Giới thiệu

**dgbs.vpa.com.vn** là nền tảng đấu giá biển số xe ô tô trực tuyến chính thức của Việt Nam, vận hành bởi **VPA (Vietnam Plate Auction)**. Hệ thống cho phép công dân và tổ chức tham gia đấu giá biển số xe theo quy định của Bộ Công an.

**Trụ sở**: NO2-T4.03, tầng 4 tòa nhà NO2 - TNL Plaza Goldseason, số 47 Nguyễn Tuân, phường Thanh Xuân, thành phố Hà Nội.

## Kiến trúc kỹ thuật

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | **Next.js** (React SSR/SPA) |
| Build ID | `1776244309699` |
| Font chữ | BeVietnamPro, Montserrat, UKNumberPlate (biển số) |
| CDN/Security | **Cloudflare** (WAF, bot protection, DDoS) |
| Storage | **FPT Cloud S3** (`s3-hfx03.fptcloud.com/daugia/`) |
| Push Notification | **Firebase Cloud Messaging** |
| Captcha | **Google reCAPTCHA v2** |
| Xác thực định danh | **VNeID** (SSO), **eKYC** |
| Realtime | **SSE** (Server-Sent Events) cho phòng đấu giá |
| Analytics | Google Analytics (`_ga_QVGFBK5EKL`, `_ga_R1M98GBK4S`) |

## Hệ thống domains

| Domain | Mục đích |
|--------|----------|
| `dgbs.vpa.com.vn` | Website chính (frontend + API gateway) |
| `phongdau.vpa.com.vn` | Phòng đấu giá realtime |
| `s3-hfx03.fptcloud.com/daugia/` | Lưu trữ file (PDF thông báo, tài liệu) |

## API Gateways

Tất cả API đều đi qua các gateway prefix sau:

| Gateway | Mục đích |
|---------|----------|
| `/web-api/user-bidding/api/` | Gateway chính - đấu giá, tài khoản, đơn hàng |
| `/web-api/user-payment/api/payment/` | Thanh toán |
| `/web-api/admin-api/public/` | API admin (phần public) |
| `/web-api/user-api/public/` | API user (phần public) |
| `/web-api/marketing-api/` | Tiếp thị liên kết |
| `/web-api/uploadapi/` | Upload file |
| `/search-api/search/` | Tìm kiếm biển số |
| `/api/bidding/public-result/` | Kết quả đấu giá công khai |
| `/api/tin-tuc/` | Tin tức, FAQ, menu |

## Phiên đấu giá

Hệ thống tổ chức đấu giá theo **phiên**. Tính đến thời điểm phân tích (04/2026), đã có **10 phiên**:

| Phiên | Mã | Năm |
|-------|-----|------|
| Phiên 1 | 2023001 | 2023 |
| Phiên 2 | 2023002 | 2023 |
| Phiên 3 | 2024003 | 2024 |
| Phiên 4 | 2024004 | 2024 |
| Phiên 5 | 2024005 | 2024 |
| Phiên 6 | 2025006 | 2025 |
| Phiên 7 | 2025007 | 2025 |
| Phiên 8 | 2025008 | 2025 |
| Phiên 9 | 2025009 | 2025 |
| Phiên 10 | 2026010 | 2026 |

## Bảo mật & Anti-bot

- **Cloudflare**: `cf_clearance` cookie, `__cf_bm` bot management
- **reCAPTCHA v2**: Bắt buộc khi đăng nhập
- **CSRF**: Header `csrf` chứa Base64-encoded timestamp
- **Single Device Login**: Kiểm tra đăng nhập 1 thiết bị
- Hậu quả: Không thể gọi API trực tiếp bằng curl/axios, cần browser automation (Playwright/Puppeteer)

## Sơ đồ file tài liệu

```
docs/
├── 00-tong-quan.md          ← File này
├── 01-luong-nghiep-vu.md    ← Luồng nghiệp vụ chính (user journey)
├── 02-xac-thuc.md           ← Đăng ký, đăng nhập, eKYC, VNeID
├── 03-bien-so.md            ← Quản lý biển số (kho, công bố, tìm kiếm)
├── 04-dau-gia.md            ← Cơ chế đấu giá realtime
├── 05-thanh-toan.md         ← Đơn hàng, thanh toán, hoàn tiền
├── 06-tai-khoan.md          ← Quản lý tài khoản, hồ sơ, thông báo
├── 07-api-reference.md      ← Tham chiếu API đầy đủ
└── 08-du-lieu-mau.md        ← Cấu trúc dữ liệu & schema mẫu
```
