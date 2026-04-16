# Quản lý tài khoản người dùng

## 1. Các trang quản lý

Tất cả nằm dưới prefix `/thong-tin/`:

| Trang | URL | Mô tả |
|-------|-----|--------|
| Tài khoản | `/thong-tin/tai-khoan` | Thông tin cá nhân/tổ chức |
| Xác minh | `/thong-tin/xac-minh-tai-khoan` | eKYC / VNeID |
| Hồ sơ | `/thong-tin/quan-ly-ho-so` | Upload/quản lý tài liệu |
| Giỏ hàng | `/thong-tin/gio-hang` | Biển số đã chọn |
| Biển đã ĐK | `/thong-tin/bien-da-dang-ky` | Biển đã đăng ký đấu giá |
| Lịch sử | `/thong-tin/lich-su-dau-gia` | Lịch sử tham gia đấu giá |
| Thông báo | `/thong-tin/thong-bao` | Thông báo hệ thống |

## 2. Thông tin tài khoản

### Xem thông tin

| API | Method | Mô tả |
|-----|--------|--------|
| `/user/get-profile` | GET | Thông tin profile |
| `/user/get-information-account` | GET | Thông tin tài khoản đầy đủ |

### Cập nhật thông tin cá nhân

| API | Method | Mô tả |
|-----|--------|--------|
| `/user/update-person-profile` | PUT | Cập nhật profile (v1) |
| `/user/v2/update-person-profile` | PUT | Cập nhật profile (v2) |
| `/user/update-phone` | PUT | Đổi số điện thoại |
| `/account/check-otp-update-phone` | POST | OTP xác nhận đổi SĐT |

### Cập nhật thông tin tổ chức

| API | Method | Mô tả |
|-----|--------|--------|
| `/user/update-org-profile` | PUT | Cập nhật tổ chức (v1) |
| `/user/v2/update-org-profile` | PUT | Cập nhật tổ chức (v2) |

### Cập nhật từ VNeID

| API | Method | Mô tả |
|-----|--------|--------|
| `/user/v2/update-person-profile-with-vneid-data?requestId=` | PUT | Cập nhật từ VNeID |
| `/user/v2/reject-update-person-profile-with-vneid-data?requestId=` | PUT | Từ chối cập nhật |

## 3. Quản lý hồ sơ

**Trang**: `/thong-tin/quan-ly-ho-so`

Lưu trữ tài liệu cần thiết cho đấu giá (CCCD, ĐKKD, giấy tờ xe, v.v.)

| API | Method | Mô tả |
|-----|--------|--------|
| `/document/v2/user/all` | GET | Tất cả tài liệu |
| `/document/user/upload` | POST | Upload tài liệu mới |
| `/document/user/download?documentId=` | GET | Tải tài liệu |
| `/web-api/user-bidding/api/document/preSignedUrl/{id}` | GET | URL download tạm |

## 4. Thông báo (Notifications)

**Trang**: `/thong-tin/thong-bao`

### Push Notification (Firebase)

| API | Method | Mô tả |
|-----|--------|--------|
| `/subcribe-user-device` | POST | Đăng ký thiết bị nhận thông báo |
| `/user/subscribe-browser` | POST | Đăng ký browser nhận push |

### Lấy thông báo

| API | Method | Mô tả |
|-----|--------|--------|
| `/get-all-user-notification` | GET | Tất cả thông báo cá nhân |
| `/get-all-auction-notification` | GET | Thông báo đấu giá |
| `/get-unread-count` | GET | Số thông báo chưa đọc |
| `/web-api/user-bidding/api/notification` | GET | Endpoint notification gateway |

**Firebase config**: Dùng Firebase Cloud Messaging (FCM) cho push notification.
- Service Worker: `/firebase-messaging-sw.js`
- Registration: `https://fcmregistrations.googleapis.com/v1/projects/${projectId}/registrations`

## 5. Biển số đã đăng ký

**Trang**: `/thong-tin/bien-da-dang-ky`

Hiển thị danh sách biển số mà người dùng đã đăng ký tham gia đấu giá, bao gồm trạng thái thanh toán và lịch đấu giá.

## 6. Lịch sử đấu giá

**Trang**: `/thong-tin/lich-su-dau-gia`

Hiển thị tất cả các phiên đấu giá đã tham gia, kết quả (trúng/không trúng), giá đã đặt.

**API liên quan**:
- `/auction-history/auction-history-detail`
- `/auction-history/report-auction-history-detail`
- `/user/auction-result/get-history-and-result`

## 7. Khiếu nại & Phản hồi

**Trang**: `/tiep-nhan-y-kien`

| API | Method | Mô tả |
|-----|--------|--------|
| `/web-api/user-bidding/complaint/get-list-topic` | GET | Danh sách chủ đề khiếu nại |
| `/web-api/user-bidding/complaint/create-customer-complaint` | POST | Gửi khiếu nại |

## 8. Tiếp thị liên kết (Affiliate)

**Trang**: `/affiliate-marketing`

| API | Method | Mô tả |
|-----|--------|--------|
| `/web-api/marketing-api` | - | Gateway API marketing |
| `/api/signUp` | POST | Đăng ký affiliate |
