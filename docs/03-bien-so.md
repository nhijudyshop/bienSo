# Quản lý biển số xe

## 1. Các trạng thái biển số

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  KHO BIỂN   │────>│  CÔNG BỐ    │────>│ ĐANG ĐẤU GIÁ│────>│ ĐÃ TRÚNG   │
│  (Warehouse)│     │ (Published) │     │  (Auction)   │     │  (Sold)     │
└─────────────┘     └─────────────┘     └──────┬───────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  ĐẤU LẠI    │
                                        │ (Re-auction) │
                                        └─────────────┘
```

## 2. Phân loại biển số

### Theo màu biển (colorCode)

| colorCode | Màu | Loại |
|-----------|-----|------|
| `0` | Trắng | Biển cá nhân (xe con, xe tải) |
| `3` | Vàng | Biển kinh doanh (taxi, xe buýt) |

### Theo loại xe (plateType)

| plateType | Mô tả |
|-----------|--------|
| `6` | Một loại biển (chưa xác định chính xác) |
| `7` | Một loại biển khác |

### Theo loại xe (vehicleType - text)

- `Xe Con` - Ô tô con
- `Xe Tải` - Xe tải
- Và các loại khác

## 3. Các trang hiển thị biển số

### 3.1 Trang chủ (`/`)

Hiển thị **danh sách biển số đưa ra đấu giá** từ phiên hiện tại.

**API**: `POST /search-api/search/list-announcement-plan`

**Bộ lọc**:
- Biển số xe cần tìm (text search)
- Tỉnh/thành phố (dropdown)
- Ngày đấu giá (date picker)
- Phiên đấu giá (dropdown)
- Màu biển (dropdown)

**Bảng hiển thị**:

| Cột | Mô tả |
|-----|--------|
| STT | Số thứ tự |
| Biển số | Biển số xe (có màu nền: xanh = thường, vàng = kinh doanh) |
| Phiên đấu | Phiên đấu giá (VD: "Phiên 10") |
| Số người đăng ký | Số người đã đăng ký đấu giá biển này |
| Tỉnh/Thành phố | Nơi đăng ký |
| Ngày đấu giá | Ngày diễn ra đấu giá |
| Lựa chọn | Nút "Đăng ký đấu giá" |

**Đặc biệt**: Biển đấu lại hiển thị thêm text "(Đấu lại lần X)".

### 3.2 Kho biển số (`/kho-bien-so`)

Tất cả biển số trong kho, chưa đưa vào phiên đấu giá nào. Người dùng có thể "Yêu cầu đấu giá" biển từ kho.

**API**: `POST /search-api/search/get-all-wh-license-plate`

**Bảng hiển thị**:

| Cột | Mô tả |
|-----|--------|
| STT | Số thứ tự |
| Phiên | Phiên công bố |
| Biển số | Mã biển |
| Tỉnh/Thành phố | Theo provinceCode |
| Action | "Yêu cầu đấu giá" |

### 3.3 Danh sách công bố (`/danh-sach-cong-bo`)

Biển số vừa được công bố, đang trong giai đoạn đăng ký.

**API**: `GET /web-api/user-bidding/api/publish/get-all-publish-detail` (public)
**API (auth)**: `GET /web-api/user-bidding/api/publish/get-all-registered-publish-detail`

**Countdown timers**:
- `/publish/get-current-publish` → Thời gian đếm ngược công bố
- `/publish/get-current-register` → Thời gian đếm ngược đăng ký

### 3.4 Tất cả biển số (`/tat-ca-bien-so`)

Trang tổng hợp, hiển thị grid các biển số.

**API**: `POST /api/bidding/public-result/list-await-auction/province/view`

**Request body**:
```json
{
  "provinceId": "",
  "districtId": "",
  "page": 0,
  "limit": 10,
  "search": "",
  "typeVehicle": "",
  "siteId": "",
  "colorCode": "",
  "fromAuctionTime": "",
  "toAuctionTime": ""
}
```

### 3.5 Khoảng biển (`/khoang-bien`)

Tìm kiếm biển theo khoảng số (VD: tìm tất cả biển từ xxx-100 đến xxx-199).

**API**: `POST /announcement-plan/plate-range`

## 4. Tìm kiếm biển số

### Search API endpoints

| API | Mô tả | Method |
|-----|--------|--------|
| `/search-api/search/list-announcement-plan` | Biển đưa ra đấu giá | POST |
| `/search-api/search/get-all-wh-license-plate` | Kho biển số | POST |
| `/search-api/search/list-published-license-plate` | Biển đã công bố | POST |
| `/search-api/search/list-announcement-plan-code` | Danh sách mã phiên | GET |
| `/search-api/search/statistic-winner-price-history` | Thống kê giá trúng | POST |

### Dữ liệu hành chính (cho filter)

| API | Mô tả | Method |
|-----|--------|--------|
| `/administrative/provinces` | 63 tỉnh/thành phố | GET |
| `/administrative/districts?provinceId=XX` | Quận/huyện | GET |
| `/administrative/wards?provinceCode=XX` | Phường/xã | GET |
| `/announcement-plan/province-and-vehicle-list` | Tỉnh + loại xe | GET |

## 5. Biển số xu hướng

**API**: `GET /trending-license-plate`

Hiển thị các biển số đang được nhiều người quan tâm.

## 6. Giỏ hàng (Cart) & Wishlist

### Giỏ hàng - Biển số đã chọn để đấu giá

| API | Method | Mô tả |
|-----|--------|--------|
| `/cart/add-item/{bksId}` | POST | Thêm biển vào giỏ |
| `/cart/get-all-items` | GET | Lấy tất cả biển trong giỏ |
| `/cart/get-items-count` | GET | Đếm số biển trong giỏ |
| `/cart/remove-item/{bksId}` | DELETE | Xóa biển khỏi giỏ |

### Wishlist - Biển số quan tâm

| API | Method | Mô tả |
|-----|--------|--------|
| `/wishlist/add-item/{bksId}` | POST | Thêm biển quan tâm |
| `/wishlist/get-all-items` | GET | Danh sách quan tâm |
| `/wishlist/get-items-count` | GET | Đếm số biển |
| `/wishlist/remove-item/{bksId}` | DELETE | Xóa khỏi danh sách |

## 7. Cấu trúc mã biển số

Format: `XXY-ZZZZZ` hoặc `XXYZ-ZZZZZ`

- `XX` = Mã tỉnh (VD: 29 = Hà Nội, 30 = Hà Nội, 50 = TP.HCM)
- `Y` = Seri (chữ cái: A-Z)
- `ZZZZZ` = Số thứ tự (5 chữ số)

**Ví dụ từ dữ liệu crawl**:
- `29E-555.55` → Hà Nội, seri E, số 55555
- `30B-555.55` → Hà Nội, seri B, số 55555 (giá khởi điểm 500 triệu)
- `50AA-803.08` → TP.HCM, seri AA, số 80308
