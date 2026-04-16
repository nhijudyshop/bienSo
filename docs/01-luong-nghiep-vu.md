# Luồng nghiệp vụ chính

## Tổng quan luồng đấu giá biển số

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. ĐĂNG KÝ  │────>│ 2. XÁC MINH  │────>│ 3. TÌM BIỂN  │────>│ 4. ĐĂNG KÝ   │
│   TÀI KHOẢN  │     │   eKYC/VNeID │     │   SỐ XE      │     │   ĐẤU GIÁ    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  8. THỦ TỤC  │<────│ 7. THANH TOÁN│<────│ 6. TRÚNG GIÁ │<────│ 5. VÀO PHÒNG │
│  SAU ĐẤU GIÁ │     │   TOÀN BỘ   │     │              │     │   ĐẤU GIÁ    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

## Chi tiết từng bước

### Bước 1: Đăng ký tài khoản

**Trang**: `/dang-ky`

Có 2 loại tài khoản:
- **Cá nhân**: Dùng CCCD/CMND, số điện thoại
- **Tổ chức**: Dùng ĐKKD (Đăng ký kinh doanh)

**Luồng**:
1. Nhập thông tin cơ bản (tên, SĐT, email, mật khẩu)
2. Validate thông tin → API `/account/validate-user-basic-info`
3. Nhận OTP qua SMS → API `/account/get-phone-verification-code`
4. Xác thực OTP
5. Hoàn tất đăng ký → API `/account/register-person` hoặc `/account/register-org`

**Yêu cầu mật khẩu** (từ API `get-config-pr`):
- Độ dài: 8-16 ký tự
- Bắt buộc: chữ hoa, chữ thường, số, ký tự đặc biệt

### Bước 2: Xác minh tài khoản

**Trang**: `/thong-tin/xac-minh-tai-khoan`

Có 2 phương thức xác minh:

**eKYC (Electronic Know Your Customer)**:
1. Chụp ảnh CCCD mặt trước/sau
2. Chụp ảnh khuôn mặt (selfie)
3. Hệ thống xác minh tự động → API `/ekyc/`, `/ekyc/result`
4. Giới hạn số lần thử → API `/ekyc/limit`
5. Đối với tổ chức: `/ekyc/dkkd/result` (xác minh ĐKKD)

**VNeID (Định danh điện tử quốc gia)**:
1. Chuyển hướng sang cổng VNeID (SSO)
2. Xác thực trên app VNeID
3. Trả về thông tin → API `/third-party/vneid/get-user-information`
4. Cập nhật profile → API `/user/v2/update-person-profile-with-vneid-data`

### Bước 3: Tìm kiếm biển số

**Các trang tìm kiếm**:

| Trang | URL | Mô tả |
|-------|-----|--------|
| Trang chủ | `/` | Biển số đang đưa ra đấu giá (phiên hiện tại) |
| Danh sách công bố | `/danh-sach-cong-bo` | Biển số vừa được công bố |
| Danh sách chính thức | `/danh-sach-bien` | Danh sách chính thức đấu giá |
| Kho biển số | `/kho-bien-so` | Tất cả biển trong kho chờ yêu cầu |
| Khoảng biển | `/khoang-bien` | Tìm theo khoảng số |
| Tất cả biển số | `/tat-ca-bien-so` | Toàn bộ biển có sẵn |

**Bộ lọc tìm kiếm**:
- Biển số xe (text, hỗ trợ tìm theo pattern)
- Tỉnh/thành phố (dropdown - 63 tỉnh thành)
- Ngày đấu giá (date picker)
- Phiên đấu giá (dropdown - Phiên 1 đến Phiên 10)
- Màu biển (dropdown)
- Loại xe (Xe Con, Xe Tải, v.v.)

### Bước 4: Đăng ký đấu giá

**Trang**: `/dang-ky-dau-gia`

**Luồng**:
1. Chọn biển số muốn đấu giá → Nhấn "Đăng ký đấu giá"
2. Thêm vào giỏ hàng → API `/cart/add-item/`
3. Vào giỏ hàng (`/thong-tin/gio-hang`) → Xem lại danh sách
4. Tạo đơn hàng → API `/order/create-order` hoặc `/order/create-pre-order`
5. Đọc & chấp thuận quy chế → API `/policy/approve-auction-policy`
6. Thanh toán tiền đặt trước (tiền cọc)

**Giá khởi điểm**: Tuỳ biển số
- Biển thường: từ 40.000.000 VNĐ
- Biển đẹp (số đẹp): từ 500.000.000 VNĐ trở lên

### Bước 5: Vào phòng đấu giá

**Trang**: `/phong-dau-gia/[id]` (redirect sang `phongdau.vpa.com.vn`)

**Cơ chế realtime**:
- Sử dụng **SSE (Server-Sent Events)** tại endpoint `/phong-dau-gia/sse/`
- Mỗi phiên đấu giá diễn ra theo lịch cố định (công bố trước)
- Đấu giá tổ chức hàng ngày, mỗi ngày ~500-800 biển số

**Trong phòng đấu giá**:
1. Xem bảng giá hiện tại → API `/bidding/v1/get-user-price-table/`
2. Đặt giá → API `/bidding/v1/set-price/`
3. Kiểm tra timeout → API `/bidding/v1/get-timeout/`
4. Đồng bộ thời gian server → API `/time-control/public/time-info`

### Bước 6: Trúng giá

Sau khi phiên đấu giá kết thúc:
- Kết quả được công bố tại `/ket-qua-dau-gia`
- Người trúng nhận thông báo (push notification + email)
- Xem chi tiết: `/ket-qua-dau-gia/[id]`
- Lịch sử cá nhân: `/thong-tin/lich-su-dau-gia`

**Thống kê mẫu** (16/04/2026):
- 495 biển số đấu giá trong ngày
- Giá cao nhất: 1.220.000.000 VNĐ
- Giá thấp nhất: 5.000.000 VNĐ

### Bước 7: Thanh toán toàn bộ

**Trang**: `/thanh-toan/[id]`

**Phương thức thanh toán**:
- QR Code ngân hàng
- QR Code ví điện tử
- Chuyển khoản trực tiếp

**Ngân hàng hỗ trợ**: BIDV, Techcombank, VPBank, Vietinbank, ACB, Agribank, MB, VIB, OCB

**Thời hạn**: 30 ngày kể từ ngày có Thông báo kết quả trúng đấu giá

### Bước 8: Thủ tục sau đấu giá

**Trang**: `/thu-tuc-sau-dau-gia`

1. **Xác nhận Biên bản đấu giá trực tuyến** trong thời hạn quy định
2. **Nộp tiền trúng đấu giá** (trừ tiền đặt trước) trong 30 ngày
3. Nhận **hóa đơn điện tử** bán tài sản công + **Quyết định xác nhận biển số xe trúng đấu giá** qua email
4. **Đăng ký biển số** tại Phòng CSGT cấp tỉnh/thành phố nơi cư trú

## Luồng phụ

### Không trúng đấu giá
1. Tiền đặt trước được hoàn lại
2. Yêu cầu hoàn tiền → API `/order/create-refund-request`
3. Nhận mã OTP xác nhận hoàn tiền → API `/order/get-refund-request-code-with-phone`

### Đấu lại
- Biển số không có người trúng hoặc người trúng không thanh toán → Đấu lại
- Hiển thị "(Đấu lại lần X)" bên cạnh biển số
- Yêu cầu đấu lại → API `/user/v2/request-reauction`

### Khiếu nại
**Trang**: `/tiep-nhan-y-kien`
1. Chọn chủ đề → API `/complaint/get-list-topic`
2. Gửi khiếu nại → API `/complaint/create-customer-complaint`

### Wishlist (Quan tâm)
- Thêm biển số vào danh sách quan tâm → API `/wishlist/add-item/`
- Xem danh sách → API `/wishlist/get-all-items`
- Nhận thông báo khi biển số sắp đấu giá
