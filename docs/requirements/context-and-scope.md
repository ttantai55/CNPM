# BrewLite – Bối cảnh, Stakeholder và Phạm vi

## 1. Vấn đề nghiệp vụ
- Hiện trạng: quán nhận order thủ công (giấy/miệng), dễ nhầm món, chậm
  vào giờ cao điểm, khó thống kê doanh thu.
- Vấn đề: khách chờ lâu, nhân viên quầy quá tải, quản lý thiếu số liệu.
- Giải pháp: hệ thống BrewLite cho phép đặt món, quản lý đơn,
  thanh toán và xem báo cáo.

## 2. Stakeholder, mục tiêu và kỳ vọng
| Stakeholder | Vai trò | Mục tiêu | Kỳ vọng |
|---|---|---|---|
| Khách hàng | Đặt đồ uống | Đặt nhanh, đúng món | Giao diện dễ dùng, xem trạng thái đơn |
| Nhân viên quầy | Xử lý đơn | Nhận và pha đúng đơn | Danh sách đơn rõ ràng, cập nhật trạng thái nhanh |
| Quản lý cửa hàng | Quản lý menu, doanh thu | Kiểm soát hoạt động | Quản lý menu, xem báo cáo |
| Giảng viên / khách hàng nghiệm thu | Đánh giá sản phẩm | Sản phẩm đúng yêu cầu | Demo chạy được, tài liệu đầy đủ |
| Nhóm phát triển | Xây dựng hệ thống | Hoàn thành đúng hạn | Yêu cầu rõ, phạm vi vừa sức |
| Đơn vị thanh toán | Cung cấp cổng thanh toán | Giao dịch đúng, an toàn | Tích hợp theo API/chuẩn của họ |

# 3. Phạm vi hệ thống (In-Scope, Out-Of-Scope)
## 3.1. Phạm vi trong MVP (In-Scope)
| Hạng mục | Mô tả chi tiết |
| --- | --- |
| Menu & Sản phẩm | Xem danh sách sản phẩm, chi tiết sản phẩm  |
| Giỏ hàng| Thêm, sửa số lượng, xóa sản phẩm, tính tổng tiền |
| Xác thực | Đăng ký, đăng nhập tài khoản bằng JWT. |
| Đặt đơn & Thanh toán| Tạo đơn hàng, tích hợp cổng thanh toán mô phỏng. |
| Quản lý đơn hàng | Khách hàng theo dõi lịch sử và trạng thái đơn hàng. |

## 3.2. Phạm vi mở rộng & Nội dung không thực hiện (Out-Of-Scope)
| Hạng mục | Phân loại | Mô tả |
| --- | --- | --- |
| Cổng thanh toán thực tế | Mở rộng | Tích hợp VNPay/MoMo sandbox thực tế  |
| Đánh giá sản phẩm | Mở rộng | Tính năng review & rating sau khi mua. |
| Quản lý kho nâng cao | Không thực hiện | Nhập kho nguyên liệu, quản lý nhà cung cấp. |
| Mobile App Native| Không thực hiện | Không viết app iOS/Android thuần (chỉ dùng Next.js PWA). |
