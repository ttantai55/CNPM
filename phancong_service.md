# Bảng Phân Công Nghiệp Vụ Tầng Service (Bubble Tea Management System)

Tài liệu này quy định chi tiết danh sách các lớp Service, các hàm cần cài đặt, luồng xử lý logic nghiệp vụ và ràng buộc kỹ thuật. Thành viên phụ trách từng nhóm chức năng căn cứ vào đây để tự viết mã nguồn chi tiết.

---

## 1. Nhóm Danh Mục & Sản Phẩm (Catalog Domain)

### Phụ trách: `CategoryService.java`
* **Mục tiêu:** Quản lý các nhóm phân loại thức uống (Trà sữa, Trà trái cây, Cà phê, Đá xay, Topping).
* **Danh sách hàm nghiệp vụ cần viết:**
  1. `getAllCategories()`:
     * Lấy toàn bộ danh mục đang hoạt động (`isActive = true`), sắp xếp theo thứ tự hiển thị (`displayOrder`).
  2. `getCategoryById(String categoryId)`:
     * Kiểm tra tồn tại, nếu không có ném ngoại lệ `ResourceNotFoundException`.
  3. `createCategory(CategoryCreateRequest request)`:
     * Kiểm tra trùng tên danh mục trong hệ thống.
     * Khởi tạo và lưu danh mục mới.
  4. `updateCategory(String categoryId, CategoryUpdateRequest request)`:
     * Tìm danh mục theo ID; cập nhật tên, mô tả, trạng thái hoạt động.
  5. `deleteCategory(String categoryId)`:
     * Kiểm tra ràng buộc: Nếu danh mục đang chứa sản phẩm thì không cho xóa cứng, ném lỗi yêu cầu xóa hoặc dời sản phẩm trước, hoặc chuyển trạng thái sang ẩn (`isActive = false`).

---

### Phụ trách: `ProductService.java`
* **Mục tiêu:** Quản lý thực đơn thức uống, đơn giá, biến thể kích thước và các loại topping kèm theo.
* **Danh sách hàm nghiệp vụ cần viết:**
  1. `getMenu(String categoryId, Boolean availableOnly)`:
     * Trả về danh sách món, hỗ trợ lọc theo danh mục hoặc trạng thái sẵn sàng phục vụ.
  2. `getProductDetail(String productId)`:
     * Lấy thông tin chi tiết một món kèm danh sách các loại topping tương thích có thể chọn thêm.
  3. `createProduct(ProductCreateRequest request)`:
     * Kiểm tra `request.getCategoryId()` có tồn tại hay không qua `CategoryRepository`.
     * Kiểm tra trùng tên món trong cùng một danh mục.
     * Khởi tạo entity `Product`, gán danh mục đã tìm thấy và lưu vào DB.
  4. `updateProduct(String productId, ProductUpdateRequest request)`:
     * Cập nhật giá bán, mô tả, hình ảnh và trạng thái hết hàng tạm thời (`isAvailable`).
  5. `toggleProductAvailability(String productId)`:
     * Dành cho Barista đổi trạng thái nhanh của món khi quầy tạm hết nguyên liệu pha chế.

---

## 2. Nhóm Bán Hàng & Tiến Trình Đơn Hàng (Order Domain - Core)

### Phụ trách: `OrderService.java`
* **Mục tiêu:** Tiếp nhận giỏ hàng, chốt đơn, điều phối máy trạng thái đơn hàng (Order State Machine) và lưu vết tiến độ pha chế.
* **Danh sách hàm nghiệp vụ cần viết:**
  1. `checkout(OrderCheckoutRequest request, String customerId)`:
     * **Xác thực:** Kiểm tra danh sách món, topping có tồn tại và đang mở bán (`isAvailable == true`) hay không.
     * **Tính toán tài chính độc lập:** Lấy giá gốc từ cơ sở dữ liệu để nhân với số lượng (tuyệt đối không dùng giá gửi lên từ Client). Tính tổng tiền đồ uống + tiền topping.
     * **Khởi tạo đơn hàng:** Tạo mã đơn tự động (`ORD-yyMMdd-XXXX`), tạo danh sách `OrderItem`, đặt trạng thái ban đầu là `PENDING`.
     * **Lưu vết:** Tạo bản ghi đầu tiên trong `OrderProcess` ghi nhận đơn mới được tạo bởi khách hàng.
  2. `changeOrderStatus(String orderId, OrderStatus newStatus, String updatedByUserId)`:
     * Tìm đơn hàng theo `orderId`.
     * Gọi hàm `order.changeStatus(newStatus)` trên domain entity (nơi chứa ma trận `canTransitionTo`). Nếu sai luồng, ném `IllegalStateException`.
     * Ghi nhận tiến trình mới vào bảng `OrderProcess` (lưu thời gian thực hiện, trạng thái mới, và người thực hiện).
     * **Sự kiện kèm theo:** Nếu `newStatus == OrderStatus.COMPLETED`, kích hoạt lời gọi nội bộ sang `InventoryService` để thực hiện khấu trừ nguyên liệu theo công thức.
  3. `cancelOrder(String orderId, String reason, String requestedByUserId)`:
     * Chỉ cho phép hủy nếu đơn đang ở trạng thái `PENDING` hoặc `CONFIRMED`.
     * Chuyển trạng thái đơn sang `CANCELED`, lưu lý do hủy vào `OrderProcess`.
  4. `getOrderDetails(String orderId)`:
     * Lấy thông tin chi tiết đơn hàng, danh sách món, danh sách topping của từng món và toàn bộ lịch sử các bước trạng thái từ `OrderProcess`.
  5. `getActiveOrdersForBarista()`:
     * Lấy toàn bộ các đơn đang trong quá trình chế biến (`CONFIRMED`, `PREPARING`, `READY`) để hiển thị trên màn hình bếp KDS, sắp xếp theo thời gian đặt sớm nhất trước (FIFO).

---

## 3. Nhóm Giao Dịch & Cổng Thanh Toán (Payment Domain)

### Phụ trách: `PaymentService.java`
* **Mục tiêu:** Khởi tạo yêu cầu thanh toán chuyển khoản, tạo dữ liệu VietQR và xử lý Webhook xác nhận giao dịch.
* **Danh sách hàm nghiệp vụ cần viết:**
  1. `initiateVietQRPayment(String orderId)`:
     * Tìm thông tin đơn hàng, kiểm tra đơn hàng có đang ở trạng thái hợp lệ để trả tiền (`PENDING`) hay không.
     * Kiểm tra xem đơn hàng đã có giao dịch thanh toán thành công trước đó chưa (tránh thanh toán trùng).
     * Tạo bản ghi `PaymentTransaction` với trạng thái `PENDING`, phương thức `VIETQR`.
     * Sinh chuỗi dữ liệu chuyển khoản gồm: Số tài khoản ngân hàng, Mã ngân hàng (BIN), Số tiền đơn hàng, Nội dung chuyển khoản chuẩn hóa (ví dụ: `TT ORD12345`).
     * Trả về URL ảnh mã QR (chuẩn VietQR) cho phía Frontend hiển thị.
  2. `processPaymentWebhook(WebhookPayload payload)`:
     * Nhận dữ liệu do Mock Payment Gateway hoặc dịch vụ ngân hàng gửi về.
     * Trích xuất mã đơn hàng từ nội dung chuyển khoản và số tiền thực nhận.
     * Kiểm tra số tiền nhận được có khớp với số tiền của đơn hàng hay không.
     * Cập nhật `PaymentTransaction` sang `SUCCESS` kèm mã giao dịch ngân hàng (`bankTransactionId`).
     * Gọi hàm `orderService.changeOrderStatus(orderId, OrderStatus.CONFIRMED, "SYSTEM_PAYMENT")` để thông báo đơn đã thanh toán xong cho quầy pha chế.
  3. `getPaymentStatusByOrder(String orderId)`:
     * Dùng cho client gọi polling kiểm tra xem đơn hàng đã được ghi nhận thanh toán thành công hay chưa.

---

## 4. Nhóm Quản Trị Kho Nguyên Vật Liệu (Inventory Domain)

### Phụ trách: `InventoryService.java`
* **Mục tiêu:** Quản lý nguyên liệu thô (Trà, sữa, bột kem béo, siro, trân châu), theo dõi tồn kho và lập phiếu xuất nhập.
* **Danh sách hàm nghiệp vụ cần viết:**
  1. `getAllIngredients()`:
     * Lấy danh sách nguyên vật liệu trong kho kèm số lượng tồn hiện tại và đơn vị tính (g, ml, kg, hộp).
  2. `createInventoryTransaction(InventoryTransactionRequest request, String staffId)`:
     * Dành cho Barista hoặc Quản lý kho tạo phiếu nhập hàng (`IMPORT`), xuất hủy/hao hụt (`WASTE`), hoặc điều chỉnh sau kiểm kê (`ADJUSTMENT`).
     * Tính toán số lượng tồn mới:
       * Nếu là `IMPORT`: Tồn kho = Tồn cũ + Số lượng nhập.
       * Nếu là `WASTE`: Kiểm tra tồn kho có đủ để trừ hay không; nếu đủ thì Tồn kho = Tồn cũ - Số lượng hủy.
     * Lưu thông tin vào bảng `InventoryTransaction` để phục vụ đối soát lịch sử kho.
  3. `deductIngredientsForOrder(String orderId)`:
     * Được tự động gọi khi đơn hàng hoàn thành (`COMPLETED`).
     * Dựa trên danh sách món và công thức định mức nguyên liệu (Recipe) để tính tổng nguyên liệu cần trừ.
     * Tạo tự động một bản ghi `InventoryTransaction` loại `AUTO_ORDER_EXPORT` gắn liền với `orderId`.
  4. `checkLowStockAlerts()`:
     * Lọc tất cả nguyên liệu có số lượng tồn kho $\le$ ngưỡng cảnh báo tối thiểu (`stockQuantity <= minAlertThreshold`).
     * Trả về danh sách cảnh báo để hiển thị chuông thông báo trên Dashboard của Quản lý.

---

## 5. Nhóm Xác Thực & Tài Khoản (Identity & Access Domain)

### Phụ trách: `UserService.java` & `AuthService.java`
* **Mục tiêu:** Quản lý tài khoản người dùng, hồ sơ khách hàng, phân quyền nhân viên (Customer, Barista, Admin) và xác thực JWT.
* **Danh sách hàm nghiệp vụ cần viết:**
  1. `register(RegisterRequest request)`:
     * Kiểm tra số điện thoại/email đã được đăng ký trước đó chưa.
     * Mã hóa mật khẩu bằng `BCryptPasswordEncoder`.
     * Tạo `User` với quyền mặc định là `ROLE_CUSTOMER`.
  2. `authenticate(LoginRequest request)`:
     * Xác thực tài khoản và mật khẩu.
     * Sinh JWT Token chứa `userId`, `role`, thời hạn sống của token.
  3. `getUserProfile(String userId)`:
     * Lấy thông tin cá nhân của người dùng đang đăng nhập.
  4. `updateStaffRole(String targetUserId, Role newRole)`:
     * Chỉ tài khoản có quyền `ROLE_ADMIN` mới được phép đổi vai trò người dùng (ví dụ: thăng cấp tài khoản thành `ROLE_BARISTA`).