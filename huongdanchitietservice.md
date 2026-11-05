# Hướng Dẫn Kỹ Thuật Xây Dựng Tầng Service (Spring Boot & Spring Data JPA)

Tài liệu này hướng dẫn quy chuẩn thiết kế và cài đặt tầng Service cho dự án Hệ thống Quản lý Bán Trà Sữa (Bubble Tea Management System), tối ưu hóa việc sử dụng Spring Data JPA, loại bỏ cấu trúc phân cấp rườm rà `impl/` và tối ưu hiệu năng cơ sở dữ liệu.

---

## 1. Kiến Trúc Cấu Trúc Thư Mục (Flat Structure)

Thay vì chia cặp `interface` và thư mục con `impl/` (vốn gây phân mảnh mã nguồn khi dự án không có nhu cầu đa triển khai cùng một service), dự án áp dụng **Concrete Service Class**. Tất cả các lớp nghiệp vụ nằm trực tiếp trong package `vn.doan.service`.

```text
src/main/java/vn/doan/
├── domain/                    # Các JPA Entities và Enums (Order, Product, OrderStatus...)
├── repository/                # Các Spring Data JPA Repositories (OrderRepository...)
├── dto/                       # Request và Response DTOs
│   ├── request/               # ProductCreateRequest, OrderCheckoutRequest...
│   └── response/              # OrderDetailResponse, ProductSummaryResponse...
├── service/                   # Tầng Service trực tiếp (KHÔNG dùng thư mục impl)
│   ├── AuthService.java
│   ├── UserService.java
│   ├── ProductService.java
│   ├── CategoryService.java
│   ├── OrderService.java
│   ├── PaymentService.java
│   └── InventoryService.java
└── controller/                # Tầng REST Controllers
```

> **Lưu ý:** Nếu trong tương lai có service cần interface (ví dụ cổng thanh toán cần đa hình giữa VNPay, MoMo, VietQR), hãy đặt interface và class triển khai ngang cấp ngay trong package `service/` với quy ước đặt tên:
> * Interface: `PaymentGateway.java`
> * Class triển khai: `VietQRPaymentGateway.java`, `MoMoPaymentGateway.java`

---

## 2. Tiêu Chuẩn Dependency Injection (DI)

* **Không sử dụng:** `@Autowired` trên thuộc tính (Field Injection) vì gây khó khăn khi viết Unit Test và che giấu sự phụ thuộc tuần hoàn (circular dependency).
* **Quy chuẩn:** Sử dụng **Constructor Injection** thông qua annotation `@RequiredArgsConstructor` của thư viện Lombok. Mọi Repository và Service phụ thuộc đều phải khai báo `private final`.

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // Lombok tự động sinh constructor nhận 2 repository trên
}
```

---

## 3. Quản Lý Giao Dịch (`@Transactional`) Với JPA

Spring Data JPA phụ thuộc chặt chẽ vào vòng đời Transaction của Hibernate Session/EntityManager. Áp dụng chuẩn sau cho toàn bộ các Service:

### 3.1. Phân định rõ ràng giữa Đọc và Ghi
* Đặt `@Transactional(readOnly = true)` ở mức **Class Level**: Tối ưu hóa hiệu năng Hibernate (không cần snapshot kiểm tra thay đổi dirty-checking, định tuyến đúng đến Read-Replica nếu có).
* Đặt `@Transactional` ở mức **Method Level** cho các phương thức có thao tác Tạo mới (`INSERT`), Cập nhật (`UPDATE`), hoặc Xóa (`DELETE`).

### 3.2. Tận dụng cơ chế Dirty Checking (Không lạm dụng `save()`)
Khi một entity được tải lên từ cơ sở dữ liệu bên trong một phương thức có `@Transactional`, entity đó ở trạng thái **Managed**. Hibernate sẽ tự động theo dõi các thay đổi và tự phát sinh câu lệnh `UPDATE` khi kết thúc phương thức:

* **Sai quy cách:**
  ```java
  @Transactional
  public void updatePrice(String productId, long newPrice) {
      Product product = productRepository.findById(productId).orElseThrow(...);
      product.setPrice(newPrice);
      productRepository.save(product); // THỪA THÃI, tăng tải không cần thiết
  }
  ```
* **Chuẩn quy cách:**
  ```java
  @Transactional
  public void updatePrice(String productId, long newPrice) {
      Product product = productRepository.findById(productId).orElseThrow(...);
      product.setPrice(newPrice);
      // Hibernate tự động đối soát và flush câu lệnh UPDATE khi commit transaction
  }
  ```
* **Khi nào mới dùng `save()`?** Chỉ gọi `repository.save(entity)` khi đối tượng là **mới hoàn toàn** (mới khởi tạo bằng `new`).

---

## 4. Xử Lý Ngoại Lệ & Kiểm Soát Lỗi Nghiệp Vụ

Tầng Service **không được trả về mã HTTP (200, 400, 404, 500)** và **không được nuốt ngoại lệ** bằng các khối `try-catch` trống.

1. **Khi không tìm thấy dữ liệu:** Ném ra các ngoại lệ dẫn xuất từ `RuntimeException` (ví dụ: `ResourceNotFoundException`, `EntityNotFoundException`).
2. **Khi vi phạm luật nghiệp vụ:** Ném ra ngoại lệ như `IllegalStateException` hoặc `BusinessValidationException`.
3. Tầng `@RestControllerAdvice` (ở package controller/exception) sẽ chịu trách nhiệm bắt các ngoại lệ này và chuyển thành format JSON chuẩn cho Client:

```json
{
  "timestamp": "2026-11-05T22:24:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Không thể chuyển trạng thái từ PENDING sang READY",
  "path": "/api/v1/orders/ORD-001/status"
}
```

---

