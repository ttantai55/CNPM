# ☕ BrewLite — Hệ thống quản lý và đặt đồ uống

![Java](https://img.shields.io/badge/Java-17+-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-6DB33F?logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

BrewLite là hệ thống đặt đồ uống tự động hóa áp dụng kiến trúc hiện đại, tách biệt hoàn toàn giữa Frontend và Backend. Để đảm bảo hiệu suất ổn định, dữ liệu nhất quán và tối ưu quy trình làm việc nhóm, dự án tích hợp một hệ sinh thái công nghệ đồng bộ:

- **Nền tảng ứng dụng:** Java Spring Boot, Next.js
- **Quản trị dữ liệu:** PostgreSQL
- **DevOps & Kiểm thử tự động:** Docker Compose, JUnit/Mockito/H2, Cypress, GitHub Actions

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
- [Flyway và migration](#flyway-và-migration)
- [Troubleshooting](#troubleshooting)
- [Đóng gói (Build)](#-đóng-gói-build)
- [Hướng dẫn triển khai (Deployment)](#-hướng-dẫn-triển-khai-deployment)

---

## ✨ Tính năng chính

### 👤 Dành cho Khách hàng (Customer)

- **Xác thực & Tài khoản:** Đăng ký, đăng nhập và đổi mật khẩu.
- **Thực đơn & Tùy chỉnh món:** Xem danh sách đồ uống, chọn kích cỡ (`S`, `M`, `L`), thêm topping và ghi chú riêng cho từng ly.
- **Giỏ hàng & Đặt hàng:** Quản lý giỏ hàng đồng bộ, đặt hàng online.
- **Khuyến mãi & Điểm thưởng:** Áp dụng mã voucher giảm giá và quy đổi điểm tích lũy (Loyalty Points).
- **Thanh toán & Theo dõi đơn:** Thanh toán mô phỏng qua **In-App QR Modal** (MoMo, VietQR), xác nhận trực tiếp không cần chuyển trang; theo dõi trạng thái đơn hàng.

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
| **Frontend** | Next.js (App Router), React, Tailwind CSS, Fetch API |
| **Backend** | Java 17+, Spring Boot, Spring Security, Spring Data JPA, Flyway |
| **Dịch vụ local** | PostgreSQL, Redis (được Compose khởi động; Backend hiện chưa kết nối Redis) |
| **Kiểm thử** | JUnit 5 / Mockito / H2, Cypress (E2E) |
| **Triển khai (DevOps)** | Docker, Docker Compose, Supabase, Render, Vercel, GitHub Actions |

---

## 🏗️ Kiến trúc & Cấu trúc thư mục

```text
brewlite/
├── .github/
│   └── workflows/
│       └── frontend-ci.yml     # Kiểm tra Frontend và Cypress E2E
├── apps/
│   ├── backend/                # Spring Boot API, Maven Wrapper, Dockerfile
│   │   ├── pom.xml
│   │   └── src/main/resources/db/migration/
│   └── frontend/               # Next.js, package.json, Dockerfile, .env.example
│       └── vercel.json         # Proxy API khi deploy Vercel
├── docs/requirements/          # Tài liệu yêu cầu và sơ đồ
├── test/                       # Cypress E2E riêng, cài bằng pnpm
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── cypress.config.js
│   └── e2e/payment-flow.cy.js
├── docker-compose.yml          # PostgreSQL, Redis, Backend, Frontend
└── README.md
```

---

## 📋 Yêu cầu hệ thống

### 1. Công cụ & phần mềm cần thiết

| Công cụ | Mục đích | Mức độ |
| :--- | :--- | :--- |
| **Git** | Clone mã nguồn và quản lý phiên bản | Bắt buộc |
| **Docker Desktop** | Chạy PostgreSQL, Redis, Backend và Frontend qua Compose | Bắt buộc (nếu chạy Docker) |
| **Java JDK 17+** | Biên dịch và chạy Spring Boot *(Maven Wrapper ở `apps/backend`)* | Bắt buộc (nếu chạy local) |
| **Node.js 20.9+ & pnpm 12.3.4** | Cài thư viện, chạy Frontend và bộ test Cypress | Bắt buộc (nếu chạy local/Cypress) |
| **PostgreSQL** | Cơ sở dữ liệu ứng dụng | Bắt buộc (nếu không dùng Docker) |
| **VS Code / DBeaver / REST Client** | Soạn code, quản trị CSDL, kiểm thử API | Khuyến nghị |

### 2. Lưu ý cấu hình trước khi chạy

1. **Khởi động Docker Desktop** trước khi chạy `docker compose up`.
2. **Biến môi trường:**
   - **Backend:** có thể ghi đè `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.
   - **Frontend chạy local:** tạo `apps/frontend/.env.local` từ `.env.example`; URL mặc định trỏ tới Backend ở `http://localhost:8081`.
3. **Kiểm tra sức khỏe dịch vụ:** Backend trả `{"status":"UP"}` tại `http://localhost:8081/health`.

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

**2.1. Khởi động PostgreSQL**

```bash
docker compose up -d db redis
```

Thông tin kết nối (đã khớp sẵn với `docker-compose.yml` và `application.properties`, không cần sửa):

| Dịch vụ | Địa chỉ | Thông tin |
| :--- | :--- | :--- |
| PostgreSQL | `localhost:5432` | database `drinkshop_db`, user `brewlite`, mật khẩu `taidz@2026` |

> [!NOTE]
> Đây là thông tin mặc định chỉ dành cho local. Nếu máy đã cài PostgreSQL riêng, hãy tắt service đó hoặc đổi cổng để tránh trùng cổng `5432` của Docker.

**2.2. Chạy Backend**

```bash
cd apps/backend
./mvnw spring-boot:run        # Linux/macOS
# Windows PowerShell: .\mvnw.cmd spring-boot:run
```

Flyway tạo/cập nhật schema và dữ liệu mẫu khi Backend khởi động; Hibernate chỉ kiểm tra schema (`ddl-auto=validate`). Backend sẵn sàng tại `http://localhost:8081/health`.

**2.3. Chạy Frontend (Next.js)** — mở một terminal mới:

```bash
cd apps/frontend
pnpm install
```

Tạo `apps/frontend/.env.local` từ file mẫu để gọi API local:

```bash
cp .env.example .env.local     # Linux/macOS
# Windows PowerShell: Copy-Item .env.example .env.local
```

Khởi động Frontend:

```bash
pnpm dev
```

### Flyway và migration

Flyway tự chạy các file SQL theo thứ tự khi Backend khởi động:

- `V1__init_schema.sql`: tạo schema ban đầu.
- `V2__seed_demo_data.sql`: dữ liệu demo cho local và E2E.
- Khi thay đổi schema, thêm migration mới, ví dụ `apps/backend/src/main/resources/db/migration/V3__add_customer_notes.sql`. Không sửa migration đã chạy ở môi trường dùng chung.

Với Supabase, Flyway có thể không tương thích transaction pooler cổng `6543`. Dùng direct connection hoặc session pooler cổng `5432`; nếu ứng dụng vẫn kết nối qua pooler `6543`, đặt riêng `SPRING_FLYWAY_URL`, `SPRING_FLYWAY_USERNAME`, `SPRING_FLYWAY_PASSWORD` cho Flyway.

### Bước 3. Địa chỉ truy cập

| Dịch vụ | Địa chỉ |
| :--- | :--- |
| Frontend | http://localhost:3000 |
| Backend health | http://localhost:8081/health |
| PostgreSQL | `localhost:5432` |

### Bước 4. Kiểm tra nhanh

Mở http://localhost:3000, đăng nhập (hoặc đăng ký tài khoản mới, mật khẩu tối thiểu 8 ký tự). Thấy danh sách thực đơn là hệ thống đã chạy đúng.

Chức năng thanh toán dùng cơ chế **In-App QR Modal** ngay trên trang Checkout. Khi chọn MoMo/VietQR, hệ thống hiển thị mã QR động chứa sẵn số tiền và mã đơn hàng (không chuyển trang). Bạn có thể bấm **"Xác nhận đã thanh toán"** hoặc **"Giả lập thất bại"** trên Modal để kiểm tra các luồng trạng thái (`PAID`, `CANCELLED`).

### Bước 5. Tài khoản mẫu

| Vai trò | Tài khoản | Mật khẩu |
| :--- | :--- | :--- |
| Quản lý (`ROLE_MANAGER`) | `demo-manager` | `BrewLite123!` |
| Nhân viên / Barista (`STAFF`) | `demo-staff` | `BrewLite123!` |
| Khách hàng (`ROLE_CUSTOMER`) | `demo-customer` | `BrewLite123!` |

Khách hàng mới có thể đăng ký tài khoản ngay trên giao diện.

---

## 🧪 Kiểm thử (Testing)

Dự án có unit tests cho Backend, kiểm tra build/type Frontend và Cypress E2E cho luồng đặt hàng/thanh toán.

### 1. Kiểm thử đơn vị (Unit Test — JUnit 5 & Mockito)

**Mục tiêu:** Kiểm tra độc lập logic nghiệp vụ ở tầng Domain/Service bằng JUnit và Mockito.

- **Vị trí mã nguồn:** `apps/backend/src/test/java/vn/doan`

```bash
cd apps/backend

# Chạy toàn bộ test
./mvnw test

# Chạy một file test cụ thể
./mvnw test -Dtest=PaymentServiceTest
# Windows PowerShell: .\mvnw.cmd test -Dtest=PaymentServiceTest
```

### 2. Kiểm thử đầu cuối (End-to-End — Cypress)

**Mục tiêu:** Mô phỏng thao tác khách hàng trên trình duyệt: đăng nhập → chọn Latte size L và topping → thêm vào giỏ → thanh toán VietQR mô phỏng → kiểm tra trạng thái `PAID` hoặc `CANCELLED`.

- **Vị trí mã nguồn:** `test/e2e/payment-flow.cy.js`
- **Điều kiện trước khi chạy:** toàn bộ dịch vụ Compose phải healthy; Flyway đã seed dữ liệu mẫu. Mặc định Cypress mở Frontend tại `http://localhost:3000`.

```bash
# Bước 1: Từ thư mục gốc, khởi động toàn bộ dịch vụ
docker compose up --build -d

# Bước 2: Vào thư mục test và cài thư viện
cd test
pnpm install

# Bước 3: Chạy kịch bản E2E
# Cách 1 — Giao diện trực quan (dùng khi demo):
pnpm cy:open

# Cách 2 — Chạy ẩn, không mở trình duyệt (dùng cho CI/CD):
pnpm cy:run
```

Kịch bản đăng nhập qua API, đặt Latte size L kèm topping, thanh toán VietQR mô phỏng và kiểm tra `PAID`; kịch bản lỗi kiểm tra `CANCELLED`. Ba tài khoản mẫu ở mục trên đều được kiểm tra đăng nhập trong E2E.

### Troubleshooting

- **Trùng cổng:** dừng dịch vụ đang chiếm cổng hoặc đặt `POSTGRES_HOST_PORT`, `REDIS_HOST_PORT`, `BACKEND_HOST_PORT`, hay `FRONTEND_HOST_PORT` trước khi chạy Compose.
- **Docker chưa chạy:** mở Docker Desktop rồi kiểm tra `docker compose ps`.
- **Thiếu `.env.local`:** trong `apps/frontend`, chạy `Copy-Item .env.example .env.local` trên PowerShell hoặc `cp .env.example .env.local` trên Linux/macOS.
- **Lỗi CORS/API khi chạy local:** xác nhận Backend khỏe tại `/health`, đặt `NEXT_PUBLIC_API_URL=http://localhost:8081` trong `.env.local`, rồi khởi động lại frontend.
- **Lỗi CORS khi deploy:** Backend mặc định cho phép domain demo `https://brewlite-frontend-omega.vercel.app`; nếu dùng domain khác hoặc Vercel Preview, đặt biến `CORS_ALLOWED_ORIGINS` trên Render thành danh sách origin cách nhau bằng dấu phẩy. `NEXT_PUBLIC_API_URL` có thể là URL backend gốc hoặc URL kết thúc bằng `/api`.

---

## 📦 Đóng gói (Build)

Đóng gói mã nguồn Backend thành file thực thi `.jar` và khởi chạy server.

```bash
# 1. Vào thư mục Backend
cd apps/backend

# 2. Đóng gói ứng dụng (lần đầu tải thư viện hơi lâu)
# Windows (PowerShell):
.\mvnw.cmd clean package -DskipTests

# Linux / macOS:
./mvnw clean package -DskipTests

# Kết quả: file thực thi tại target/doan-cnpm-0.0.1-SNAPSHOT.jar
```

Khởi chạy ứng dụng:

```bash
# Cách 1: Chạy qua Maven (khuyên dùng khi phát triển)
./mvnw spring-boot:run          # Linux/macOS
# Windows PowerShell: .\mvnw.cmd spring-boot:run

# Cách 2: Chạy file .jar đã build (dùng khi deploy)
java -jar target/doan-cnpm-0.0.1-SNAPSHOT.jar
```

---

## ☁️ Hướng dẫn triển khai (Deployment)

Hướng dẫn dưới đây triển khai thủ công qua Supabase, Render và Vercel. Pipeline GitHub Actions hiện chỉ chạy kiểm tra Frontend và Cypress E2E; nó **không** gọi Render Deploy Hook.

### 1. Cơ sở dữ liệu: Supabase (PostgreSQL)

1. Đăng nhập [Supabase](https://supabase.com/) và tạo Project mới. Chọn khu vực gần nhất (ví dụ `ap-southeast-1` Singapore) và đặt mật khẩu đủ mạnh.
2. Đợi vài phút để Supabase cấp phát Database.
3. Vào **Project Settings → Database**, kéo xuống **Connection string**, chọn tab **JDBC** và lưu lại chuỗi kết nối.
   - **Ví dụ:** dùng direct connection hoặc session pooler cổng `5432` cho Flyway; transaction pooler cổng `6543` có thể không hỗ trợ migration.
   - **User:** `postgres.[tên_project]`

> [!IMPORTANT]
> Lưu mật khẩu riêng trong Environment Variables, không ghi vào URL được commit lên Git.

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
| `PORT` | Render cung cấp tự động; Backend sẽ lắng nghe cổng này. |
| `SPRING_DATASOURCE_URL` | Chuỗi JDBC từ bước 1 |
| `SPRING_DATASOURCE_USERNAME` | `<SUPABASE_USERNAME>` (VD: `postgres.[tên_project]`) |
| `SPRING_DATASOURCE_PASSWORD` | `<SUPABASE_PASSWORD>` (mật khẩu đã đặt ở bước 1) |

5. Nhấn **Create Web Service** để Render kéo code và build Docker image (khoảng 3–5 phút).
6. Sau khi deploy thành công, Render cấp URL công khai, ví dụ `https://brewlite-backend-xxxx.onrender.com`.
7. Chọn Auto-Deploy từ nhánh `main` nếu muốn Render tự triển khai khi có push; workflow trong repo hiện không kích hoạt Deploy Hook.

### 3. Frontend: Vercel

1. `apps/frontend/vercel.json` hiện proxy `/api/*` tới Backend Render. Nếu dùng Backend khác, cập nhật URL đích trong file này trước khi deploy.

2. Đăng nhập https://vercel.com và import kho mã nguồn.
3. Cấu hình dự án:

| Thông số | Giá trị |
| :--- | :--- |
| **Root Directory** | `apps/frontend` |
| **Framework Preset** | `Next.js` |
| **Build Command** | `pnpm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `pnpm install` |

4. Nhấn **Deploy**. Vercel build và cấp tên miền Frontend. Nếu repo được liên kết với Vercel, việc deploy Frontend do Vercel quản lý độc lập với GitHub Actions.

### 4. Kiểm tra CI (GitHub Actions)

Workflow `.github/workflows/frontend-ci.yml` chạy khi push hoặc mở Pull Request vào `main`. Nó kiểm tra TypeScript/build Frontend, sau đó khởi động Docker Compose và chạy Cypress E2E. Workflow hiện không build/deploy Render; Vercel chỉ tự deploy nếu repository đã được liên kết trong cấu hình Vercel.