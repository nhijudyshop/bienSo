export default function ThuTucSauDauGiaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-8">THỦ TỤC SAU ĐẤU GIÁ</h1>

      {/* Timeline */}
      <div className="space-y-6 mb-10">
        {[
          {
            step: 1,
            title: "Xác nhận Biên bản đấu giá trực tuyến",
            desc: "Trong thời hạn quy định tại Quy chế đấu giá, người trúng đấu giá cần xác nhận Biên bản đấu giá trực tuyến trên hệ thống.",
            color: "bg-accent-green",
          },
          {
            step: 2,
            title: "Nộp toàn bộ tiền trúng đấu giá",
            desc: "Nộp toàn bộ số tiền trúng đấu giá (trừ tiền đặt trước) trong 30 ngày kể từ ngày có Thông báo kết quả trúng đấu giá. Thanh toán qua QR Code ngân hàng hoặc chuyển khoản trực tiếp.",
            color: "bg-accent-blue",
          },
          {
            step: 3,
            title: "Nhận hóa đơn và Quyết định xác nhận",
            desc: "Ngay sau khi nhận đủ tiền, Cục Cảnh sát giao thông cấp hóa đơn điện tử bán tài sản công và Quyết định xác nhận biển số xe trúng đấu giá gửi qua email.",
            color: "bg-accent-orange",
          },
          {
            step: 4,
            title: "Đăng ký biển số tại Phòng CSGT",
            desc: "Thực hiện đăng ký cấp biển số xe trúng đấu giá tại Phòng Cảnh sát giao thông cấp tỉnh/thành phố nơi cư trú. Thời hạn đăng ký: 12 tháng kể từ ngày được cấp Quyết định.",
            color: "bg-accent-red",
          },
        ].map((item) => (
          <div key={item.step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {item.step}
              </div>
              {item.step < 4 && <div className="w-0.5 flex-1 bg-border mt-2" />}
            </div>
            <div className="bg-bg-secondary rounded-xl border border-border p-5 flex-1 mb-2">
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-text-secondary text-sm leading-6">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Important notes */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Lưu ý quan trọng</h2>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="flex gap-3">
            <span className="text-accent-orange flex-shrink-0">•</span>
            <span>Thời hạn thanh toán: <strong className="text-text-primary">30 ngày</strong> kể từ ngày có Thông báo kết quả trúng đấu giá</span>
          </div>
          <div className="flex gap-3">
            <span className="text-accent-orange flex-shrink-0">•</span>
            <span>Thời hạn đăng ký biển số: <strong className="text-text-primary">12 tháng</strong> kể từ ngày được cấp Quyết định (có thể gia hạn thêm tối đa 6 tháng trong trường hợp bất khả kháng)</span>
          </div>
          <div className="flex gap-3">
            <span className="text-accent-orange flex-shrink-0">•</span>
            <span>Việc chuyển nhượng biển số xe trúng đấu giá mà không kèm theo xe là <strong className="text-accent-red">trái quy định pháp luật</strong></span>
          </div>
        </div>
      </div>

      {/* Not winning */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Trường hợp không trúng đấu giá</h2>
        <p className="text-text-secondary text-sm leading-6">
          Nếu không trúng đấu giá và không thuộc trường hợp không được nhận lại tiền đặt trước,
          tiền cọc sẽ được hoàn lại trong vòng <strong className="text-text-primary">03 ngày làm việc</strong> (không bao gồm thứ bảy, chủ nhật) kể từ ngày kết thúc cuộc đấu giá.
        </p>
      </div>

      {/* Supported banks */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Ngân hàng hỗ trợ thanh toán</h2>
        <div className="flex flex-wrap gap-3">
          {["BIDV", "Techcombank", "VPBank", "Vietinbank", "ACB", "Agribank", "MB Bank", "VIB", "OCB", "Vietcombank"].map((bank) => (
            <span key={bank} className="bg-bg-card border border-border px-3 py-1.5 rounded-lg text-sm">
              {bank}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
