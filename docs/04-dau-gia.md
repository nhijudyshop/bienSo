# Cơ chế đấu giá realtime

## 1. Tổng quan

Đấu giá biển số xe diễn ra **trực tuyến theo thời gian thực** trên subdomain `phongdau.vpa.com.vn`. Mỗi ngày tổ chức 1 phiên đấu giá với hàng trăm biển số.

**Thống kê mẫu** (từ dữ liệu crawl):

| Ngày | Số biển | Giá cao nhất | Giá thấp nhất |
|------|---------|-------------|---------------|
| 16/04/2026 | 495 | 1.220.000.000 ₫ | 5.000.000 ₫ |
| 15/04/2026 | 644 | 8.030.000.000 ₫ | 5.000.000 ₫ |
| 14/04/2026 | 729 | 5.100.000.000 ₫ | 5.000.000 ₫ |
| 13/04/2026 | 819 | 930.000.000 ₫ | 5.000.000 ₫ |
| 10/04/2026 | 691 | 5.875.000.000 ₫ | 5.000.000 ₫ |

**Tổng lịch sử**: 511 phiên đấu giá (từ 2023 đến nay).

## 2. Kiến trúc realtime

```
┌─────────────────┐         ┌──────────────────────┐
│   Browser        │   SSE   │  phongdau.vpa.com.vn │
│   (Participant)  │◄────────│  (Auction Server)    │
│                  │         │                      │
│  - Xem giá      │  POST   │  - Quản lý phiên     │
│  - Đặt giá  ────┼────────>│  - Broadcast giá mới │
│  - Nhận update   │         │  - Kiểm tra timeout  │
└─────────────────┘         └──────────────────────┘
```

### SSE (Server-Sent Events)

- **Endpoint**: `/phong-dau-gia/sse/{sessionId}`
- **Trang frontend**: `/phong-dau-gia/[id]`
- Kết nối một chiều: server → client
- Tự động reconnect khi mất kết nối
- Broadcast cập nhật giá mới cho tất cả participants

### Đồng bộ thời gian

- API: `GET /time-control/public/time-info`
- Trả về Unix timestamp (milliseconds) của server
- Response mẫu: `1776321749555`
- Dùng để đồng bộ đồng hồ client với server, đảm bảo công bằng

## 3. API đấu giá

### Trước khi vào phòng

| API | Method | Mô tả |
|-----|--------|--------|
| `/policy/get-auction-policy?orderId=` | GET | Lấy quy chế đấu giá |
| `/policy/approve-auction-policy` | POST | Chấp thuận quy chế |
| `/order/get-orders-wait-auction` | GET | Đơn hàng chờ đấu giá |
| `/order/get-orders-wait-auction-count` | GET | Đếm đơn chờ |

### Trong phòng đấu giá

| API | Method | Mô tả |
|-----|--------|--------|
| `/bidding/v1/get-user-price-table/{bksId}` | GET | Bảng giá hiện tại |
| `/bidding/v1/set-price/{bksId}` | POST | Đặt giá mới |
| `/bidding/v1/get-timeout/{bksId}` | GET | Thời gian còn lại |
| `/time-control/public/time-info` | GET | Thời gian server |
| `/participant-joined` | POST | Thông báo đã vào phòng |
| `/active-video` | GET | Video hướng dẫn |

### Sau phòng đấu giá

| API | Method | Mô tả |
|-----|--------|--------|
| `/user/auction-result/get-history-and-result` | GET | Kết quả & lịch sử |
| `/auction-history/auction-history-detail` | GET | Chi tiết lịch sử |
| `/auction-history/report-auction-history-detail` | GET | Báo cáo chi tiết |
| `/user/signed-by-customer` | POST | Ký xác nhận biên bản |

## 4. Kết quả đấu giá

### API công khai (không cần auth)

| API | Method | Mô tả |
|-----|--------|--------|
| `/api/bidding/public-result/history/auction-result-session` | POST | Danh sách phiên |
| `/api/bidding/public-result/history/detail/auction-result-session` | POST | Chi tiết phiên |
| `/api/bidding/public-result/list-await-auction/province/view` | POST | Kết quả theo tỉnh |
| `/api/bidding/public-result/list-await-auction/customer/detail` | POST | Chi tiết KH |

### API cần auth

| API | Method | Mô tả |
|-----|--------|--------|
| `/auction-result/detail-auction-session-result` | GET | Chi tiết kết quả phiên |
| `/auction-result/detail-by-session-id` | GET | Chi tiết theo session |

## 5. Luồng đấu giá chi tiết

```
Thời gian ────────────────────────────────────────────>

[T+0]     Phiên đấu giá bắt đầu
           │
           ├── Tất cả biển số được mở đồng thời
           │
[T+Xmin]  Người tham gia đặt giá
           │
           ├── Mỗi lần có giá mới → SSE broadcast
           │   cho tất cả participants
           │
           ├── Có thể đặt giá nhiều lần
           │   (giá sau phải cao hơn giá trước)
           │
[Timeout]  Hết thời gian đấu giá cho biển này
           │
           ├── Người có giá cao nhất → TRÚNG
           │
           └── Không ai đặt → ĐẤU LẠI (phiên sau)
```

## 6. Quy chế đấu giá

**Trang**: `/quy-che`

Nội dung quy chế được lưu dạng PDF trên FPT Cloud S3:
- URL mẫu: `https://s3-hfx03.fptcloud.com/daugia/thong-bao-dau-gia/...`
- API lấy file: `GET /api/tin-tuc/public/api/get-public-file`

**Thông báo mẫu** (từ dữ liệu crawl):
- "Thông báo thời gian đấu giá trực tuyến biển số xe ngày 22/4/2026"
- "Quyết định về việc ban hành Quy chế đấu giá trực tuyến biển số xe Phiên đấu giá thứ 10"
- "Thông báo công bố danh sách biển số xe đưa ra đấu giá Phiên đấu giá thứ 10"

## 7. Giá khởi điểm

Từ dữ liệu crawl, giá khởi điểm (`startingPrice`) phụ thuộc vào "độ đẹp" của biển:

| Loại biển | Giá khởi điểm | Ví dụ |
|-----------|---------------|-------|
| Biển thường | 40.000.000 ₫ | 29E-555.55, 30D-333.33 |
| Biển rất đẹp | 500.000.000 ₫ | 30B-555.55 |

Giá trúng thực tế có thể lên đến **hàng tỷ đồng** (VD: 8.030.000.000 ₫ cho biển 50AA-803.08 ngày 15/04/2026).
