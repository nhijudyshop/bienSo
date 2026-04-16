# Xác thực & Quản lý tài khoản

## 1. Đăng ký tài khoản

### 1.1 Đăng ký cá nhân

**Luồng API**:
```
validate-user-basic-info → get-phone-verification-code → register-person-basic-info → register-person-full
```

| Bước | API | Method | Mô tả |
|------|-----|--------|--------|
| Validate | `/account/validate-user-basic-info` | POST | Kiểm tra thông tin hợp lệ |
| OTP | `/account/get-phone-verification-code` | POST | Gửi OTP qua SMS |
| Đăng ký v1 | `/account/register-person` | POST | Đăng ký (phiên bản cũ) |
| Đăng ký v2 cơ bản | `/account/v2/register-person-basic-info` | POST | Đăng ký thông tin cơ bản |
| Đăng ký v2 đầy đủ | `/account/register-person-full` | POST | Đăng ký đầy đủ thông tin |
| Enrichment | `/account/v2/enrich-user-info` | POST | Bổ sung thông tin |

### 1.2 Đăng ký tổ chức

| Bước | API | Method | Mô tả |
|------|-----|--------|--------|
| Validate | `/account/validate-org-basic-info` | POST | Kiểm tra thông tin tổ chức |
| Đăng ký v1 | `/account/register-org` | POST | Đăng ký tổ chức (v1) |
| Đăng ký v2 cơ bản | `/account/v2/register-org-basic-info` | POST | Thông tin cơ bản |
| Đăng ký v2 đầy đủ | `/account/register-org-full` | POST | Đầy đủ thông tin |
| Enrichment | `/account/v2/enrich-org-info` | POST | Bổ sung thông tin tổ chức |

### 1.3 Yêu cầu mật khẩu

Cấu hình từ API `/account/get-config-pr`:
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

## 2. Đăng nhập

### 2.1 Đăng nhập bằng SĐT + Mật khẩu

**Trang**: `/dang-nhap`

**Endpoint**: `POST /web-api/user-bidding/api/account/authenticate`

**Request body**:
```json
{
  "username": "<số_điện_thoại>",
  "password": "<mật_khẩu>",
  "rememberMe": true,
  "firstTimeToken": "",
  "captcha": "<reCAPTCHA_token>",
  "version": "ver2"
}
```

**Headers bắt buộc**:
```
Content-Type: application/json
csrf: <Base64_encoded_timestamp>
```

**Cơ chế CSRF**: Token CSRF là timestamp hiện tại được mã hóa Base64.
Ví dụ: `MTc3NjMyMTA2MjA5Nw==` → decode → `1776321062097` (Unix timestamp milliseconds)

**Luồng đăng nhập đầy đủ**:
```
1. GET trang /dang-nhap
2. Cloudflare challenge → nhận cf_clearance cookie
3. Giải reCAPTCHA → nhận captcha token
4. POST /account/authenticate với username + password + captcha
5. Nhận JWT token
6. POST /account/v2/enrich-user-info (bổ sung thông tin)
7. GET /user/check-one-device-login (kiểm tra single device)
```

### 2.2 Đăng nhập bằng OTP

```
1. POST /account/get-phone-login-code?username=<SĐT>
2. Nhận OTP qua SMS
3. POST /api/login/ với OTP
```

### 2.3 Đăng nhập qua VNeID (SSO)

```
1. Redirect → /xac-thuc-vneid
2. Redirect → cổng VNeID
3. Xác thực trên app VNeID
4. Callback → /ssovneid
5. GET /third-party/vneid/get-user-information
6. Tạo session
```

### 2.4 Refresh Token

- API: `POST /account/authenticate-with-refresh-token`
- Tự động refresh khi token hết hạn
- Kiểm tra single device: `/user/check-one-device-login`

## 3. eKYC (Xác minh danh tính)

**Trang**: `/thong-tin/xac-minh-tai-khoan`

| API | Mô tả |
|-----|--------|
| `/ekyc/` | Bắt đầu quá trình eKYC |
| `/ekyc/result` | Kết quả xác minh cá nhân |
| `/ekyc/dkkd/result` | Kết quả xác minh ĐKKD (tổ chức) |
| `/ekyc/limit` | Kiểm tra giới hạn số lần thử |

**Luồng eKYC**:
1. Chụp ảnh CCCD mặt trước
2. Chụp ảnh CCCD mặt sau
3. Chụp selfie (liveness check)
4. Hệ thống OCR + so sánh khuôn mặt
5. Trả kết quả xác minh

## 4. VNeID Integration

| API | Mô tả |
|-----|--------|
| `/third-party/vneid/get-user-information` | Lấy thông tin từ VNeID |
| `/third-party/vneid/create-user-share-info-transaction-web` | Tạo giao dịch chia sẻ thông tin |
| `/third-party/vneid/result-user-share-info` | Kết quả chia sẻ thông tin |
| `/third-party/vneid/get-vneid-logout-url?redirect_uri=` | URL đăng xuất VNeID |
| `/user/v2/update-person-profile-with-vneid-data?requestId=` | Cập nhật profile từ VNeID |
| `/user/v2/reject-update-person-profile-with-vneid-data?requestId=` | Từ chối cập nhật |

## 5. Quên mật khẩu

**Trang**: `/quen-mat-khau`

**Qua email**:
```
1. GET /account/get-recover-password-code-with-mail?email=<email>
2. Nhận mã qua email
3. POST /account/check-recover-password-code-with-email
4. POST /account/recover-password-with-mail
```

**Qua SĐT**:
```
1. GET /account/get-recover-password-code-with-phone?phone=<sdt>
2. Nhận mã qua SMS
3. POST /account/check-recover-password-code-with-phone
4. POST /account/recover-password-with-phone
```

## 6. Đổi mật khẩu

**Trang**: `/doi-mat-khau`

| API | Mô tả |
|-----|--------|
| `/user/change-password` | Đổi mật khẩu thường |
| `/user/change-password-expired` | Đổi mật khẩu hết hạn |
| `/api/checkOldPass` | Kiểm tra mật khẩu cũ |

## 7. Đăng xuất

- API: `POST /account/logout`
- Xóa token, session
- Nếu dùng VNeID: redirect qua `/third-party/vneid/get-vneid-logout-url`
