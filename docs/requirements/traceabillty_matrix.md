| Mã yêu cầu | Use-case/User Story | Thiết kế/Sơ đồ | Code/API | Test |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | US-01 Xem danh sách đồ uống theo danh mục | `Class (Product, Category)`, `C4-CatalogModule` | `GET /api/products`, `GET /api/categories`, `GET /api/menu/category/{categoryId}` | `API-T01` |
| **FR-02** | US-02 Tìm món theo tên | `Usecase-Overview-Diagram` | `Lọc theo tên ở frontend` | `UI-T01` |
| **FR-03** | US-03 Xem chi tiết món (tên, giá, mô tả, ảnh) | `Class (Product)` | `GET /api/products/{id}`, `GET /api/menu/{id}` | `API-T03` |
| **FR-04** | US-04 Chọn tùy chọn (size, đường, đá, topping) | `Class (Topping, CartItem)` | `GET /api/toppings`, `GET /api/products/{id}` | `API-T04` |
| **FR-05** | UC-01 Quản lý giỏ hàng (thêm món) | `Activity (Luồng end-to-end)`, `Class (Cart, CartItem)` | `PUT /api/users/{userId}/cart` | `API-T05` |
| **FR-06** | UC-01 Quản lý giỏ hàng (sửa số lượng, xóa món) | `Activity-01 (Luồng end-to-end)`, `Class (Cart, CartItem)` | `PUT /api/users/{userId}/cart` | `API-T06` |
| **FR-07** | UC-01 Quản lý giỏ hàng (giữ giỏ khi tải lại trang) | `Class (Cart)`, `C4-CartModule` | `GET /api/users/{userId}/cart` | `API-T07` |
| **FR-08** | UC-02 Đăng ký tài khoản | `Usecase-Overview-Diagram`, `Class (User)`, `C4-AuthModule` | `POST /api/auth/register` | `API-T08` |
| **FR-09** | UC-03 Đăng nhập, đăng xuất | `Usecase-Overview-Diagram` | `POST /api/auth/login`; không có API logout — frontend xóa session tại `components/brewlite/brewlite-app.tsx` và `components/brewlite/role-shell.tsx` | `API-T09` |
| **FR-10** | UC-03 Đăng nhập, phân quyền khách hàng và nhân viên | `Class (User.role)` | `POST /api/auth/login` (trả vai trò) | `API-T10` |
| **FR-11** | UC-04 Đặt và thanh toán đơn hàng (luồng chính bước 4, 8) | `Usecase-Center-Diagram`, `Activity-01`, `Class (Order, OrderItem)`, `C4-OrderModule` | `POST /api/orders` | `INT-T01` |
| **FR-12** | UC-04 Đặt và thanh toán đơn hàng (ngoại lệ E1: giỏ rỗng) | `Usecase-Center-Diagram`, `Activity-01` | `POST /api/orders` | `API-T11` |
| **FR-13** | UC-04 Đặt và thanh toán đơn hàng | `Usecase-Center-Diagram`, `Activity-01`, `Class (Payment)`, `C4-PaymentModule` | `POST /api/payments/create`, `POST /api/payments/confirm` | `INT-T02` |
| **FR-14** | UC-04 Đặt và thanh toán đơn hàng (A5, A6, E7: hủy, thanh toán lại, thất bại) | `Activity-01`, `Class (Payment, PaymentStatus)`, `C4-PaymentModule` | `POST /api/payments/confirm`; hủy dùng `PATCH /api/orders/{id}/status`, thanh toán lại dùng `POST /api/orders`; frontend mô phỏng thất bại tại `components/payment/mock-payment-modal.tsx` | `INT-T03` |
| **FR-15** | US-05 Xem lịch sử đơn hàng | `Class (Order)` | Không có API lịch sử riêng; frontend dùng `GET /api/orders` rồi lọc đơn theo khách hàng tại `components/brewlite/brewlite-app.tsx`, hiển thị tại `components/brewlite/app-header.tsx` | `API-T12` |
| **FR-16** | US-06 Xem chi tiết một đơn cũ | `Class (Order, OrderItem)` | `GET /api/orders/{id}` | `API-T13` |
| **FR-17** | UC-05 Xử lý đơn của nhân viên quầy (xem danh sách đơn mới) | `Activity-01 (làn Nhân viên quầy)`, `C4-OrderModule` | `GET /api/orders?status={OrderStatus}`; backend chưa lọc đơn đã thanh toán, frontend tải/lọc/hiển thị đơn tại `components/brewlite/staff-orders-dashboard.tsx` | `API-T14` |
| **FR-18** | UC-05 Xử lý đơn của nhân viên quầy (Mới → Đang pha → Hoàn tất) | `Activity-01 (làn Nhân viên quầy)`, `Class (OrderStatus)` | `PATCH /api/orders/{id}/status` | `INT-T04` |
| **FR-19** | UC-06 Theo dõi trạng thái đơn hàng | `Activity-01`, `Class (OrderStatus)` | `GET /api/orders/{id}` | `INT-T05` |
| **FR-20** | UC-07 Quản lý món (Quản lý cửa hàng) | `Class (Product, Category)`, `C4-CatalogModule` | `POST /api/admin/products`, `PUT /api/admin/products/{id}`, `DELETE /api/admin/products/{id}` | `API-T15` |
| **FR-21** | Ngoài phạm vi (Task 1.1 mục 3.3: không tích hợp thanh toán thật) | - | Không có API; thanh toán chạy qua `/api/payments/*` ở chế độ mô phỏng | N/A (Won't) |
| **FR-22** | Ngoài phạm vi (Task 1.3 mục 5: không giao hàng tận nơi) | - | Không có API | N/A (Won't) |
| **FR-23** | Ngoài phạm vi (Task 1.3 mục 5: không thanh toán tiền mặt) | - | Không có API | N/A (Won't) |
| **FR-24** | UC-05 Xử lý đơn (xem tình trạng thanh toán, AC-12) | `Activity-01`, `Class (PaymentStatus)` | `GET /api/orders`, `GET /api/orders/{id}`, `PATCH /api/orders/{id}/status`; frontend hiển thị/sắp xếp tình trạng thanh toán tại `components/brewlite/staff-orders-dashboard.tsx` | `INT-T06` |