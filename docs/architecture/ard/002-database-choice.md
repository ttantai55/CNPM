# ADR 002: Lựa chọn PostgreSQ làm Cơ sở dữ liệu chính và H2 cho Kiểm thử

## Trạng thái
Đã chấp thuận (Accepted)

## Bối cảnh (Context)
Hệ thống quản lý cửa hàng cà phê đòi hỏi một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) có persistent storage ổn định để lưu trữ thông tin thực đơn đồ uống, đơn hàng, chi tiết món, trạng thái giao dịch và tài khoản người dùng. Đồng thời, nhóm cần sự linh hoạt khi triển khai trên môi trường máy cá nhân của các thành viên cũng như một cơ sở dữ liệu gọn nhẹ trên bộ nhớ đệm (in-memory) để chạy các bài kiểm thử tự động (Unit/Integration Test) mà không làm ảnh hưởng đến dữ liệu thật.

## Quyết định (Decision)
Nhóm quyết định cấu hình hệ thống cơ sở dữ liệu trên nền tảng **Spring Data JPA / Hibernate** với chiến lược đa môi trường:
* **Môi trường Phát triển & Vận hành (Runtime):** Tích hợp driver kết nối là **PostgreSQL (`org.postgresql:postgresql`)** và cho phép chuyển đổi linh hoạt qua cấu hình môi trường (`application.properties` / Docker) mà không cần sửa đổi mã nguồn tầng Repository.
* **Môi trường Kiểm thử (Test scope):** Sử dụng **H2 In-memory Database (`com.h2database:h2`)** kết hợp `spring-boot-starter-test` để khởi tạo nhanh schema tạm thời phục vụ kiểm thử.

## Hệ quả (Consequences / Trade-offs)

- **Ưu điểm:**
  - Đảm bảo tuyệt đối tính toàn vẹn tham chiếu (Foreign Key) và tính chất ACID khắt khe cho các giao dịch tạo đơn hàng, thanh toán và trừ tồn kho tại cửa hàng.
  - Tận dụng được tối đa các tính năng nâng cao đặc thù của riêng PostgreSQL (như kiểu dữ liệu `JSONB` cho tùy chọn topping/combo, hoặc các Index chuyên biệt) để tối ưu truy vấn mà không bị gò bó bởi chuẩn SQL chung.
  - Môi trường phát triển của tất cả thành viên trong nhóm được đồng bộ nhất quán 100% nhờ việc chạy chung một cấu hình PostgreSQL thông qua Docker Compose.

- **Nhược điểm (Trade-off):**
  - **Khóa chặt công nghệ (Vendor Lock-in):** Khi lạm dụng Native SQL hoặc các hàm đặc thù của PostgreSQL để tối ưu tốc độ, mã nguồn (repository) sẽ bị gắn chặt với hệ quản trị này. Nếu tương lai muốn đổi sang MySQL hay SQL Server sẽ tốn rất nhiều chi phí đập đi viết lại.
  - **Tốn tài nguyên khi kiểm thử (Testing):** Do không dùng database siêu nhẹ trên RAM (như H2) để đảm bảo test đúng môi trường thực tế, nhóm phải sử dụng công cụ như Testcontainers (giả lập PostgreSQL thật trong Docker khi chạy test), làm tăng thời gian và RAM khi chạy các bộ kiểm thử tự động (CI/CD).