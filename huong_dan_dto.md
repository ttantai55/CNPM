# Hướng dẫn tạo DTO (Data Transfer Object) cho Đồ án

Sau khi đã hoàn thiện tầng `Entity`, bước tiếp theo chúng ta cần làm là tạo các **DTO**. Dưới đây là quy chuẩn và cách làm chi tiết cho nhóm.

## 1. DTO là gì và Tại sao phải dùng?
* **DTO (Data Transfer Object)** là một object đơn giản dùng để "chở" dữ liệu giữa Client (Frontend/Postman) và Server (Backend).
* **Tại sao không dùng luôn Entity?**
  * **Bảo mật:** Entity chứa toàn bộ cấu trúc DB, có những trường ta không muốn Frontend thấy (ví dụ: `password`, `createAt`, `updateAt`).
  * **Tránh lỗi đệ quy (Infinite Loop):** Khi có quan hệ 1-Nhiều (như `Category` và `Product`), nếu trả trực tiếp Entity ra JSON, nó sẽ bị lặp vô tận (Category gọi Product -> Product gọi Category...).
  * **Validation:** Tách biệt việc validate dữ liệu đầu vào (Request) với dữ liệu lưu trong Database.

## 2. Cấu trúc thư mục (Package)
Bạn nên tạo một package mới tên là `vn.doan.dto`. Để gọn gàng hơn, hãy chia thành 2 thư mục con:
* `vn.doan.dto.request`: Chứa các class nhận dữ liệu từ Frontend gửi lên (Create, Update).
* `vn.doan.dto.response`: Chứa các class trả dữ liệu từ Backend về cho Frontend.

## 3. Ví dụ thực tế: Cấu hình DTO cho `Product`

Giả sử Frontend cần chức năng: **Thêm mới một Sản phẩm (Product)**.

### Bước 3.1: Tạo Request DTO (Nhận dữ liệu)
Tạo file `ProductCreateRequest.java` trong package `dto.request`.
*Lưu ý: Không cần trường `id` vì ID sẽ do database tự sinh. Bổ sung các annotation validation.*

```java
package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ProductCreateRequest {
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @Min(value = 0, message = "Giá sản phẩm không được âm")
    private long price;

    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private long stockQuantity;

    private String description;
    private String imageUrl;

    @NotBlank(message = "ID Danh mục không được để trống")
    private String categoryId; // Chỉ nhận ID của Category, không nhận nguyên object

    // Bổ sung Constructor rỗng, Constructor đầy đủ và toàn bộ Getters/Setters ở đây
    // ...
}
```

### Bước 3.2: Tạo Response DTO (Trả dữ liệu về)
Tạo file `ProductResponse.java` trong package `dto.response`.
*Lưu ý: Lúc trả về cần `id`. Có thể "làm phẳng" dữ liệu (chỉ trả về tên danh mục thay vì cả object Category).*

```java
package vn.doan.dto.response;

public class ProductResponse {
    private String id;
    private String name;
    private long price;
    private long stockQuantity;
    private String description;
    private String imageUrl;
    private boolean status;
    
    // Thay vì trả nguyên object Category, ta chỉ trả về tên Category cho FE dễ hiển thị
    private String categoryName; 

    // Bổ sung Constructor rỗng, Constructor đầy đủ và toàn bộ Getters/Setters ở đây
    // ...
}
```

## 4. Cách chuyển đổi (Mapping) giữa Entity và DTO
Việc chuyển đổi này thường được thực hiện ở tầng **Service**.

**Ví dụ trong `ProductService.java`:**

```java
// 1. Convert từ DTO -> Entity (Khi thêm mới)
public Product mapToEntity(ProductCreateRequest request, Category category) {
    Product product = new Product();
    product.setName(request.getName());
    product.setPrice(request.getPrice());
    product.setStockQuantity(request.getStockQuantity());
    product.setDescription(request.getDescription());
    product.setImageUrl(request.getImageUrl());
    product.activate(); // set mặc định status = true
    product.setCategory(category); // Gán object Category tìm được từ DB
    return product;
}

// 2. Convert từ Entity -> DTO (Khi trả về kết quả)
public ProductResponse mapToResponse(Product entity) {
    ProductResponse response = new ProductResponse();
    response.setId(entity.getId());
    response.setName(entity.getName());
    response.setPrice(entity.getPrice());
    response.setStockQuantity(entity.getStockQuantity());
    response.setDescription(entity.getDescription());
    response.setImageUrl(entity.getImageUrl());
    response.setStatus(entity.isStatus());
    
    // Tránh lỗi vòng lặp: Chỉ lấy tên category
    if (entity.getCategory() != null) {
        response.setCategoryName(entity.getCategory().getName());
    }
    
    return response;
}
```

## 5. Lời khuyên bổ sung (Best Practices)
1. **Dùng Java Record (Nếu dùng Java 14+):** DTO bản chất là những data container không thay đổi (immutable), dùng `record` sẽ giúp tiết kiệm việc viết Getter/Setter/Constructor.
2. **Sử dụng thư viện Mapping:** Nếu dự án lớn, việc viết hàm map thủ công `mapToEntity` hay `mapToResponse` rất mất thời gian. Nhóm có thể tìm hiểu thêm thư viện **MapStruct** hoặc **ModelMapper** để tự động hóa việc này.
3. **Thêm Validation:** Đừng quên thêm `@Valid` ở tầng Controller để kích hoạt các rule như `@NotBlank`, `@Min` bên trong class DTO nhé.