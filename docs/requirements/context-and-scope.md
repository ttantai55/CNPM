# BrewLite – Bối cảnh, Stakeholder và Phạm vi

## 1. Vấn đề nghiệp vụ
- Hiện trạng: quán nhận order thủ công (giấy/miệng), dễ nhầm món, chậm
  vào giờ cao điểm, khó thống kê doanh thu.
- Vấn đề: khách chờ lâu, nhân viên quầy quá tải, quản lý thiếu số liệu.
- Giải pháp: hệ thống BrewLite cho phép đặt món, quản lý đơn,
  thanh toán và xem báo cáo.

## 2. Stakeholder, mục tiêu và kỳ vọng
| Stakeholder | Vai trò | Mục tiêu | Kỳ vọng |
|---|---|---|---|
| Khách hàng | Đặt đồ uống | Đặt nhanh, đúng món | Giao diện dễ dùng, xem trạng thái đơn |
| Nhân viên quầy | Xử lý đơn | Nhận và pha đúng đơn | Danh sách đơn rõ ràng, cập nhật trạng thái nhanh |
| Quản lý cửa hàng | Quản lý menu, doanh thu | Kiểm soát hoạt động | Quản lý menu, xem báo cáo |
| Giảng viên / khách hàng nghiệm thu | Đánh giá sản phẩm | Sản phẩm đúng yêu cầu | Demo chạy được, tài liệu đầy đủ |
| Nhóm phát triển | Xây dựng hệ thống | Hoàn thành đúng hạn | Yêu cầu rõ, phạm vi vừa sức |
| Đơn vị thanh toán | Cung cấp cổng thanh toán | Giao dịch đúng, an toàn | Tích hợp theo API/chuẩn của họ |

## 3. Mục tiêu và kỳ vọng của từng Stakeholder
| Stakeholder | Vai trò | Mục tiêu | Kỳ vọng |
|---|---|---|---|
| Khách hàng | Đặt đồ uống | • Đặt món nhanh chóng, tiết kiệm thời gian chờ tại quầy.<br>• Cá nhân hóa món theo đúng sở thích (size, đá, đường, topping).<br>• Thanh toán thuận tiện và theo dõi tiến độ pha chế chính xác. | • Giao diện web mobile-first/PWA tải nhanh, mượt mà và trực quan.<br>• Menu hiển thị rõ thông tin, giá bán và trạng thái món (còn hàng/hết hàng).<br>• Cập nhật trạng thái đơn hàng tức thời (Đã nhận đơn → Đang pha → Sẵn sàng nhận). |
| Nhân viên quầy | Xử lý đơn | • Tiếp nhận, xử lý và chuẩn bị đúng món theo yêu cầu của khách.<br>• Giảm thiểu sai sót do ghi chú thủ công và giảm tải áp lực giờ cao điểm.<br>• Phối hợp nhịp nhàng giữa khâu nhận đơn và trả đồ. | • Danh sách đơn hiển thị rõ ràng thông tin chi tiết từng món và topping theo thời gian thực.<br>• Thao tác chuyển trạng thái đơn (tiếp nhận, hoàn thành) nhanh chóng, tiện lợi.<br>• Giảm thời gian giải thích thực đơn và thu tiền mặt trực tiếp tại quầy. |
| Quản lý cửa hàng | Quản lý menu, doanh thu | • Kiểm soát toàn diện hoạt động vận hành và bán hàng của quán.<br>• Tối ưu hiệu suất phục vụ và hạn chế thất thoát doanh thu.<br>• Đảm bảo thực đơn trên hệ thống luôn đúng với thực tế kho hàng. | • Dễ dàng cập nhật giá, thêm/sửa món và đổi trạng thái hết hàng tạm thời.<br>• Thống kê doanh thu, số lượng đơn theo ca/ngày rõ ràng, minh bạch.<br>• Hệ thống vận hành ổn định, không gián đoạn trong khung giờ cao điểm. |
| Giảng viên / Khách hàng nghiệm thu | Đánh giá sản phẩm | • Kiểm chứng năng lực vận dụng quy trình phát triển phần mềm chuẩn mực từ khâu yêu cầu đến triển khai thực tế.<br>• Đánh giá mức độ hoàn thiện của hệ thống dựa trên yêu cầu đề ra. | • Sản phẩm bám sát SRS, có tính truy vết rõ ràng từ use-case đến test case.<br>• Demo chạy mượt mà trên môi trường production thực tế qua URL HTTPS.<br>• Tài liệu kỹ thuật, sơ đồ phân tích và hồ sơ bàn giao đầy đủ, đúng hạn. |
| Nhóm phát triển | Xây dựng hệ thống | • Hoàn thành đầy đủ các Sprint theo đúng tiến độ và yêu cầu môn học.<br>• Xây dựng mã nguồn chất lượng, dễ bảo trì và mở rộng.<br>• Tự động hóa kiểm thử và triển khai để hạn chế lỗi khi tích hợp. | • Phạm vi sản phẩm (scope) rõ ràng, tiêu chí nghiệm thu kiểm chứng được.<br>• Cấu trúc dự án và môi trường đồng nhất thông qua Docker Compose.<br>• Pipeline CI/CD vận hành ổn định, tự động kiểm tra lint, test và build trước khi merge code. |
| Đơn vị thanh toán | Cung cấp cổng thanh toán | • Đảm bảo các giao dịch thanh toán trực tuyến diễn ra an toàn, chính xác.<br>• Xử lý đồng bộ và toàn vẹn dữ liệu giữa cổng thanh toán và hệ thống. | • Request gửi sang đúng cấu trúc dữ liệu và chuẩn bảo mật.<br>• Hệ thống hỗ trợ cơ chế Idempotency để tránh trừ tiền trùng lặp khi người dùng gửi lại yêu cầu.<br>• Nhận và xử lý chính xác phản hồi kết quả giao dịch (callback/webhook). |
# Task 2.
## 4. Tiêu chí chấp nhận có thể kiểm chứng (Acceptance Criteria)

Các tiêu chí chấp nhận được chuẩn hóa theo định dạng **Given - When - Then** để phục vụ trực tiếp cho việc viết Unit/Integration/E2E Test ở các Sprint sau[cite: 5, 8].

---

### 4.1. Nhóm Yêu cầu Chức năng (Functional Requirements - FR)

#### FR-01: Xem menu và danh mục sản phẩm
* **AC-01.1 (Hiển thị danh sách món):**
  * **Given:** Khách hàng truy cập vào màn hình Menu trên giao diện mobile-first/PWA[cite: 4, 7].
  * **When:** Hệ thống gọi API `GET /products` thành công[cite: 7].
  * **Then:** Danh sách hiển thị đầy đủ tên, hình ảnh, mô tả ngắn và giá bán cơ bản của từng sản phẩm được phân loại theo từng danh mục (Cà phê, Trà, Bánh...)[cite: 7].
* **AC-01.2 (Sản phẩm hết hàng):**
  * **Given:** Sản phẩm có trạng thái tồn kho bằng 0 hoặc cờ `is_available = false`[cite: 5].
  * **When:** Sản phẩm được hiển thị trên giao diện Menu.
  * **Then:** Ảnh sản phẩm chuyển tông màu xám, hiển thị nhãn "Hết hàng" và nút "Chọn món" bị vô hiệu hóa (disabled)[cite: 5].
* **AC-01.3 (Trạng thái Loading và Empty):**
  * **Given:** Mạng có độ trễ cao hoặc danh mục chưa có sản phẩm.
  * **When:** Khách hàng chuyển danh mục.
  * **Then:** Giao diện hiển thị skeleton loading trong lúc chờ dữ liệu; nếu không có dữ liệu, hiển thị thông báo "Không có món nào trong danh mục này"[cite: 7].

---

#### FR-02: Xem chi tiết sản phẩm và tùy biến món
* **AC-02.1 (Tùy chọn kích cỡ - Size):**
  * **Given:** Khách hàng mở modal chi tiết sản phẩm (giá gốc: 30.000đ).
  * **When:** Khách hàng chọn kích cỡ "Size L" (phụ thu +10.000đ)[cite: 7].
  * **Then:** Tổng giá hiển thị tức thời trên modal tự động cộng dồn thành 40.000đ[cite: 7].
* **AC-02.2 (Tùy chọn Topping):**
  * **Given:** Khách hàng đang ở modal chi tiết sản phẩm[cite: 7].
  * **When:** Khách hàng tick chọn 2 loại Topping (mỗi loại 5.000đ)[cite: 7].
  * **Then:** Tổng giá tăng thêm đúng 10.000đ và danh sách topping đã chọn được lưu vào cấu trúc món[cite: 7].
* **AC-02.3 (Tùy chỉnh đá, đường và ghi chú):**
  * **Given:** Khách hàng chọn mức đá (ví dụ: 50% đá) và độ ngọt (ví dụ: 70% đường).
  * **When:** Khách hàng nhập ghi chú và bấm "Thêm vào giỏ".
  * **Then:** Thông tin tùy biến được ghi nhận chính xác vào thuộc tính của OrderItem[cite: 6].

---

#### FR-03: Quản lý giỏ hàng
* **AC-03.1 (Thêm món vào giỏ):**
  * **Given:** Khách hàng hoàn tất tùy biến một sản phẩm[cite: 4, 7].
  * **When:** Bấm nút "Thêm vào giỏ hàng"[cite: 4].
  * **Then:** Icon giỏ hàng tăng số lượng badge lên 1; dữ liệu được đồng bộ vào LocalStorage/State mà không cần tải lại trang[cite: 7].
* **AC-03.2 (Cập nhật số lượng và tính tổng tiền):**
  * **Given:** Giỏ hàng có 2 món khác nhau[cite: 4].
  * **When:** Khách hàng tăng/giảm số lượng của một món.
  * **Then:** Tổng tiền tạm tính của giỏ hàng cập nhật chính xác theo công thức: $\sum (\text{Giá cơ bản} + \text{Phụ thu size} + \text{Topping}) \times \text{Số lượng}$[cite: 7].
* **AC-03.3 (Xóa món khỏi giỏ hàng):**
  * **Given:** Giỏ hàng có sản phẩm.
  * **When:** Khách hàng bấm biểu tượng thùng rác hoặc giảm số lượng về 0.
  * **Then:** Hiển thị cảnh báo xác nhận; nếu xác nhận, món bị loại khỏi giỏ và cập nhật lại tổng tiền[cite: 7].

---

#### FR-04: Xác thực và Phân quyền (Authentication & Authorization)
* **AC-04.1 (Đăng nhập thành công trả về JWT):**
  * **Given:** Người dùng nhập đúng số điện thoại/tài khoản và mật khẩu[cite: 7].
  * **When:** Gửi request đến `POST /auth/login`[cite: 7].
  * **Then:** Backend trả về HTTP status 200 kèm access token định dạng JWT có thời hạn; client lưu token vào storage an toàn[cite: 5, 7].
* **AC-04.2 (Đăng nhập thất bại):**
  * **Given:** Người dùng nhập sai mật khẩu hoặc tài khoản chưa đăng ký.
  * **When:** Gửi request đến `POST /auth/login`.
  * **Then:** Backend trả về HTTP status 401 Unauthorized kèm thông báo lỗi rõ ràng[cite: 7].
* **AC-04.3 (Phân quyền truy cập):**
  * **Given:** Tài khoản khách hàng (role: `CUSTOMER`).
  * **When:** Cố ý truy cập vào API đổi trạng thái của nhân viên (`PATCH /orders/:id/status`).
  * **Then:** Hệ thống chặn và trả về HTTP status 403 Forbidden[cite: 5].

---

#### FR-05: Đặt đơn và Thanh toán mô phỏng (Checkout & Payment)
* **AC-05.1 (Khởi tạo đơn hàng):**
  * **Given:** Giỏ hàng hợp lệ và khách hàng đã cung cấp thông tin nhận hàng[cite: 4, 7].
  * **When:** Khách hàng bấm "Tiến hành đặt hàng"[cite: 4].
  * **Then:** Hệ thống tạo bản ghi trong bảng `orders` với trạng thái ban đầu là `PENDING` và tạo các bản ghi `order_items` tương ứng trong PostgreSQL[cite: 4, 6].
* **AC-05.2 (Thanh toán thành công):**
  * **Given:** Đơn hàng đang ở trạng thái `PENDING`[cite: 5].
  * **When:** Cổng thanh toán mô phỏng xử lý thành công và gửi webhook/callback xác nhận[cite: 5, 6].
  * **Then:** Giao dịch thanh toán được ghi nhận `SUCCESS`, trạng thái đơn đổi thành `PAID`, giao diện chuyển sang màn hình thông báo hoàn tất[cite: 5, 7].
* **AC-05.3 (Tính Idempotency khi thanh toán):**
  * **Given:** Khách hàng thực hiện thanh toán cho đơn hàng có kèm `Idempotency-Key`[cite: 5].
  * **When:** Xảy ra tình trạng mất mạng hoặc người dùng click liên tục nhiều lần vào nút thanh toán[cite: 5].
  * **Then:** Backend chỉ xử lý trừ tiền và tạo đúng một giao dịch thanh toán duy nhất, các request trùng lặp trả về kết quả của giao dịch trước đó[cite: 5].

---

#### FR-06: Quản lý trạng thái và Lịch sử đơn hàng
* **AC-06.1 (Theo dõi tiến độ đơn hàng):**
  * **Given:** Đơn hàng đã được thanh toán thành công (`PAID`)[cite: 5, 7].
  * **When:** Khách hàng mở trang "Theo dõi đơn hàng"[cite: 4].
  * **Then:** Tiến trình đơn hiển thị trực quan các bước: Đã tiếp nhận $\rightarrow$ Đang pha chế $\rightarrow$ Sẵn sàng nhận $\rightarrow$ Hoàn tất[cite: 4, 7].
* **AC-06.2 (Xem lịch sử đơn):**
  * **Given:** Khách hàng đã đăng nhập tài khoản[cite: 5, 7].
  * **When:** Truy cập mục "Lịch sử đơn hàng"[cite: 5, 7].
  * **Then:** Hệ thống hiển thị danh sách các đơn đã đặt trước đây sắp xếp theo thời gian mới nhất, kèm trạng thái và chi tiết từng món[cite: 5, 7].
* **AC-06.3 (Cập nhật trạng thái từ phía quầy):**
  * **Given:** Nhân viên quầy nhận được đơn mới trên giao diện quản lý[cite: 4].
  * **When:** Nhân viên nhấn "Bắt đầu pha chế" hoặc "Đã pha xong".
  * **Then:** Database cập nhật trạng thái đơn tương ứng và màn hình khách hàng cập nhật theo[cite: 4, 5].

---

### 4.2. Nhóm Yêu cầu Phi chức năng (Non-Functional Requirements - NFR)

#### NFR-01: Hiệu năng hệ thống (Performance)
* **AC-P01.1 (Tốc độ phản hồi API):**
  * **Given:** Hệ thống chịu tải 50 người dùng đồng thời trên môi trường production[cite: 7].
  * **When:** Gửi request đến các API chính (`GET /products`, `GET /products/:id`)[cite: 7].
  * **Then:** 95% số request (p95) phản hồi thành công trong thời gian dưới 500ms.
* **AC-P01.2 (Chỉ số Core Web Vitals của Next.js):**
  * **Given:** Thiết bị di động kết nối mạng 4G thông thường.
  * **When:** Người dùng tải trang chủ Menu lần đầu tiên[cite: 4, 7].
  * **Then:** Chỉ số FCP (First Contentful Paint) $\le 1.5$ giây và LCP (Largest Contentful Paint) $\le 2.5$ giây[cite: 4, 7].

---

#### NFR-02: An toàn và Bảo mật (Security)
* **AC-S01.1 (Kiểm soát truy cập API):**
  * **Given:** Endpoint yêu cầu đăng nhập (ví dụ: `GET /orders/history`)[cite: 5, 7].
  * **When:** Request gửi lên thiếu header `Authorization: Bearer <token>` hoặc token hết hạn.
  * **Then:** Hệ thống trả về mã lỗi HTTP 401 Unauthorized và từ chối xử lý[cite: 5, 7].
* **AC-S01.2 (Validation và Chống tấn công injection):**
  * **Given:** Request gửi body dữ liệu không đúng chuẩn hoặc chứa payload script/SQL Injection.
  * **When:** Dữ liệu đi qua ValidationPipe của NestJS[cite: 4, 7].
  * **Then:** Hệ thống tự động từ chối, trả về HTTP status 400 Bad Request kèm chi tiết trường bị lỗi, không lộ cấu trúc database[cite: 7].
* **AC-S01.3 (Bảo mật đường truyền):**
  * **Given:** Ứng dụng triển khai trên môi trường production[cite: 7, 8].
  * **When:** Client gửi bất kỳ request nào.
  * **Then:** Toàn bộ dữ liệu được truyền qua giao thức HTTPS bảo mật[cite: 6, 8].

---

#### NFR-03: Tính khả dụng và Trải nghiệm Mobile-first (Usability & PWA)
* **AC-U01.1 (Đáp ứng giao diện di động - Responsive):**
  * **Given:** Người dùng mở web trên thiết bị di động có độ rộng màn hình từ 360px đến 430px[cite: 4].
  * **When:** Thao tác từ xem menu, chọn size/topping đến checkout[cite: 4, 7].
  * **Then:** Toàn bộ nội dung hiển thị vừa vặn, không bị tràn viền (overflow ngang), nút bấm kích thước tối thiểu $44 \times 44\text{px}$ tiện cho ngón tay chạm[cite: 4].
* **AC-U01.2 (Tiêu chuẩn PWA):**
  * **Given:** Người dùng truy cập bằng trình duyệt di động (Chrome, Safari)[cite: 4, 6].
  * **When:** Kiểm tra file `manifest.json` và cấu hình PWA[cite: 4].
  * **Then:** Trình duyệt cho phép người dùng chọn "Thêm vào màn hình chính" (Add to Home Screen) và mở ra như ứng dụng độc lập[cite: 4].

---

#### NFR-04: Khả năng triển khai và Vận hành (Deployability & DevOps)
* **AC-D01.1 (Khởi chạy môi trường Local qua Docker):**
  * **Given:** Máy phát triển đã cài Docker và Docker Compose[cite: 4, 8].
  * **When:** Thành viên nhóm chạy lệnh `docker compose up`[cite: 8].
  * **Then:** Cả 3 dịch vụ Frontend (Next.js), Backend (NestJS) và Database (PostgreSQL) khởi chạy thành công mà không cần cài đặt thêm runtime môi trường[cite: 4, 8].
* **AC-D01.2 (Kiểm tra trạng thái sức khỏe - Health Check):**
  * **Given:** Hệ thống backend NestJS đang hoạt động[cite: 4, 8].
  * **When:** Gọi request `GET /health`[cite: 8].
  * **Then:** Server trả về HTTP status 200 kèm JSON xác nhận kết nối cơ sở dữ liệu `{"status": "ok", "db": "connected"}`[cite: 8].