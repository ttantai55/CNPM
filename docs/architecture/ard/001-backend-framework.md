# ADR 001: Lựa chọn Spring Boot 3 (Java 17) làm Backend Framework

## Trạng thái
Đã chấp thuận (Accepted)

## Bối cảnh (Context)
Hệ thống quản lý cửa hàng cà phê cần xử lý các nghiệp vụ cốt lõi như quản lý thực đơn đồ uống & phân loại (Menu/Category), đặt món và tùy chỉnh đơn hàng (Order/OrderItem), thanh toán (Payment) và phân quyền nhân sự vận hành quán. Trong quá trình đánh giá năng lực công nghệ và định hướng của dự án, nhóm nhận thấy cần một framework có tính định kiểu tĩnh chặt chẽ, quản lý Dependency Injection mạnh mẽ, tích hợp sẵn cơ chế kiểm tra dữ liệu đầu vào (Validation), bảo mật (Security) và thư viện ORM ổn định để xử lý logic giao dịch thanh toán phức tạp.

## Quyết định (Decision)
Nhóm quyết định sử dụng **Spring Boot 3.4.4 (Java 17)** quản lý qua công cụ build **Maven**, kết hợp kiến trúc phân lớp (Layered Architecture) phân chia theo các Domain Module nội bộ tại `apps/backend/` với bộ thư viện cốt lõi:
* **Spring Web (`spring-boot-starter-web`):** Xây dựng hệ thống RESTful API giao tiếp với Frontend.
* **Spring Data JPA (`spring-boot-starter-data-jpa`):** Ánh xạ thực thể (Entity/Domain) và thao tác cơ sở dữ liệu thông qua Hibernate ORM.
* **Spring Validation (`spring-boot-starter-validation`):** Kiểm tra tính hợp lệ của dữ liệu đầu vào tại tầng DTO/Controller.
* **Spring Security (`spring-boot-starter-security`):** Xác thực và phân quyền truy cập theo vai trò (Khách hàng, Nhân viên thu ngân/Pha chế, Quản trị viên).
* **Lombok (`1.18.48`):** Tự động sinh mã boilerplate (Getter, Setter, Constructor, Builder) thông qua Annotation Processor của `maven-compiler-plugin`.

## Hệ quả (Consequences / Trade-offs)
* **Ưu điểm:**
  * Tận dụng tối đa kinh nghiệm lập trình hướng đối tượng với Java 17 và Maven của các thành viên trong nhóm.
  * Hệ sinh thái Spring Boot 3 đồng bộ từ kiểm duyệt dữ liệu (`Validation`), bảo mật (`Security`) đến truy xuất CSDL (`Data JPA`) và kiểm thử tự động (`spring-boot-starter-test`).
  * Cấu trúc thư mục rõ ràng, tách biệt rạch ròi giữa Entity, Domain, Enum và DTO, dễ bảo trì theo tiêu chuẩn doanh nghiệp.
* **Nhược điểm (Trade-off):**
  * Ứng dụng Java Spring Boot tiêu tốn nhiều bộ nhớ (RAM) và có thời gian khởi động (startup time) chậm hơn so với các framework viết bằng Node.js (như NestJS/Express).