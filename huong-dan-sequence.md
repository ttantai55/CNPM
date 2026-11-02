# Giải Thích Chi Tiết Sơ Đồ Tuần Tự (Sequence Diagram)
## Use-Case: Đặt Hàng và Thanh Toán Trực Tuyến (BrewLite)

Tài liệu này giải thích chi tiết kịch bản tương tác giữa 5 thành phần (Lifelines) trong sơ đồ tuần tự `sequence-checkout.puml` theo chuẩn kiến trúc của dự án BrewLite.

---

## 1. Danh Sách Các Thành Phần Tham Gia (5 Lifelines)

1. **Customer (Khách hàng):** Người dùng thao tác trên ứng dụng di động/web.
2. **Next.js UI (Frontend):** Giao diện ứng dụng người dùng (PWA/Mobile-first).
3. **NestJS API (Backend):** Máy chủ trung tâm xử lý các quy tắc nghiệp vụ và điều hướng dữ liệu.
4. **PostgreSQL (Database):** Cơ sở dữ liệu lưu trữ đơn hàng, tồn kho và lịch sử giao dịch.
5. **Payment (Sandbox):** Cổng thanh toán trực tuyến giả lập (MoMo / VNPay / Thẻ ngân hàng).

---

## 2. Chi Tiết Tiến Trình Tương Tác (Các Bước 1 - 29)

### Giai đoạn 1: Xác thực & Kiểm tra dữ liệu (Validation)

* **Bước 1 (Customer -> Next.js UI):** Khách hàng chọn xong món/topping và bấm nút *"Thanh toán"*.
* **Bước 2 (Next.js UI -> NestJS API):** Next.js UI gửi một HTTP POST request `/orders/checkout` tới NestJS API, đính kèm mã xác thực `Bearer JWT` (token người dùng) và mã `Idempotency-Key` độc nhất trong Header.
* **Bước 3 (NestJS API -> NestJS API):** NestJS API tiến hành giải mã token JWT để kiểm tra danh tính và validate cấu trúc giỏ hàng.
* **Nhánh rẽ `alt` [JWT Hết hạn / Dữ liệu lỗi]:**
  * **Bước 4 (NestJS API -> Next.js UI):** Nếu token bị sai/hết hạn hoặc giỏ hàng không đúng định dạng, API trả về lỗi `401 Unauthorized` hoặc `400 Bad Request`.
  * **Bước 5 (Next.js UI -> Customer):** Frontend hiển thị thông báo lỗi và yêu cầu người dùng đăng nhập lại.

---

### Giai đoạn 2: Kiểm tra chống gửi trùng yêu cầu (Idempotency Check)

* **Bước 6 (NestJS API -> PostgreSQL):** NestJS API thực hiện câu truy vấn tìm kiếm `Idempotency-Key` trong bảng lịch sử giao dịch.
* **Bước 7 (PostgreSQL -> NestJS API):** PostgreSQL trả về kết quả tìm kiếm.
* **Nhánh rẽ `alt` [Key đã tồn tại - Chống gửi trùng]:**
  * **Bước 8 (NestJS API -> Next.js UI):** Nếu phát hiện mã key này đã từng được xử lý (do người dùng bấm nút nhiều lần do mạng lag), NestJS API hủy xử lý mới và trả về ngay kết quả đơn hàng đã tạo trước đó (`200 OK`).
  * **Bước 9 (Next.js UI -> Customer):** Frontend hiển thị thông tin đơn hàng đã khởi tạo mà không trừ tiền hay tạo đơn trùng lặp.

---

### Giai đoạn 3: Giao dịch CSDL & Quản lý Tồn kho (Database Transaction)

* **Bước 10 (NestJS API -> PostgreSQL):** NestJS API phát lệnh `BEGIN TRANSACTION` để đảm bảo tính toàn vẹn dữ liệu.
* **Bước 11 (NestJS API -> PostgreSQL):** Thực hiện khóa dòng (`Lock Row`) và kiểm tra số lượng tồn kho thực tế của các món trong giỏ.
* **Bước 12 (PostgreSQL -> NestJS API):** CSDL trả về số lượng tồn kho hiện có.
* **Nhánh rẽ `alt` [Không đủ hàng]:**
  * **Bước 13 (NestJS API -> PostgreSQL):** Nếu sản phẩm vừa hết, API phát lệnh `ROLLBACK` để hủy bỏ mọi thay đổi tạm thời.
  * **Bước 14 (NestJS API -> Next.js UI):** Trả về mã lỗi `400 Bad Request` kèm thông báo *"Sản phẩm vừa hết hàng"*.
  * **Bước 15 (Next.js UI -> Customer):** Frontend yêu cầu người dùng điều chỉnh lại giỏ hàng.
* **Nhánh rẽ `alt` [Đủ hàng]:**
  * **Bước 16 (NestJS API -> PostgreSQL):** API thực hiện trừ số lượng tồn kho (`stock_quantity - quantity`) và tạo bản ghi đơn hàng ở trạng thái `PENDING`.
  * **Bước 17 (NestJS API -> PostgreSQL):** Lưu danh sách chi tiết món (`Order Items`) thuộc đơn hàng đó.
  * **Bước 18 (NestJS API -> PostgreSQL):** Phát lệnh `COMMIT` để chốt giữ hàng trong CSDL.

---

### Giai đoạn 4: Xử lý Thanh toán Trực tuyến & Hoàn tất Đơn hàng

* **Bước 19 (NestJS API -> Payment Sandbox):** NestJS API gọi API của Cổng thanh toán, truyền mã đơn hàng và số tiền cần thanh toán.
* **Bước 20 (Payment Sandbox -> NestJS API):** Cổng thanh toán trả về kết quả xử lý giao dịch.

#### Nhánh rẽ `alt` 1: Thanh toán Thành công (`SUCCESS`)
* **Bước 21 (NestJS API -> PostgreSQL):** Cập nhật trạng thái đơn hàng thành `CONFIRMED`, trạng thái thanh toán thành `SUCCESS` và lưu mã `Idempotency-Key`.
* **Bước 22 (NestJS API -> Next.js UI):** Trả về mã `200 OK` kèm thông tin đơn hàng đã xác nhận thành công.
* **Bước 23 (Next.js UI -> Customer):** Frontend hiển thị màn hình *"Đặt hàng thành công"* kèm mã đơn hàng để khách theo dõi.

#### Nhánh rẽ `alt` 2: Thanh toán Thất bại hoặc Quá thời gian (`FAILED / Timeout`)
* **Bước 24 (NestJS API -> PostgreSQL):** Bắt đầu một giao dịch `BEGIN TRANSACTION` mới để xử lý dọn rác.
* **Bước 25 (NestJS API -> PostgreSQL):** Cộng trả lại số lượng nguyên liệu/sản phẩm đã trừ tạm thời vào kho (`+ quantity`).
* **Bước 26 (NestJS API -> PostgreSQL):** Cập nhật trạng thái đơn hàng thành `CANCELLED` (Đã hủy).
* **Bước 27 (NestJS API -> PostgreSQL):** Phát lệnh `COMMIT` để hoàn tất việc nhả kho.
* **Bước 28 (NestJS API -> Next.js UI):** Trả về mã lỗi `402 Payment Required` báo thanh toán không thành công.
* **Bước 29 (Next.js UI -> Customer):** Frontend báo lỗi thanh toán và hiển thị nút *"Thử thanh toán lại"*.

---

## 3. Các Điểm Kỹ Thuật Trọng Tâm Cần Lưu Ý Khi Bảo Vệ Đồ Án

1. **Bảo mật (Security):** Mọi giao dịch tạo đơn bắt buộc phải có `JWT` trong Header.
2. **Chống trùng lặp (Idempotency):** Nhờ có `Idempotency-Key`, hệ thống đảm bảo dù mạng lag bấm 10 lần thì CSDL cũng chỉ tạo 1 đơn hàng và trừ tiền 1 lần.
3. **Quản lý kho an toàn (Race Condition & Lock Row):** Sử dụng `Lock Row` trong CSDL để tránh trường hợp 2 người cùng mua món cuối cùng vào một phần nghìn giây.
4. **Cơ chế Rollback Tự động:** Nếu cổng thanh toán thất bại, hệ thống tự động hoàn kho (`+ quantity`) và chuyển trạng thái đơn sang `CANCELLED` để không bị treo đơn hay mất hàng của quán.