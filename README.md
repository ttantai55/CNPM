# ☕ BrewLite — Hệ Thống Quản Lý Quán Coffee

![Java](https://img.shields.io/badge/Java-21+-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-6DB33F?logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

BrewLite là hệ thống đặt đồ uống tự động hóa áp dụng kiến trúc hiện đại, tách biệt hoàn toàn giữa Frontend và Backend. Để đảm bảo hiệu suất ổn định, dữ liệu nhất quán và tối ưu quy trình làm việc nhóm, dự án tích hợp một hệ sinh thái công nghệ đồng bộ:

- **Nền tảng ứng dụng:** Java Spring Boot, Next.js
- **Quản trị dữ liệu:** PostgreSQL, Redis, Flyway
- **DevOps & Kiểm thử tự động:** Docker, Testcontainers, Cypress, GitHub Actions

Tài liệu này cung cấp cái nhìn toàn diện về kiến trúc, bộ công cụ phát triển, quy trình kiểm thử và triển khai hệ thống, giúp các thành viên mới nhanh chóng thiết lập môi trường local và tham gia phát triển.

🌐 **Bản demo:** https://brewlite-frontend-omega.vercel.app/

---

## 📑 Mục Lục

- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc & Cấu trúc thư mục](#-kiến-trúc--cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Hướng dẫn chạy dự án ở Local](#-hướng-dẫn-chạy-dự-án-ở-local)
- [Kiểm thử (Testing)](#-kiểm-thử-testing)
- [Đóng gói (Build)](#-đóng-gói-build)
- [Hướng dẫn triển khai (Deployment)](#-hướng-dẫn-triển-khai-deployment)

---

## ✨ Tính năng chính

### 👤 Dành cho Khách hàng (Customer)

- **Xác thực & Tài khoản:** Đăng ký, đăng nhập (JWT + Refresh Token), quên/đặt lại mật khẩu.
- **Thực đơn & Tùy chỉnh món:** Xem danh sách đồ uống, chọn kích cỡ (`S`, `M`, `L`), thêm topping và ghi chú riêng cho từng ly.
- **Giỏ hàng & Đặt hàng:** Quản lý giỏ hàng đồng bộ, đặt hàng online.
- **Khuyến mãi & Điểm thưởng:** Áp dụng mã voucher giảm giá và quy đổi điểm tích lũy (Loyalty Points).
- **Thanh toán & Theo dõi đơn:** Thanh toán nhanh qua **In-App QR Modal** (MoMo, VietQR), xác nhận trực tiếp không cần chuyển trang; theo dõi tiến trình làm món theo thời gian thực.

### 🧑‍🍳 Dành cho Nhân viên / Barista (Staff)

- Tiếp nhận hàng đợi đơn hàng theo luồng trạng thái:

  `PENDING` → `PAID` → `PREPARING` → `COMPLETED`

### 🛠️ Dành cho Quản trị viên (Admin)

- Quản lý thực đơn, topping, chương trình khuyến mãi và thống kê doanh thu.
- Quản lý tồn kho nguyên liệu/sản phẩm, lịch sử xuất/nhập kho và cảnh báo hết hàng.

---

## 🧰 Công nghệ sử dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, TailwindCSS, Axios |
| **Backend** | Java 21+, Spring Boot, Spring Security (JWT), Spring Data JPA, Flyway |
| **Cơ sở dữ liệu & Cache** | PostgreSQL, Redis, DBeaver |
| **Kiểm thử** | JUnit 5 / Spring Boot Test, Testcontainers (PostgreSQL), Cypress (E2E) |
| **Triển khai (DevOps)** | Docker, Docker Compose, Supabase, Render, Vercel, GitHub Actions |

---

## 🏗️ Kiến trúc & Cấu trúc thư mục

```text
brewlite/
├── .github/
│   └── workflows/              # Pipeline CI/CD (GitHub Actions)
├── apps/
│   ├── backend/                # Spring Boot API (Port 8081)
│   │   ├── src/main/java/      # Controllers, Services, Repositories, Security, Domain
│   │   └── src/main/resources/ # application.properties, Flyway SQL migrations
│   └── frontend/               # Giao diện Next.js (Port 3000)
├── test/                       # Kiểm thử tự động Cypress E2E
│   ├── cypress.config.js
│   └── e2e/                    # Kịch bản luồng đặt hàng & thanh toán
├── docker-compose.yml          # Chạy toàn bộ hệ thống local (PostgreSQL, Redis, Backend, Frontend)
└── README.md
```

---

## 📋 Yêu cầu hệ thống

### 1. Công cụ & phần mềm cần thiết

| Công cụ | Mục đích | Mức độ |
| :--- | :--- | :--- |
| **Git** | Clone mã nguồn và quản lý phiên bản | Bắt buộc |
| **Docker Desktop** | Chạy các dịch vụ PostgreSQL, Redis qua Docker Compose | Bắt buộc (nếu chạy Docker) |
| **Java JDK 21+** | Biên dịch và chạy Spring Boot *(đã có sẵn Maven Wrapper `./mvnw`)* | Bắt buộc (nếu chạy local) |
| **Node.js (LTS 18+) & pnpm** | Cài thư viện, chạy Frontend và bộ test Cypress | Bắt buộc (nếu chạy local/Cypress) |
| **PostgreSQL & Redis** | Hệ quản trị CSDL và bộ nhớ đệm | Bắt buộc (nếu không dùng Docker) |
| **VS Code / DBeaver / REST Client** | Soạn code, quản trị CSDL, kiểm thử API | Khuyến nghị |

### 2. Lưu ý cấu hình trước khi chạy

1. **Khởi động Docker Desktop** trước khi chạy `docker compose up -d db redis`.
2. **Biến môi trường:**
   - **Backend:** cấu hình URL kết nối PostgreSQL trong `application.properties` hoặc qua biến môi trường.
   - **Frontend:** tạo file `.env.local` từ `.env.example` và đặt `NEXT_PUBLIC_API_URL` trỏ về Backend.
3. **Kiểm tra sức khỏe dịch vụ:** Backend phản hồi bình thường tại `http://localhost:8081`.

> [!WARNING]
> **Tuyệt đối không** commit thông tin nhạy cảm (mật khẩu Database, JWT Secret) lên GitHub.

---

## 🚀 Hướng dẫn chạy dự án ở Local

Hướng dẫn chạy hệ thống BrewLite (PostgreSQL + Redis + Backend + Frontend) trên máy cá nhân.

### Bước 1. Chuẩn bị

Cài đặt các công cụ theo mục [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống), sau đó tải mã nguồn:

```bash
git clone <URL_REPOSITORY>
cd <TEN_THU_MUC_DU_AN>
```

### Bước 2. Chọn cách chạy

#### Cách 1 — Chạy toàn bộ bằng Docker Compose (khuyên dùng)

Chỉ cần Docker đang chạy. Lệnh dưới khởi động đủ 4 dịch vụ: PostgreSQL, Redis, Backend, Frontend.

```bash
docker compose up --build
```

Dừng hệ thống:

```bash
docker compose down
```

#### Cách 2 — Chạy Backend và Frontend thủ công

Dùng Docker cho PostgreSQL và Redis; Backend và Frontend chạy trực tiếp trên máy (tiện để debug).

**2.1. Khởi động PostgreSQL và Redis**

```bash
docker compose up -d db redis
```

Thông tin kết nối (đã khớp sẵn với `docker-compose.yml` và `application.properties`, không cần sửa):

| Dịch vụ | Địa chỉ | Thông tin |
| :--- | :--- | :--- |
| PostgreSQL | `localhost:5432` | database `drinkshop_db`, user `brewlite`, mật khẩu `taidz@2026` |
| Redis | `localhost:6379` | cổng mặc định |

> [!NOTE]
> Nếu máy đã cài PostgreSQL riêng, hãy tắt service đó hoặc đổi cổng để tránh trùng cổng `5432` của Docker.

**2.2. Chạy Backend**

```bash
cd apps/backend
./mvnw spring-boot:run        # Windows PowerShell: .\mvnw spring-boot:run
```

Thành công khi console hiện dòng `Started ... Application in ... seconds`. Các bảng dữ liệu được Hibernate tự tạo (`ddl-auto=update`).

**2.3. Chạy Frontend (Next.js)** — mở một terminal mới:

```bash
cd apps/frontend
pnpm install
pnpm dev
```

Nếu Frontend không gọi được API, tạo file `apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### Bước 3. Địa chỉ truy cập

| Dịch vụ | Địa chỉ |
| :--- | :--- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8081 |
| PostgreSQL | `localhost:5432` |

### Bước 4. Kiểm tra nhanh

Mở http://localhost:3000, đăng nhập (hoặc đăng ký tài khoản mới, mật khẩu tối thiểu 8 ký tự). Thấy danh sách thực đơn là hệ thống đã chạy đúng.

Chức năng thanh toán dùng cơ chế **In-App QR Modal** ngay trên trang Checkout. Khi chọn MoMo/VietQR, hệ thống hiển thị mã QR động chứa sẵn số tiền và mã đơn hàng (không chuyển trang). Bạn có thể bấm **"Xác nhận đã thanh toán"** hoặc **"Giả lập thất bại"** trên Modal để kiểm tra các luồng trạng thái (`PAID`, `CANCELLED`).

### Bước 5. Tài khoản mẫu

| Vai trò | Tài khoản | Mật khẩu |
| :--- | :--- | :--- |
| Quản lý (ADMIN / STORE_MANAGER) | `demo-manager` | `BrewLite123!` |
| Nhân viên / Barista (STAFF) | `demo-staff` | `BrewLite123!` |
| Khách hàng (CUSTOMER) | `demo-customer` | `BrewLite123!` |

Khách hàng mới có thể đăng ký tài khoản ngay trên giao diện.

---

## 🧪 Kiểm thử (Testing)

Dự án áp dụng mô hình kiểm thử 3 tầng: **Unit Test**, **Integration Test** và **End-to-End Test**, đảm bảo tính chính xác từ từng hàm nghiệp vụ đến toàn bộ luồng trải nghiệm người dùng.

### 1. Kiểm thử đơn vị (Unit Test — JUnit 5 & Mockito)

**Mục tiêu:** Kiểm tra độc lập từng hàm logic ở tầng Service/Utils (tính tổng giỏ hàng, áp dụng khuyến mãi, quy đổi điểm thưởng, kiểm tra tồn kho, xác thực người dùng, sinh/giải mã JWT) mà không phụ thuộc cơ sở dữ liệu hay mạng.

- **Vị trí mã nguồn:** `apps/backend/src/test/java/vn/doan`

```bash
cd apps/backend

# Chạy toàn bộ test
./mvnw test

# Chạy một file test cụ thể
./mvnw test -Dtest=CartServiceTest
```

### 2. Kiểm thử tích hợp (Integration Test — Spring Boot Test & MockMvc)

**Mục tiêu:** Kiểm tra sự phối hợp giữa các tầng (`Controller` → `Security Filter` → `Service` → `Repository` → `Database`) qua các request HTTP thực tế; xác minh mã trạng thái (`200`, `201`, `400`, `401`, `403`), cấu trúc JSON trả về và các ràng buộc dưới CSDL.

- **Vị trí mã nguồn:** `apps/backend/src/test/java/vn/doan/`

```bash
cd apps/backend

# Chạy một file Integration Test cụ thể
./mvnw test -Dtest=PaymentControllerIntegrationTest
```

> 📄 **Báo cáo chi tiết:** xem tại `apps/backend/target/surefire-reports/`.

### 3. Kiểm thử đầu cuối (End-to-End — Cypress)

**Mục tiêu:** Mô phỏng thao tác thực tế của khách hàng trên trình duyệt: truy cập trang chủ → đăng nhập (`demo-customer`) → chọn món, tùy chỉnh kích cỡ/topping → thêm vào giỏ → áp dụng ưu đãi/điểm thưởng → thanh toán (In-App QR Modal) → kiểm tra trạng thái đơn hàng.

- **Vị trí mã nguồn:** `test/e2e/cypress/e2e/payment-flow.cy.js`
- **Điều kiện trước khi chạy:** toàn bộ dịch vụ phải đang hoạt động:
  - Frontend tại `http://localhost:3000`
  - Backend API tại `http://localhost:8081`
  - PostgreSQL đã khởi động và có sẵn dữ liệu mẫu

```bash
# Bước 1: Vào thư mục test và cài thư viện
cd test
pnpm install

# Bước 2: Chạy kịch bản E2E
# Cách 1 — Giao diện trực quan (dùng khi demo):
pnpm exec cypress open

# Cách 2 — Chạy ẩn, không mở trình duyệt (dùng cho CI/CD):
pnpm exec cypress run
```

---

## 📦 Đóng gói (Build)

Đóng gói mã nguồn Backend thành file thực thi `.jar` và khởi chạy server.

```bash
# 1. Vào thư mục Backend
cd apps/backend

# 2. Đóng gói ứng dụng (lần đầu tải thư viện hơi lâu)
# Windows (PowerShell):
.\mvnw clean package -DskipTests

# Linux / macOS:
./mvnw clean package -DskipTests

# Kết quả: file thực thi tại target/doan-cnpm-0.0.1-SNAPSHOT.jar
```

Khởi chạy ứng dụng:

```bash
# Cách 1: Chạy qua Maven (khuyên dùng khi phát triển)
./mvnw spring-boot:run          # Windows: .\mvnw spring-boot:run

# Cách 2: Chạy file .jar đã build (dùng khi deploy)
java -jar target/doan-cnpm-0.0.1-SNAPSHOT.jar
```

---

## ☁️ Hướng dẫn triển khai (Deployment)

Các bước đưa BrewLite lên môi trường Production gồm: Cơ sở dữ liệu (**Supabase**) → Backend (**Render**) → Frontend (**Vercel**) → tự động hóa (**GitHub Actions**).

### 1. Cơ sở dữ liệu: Supabase (PostgreSQL)

1. Đăng nhập [Supabase](https://supabase.com/) và tạo Project mới. Chọn khu vực gần nhất (ví dụ `ap-southeast-1` Singapore) và đặt mật khẩu đủ mạnh.
2. Đợi vài phút để Supabase cấp phát Database.
3. Vào **Project Settings → Database**, kéo xuống **Connection string**, chọn tab **JDBC** và lưu lại chuỗi kết nối.
   - **Ví dụ:** `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - **User:** `postgres.[tên_project]`

> [!IMPORTANT]
> Thay `[YOUR-PASSWORD]` trong URL bằng mật khẩu đã đặt ở bước 1.

### 2. Backend: Render (Web Service)

1. Đăng nhập [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**.
2. Kết nối với kho GitHub chứa mã nguồn.
3. Thiết lập Web Service:

| Thông số | Giá trị |
| :--- | :--- |
| **Name** | `brewlite-backend` (hoặc tên tùy chọn) |
| **Region** | Singapore (cùng khu vực Supabase để giảm độ trễ) |
| **Branch** | `main` |
| **Root Directory** | `apps/backend` ⚠️ *Bắt buộc trỏ đúng thư mục chứa code Spring Boot* |
| **Runtime** | `Docker` |
| **Dockerfile Path** | `Dockerfile` (Render tự tìm trong `apps/backend`) |
| **Instance Type** | Free |

4. Cấu hình **Environment Variables** trên Render:

| Tên biến | Giá trị |
| :--- | :--- |
| `PORT` | `8081` |
| `SPRING_DATASOURCE_URL` | Chuỗi JDBC từ bước 1 |
| `SPRING_DATASOURCE_USERNAME` | `<SUPABASE_USERNAME>` (VD: `postgres.[tên_project]`) |
| `SPRING_DATASOURCE_PASSWORD` | `<SUPABASE_PASSWORD>` (mật khẩu đã đặt ở bước 1) |

5. Nhấn **Create Web Service** để Render kéo code và build Docker image (khoảng 3–5 phút).
6. Sau khi deploy thành công, Render cấp URL công khai, ví dụ `https://brewlite-backend-xxxx.onrender.com`.
7. **Lấy Deploy Hook (dùng cho CI/CD):** vào tab **Settings** của Web Service → mục **Deploy Hook** → sao chép URL để thêm vào GitHub Secrets.

### 3. Frontend: Vercel

1. Cập nhật địa chỉ Backend (từ Render) vào `apps/frontend/vercel.json` để cấu hình Reverse Proxy (tránh lỗi CORS và Mixed Content khi gọi API):

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://<ten-backend-cua-ban>.onrender.com/api/$1"
    }
  ]
}
```

2. Đăng nhập https://vercel.com và import kho mã nguồn.
3. Cấu hình dự án:

| Thông số | Giá trị |
| :--- | :--- |
| **Root Directory** | `apps/frontend` |
| **Framework Preset** | `Next.js` |
| **Build Command** | `pnpm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `pnpm install` |

4. Nhấn **Deploy**. Vercel build và cấp tên miền truy cập Frontend (ví dụ `https://brewlite-olive.vercel.app`).

### 4. Tự động hóa CI/CD (GitHub Actions)

1. Vào kho GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Thêm Secret mới:
   - **Name:** `PROD_DEPLOY_WEBHOOK`
   - **Secret:** dán URL Deploy Hook lấy từ Render ở mục 2.
3. Khi push commit lên nhánh `main`:
   - **Vercel** tự động build và deploy lại Frontend.
   - **GitHub Actions** chạy kiểm thử, đóng gói và kích hoạt Deploy Hook để Render tự cập nhật Backend mới nhất.