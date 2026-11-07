# Hướng dẫn xây dựng tầng Service trong Spring Boot

Sau khi đã có **JPA Entity / Repository** (giao tiếp Database) và **DTO** (giao tiếp Frontend), tầng **Service** sẽ đứng ở giữa để xử lý logic và luân chuyển dữ liệu.

## 1. Tầng Service dùng để làm gì?
* **Xử lý Business Logic (Nghiệp vụ):** Tính toán thành tiền, kiểm tra tồn kho, kiểm tra xem tên danh mục đã tồn tại chưa...
* **Mapping (Chuyển đổi dữ liệu):**
  * Nhận `Request DTO` từ Controller -> Chuyển thành `Entity` -> Gọi `Repository` lưu xuống Database.
  * Lấy `Entity` từ Database thông qua `Repository` -> Chuyển thành `Response DTO` -> Trả về cho Controller.
* **Quản lý Transaction:** Đảm bảo tính toàn vẹn dữ liệu (ví dụ: đang lưu hóa đơn mà bị lỗi thì hệ thống phải tự động rollback lại số lượng tồn kho).

## 2. Cấu trúc thư mục chuẩn (Best Practice)
Trong package `vn.doan.service`, chúng ta nên chia làm 2 phần (Interface và Class thực thi) để dễ dàng bảo trì và mở rộng:
* `vn.doan.service`: Chứa các **Interface** (chỉ định nghĩa tên hàm, đầu vào, đầu ra).
* `vn.doan.service.impl`: Chứa các **Class** thực thi (implement) các interface đó, đây mới là nơi viết code logic thật sự.

---

## 3. Ví dụ thực tế: Xây dựng Service cho `Category`

### Bước 3.1: Tạo Interface `CategoryService` (Khai báo tính năng)
Tạo file `CategoryService.java` trong thư mục `vn.doan.service`. 
*Lưu ý: Đầu vào và đầu ra ở tầng Service nên là DTO, hạn chế tối đa việc trả Entity trực tiếp ra ngoài.*

```java
package vn.doan.service;

import vn.doan.dto.request.CategoryCreateRequest;
import vn.doan.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    // Thêm mới danh mục
    CategoryResponse createCategory(CategoryCreateRequest request);
    
    // Lấy danh sách tất cả danh mục
    List<CategoryResponse> getAllCategories();
    
    // Tìm danh mục theo ID
    CategoryResponse getCategoryById(String id);
}
```

### Bước 3.2: Tạo Class thực thi `CategoryServiceImpl` (Viết logic)
Tạo file `CategoryServiceImpl.java` trong thư mục `vn.doan.service.impl`. Bắt buộc phải gắn annotation `@Service`.

```java
package vn.doan.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Category;
import vn.doan.dto.request.CategoryCreateRequest;
import vn.doan.dto.response.CategoryResponse;
import vn.doan.repository.CategoryRepository;
import vn.doan.service.CategoryService;

import java.util.List;
import java.util.stream.Collectors;

@Service
<<<<<<< HEAD
public class CategoryServiceImpl implements CategoryService {
=======
public class CategoryService {
>>>>>>> c42e5fe65974e8af6a5fba71fbddb7dfccc36e65

    // Tiêm phụ thuộc (Dependency Injection) Repository vào để tương tác với Database
    private final CategoryRepository categoryRepository;

<<<<<<< HEAD
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
=======
    public CategoryService(CategoryRepository categoryRepository) {
>>>>>>> c42e5fe65974e8af6a5fba71fbddb7dfccc36e65
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional // Bắt buộc cho các thao tác thay đổi dữ liệu
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        // 1. Validate logic nghiệp vụ (nếu có)
        
        // 2. Map DTO -> Entity
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        
        // 3. Gọi Repository lưu xuống DB
        Category savedCategory = categoryRepository.save(category);
        
        // 4. Map Entity -> DTO để trả về
        return mapToResponse(savedCategory);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        // Lấy list Entity từ DB, sau đó dùng Stream API map sang list DTO
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(String id) {
        // Tìm kiếm trong DB, nếu không thấy thì quăng lỗi
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
        
        return mapToResponse(category);
    }

    // --- HÀM TIỆN ÍCH DÙNG CHUNG (MAPPING) ---
    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        return response;
    }
}
```

## 4. Các Lưu ý Quan trọng (Cần nhớ)
1. **Luôn có `@Service`:** Quên cái này là Spring Boot sẽ không nhận diện được Bean và báo lỗi ngay khi khởi chạy.
2. **Dùng `@Transactional`:** Các hàm làm thay đổi dữ liệu (`create`, `update`, `delete`) bắt buộc nên gắn `@Transactional` để DB tự động rollback (hủy bỏ) dữ liệu nếu có Exception xảy ra giữa chừng. Không cần gắn cho các hàm chỉ đọc (GET).
3. **Tiêm phụ thuộc (Dependency Injection):** Nên dùng Constructor Injection thay vì gắn `@Autowired` trực tiếp lên field. (Khai báo `private final...` và viết Constructor như ví dụ).
4. **Xử lý lỗi (Exception):** Ở hàm `findById`, hãy dùng `.orElseThrow()` để ném ra lỗi nếu không tìm thấy dữ liệu. Về sau có thể bắt lỗi này ở tầng Exception Handler chung để trả về mã 404 cho Frontend.