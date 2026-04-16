# Đơn hàng & Thanh toán

## 1. Luồng đơn hàng

```
Giỏ hàng ──> Tạo đơn ──> Thanh toán cọc ──> Đấu giá ──> Trúng? ──> Thanh toán toàn bộ
   │              │              │                          │
   │              │              │                     Không trúng
   │              │              │                          │
   │              │              │                     Hoàn tiền cọc
```

## 2. Quản lý đơn hàng

### Tạo đơn hàng

| API | Method | Mô tả |
|-----|--------|--------|
| `/order/create-order` | POST | Tạo đơn hàng chính thức |
| `/order/create-pre-order` | POST | Tạo đơn hàng tạm (pre-order) |
| `/order/get-order-detail-by-orderId` | GET | Chi tiết đơn theo orderId |
| `/order/get-order-fee` | GET | Phí đơn hàng |

### Trạng thái đơn hàng

| API | Method | Mô tả |
|-----|--------|--------|
| `/order/get-orders-payment-status` | GET | Đơn theo trạng thái thanh toán |
| `/order/get-count-orders-payment-status` | GET | Đếm đơn theo trạng thái |
| `/order/get-orders-wait-auction` | GET | Đơn chờ đấu giá |
| `/order/get-orders-wait-auction-count` | GET | Đếm đơn chờ |
| `/order/check-status-order` | GET | Kiểm tra trạng thái đơn |

### Cập nhật & Xóa

| API | Method | Mô tả |
|-----|--------|--------|
| `/order/update-order-payment-method` | PUT | Đổi phương thức thanh toán |
| `/order/remove-multi-orders` | DELETE | Xóa nhiều đơn |

**Trang quản lý**: `/don-hang/[id]`

## 3. Thanh toán

**Trang**: `/thanh-toan/[id]`

### Phương thức thanh toán

| API | Method | Mô tả |
|-----|--------|--------|
| `/order/get-online-methods` | GET | Danh sách phương thức online |
| `/categories/get-all-bank` | GET | Danh sách ngân hàng |
| `/request-payment` | POST | Yêu cầu thanh toán |

### QR Code thanh toán

| API | Method | Mô tả |
|-----|--------|--------|
| `/order/get-qr-code` | POST | QR code chung |
| `/order/get-bank-qr` | POST | QR ngân hàng cụ thể |
| `/order/get-ewallet-qr` | POST | QR ví điện tử |
| `/categories/get-qr-code` | GET | QR theo danh mục |

### Ngân hàng hỗ trợ

Hệ thống tích hợp trực tiếp với Internet Banking của các ngân hàng:

| Ngân hàng | URL Internet Banking |
|-----------|---------------------|
| BIDV | bidv.com.vn/vn/ca-nhan |
| Techcombank | ebank.tpb.vn |
| VPBank | neo.vpbank.com.vn |
| Vietinbank | ipay.vietinbank.vn |
| ACB | online.acb.com.vn |
| Agribank | ibank.agribank.com.vn |
| MB Bank | online.mbbank.com.vn |
| VIB | www.vib.com.vn/ngan-hang-so/myvib |
| OCB | omni.ocb.com.vn |
| Vietcombank | www.vietcombank.com.vn/Ibanking20 |

### Kiểm tra ngân hàng BIDV

API đặc biệt cho BIDV (ngân hàng đối tác chính?):
- `/user/v2/check-user-bank-info-bidv` - Kiểm tra thông tin tài khoản BIDV

## 4. Hoàn tiền

Khi không trúng đấu giá hoặc huỷ đơn, tiền cọc được hoàn lại.

| API | Method | Mô tả |
|-----|--------|--------|
| `/order/create-refund-request` | POST | Tạo yêu cầu hoàn tiền |
| `/order/get-all-refund-order` | GET | Danh sách đơn hoàn tiền |
| `/order/get-refund-request-code-with-phone` | POST | Mã OTP xác nhận hoàn tiền |

**Luồng hoàn tiền**:
```
1. Tạo yêu cầu hoàn tiền
2. Nhận OTP qua SĐT
3. Xác nhận OTP
4. Hệ thống xử lý hoàn tiền về tài khoản ngân hàng
```

## 5. Thanh toán API Gateway

**Base URL**: `/web-api/user-payment/api/payment`

Gateway riêng cho các thao tác thanh toán, tách biệt khỏi gateway đấu giá chính.

## 6. Tài liệu thanh toán

Upload/download tài liệu liên quan đến thanh toán:

| API | Method | Mô tả |
|-----|--------|--------|
| `/document/user/upload` | POST | Upload tài liệu |
| `/document/user/download?documentId=` | GET | Tải tài liệu |
| `/document/v2/user/all` | GET | Tất cả tài liệu |
| `/web-api/user-bidding/api/document/preSignedUrl/` | GET | Pre-signed URL |
| `/web-api/uploadapi/file/preSignedUrl/` | GET | Pre-signed URL upload |
| `/file/upload` | POST | Upload file trực tiếp |
