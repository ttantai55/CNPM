# BrewLite — Hệ Thống Quản Lý Quán Coffee

BrewLite là hệ thống đặt đồ uống tự động hóa áp dụng kiến trúc hiện đại, phân tách hoàn toàn độc lập giữa Frontend và Backend. Để đảm bảo hiệu suất vận hành ổn định, dữ liệu nhất quán và tối ưu quy trình phối hợp nhóm, dự án tích hợp một hệ sinh thái công nghệ đồng bộ:

- **Nền tảng ứng dụng:** Java Spring Boot, Next.js.
- **Quản trị dữ liệu:** PostgreSQL.
- **DevOps & Kiểm thử tự động:** Docker, GitHub Actions.

Tài liệu README này cung cấp cái nhìn toàn diện về kiến trúc công nghệ, bộ công cụ phát triển, quản lý mã nguồn và quy trình triển khai hệ thống. Qua đó, người đọc và các thành viên mới có thể nhanh chóng nắm bắt môi trường kỹ thuật, thiết lập dự án cục bộ (local) và tham gia phối hợp phát triển một cách hiệu quả.

---

## Mục Lục
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc & Cấu trúc thư mục](#kiến-trúc--cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt & Chạy dự án ở Local](#hướng-dẫn-cài-đặt--chạy-dự-án-ở-local)
- [Kiểm thử (Testing)](#kiểm-thử-testing)
- [Hướng dẫn đóng gói (Build)](#hướng-dẫn-đóng-gói-build)
- [Hướng dẫn deploy](#hướng-dẫn-triển-khai-deployment-guide)

---

## Tính năng chính

### Dành cho Khách hàng (Customer)
- **Xác thực & Tài khoản:** Đăng ký, đăng nhập (JWT + Refresh Token), quên/đặt lại mật khẩu.
- **Thực đơn & Tùy chỉnh món:** Xem danh sách đồ uống, chọn kích cỡ (`S`, `M`, `L`), thêm topping và ghi chú riêng cho từng ly.
- **Giỏ hàng & Đặt hàng:** Quản lý giỏ hàng đồng bộ, Đặt Hàng Onl.
- **Khuyến mãi & Điểm thưởng:** Áp dụng mã voucher giảm giá và quy đổi điểm tích lũy (Loyalty Points).
- **Thanh toán & Theo dõi đơn:** Thanh toán siêu tốc qua **In-App QR Modal** (MoMo, VietQR) xác nhận trực tiếp không cần chuyển trang, theo dõi tiến trình làm món theo thời gian thực.

### Dành cho Nhân viên / Barista (Staff)
- Tiếp nhận hàng đợi đơn hàng (`PENDING` $\rightarrow$ `PAID` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`).

### Dành cho Quản trị viên (Admin)
- Quản lý thực đơn, topping, chương trình khuyến mãi và thống kê doanh thu.
- Quản lý tồn kho nguyên liệu/sản phẩm, lịch sử xuất/nhập kho và cảnh báo hết hàng.

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, TailwindCSS, Axios |
| **Backend** | Java 21+, Spring Boot, Spring Security (JWT), Spring Data JPA, Flyway |
| **Cơ sở dữ liệu & Cache** | PostgreSQL, Redis, DBeaver |
| **Kiểm thử (Testing)** | JUnit 5 / Spring Boot Test, Testcontainers (PostgreSQL), Cypress (E2E) |
| **Triển khai (DevOps)** | Docker, Docker Compose, Supabase, Render, Vercel, GitHub Actions |

---

## Kiến trúc & Cấu trúc thư mục

```text
brewlite/
├── .github/
|    └──workflows/
├── apps/
│   ├── backend/                # Mã nguồn Spring Boot API (Port 8081)
│   │   ├── src/main/java/      # Controllers, Services, Repositories, Security
│   │   └── src/main/resources/ # application.properties, Flyway SQL migrations
│   └── frontend/               # Mã nguồn giao diện Next.js (Port 3000)
├── test/                       # Bộ kiểm thử tự động Cypress E2E
│   ├── cypress.config.js     
│   └── e2e/                    # Kịch bản kiểm thử luồng đặt hàng & thanh toán
├── docker-compose.yml          # Cấu hình chạy toàn bộ hệ thống Local (PostgreSQL, Redis, Backend, Frontend)
└── README.md