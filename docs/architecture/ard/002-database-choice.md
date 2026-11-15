# ADR 002: Lựa chọn PostgreSQL / SQL Server làm Cơ sở dữ liệu chính và H2 cho Kiểm thử

## Trạng thái
Đã chấp thuận (Accepted)

## Bối cảnh (Context)
Hệ thống quản lý cửa hàng cà phê đòi hỏi một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) có persistent storage ổn định để lưu trữ thông tin thực đơn đồ uống, đơn hàng, chi tiết món, trạng thái giao dịch và tài khoản người dùng. Đồng thời, nhóm cần sự linh hoạt khi triển khai trên môi trường máy cá nhân của các thành viên cũng như một cơ sở dữ liệu gọn nhẹ trên bộ nhớ đệm (in-memory) để chạy các bài kiểm thử tự động (Unit/Integration Test) mà không làm ảnh hưởng đến dữ liệu thật.

## Quyết định (Decision)
Nhóm quyết định cấu hình hệ thống cơ sở dữ liệu trên nền tảng **Spring Data JPA / Hibernate** với chiến lược đa môi trường:
* **Môi trường Phát triển & Vận hành (Runtime):** Tích hợp cả hai driver kết nối là **PostgreSQL (`org.postgresql:postgresql`)** và **Microsoft SQL Server (`com.microsoft.sqlserver:mssql-jdbc`)**, cho phép chuyển đổi linh hoạt qua cấu hình môi trường (`application.properties` / Docker) mà không cần sửa đổi mã nguồn tầng Repository.
* **Môi trường Kiểm thử (Test scope):** Sử dụng **H2 In-memory Database (`com.h2database:h2`)** kết hợp `spring-boot-starter-test` để khởi tạo nhanh schema tạm thời phục vụ kiểm thử.

## Hệ quả (Consequences / Trade-offs)
* **Ưu điểm:**
  * Đảm bảo tuyệt đối tính toàn vẹn tham chiếu (Foreign Key) và tính chất ACID cho các giao dịch tạo đơn hàng và thanh toán tại cửa hàng cà phê.
  * Tương thích cao giữa các môi trường máy tính của thành viên trong nhóm nhờ Hibernate Dialect tự động biên dịch câu lệnh SQL tương ứng cho PostgreSQL hoặc SQL Server.
  * Tốc độ chạy kiểm thử tự động rất nhanh và cô lập hoàn toàn nhờ H2 Database chạy trực tiếp trên RAM ở scope `test`.
* **Nhược điểm (Trade-off):**
  * Các truy vấn tùy chỉnh (Custom Queries) cần ưu tiên viết bằng chuẩn JPQL thay vì Native SQL đặc thù của riêng SQL Server hay PostgreSQL để đảm bảo tính tương thích đa hệ quản trị và chạy tốt trên cả H2 khi test.