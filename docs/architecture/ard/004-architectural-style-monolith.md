# ADR 004: Lựa chọn phong cách kiến trúc Monolith (Modular Monolith)

## Trạng thái
Đã chấp thuận (Accepted)

## Bối cảnh (Context)
Trong giai đoạn thiết kế kiến trúc hệ thống cho đồ án Quản lý cửa hàng cà phê (`CNPM`), nhóm cần đưa ra quyết định lựa chọn phong cách kiến trúc tổng thể giữa Microservices và Monolithic Architecture. Hệ thống bao gồm các nghiệp vụ liên kết chặt chẽ như quản lý thực đơn (Menu/Catalog), đặt món, giỏ hàng, thanh toán, quản lý tồn kho và bảo mật phân quyền (`Spring Security`). Dự án được triển khai bởi một nhóm phát triển nhỏ trong thời gian có hạn của học kỳ, với mục tiêu xây dựng một hệ thống hoạt động ổn định, dễ triển khai, dễ kiểm thử và đảm bảo tính toàn vẹn dữ liệu trong các giao dịch đặt hàng và thanh toán.

## Quyết định (Decision)
Nhóm quyết định áp dụng phong cách kiến trúc **Monolithic**, cụ thể là mô hình **Modular Monolith** kết hợp kiến trúc phân lớp (Layered Architecture) tại `apps/backend/`:
* Toàn bộ các domain nghiệp vụ (Order, Payment, Catalog/Menu, Inventory, Customer, Auth...) được đóng gói chung trong một codebase Spring Boot (`Java 17`) duy nhất và chạy trên cùng một tiến trình (single process).
* Các thành phần (`controller`, `service`, `repository`, `domain`, `entity`, `enums`) được phân tách ranh giới rõ ràng thông qua cấu trúc package, giao tiếp với nhau qua các interface/method call nội bộ thay vì thông qua mạng (network RPC/HTTP).

## Hệ quả (Consequences / Trade-offs)
* **Ưu điểm:**
  * **Đơn giản hóa việc phát triển và gỡ lỗi (Debugging):** Toàn bộ mã nguồn backend nằm chung trong một project Maven duy nhất, lập trình viên có thể dễ dàng trace log từ `Controller`, `Service` xuống `Repository` mà không cần cấu hình Distributed Tracing phức tạp.
  * **Giao dịch nhất quán (ACID Transactions):** Dễ dàng quản lý tính toàn vẹn dữ liệu thông qua cơ chế quản lý transaction cục bộ của Spring (`@Transactional`), đặc biệt là khi trừ tồn kho nguyên liệu và tạo đơn hàng đồ uống đồng thời, tránh được bài toán phân tán dữ liệu phức tạp (như mẫu Saga hay 2-Phase Commit).
  * **Tối ưu chi phí và hạ tầng:** Giảm thiểu độ trễ mạng (Network Latency) giữa các dịch vụ nội bộ; quy trình đóng gói qua `spring-boot-maven-plugin` thành một file JAR/Docker image duy nhất giúp việc thiết lập CI/CD và vận hành server đơn giản, tiết kiệm tài nguyên.
  * **Tốc độ hoàn thiện sản phẩm (Time-to-market):** Phù hợp với năng lực nhóm và thời hạn nộp đồ án, không tốn thời gian thiết kế các cơ chế Service Discovery, API Gateway phức tạp hay Message Queue rườm rà.
* **Nhược điểm (Trade-off):**
  * **Khó mở rộng độc lập (Horizontal Scaling):** Khi một module bị nghẽn tải (ví dụ tính năng gọi món hoặc thanh toán giờ cao điểm), toàn bộ ứng dụng phải được nhân bản (scale) chung thay vì chỉ scale riêng module đó.
  * **Rủi ro phụ thuộc chéo (Tight Coupling):** Nếu các thành viên không tuân thủ nghiêm ngặt ranh giới giữa các module/service và sơ đồ lớp (Class Diagram), mã nguồn có nguy cơ trở thành "Spaghetti code", gây khó khăn nếu sau này muốn tách thành Microservices độc lập.