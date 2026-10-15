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

## 5. Giả định, Ràng buộc và Rủi ro ban đầu

### 5.1. Giả định (Assumptions)
- Người dùng truy cập hệ thống chủ yếu bằng thiết bị di động (sử dụng trình duyệt di động hoặc cài đặt PWA).
- Dịch vụ thanh toán được mô phỏng phản hồi kết quả giao dịch (Thành công/Thất bại) thông qua API giả lập.
- Kết nối mạng tại quầy và thiết bị khách hàng ổn định trong quá trình đặt đơn.

### 5.2. Ràng buộc (Constraints)
- **Công nghệ bắt buộc (Tech Stack):**
  - **Frontend:** Next.js (Mobile-first / PWA).
  - **Backend:** NestJS (Node.js framework).
  - **Database:** PostgreSQL.
  - **Containerization:** Docker & Docker Compose.
- **Quy trình & Tiến độ:** Tuân thủ đúng thứ tự 5 Task trong Assignment 2, mỗi Task phải có commit/PR và tài liệu minh chứng trên kho mã nguồn (GitHub/Bitbucket).

### 5.3. Rủi ro ban đầu (Initial Risks)
| ID | Rủi ro | Mức độ | Biện pháp giảm thiểu |
| :--- | :--- | :--- | :--- |
| **R-01** | Sự cố thiết lập pipeline CI/CD khiến việc deploy tự động lên Production bị thất bại. | Cao | Thiết lập CI/CD sớm ở Sprint 1, kiểm thử pipeline với ứng dụng mẫu trước khi ghép logic phức tạp. |
| **R-02** | Xử lý giao dịch thanh toán trùng lặp khi người dùng bấm gửi yêu cầu nhiều lần (Network retry). | Trung bình | Áp dụng cơ chế **Idempotency Key** trong các API tạo đơn và thanh toán. |
| **R-03** | Rò rỉ thông tin cấu hình nhạy cảm (API Keys, Secret, DB Passwords) lên Repository công khai. | Cao | Sử dụng tệp `.env`, `.env.example` và thiết lập Secret variables trên GitHub Actions/Host Provider. |
| **R-04** | Sai lệch giữa tài liệu đặc tả (SRS/Diagrams) và mã nguồn thực tế khi triển khai các Sprint. | Trung bình | Bắt buộc cập nhật tài liệu `docs/` thông qua Pull Request song song với việc viết code. |

# BrewLite - Yêu cầu chức năng và phi chức năng

### 3. Mức ưu tiên yêu cầu theo MoSCoW

Hệ thống phân loại mức độ ưu tiên theo mô hình MoSCoW bao gồm:
- **Must Have (Bắt buộc):** Các chức năng/yêu cầu cốt lõi phải có trong phiên bản MVP (Sprint 1 & Sprint 2) để hệ thống vận hành luồng end-to-end.
- **Should Have (Nên có):** Các chức năng/yêu cầu nên có để xử lý ngoại lệ và tăng trải nghiệm người dùng, ưu tiên làm ngay sau khi xong MVP.
- **Could Have (Có thể có):** Các chức năng mở rộng, triển khai nếu còn đủ thời gian và nguồn lực.
- **Won't Have (Chưa làm):** Các chức năng/phạm vi không thực hiện trong đợt phát triển này.

#### Bảng phân loại mức ưu tiên MoSCoW cho các Yêu cầu:

| Mã YC | Tên Yêu cầu / Tính năng | Phân loại Yêu cầu | Mức ưu tiên MoSCoW | Ghi chú / Phạm vi |
| :---: | :--- | :---: | :---: | :--- |
| **FR-01** | Xem menu món ăn/đồ uống | Chức năng | **Must** | Luồng cốt lõi MVP (Sprint 1) |
| **FR-02** | Xem chi tiết sản phẩm, chọn size & topping | Chức năng | **Must** | Luồng cốt lõi MVP (Sprint 2) |
| **FR-03** | Quản lý giỏ hàng & Tính tổng tiền | Chức năng | **Must** | Luồng cốt lõi MVP |
| **FR-04** | Đăng ký, đăng nhập & Xác thực JWT | Chức năng | **Must** | Luồng cốt lõi MVP |
| **FR-05** | Đặt đơn hàng | Chức năng | **Must** | Luồng cốt lõi MVP |
| **FR-06** | Thanh toán đơn hàng (Ví/Thẻ mô phỏng) | Chức năng | **Must** | Luồng cốt lõi MVP |
| **FR-07** | Theo dõi trạng thái & Lịch sử đơn hàng | Chức năng | **Must** | Luồng cốt lõi MVP |
| **FR-08** | Cập nhật trạng thái đơn (Dành cho quầy) | Chức năng | **Must** | Luồng cốt lõi MVP |
| **NFR-01** | Thiết kế giao diện Mobile-first / PWA | Phi chức năng | **Must** | Yêu cầu hạ tầng / UI |
| **NFR-02** | Bảo mật JWT & Giữ kín Secret / Config | Phi chức năng | **Must** | Yêu cầu an toàn hệ thống |
| **NFR-03** | Đóng gói Docker & Endpoint `/health` | Phi chức năng | **Must** | Yêu cầu triển khai |
| **NFR-04** | Tự động hóa CI/CD pipeline & HTTPS | Phi chức năng | **Must** | Yêu cầu triển khai Production |
| **FR-09** | Xử lý hết hàng & Cảnh báo tồn kho | Chức năng | **Should** | Xử lý luồng nâng cao |
| **NFR-05** | Cơ chế chống lặp giao dịch (Idempotency) | Phi chức năng | **Should** | An toàn giao dịch thanh toán |
| **NFR-06** | Cơ chế dừng pipeline & Rollback tự động | Phi chức năng | **Should** | Quản lý rủi ro khi deploy |
| **FR-10** | Áp dụng mã giảm giá / Khuyến mãi | Chức năng | **Could** | Phạm vi mở rộng |
| **FR-11** | Tích điểm thành viên & Đổi quà | Chức năng | **Could** | Phạm vi mở rộng |
| **FR-12** | Gợi ý món ăn liên quan | Chức năng | **Could** | Phạm vi mở rộng |
| **FR-13** | Tích hợp cổng thanh toán thật (Momo, VNPAY,...) | Chức năng | **Won't** | Ngoài phạm vi Assignment 2 |
| **FR-14** | Ứng dụng di động thuần (Native Mobile App) | Chức năng | **Won't** | Ngoài phạm vi Assignment 2 |
| **FR-15** | Tích hợp phần cứng máy POS / In hóa đơn | Chức năng | **Won't** | Ngoài phạm vi Assignment 2 |