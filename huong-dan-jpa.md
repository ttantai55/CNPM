# Hướng dẫn toàn tập: Áp dụng JPA & Spring Data JPA cho đồ án

Tài liệu này hướng dẫn cách chuyển đổi các class Domain (POJO) thông thường thành các Entity của JPA, giúp tự động hóa hoàn toàn việc thao tác với cơ sở dữ liệu (PostgreSQL/MySQL) mà không cần viết các câu lệnh SQL hay Repository thủ công.

---

## Bước 1: Khai báo thư viện (Dependencies)
Đảm bảo trong file `pom.xml` (nếu dùng Maven) của bạn đã có các thư viện sau:
```xml
<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<!-- Driver cho PostgreSQL (Hoặc MySQL tùy nhóm bạn dùng) -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

## Bước 2: Ánh xạ Class cơ bản (Basic Entity Mapping)
Dùng class `Product` làm ví dụ. Bạn cần thêm các Annotation (nhãn) của thư viện `jakarta.persistence.*`.

```java
package vn.doan.domain;

import jakarta.persistence.*;

@Entity // 1. Báo cho Spring biết đây là một bảng trong CSDL
@Table(name = "products") // 2. Đặt tên bảng thực tế trong DB
public class Product {

    @Id // 3. Đánh dấu đây là Khóa chính (Primary Key)
    // 4. Cách tạo ID tự động:
    // Dùng UUID nếu ID là kiểu String: @GeneratedValue(strategy = GenerationType.UUID)
    // Dùng IDENTITY nếu ID là số tự tăng (int/long): @GeneratedValue(strategy = GenerationType.IDENTITY)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "product_name", nullable = false, length = 100) 
    // 5. Cấu hình cột: Đổi tên cột, không cho phép null, độ dài tối đa 100
    private String name;

    @Column(nullable = false)
    private long price;

    @Column(name = "stock_quantity")
    private long stockQuantity;

    // Các trường không khai báo @Column sẽ tự lấy tên biến làm tên cột
    private String description;
    
    private boolean status;

    // BẮT BUỘC: JPA yêu cầu phải luôn có constructor rỗng (No-args constructor)
    public Product() {}
    
    // ... Các constructor có tham số, getters, setters, và logic khác giữ nguyên
}
```

---

## Bước 3: Thiết lập quan hệ (Relationship Mapping - CỰC KỲ QUAN TRỌNG)
Trong hệ thống bán hàng, 1 Đơn hàng (`Order`) có nhiều Dòng chi tiết (`OrderItem`). Đây là quan hệ **1-Nhiều (One-to-Many)**.

### 3.1. Phía "Nhiều" - OrderItem (Chứa khóa ngoại)
```java
package vn.doan.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Quan hệ Nhiều - 1: Nhiều OrderItem thuộc về 1 Order
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "order_id", nullable = false) // Đây chính là Khóa ngoại
    private Order order; 
    // LƯU Ý: Khai báo kiểu đối tượng Order, không dùng String orderId nữa.

    private long quantity;
    private long price;

    public OrderItem() {}
    
    // ... getters, setters
}
```

### 3.2. Phía "Một" - Order (Chủ quản)
```java
package vn.doan.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import vn.doan.domain.enums.OrderStatus;

@Entity
@Table(name = "orders")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "customer_id")
    private String customerId; // Tạm dùng String nếu chưa map bảng Customer

    @Enumerated(EnumType.STRING) // Lưu giá trị Enum dưới dạng chữ (chữ PENDING thay vì số 0)
    private OrderStatus status = OrderStatus.PENDING;

    // Quan hệ 1 - Nhiều: 1 Order có nhiều OrderItem
    // mappedBy = "order" chỉ ra tên biến Order khai báo bên OrderItem
    // cascade = CascadeType.ALL: Khi lưu Order thì tự động lưu luôn các OrderItem bên trong
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {}
    
    // ... getters, setters, và các hàm nghiệp vụ (addItem, calculateTotal...)
}
```

---

## Bước 4: Tạo Repository "Phép thuật" (Tự động hóa SQL)
Bạn KHÔNG cần viết class `implements` nào cả. Chỉ cần tạo một `interface` kế thừa `JpaRepository`.

### 4.1. Định nghĩa Repository
```java
package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Product;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    // 1. Kế thừa JpaRepository<Tên_Class_Entity, Kiểu_Dữ_Liệu_Của_ID>
    
    // Tới đây bạn đã MIỄN PHÍ có sẵn các hàm:
    // - save(Product p)        (Thêm/Sửa)
    // - findById(String id)    (Tìm 1 dòng theo ID)
    // - findAll()              (Lấy toàn bộ)
    // - deleteById(String id)  (Xóa theo ID)
    
    // 2. Tự định nghĩa hàm bằng quy tắc đặt tên (JPA tự sinh SQL):
    
    // Tìm các món đang mở bán
    List<Product> findByStatusTrue();
    
    // Tìm món theo tên (Tương đương: SELECT * FROM products WHERE name LIKE '%name%')
    List<Product> findByNameContainingIgnoreCase(String name);
}
```

```java
package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Order;
import vn.doan.domain.enums.OrderStatus;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    
    // Lấy toàn bộ đơn hàng của 1 khách hàng
    List<Order> findByCustomerId(String customerId);
    
    // Lấy các đơn hàng đang chờ thanh toán
    List<Order> findByStatus(OrderStatus status);
}
```

---

## Bước 5: Cách sử dụng trong Service
Khi cần thao tác với DB, bạn chỉ cần gọi interface Repo đó ra dùng thông qua `Dependency Injection`.

```java
package vn.doan.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import vn.doan.domain.Order;
import vn.doan.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired // Spring tự động tiêm OrderRepository vào đây
    private OrderRepository orderRepository;

    public void createOrder(Order newOrder) {
        // Chỉ với 1 dòng lệnh này, JPA sẽ tự động tạo câu INSERT INTO orders...
        // Và nhờ cấu hình cascade, nó sẽ INSERT INTO order_items luôn!
        orderRepository.save(newOrder); 
    }

    public Order getOrderInfo(String orderId) {
        // Tự động gõ câu lệnh SELECT * FROM orders WHERE id = ?
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
    }
}
```

## Tổng kết Lợi ích
1. **Zero SQL**: Không cần viết tay câu SQL nào, tránh lỗi syntax.
2. **Dễ bảo trì**: Thay đổi tên cột hay thêm cột chỉ cần đổi trong file Entity, không phải sửa cả đống file Repository cũ.
3. **Quản lý dữ liệu cha con dễ dàng**: Lưu 1 `Order` tự động lưu cả List `OrderItem` thông qua Cascade.