# ADR 003: Lựa chọn React kết hợp TypeScript và Vite cho Frontend

## Trạng thái
Đã chấp thuận (Accepted)

## Bối cảnh (Context)
Hệ thống quản lý cửa hàng cà phê phục vụ hai nhóm đối tượng chính: khách hàng/nhân viên order chọn món trực tiếp trên thực đơn điện tử, và nhân viên pha chế/quản lý vận hành hệ thống đơn hàng, kho nguyên liệu trên máy tính/máy tính bảng. Để đồng bộ chặt chẽ với các kiểu dữ liệu tĩnh và tập hằng số (`enums`) trả về từ Backend Java Spring Boot, đồng thời giảm bớt sự phức tạp của Server-Side Rendering (SSR) không thực sự cần thiết cho ứng dụng quản lý vận hành quán, nhóm cần một giải pháp frontend định kiểu mạnh, tốc độ build nhanh và dễ dàng triển khai.

## Quyết định (Decision)
Nhóm quyết định sử dụng **React** với ngôn ngữ **TypeScript** kết hợp công cụ build **Vite** làm nền tảng phát triển toàn bộ giao diện người dùng theo mô hình **Single Page Application (SPA)**.

## Hệ quả (Consequences / Trade-offs)
* **Ưu điểm:**
  * **Kiểm soát kiểu dữ liệu chặt chẽ (Type-safety):** TypeScript giúp định nghĩa các `interface`, `type` và `enum` đồng bộ 1:1 với các lớp DTO và Request Validation (`spring-boot-starter-validation`) từ phía Spring Boot, hạn chế tối đa lỗi sai lệch dữ liệu khi tích hợp API.
  * **Tốc độ phát triển & Build cực nhanh:** Vite giúp thời gian khởi động môi trường dev (dev server) gần như tức thì và tính năng Hot Module Replacement (HMR) cực kỳ mượt mà, giúp tăng năng suất của developer.
  * **Trải nghiệm SPA mượt mà:** Khách hàng và nhân viên khi thao tác (chuyển đổi giữa các tab menu đồ uống, thêm vào giỏ hàng, cập nhật trạng thái đơn, xem dashboard) sẽ không bị tải lại trang, mang lại cảm giác mượt mà như một ứng dụng độc lập.
  * **Tái sử dụng linh hoạt & Triển khai đơn giản:** Dễ dàng xây dựng giao diện đặt món và bố cục bảng điều khiển (Dashboard) cho nhân viên Barista/Admin trên cùng một codebase TypeScript; sản phẩm sau khi build chỉ là các file tĩnh dễ dàng đóng gói hoặc host trên các dịch vụ lưu trữ tĩnh.
* **Nhược điểm (Trade-off):**
  * **SEO hạn chế:** Vì là mô hình Client-Side Rendering (CSR), các công cụ tìm kiếm sẽ khó đọc nội dung trang web hơn so với SSR. *Tuy nhiên, đây là sự đánh đổi chấp nhận được vì hệ thống tập trung vào nghiệp vụ đặt món tại quầy/bàn và quản lý nội bộ cửa hàng cà phê.*
  * **Thời gian tải trang đầu tiên (Initial Load Time):** Có thể chậm hơn một chút nếu kích thước bundle lớn. Nhóm sẽ áp dụng kỹ thuật Code Splitting (Lazy load component/route) để khắc phục nhược điểm này.