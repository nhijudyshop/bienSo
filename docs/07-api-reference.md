# API Reference đầy đủ

## Base URLs

| Gateway | Base URL |
|---------|----------|
| User Bidding | `https://dgbs.vpa.com.vn/web-api/user-bidding/api` |
| Payment | `https://dgbs.vpa.com.vn/web-api/user-payment/api/payment` |
| Search | `https://dgbs.vpa.com.vn/search-api/search` |
| Public Result | `https://dgbs.vpa.com.vn/api/bidding/public-result` |
| Tin tức | `https://dgbs.vpa.com.vn/api/tin-tuc` |
| Admin Public | `https://dgbs.vpa.com.vn/web-api/admin-api/public` |
| User Public | `https://dgbs.vpa.com.vn/web-api/user-api/public` |
| Marketing | `https://dgbs.vpa.com.vn/web-api/marketing-api` |
| Upload | `https://dgbs.vpa.com.vn/web-api/uploadapi` |
| Auction Room | `https://phongdau.vpa.com.vn` |

## Headers chung

```
Content-Type: application/json
Accept: application/json
csrf: <Base64(timestamp)>
Authorization: Bearer <jwt_token>  (cho API cần auth)
```

## Response format chung

**Thành công**:
```json
{
  "success": true,
  "result": { ... }
}
```

**Lỗi**:
```json
{
  "success": false,
  "errorCode": 401,
  "errors": ["Đã có lỗi xảy ra trong quá trình xử lý, vui lòng thử lại sau"]
}
```

**Phân trang**:
```json
{
  "content": [ ... ],
  "totalElements": 511
}
```

---

## ACCOUNT - Tài khoản

### Xác thực

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 1 | POST | `/account/authenticate` | No | Đăng nhập |
| 2 | POST | `/account/authenticate-with-refresh-token` | Yes | Refresh token |
| 3 | POST | `/account/logout` | Yes | Đăng xuất |
| 4 | POST | `/account/validate-username-password` | No | Validate credentials |
| 5 | GET | `/account/get-phone-login-code?username=` | No | OTP đăng nhập |
| 6 | GET | `/account/get-config-pr` | No | Cấu hình mật khẩu |

### Đăng ký

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 7 | POST | `/account/register-person` | No | ĐK cá nhân (v1) |
| 8 | POST | `/account/v2/register-person-basic-info` | No | ĐK cá nhân basic (v2) |
| 9 | POST | `/account/register-person-full` | No | ĐK cá nhân đầy đủ |
| 10 | POST | `/account/register-org` | No | ĐK tổ chức (v1) |
| 11 | POST | `/account/v2/register-org-basic-info` | No | ĐK tổ chức basic (v2) |
| 12 | POST | `/account/register-org-full` | No | ĐK tổ chức đầy đủ |
| 13 | POST | `/account/validate-user-basic-info` | No | Validate thông tin cá nhân |
| 14 | POST | `/account/validate-org-basic-info` | No | Validate thông tin tổ chức |
| 15 | POST | `/account/get-phone-verification-code` | No | Gửi OTP SMS |
| 16 | POST | `/account/v2/enrich-user-info` | No | Bổ sung thông tin cá nhân |
| 17 | POST | `/account/v2/enrich-org-info` | No | Bổ sung thông tin tổ chức |

### Mật khẩu

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 18 | GET | `/account/get-recover-password-code-with-mail?email=` | No | OTP reset qua email |
| 19 | GET | `/account/get-recover-password-code-with-phone?phone=` | No | OTP reset qua SĐT |
| 20 | POST | `/account/check-recover-password-code-with-email` | No | Verify OTP email |
| 21 | POST | `/account/check-recover-password-code-with-phone` | No | Verify OTP SĐT |
| 22 | POST | `/account/recover-password-with-mail` | No | Đặt lại MK qua email |
| 23 | POST | `/account/recover-password-with-phone` | No | Đặt lại MK qua SĐT |
| 24 | POST | `/account/check-otp-update-phone` | Yes | OTP đổi SĐT |

---

## USER - Người dùng

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 25 | GET | `/user/get-profile` | Yes | Lấy profile |
| 26 | GET | `/user/get-information-account` | Yes | Thông tin tài khoản |
| 27 | PUT | `/user/update-person-profile` | Yes | Cập nhật cá nhân (v1) |
| 28 | PUT | `/user/v2/update-person-profile` | Yes | Cập nhật cá nhân (v2) |
| 29 | PUT | `/user/update-org-profile` | Yes | Cập nhật tổ chức (v1) |
| 30 | PUT | `/user/v2/update-org-profile` | Yes | Cập nhật tổ chức (v2) |
| 31 | POST | `/user/change-password` | Yes | Đổi mật khẩu |
| 32 | POST | `/user/change-password-expired` | Yes | Đổi MK hết hạn |
| 33 | PUT | `/user/update-phone` | Yes | Đổi SĐT |
| 34 | GET | `/user/check-one-device-login` | Yes | Kiểm tra single device |
| 35 | POST | `/user/subscribe-browser` | Yes | Đăng ký push browser |
| 36 | GET | `/user/auction-result/get-history-and-result` | Yes | Lịch sử & kết quả |
| 37 | PUT | `/user/v2/update-person-profile-with-vneid-data?requestId=` | Yes | Update từ VNeID |
| 38 | PUT | `/user/v2/reject-update-person-profile-with-vneid-data?requestId=` | Yes | Reject VNeID |
| 39 | GET | `/user/v2/check-user-bank-info-bidv` | Yes | Check tài khoản BIDV |
| 40 | POST | `/user/v2/request-reauction` | Yes | Yêu cầu đấu lại |
| 41 | POST | `/user/signed-by-customer` | Yes | Ký biên bản |

---

## SEARCH - Tìm kiếm

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 42 | POST | `/search-api/search/list-announcement-plan` | No* | Biển đưa ra đấu giá |
| 43 | POST | `/search-api/search/get-all-wh-license-plate` | No* | Kho biển số |
| 44 | POST | `/search-api/search/list-published-license-plate` | No* | Biển đã công bố |
| 45 | GET | `/search-api/search/list-announcement-plan-code` | No* | Mã phiên đấu giá |
| 46 | POST | `/search-api/search/statistic-winner-price-history` | No* | Thống kê giá trúng |

*No* = Không cần JWT nhưng cần Cloudflare cookies (browser context)

---

## PUBLISH - Công bố

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 47 | GET | `/publish/get-all-publish-detail` | No* | Biển công bố (public) |
| 48 | GET | `/publish/get-all-registered-publish-detail` | Yes | Biển đã ĐK (auth) |
| 49 | GET | `/publish/get-current-publish` | No* | Countdown công bố |
| 50 | GET | `/publish/get-current-register` | No* | Countdown đăng ký |

---

## BIDDING - Đấu giá

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 51 | GET | `/bidding/v1/get-user-price-table/{bksId}` | Yes | Bảng giá |
| 52 | POST | `/bidding/v1/set-price/{bksId}` | Yes | Đặt giá |
| 53 | GET | `/bidding/v1/get-timeout/{bksId}` | Yes | Timeout |
| 54 | POST | `/api/bidding/public-result/history/auction-result-session` | No* | Lịch sử phiên |
| 55 | POST | `/api/bidding/public-result/history/detail/auction-result-session` | No* | Chi tiết phiên |
| 56 | POST | `/api/bidding/public-result/list-await-auction/province/view` | No* | Theo tỉnh |
| 57 | POST | `/api/bidding/public-result/list-await-auction/customer/detail` | No* | Chi tiết KH |
| 58 | GET | `/api/bidding/public-result/list-await-auction/user/detail/{id}` | Yes | Trạng thái user |

---

## CART & WISHLIST

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 59 | POST | `/cart/add-item/{bksId}` | Yes | Thêm giỏ hàng |
| 60 | GET | `/cart/get-all-items` | Yes | Xem giỏ hàng |
| 61 | GET | `/cart/get-items-count` | Yes | Đếm giỏ |
| 62 | DELETE | `/cart/remove-item/{bksId}` | Yes | Xóa khỏi giỏ |
| 63 | POST | `/wishlist/add-item/{bksId}` | Yes | Thêm quan tâm |
| 64 | GET | `/wishlist/get-all-items` | Yes | Xem quan tâm |
| 65 | GET | `/wishlist/get-items-count` | Yes | Đếm quan tâm |
| 66 | DELETE | `/wishlist/remove-item/{bksId}` | Yes | Xóa quan tâm |

---

## ORDER - Đơn hàng

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 67 | POST | `/order/create-order` | Yes | Tạo đơn |
| 68 | POST | `/order/create-pre-order` | Yes | Tạo pre-order |
| 69 | GET | `/order/get-order-detail-by-orderId` | Yes | Chi tiết đơn |
| 70 | GET | `/order/get-order-fee` | Yes | Phí đơn hàng |
| 71 | GET | `/order/get-orders-payment-status` | Yes | Trạng thái thanh toán |
| 72 | GET | `/order/get-count-orders-payment-status` | Yes | Đếm trạng thái |
| 73 | GET | `/order/get-orders-wait-auction` | Yes | Đơn chờ đấu giá |
| 74 | GET | `/order/get-orders-wait-auction-count` | Yes | Đếm đơn chờ |
| 75 | GET | `/order/check-status-order` | Yes | Check trạng thái |
| 76 | PUT | `/order/update-order-payment-method` | Yes | Đổi phương thức TT |
| 77 | DELETE | `/order/remove-multi-orders` | Yes | Xóa đơn |
| 78 | GET | `/order/get-online-methods` | Yes | Phương thức online |
| 79 | POST | `/order/get-qr-code` | Yes | QR thanh toán |
| 80 | POST | `/order/get-bank-qr` | Yes | QR ngân hàng |
| 81 | POST | `/order/get-ewallet-qr` | Yes | QR ví điện tử |
| 82 | POST | `/order/create-refund-request` | Yes | Yêu cầu hoàn tiền |
| 83 | GET | `/order/get-all-refund-order` | Yes | Đơn hoàn tiền |
| 84 | POST | `/order/get-refund-request-code-with-phone` | Yes | OTP hoàn tiền |

---

## POLICY - Quy chế

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 85 | GET | `/policy/get-auction-policy?orderId=` | Yes | Lấy quy chế |
| 86 | POST | `/policy/approve-auction-policy` | Yes | Chấp thuận quy chế |

---

## DOCUMENT - Tài liệu

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 87 | POST | `/document/user/upload` | Yes | Upload |
| 88 | GET | `/document/user/download?documentId=` | Yes | Download |
| 89 | GET | `/document/v2/user/all` | Yes | Tất cả tài liệu |
| 90 | GET | `/web-api/user-bidding/api/document/preSignedUrl/{id}` | Yes | Pre-signed URL |

---

## NOTIFICATION - Thông báo

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 91 | GET | `/get-all-user-notification` | Yes | Thông báo user |
| 92 | GET | `/get-all-auction-notification` | Yes | Thông báo đấu giá |
| 93 | GET | `/get-unread-count` | Yes | Số chưa đọc |
| 94 | POST | `/subcribe-user-device` | Yes | Đăng ký device |

---

## ADMINISTRATIVE - Hành chính

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 95 | GET | `/administrative/provinces` | No | 63 tỉnh/thành |
| 96 | GET | `/administrative/districts?provinceId=` | No | Quận/huyện |
| 97 | GET | `/administrative/wards?provinceCode=` | No | Phường/xã |
| 98 | GET | `/announcement-plan/province-and-vehicle-list` | No* | Tỉnh + loại xe |
| 99 | GET | `/announcement-plan/plate-range` | No* | Khoảng biển |
| 100 | GET | `/trending-license-plate` | No* | Biển xu hướng |

---

## THIRD-PARTY - VNeID

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 101 | GET | `/third-party/vneid/get-user-information` | Yes | Thông tin VNeID |
| 102 | POST | `/third-party/vneid/create-user-share-info-transaction-web` | Yes | Tạo giao dịch |
| 103 | GET | `/third-party/vneid/result-user-share-info` | Yes | Kết quả |
| 104 | GET | `/third-party/vneid/get-vneid-logout-url?redirect_uri=` | Yes | Logout URL |

---

## EKYC

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 105 | POST | `/ekyc/` | Yes | Bắt đầu eKYC |
| 106 | GET | `/ekyc/result` | Yes | Kết quả cá nhân |
| 107 | GET | `/ekyc/dkkd/result` | Yes | Kết quả tổ chức |
| 108 | GET | `/ekyc/limit` | Yes | Giới hạn thử |

---

## TIN TỨC & MISC

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|--------|
| 109 | GET | `/api/tin-tuc/menu/client-menu/client-get-tree` | No | Menu tin tức |
| 110 | GET | `/api/tin-tuc/menu/static-information/get-by-codes` | No | Thông tin tĩnh |
| 111 | GET | `/api/tin-tuc/public/api/get-public-file` | No | File công khai |
| 112 | GET | `/api/tin-tuc/faq/get-faq` | No | FAQ |
| 113 | GET | `/api/tin-tuc/public/static-categories` | No | Danh mục |
| 114 | GET | `/api/tin-tuc/menu/active-media` | No | Media |
| 115 | GET | `/time-control/public/time-info` | No* | Server timestamp |
| 116 | GET | `/web-api/user-bidding/banner/web/get-banner` | No | Banner |
| 117 | POST | `/web-api/user-bidding/complaint/create-customer-complaint` | Yes | Khiếu nại |
| 118 | GET | `/web-api/user-bidding/complaint/get-list-topic` | No | Chủ đề KN |
| 119 | GET | `/web-api/user-bidding/file/render-qr-code` | No | Render QR |
| 120 | POST | `/request-payment` | Yes | Yêu cầu TT |
| 121 | GET | `/categories/get-all-bank` | Yes | DS ngân hàng |
| 122 | GET | `/categories/get-qr-code` | Yes | QR code |
| 123 | GET | `/api/build-id` | No | Build ID |
| 124 | GET | `/api/listCartItems` | Yes | Giỏ hàng (API route) |
| 125 | POST | `/api/signUp` | No | Đăng ký (API route) |
| 126 | POST | `/api/login/` | No | Đăng nhập (API route) |
| 127 | POST | `/api/checkOldPass` | Yes | Check MK cũ |
| 128 | POST | `/api/getRecoverPasswordCode` | No | Mã reset MK |
