# TÀI LIỆU QUY CHUẨN KIẾN TRÚC & REST API — BREWLITE

> **Dự án:** Hệ thống Quản lý Quán Cà Phê (Brewlite)
> **Phiên bản:** 1.0.0
> **Base URL (Local):** `http://localhost:8080/api`
> **Mục đích:** Bản giao ước API (API Contract) giữa Frontend và Backend, thống nhất kiến trúc code và quy trình làm việc nhóm.

## MỤC LỤC

1. [Tổng quan Kiến trúc 3 Tầng (3-Tier Architecture)](#1-tổng-quan-kiến-trúc-3-tầng)

2. [Chi tiết các Tầng & Code Mẫu (JPA / JDBC)](#2-chi-tiết-các-tầng--code-mẫu)

3. [Quy chuẩn định dạng Response & Status Code](#3-quy-chuẩn-định-dạng-response--status-code)

4. [Chi tiết các Endpoint API (Brewlite)](#4-chi-tiết-các-endpoint-api-brewlite)

5. [Quy trình phối hợp FE - BE & Ví dụ gọi API](#5-quy-trình-phối-hợp-fe---be--ví-dụ-gọi-api)

6. [Quy tắc Git & Làm việc nhóm](#6-quy-tắc-git--làm-việc-nhóm)

## 1. Tổng quan Kiến trúc 3 Tầng

Dự án Brewlite áp dụng mô hình **3-Tier Architecture** chuẩn công nghiệp:

```
[ Trình duyệt / Client (React/Vue/Mobile) ]
                 │
                 ▼  (HTTP Request: JSON qua REST API)
┌───────────────────────────────────────────────┐
│              CONTROLLER LAYER                 │
│  - Nhận HTTP Request (GET, POST, PUT, DELETE) │
│  - Validate dữ liệu đầu vào (@Valid)          │
│  - Trả về HTTP Response (JSON + HTTP Status)  │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│                SERVICE LAYER                  │
│  - Xử lý logic nghiệp vụ (Tính toán, tích điểm)│
│  - Quản lý giao dịch (@Transactional)         │
│  - Cầu nối trung gian giữa Controller và Repo │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│               REPOSITORY LAYER                │
│  - Chịu trách nhiệm tương tác trực tiếp CSDL  │
│  - Kế thừa JpaRepository (Spring Data JPA)    │
│  - Ánh xạ dữ liệu thành Java Object (Entity)  │
└──────────────────────┬────────────────────────┘
                       ▼
               [ Cơ Sở Dữ Liệu ]

```

**Tại sao lại chia thành nhiều tầng?**

* **Tách biệt trách nhiệm:** Controller không được gọi trực tiếp Database, Repository không xử lý giao diện.

* **Làm việc nhóm dễ dàng:** Người phụ trách DB viết Repository, người làm logic viết Service.

## 2. Chi tiết các Tầng & Code Mẫu

### Tầng 1: Domain/Entity & DTO

* **Entity:** Đại diện cho bảng trong Database (VD: `Product`, `Ingredient`).

* **DTO (Data Transfer Object):** Dữ liệu Frontend gửi lên hoặc trả về (giấu các trường nhạy cảm).

### Tầng 2: Repository (Truy vấn CSDL)

Đánh dấu bằng `@Repository`. Dự án Brewlite sử dụng `JpaRepository` để tự động hóa SQL:

```
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory_Id(Long categoryId);
}

```

### Tầng 3: Service (Nghiệp vụ ứng dụng)

Đánh dấu bằng `@Service`. Đặt `@Transactional` để đảm bảo toàn vẹn dữ liệu.

```
@Service
public class LoyaltyService {
    @Autowired
    private LoyaltyTransactionRepo loyaltyTransactionRepo;

    @Transactional
    public void addPoints(Long userId, int points) {
        // Logic cộng điểm tích lũy cho khách hàng mua cafe
    }
}

```

### Tầng 4: Controller (Giao tiếp API)

Sử dụng `@RestController` và `ResponseEntity` để trả về đúng cấu trúc JSON chuẩn.

## 3. Quy chuẩn định dạng Response & Status Code

### Phản hồi thành công (Success Response)

```
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... } 
}

```

### Phản hồi thất bại (Error Response)

```
{
  "success": false,
  "status": 400,
  "message": "Dữ liệu gửi lên không hợp lệ",
  "errors": {
    "productName": "Tên món không được để trống"
  }
}

```

### Bảng mã trạng thái HTTP (Status Codes)

| Mã | Tên | Ý nghĩa | 
| ----- | ----- | ----- | 
| **200** | OK | Lấy dữ liệu (GET) hoặc cập nhật (PUT) thành công | 
| **201** | Created | Tạo mới thành công (Đăng ký, đặt món, nhập kho) | 
| **400** | Bad Request | Dữ liệu sai định dạng hoặc thiếu thông tin | 
| **401** | Unauthorized | Chưa đăng nhập hoặc token không hợp lệ | 
| **403** | Forbidden | Không có quyền truy cập (VD: Nhân viên xóa món) | 
| **404** | Not Found | Không tìm thấy dữ liệu (Món, Đơn hàng...) | 
| **500** | Server Error | Lỗi hệ thống Backend | 

## 4. Chi tiết các Endpoint API (Brewlite)

### 4.1. Hệ thống & Xác thực (Auth)

* **`GET /api/health`**: Kiểm tra trạng thái server Backend.

* **`POST /api/auth/login`**: Đăng nhập (dành cho Admin, Barista, Cashier).

  * *Response*: Trả về JWT Token và thông tin User.

### 4.2. Quản lý Thực đơn (Menu & Products)

* **`GET /api/categories`**: Lấy danh sách danh mục (Cà phê, Trà, Bánh...).

* **`GET /api/products`**

  * *Query Params*: `?categoryId=1&search=latte`

  * *Response*: Danh sách món uống/bánh.

* **`POST /api/products`** (Admin)

  * *Request Body*: `name`, `price`, `categoryId`, `imageUrl`, `description`...

### 4.3. Quản lý Kho & Nguyên liệu (Inventory)

* **`GET /api/ingredients`**: Xem tồn kho nguyên liệu (Cà phê hạt, Sữa tươi, Đường...).

* **`POST /api/inventory/transactions`**: Nhập/Xuất kho nguyên liệu.

  * *Request Body*: `ingredientId`, `quantity`, `type` (IMPORT/EXPORT), `note`.

### 4.4. Đơn hàng & Bán hàng (Orders)

* **`POST /api/orders`**: Tạo đơn hàng mới (POS).

  * *Request Body*:

    ```
    {
      "customerId": 15,
      "orderType": "DINE_IN", 
      "paymentMethod": "CASH",
      "items": [
        { "productId": 3, "quantity": 2, "note": "Ít đá, ít ngọt" }
      ]
    }
    
    ```

* **`GET /api/orders/{id}`**: Xem chi tiết hóa đơn.

### 4.5. Khách hàng thành viên (Loyalty)

* **`GET /api/loyalty/{customerId}`**: Xem điểm tích lũy của khách hàng.

* **`POST /api/loyalty/transactions`**: Trừ điểm khi khách hàng đổi thưởng.

## 5. Quy trình phối hợp FE - BE & Ví dụ gọi API

**Quy trình 4 Bước:**

1. **Họp chốt API Contract:** Thống nhất URL, Request, Response.

2. **Làm việc độc lập:** FE dùng Mock Data. BE viết code và test Postman.

3. **Cấu hình CORS:** BE mở CORS để FE có thể gọi API.

4. **Ghép nối (Integration):** FE thay link Mock bằng link thật của BE.

**Ví dụ FE gọi API tạo Đơn hàng (JS Fetch):**

```
const API_BASE_URL = "http://localhost:8080/api";

async function createOrder(cartItems) {
    const payload = {
        customerId: 1, 
        orderType: "TAKEAWAY",
        paymentMethod: "CASH",
        items: cartItems
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        if (response.ok) {
            alert(`Thanh toán thành công! Mã hóa đơn: ${result.data.id}`);
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (err) {
        console.error("Lỗi hệ thống:", err);
    }
}

```

## 6. Quy tắc Git & Làm việc nhóm

1. **Tuyệt đối không code trực tiếp trên nhánh `main`**.

2. **Quy trình làm việc hàng ngày:**

   * Kéo code mới nhất từ main: `git checkout main` -> `git pull origin main`

   * Chuyển sang nhánh cá nhân: `git checkout ten-nhanh` -> `git merge main`

   * Code chức năng xong: `git add .` -> `git commit -m "feat: Thêm API đặt hàng"` -> `git push origin ten-nhanh`

3. **Tạo Pull Request (PR)** trên GitHub để nhóm review trước khi gộp vào `main`.