# Cấu trúc dữ liệu & Schema mẫu

Tất cả dữ liệu mẫu dưới đây được crawl thực tế từ dgbs.vpa.com.vn ngày 16/04/2026.

## 1. Biển số đưa ra đấu giá (list-announcement-plan)

**API**: `POST /search-api/search/list-announcement-plan`

```json
{
  "content": [
    {
      "bksId": "5691841951704",
      "bks": "29E55555",
      "provinceName": "Thành phố Hà Nội",
      "vehicleType": "Xe Con",
      "auctionDate": "",
      "announcementNumber": "Phiên 10",
      "totalInterested": 0,
      "receiveCount": 0,
      "timeEndRegister": null,
      "siteId": 1,
      "districtName": "",
      "districtCode": "",
      "wardName": "",
      "wardCode": "",
      "totalRegisteringPeople": 1,
      "provinceCode": "",
      "colorCode": 3,
      "startingPrice": 40000000,
      "hideTotalRegistered": false,
      "hideTotalRegisteredDate": 0,
      "lockTime": 0,
      "interested": false,
      "registered": false
    }
  ],
  "totalElements": 25
}
```

### Giải thích các field

| Field | Type | Mô tả |
|-------|------|--------|
| `bksId` | string (number) | ID biển số (dạng snowflake) |
| `bks` | string | Mã biển số (không có dấu gạch) |
| `provinceName` | string | Tên tỉnh/thành phố |
| `vehicleType` | string | Loại xe ("Xe Con", "Xe Tải") |
| `auctionDate` | string | Ngày đấu giá (rỗng nếu chưa lên lịch) |
| `announcementNumber` | string | Phiên đấu giá ("Phiên 10") |
| `totalInterested` | number | Số người quan tâm |
| `receiveCount` | number | Số lượt nhận/xem |
| `timeEndRegister` | number/null | Thời gian kết thúc đăng ký (Unix ms) |
| `siteId` | number | ID site (1 = mặc định) |
| `totalRegisteringPeople` | number | Số người đã đăng ký đấu giá |
| `colorCode` | number | Màu biển: `0` = trắng, `3` = vàng |
| `startingPrice` | number | Giá khởi điểm (VNĐ) |
| `hideTotalRegistered` | boolean | Ẩn số người đăng ký |
| `hideTotalRegisteredDate` | number | Ngày bắt đầu ẩn |
| `lockTime` | number | Thời gian khoá |
| `interested` | boolean | User hiện tại có quan tâm không |
| `registered` | boolean | User hiện tại đã đăng ký chưa |

## 2. Kho biển số (get-all-wh-license-plate)

**API**: `POST /search-api/search/get-all-wh-license-plate`

```json
{
  "content": [
    {
      "whLicensePlateId": "26bb09f3-6b40-4391-9319-1e1b8cbb4127",
      "idKy": "2025006",
      "licensePlate": "30M44441",
      "colorCode": "0",
      "requestId": "4dbec05d-47d8-4fab-a8a8-8f88c027d20b",
      "siteId": 1,
      "historyId": 5553739181992,
      "provinceCode": "01",
      "announcementName": "Phiên 6",
      "seqNumber": "44441",
      "plateType": 7,
      "plateSubType": 0,
      "provincePriority": 1
    }
  ]
}
```

### Giải thích các field

| Field | Type | Mô tả |
|-------|------|--------|
| `whLicensePlateId` | UUID | ID duy nhất trong kho |
| `idKy` | string | Mã kỳ/phiên ("2025006" = năm 2025, phiên 6) |
| `licensePlate` | string | Mã biển số |
| `colorCode` | string | "0" = trắng, "3" = vàng |
| `requestId` | UUID | ID request |
| `siteId` | number | Site ID |
| `historyId` | number | ID lịch sử (snowflake) |
| `provinceCode` | string | Mã tỉnh ("01" = Hà Nội) |
| `announcementName` | string | Tên phiên |
| `seqNumber` | string | Số thứ tự (phần số của biển) |
| `plateType` | number | Loại biển (6, 7, ...) |
| `plateSubType` | number | Loại phụ |
| `provincePriority` | number | Ưu tiên tỉnh |

## 3. Kết quả đấu giá (auction-result-session)

**API**: `POST /api/bidding/public-result/history/auction-result-session`

```json
{
  "content": [
    {
      "totalPlate": 495,
      "maxPrice": 1220000000,
      "minPrice": 5000000,
      "licensePlate": "37C56789",
      "auctionDate": "16/04/2026",
      "id": 20260416
    },
    {
      "totalPlate": 644,
      "maxPrice": 8030000000,
      "minPrice": 5000000,
      "licensePlate": "50AA80308",
      "auctionDate": "15/04/2026",
      "id": 20260415
    }
  ],
  "totalElements": 511
}
```

### Giải thích các field

| Field | Type | Mô tả |
|-------|------|--------|
| `totalPlate` | number | Tổng số biển đấu giá trong phiên |
| `maxPrice` | number | Giá trúng cao nhất (VNĐ) |
| `minPrice` | number | Giá trúng thấp nhất (VNĐ) |
| `licensePlate` | string | Biển số có giá cao nhất |
| `auctionDate` | string | Ngày đấu giá (dd/MM/yyyy) |
| `id` | number | ID phiên (format: yyyyMMdd) |

## 4. Danh sách phiên (list-announcement-plan-code)

**API**: `GET /search-api/search/list-announcement-plan-code`

```json
[
  {
    "announcementPlanCode": "Phiên 10",
    "announcementPlateId": null,
    "announcementCode": "2026010"
  },
  {
    "announcementPlanCode": "Phiên 9",
    "announcementPlateId": null,
    "announcementCode": "2025009"
  }
]
```

| Field | Type | Mô tả |
|-------|------|--------|
| `announcementPlanCode` | string | Tên hiển thị ("Phiên 10") |
| `announcementCode` | string | Mã nội bộ ("2026010" = năm 2026, phiên 10) |

## 5. Danh sách tỉnh/thành (provinces)

**API**: `GET /administrative/provinces`

```json
{
  "success": true,
  "result": [
    { "code": "01", "priority": 1, "fullName": "Thành phố Hà Nội" },
    { "code": "79", "priority": 2, "fullName": "Thành phố Hồ Chí Minh" },
    { "code": "48", "priority": 3, "fullName": "Thành phố Đà Nẵng" },
    { "code": "31", "priority": 4, "fullName": "Thành phố Hải Phòng" },
    { "code": "92", "priority": 5, "fullName": "Thành phố Cần Thơ" }
  ]
}
```

## 6. Cấu hình mật khẩu (get-config-pr)

**API**: `GET /account/get-config-pr`

```json
{
  "minLength": 8,
  "maxLength": 16,
  "numberCharacter": true,
  "lowercaseCharacter": true,
  "uppercaseCharacter": true,
  "specialCharacter": true
}
```

## 7. Thời gian server (time-info)

**API**: `GET /time-control/public/time-info`

```
1776321749555
```

Response là Unix timestamp milliseconds (không phải JSON object).

## 8. Thông báo đấu giá (get-public-file)

**API**: `GET /api/tin-tuc/public/api/get-public-file`

```json
{
  "result": [
    {
      "documentFile": "https://s3-hfx03.fptcloud.com/daugia/thong-bao-dau-gia/4931598128889856_signed_thong bao thoi gian dau gia truc tuyen bien so xe ngay 2242026.pdf",
      "nameFile": "Thông báo thời gian đấu giá trực tuyến biển số xe ngày 22/4/2026",
      "timePublic": 1776186000000
    }
  ]
}
```

## 9. FAQ (get-faq)

**API**: `GET /api/tin-tuc/faq/get-faq`

```json
[
  {
    "question": "Sau khi trúng đấu giá tôi phải làm gì để đăng ký biển số trúng đấu giá?",
    "answer": "Khách hàng trúng đấu giá cần thực hiện những thủ tục sau...",
    "id": 412250649972736,
    "lastUpdated": 1744008395106,
    "attachments": []
  },
  {
    "question": "Cách thức để tham gia đấu giá?",
    "answer": "Bước 1: Bấm chọn Đăng ký/Đăng nhập...",
    "id": 412250649972737,
    "lastUpdated": 1743997005725,
    "attachments": []
  }
]
```

## 10. Menu & Navigation (client-get-tree)

**API**: `GET /api/tin-tuc/menu/client-menu/client-get-tree`

```json
{
  "children": [
    {
      "id": 6,
      "page": "/",
      "code": "about_us_home",
      "title": "Trang chủ",
      "menuIndex": 1,
      "status": 1,
      "children": null
    },
    {
      "id": 2,
      "page": "/dang-ky-dau-gia",
      "code": "about_us_dang-ky-dau-gia",
      "title": "Đăng ký đấu giá",
      "menuIndex": 3,
      "status": 0,
      "children": null
    }
  ]
}
```

| Field | Type | Mô tả |
|-------|------|--------|
| `status` | number | `1` = hiển thị, `0` = ẩn |
| `page` | string | Route URL |
| `menuIndex` | number | Thứ tự hiển thị |

## 11. Static Information (get-by-codes)

**API**: `GET /api/tin-tuc/menu/static-information/get-by-codes`

Chứa thông tin tĩnh được hiển thị trên website:

| Code | Mô tả |
|------|--------|
| `footer_department` | Địa chỉ trụ sở |
| `sidebar_right_zalo` | Link Zalo |
| `sidebar_right_fb` | Link Facebook |
| `sidebar_right_viber` | Link Viber |
| `home_video_introduce` | Video giới thiệu |
| `download_title_1` | Text tải app |

## 12. Banner (get-banner)

**API**: `GET /web-api/user-bidding/banner/web/get-banner`

```json
{
  "success": true,
  "result": {
    "id": null,
    "bannerUrl": null,
    "bannerWebMobileUrl": null,
    "faviconUrl": null,
    "backGroundUrl": null,
    "logoUrl": null
  }
}
```

## 13. Static Categories

**API**: `GET /api/tin-tuc/public/static-categories`

```json
[
  { "categoryId": 6, "categoryTitle": "Chính sách bảo mật", "code": "CSBM" },
  { "categoryId": 7, "categoryTitle": "Điều khoản sử dụng", "code": "ĐKSD" },
  { "categoryId": 8, "categoryTitle": "Quy chế hoạt động", "code": "QCĐG" },
  { "categoryId": 7812761997004800, "categoryTitle": "Hướng dẫn đấu giá", "code": "HDĐG" }
]
```
