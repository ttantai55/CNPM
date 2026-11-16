# ☕ BrewLite — Hệ Thống Quản Lý Quán Coffee

![Java](https://img.shields.io/badge/Java-17+-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-6DB33F?logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

BrewLite là hệ thống đặt đồ uống tự động hóa áp dụng kiến trúc hiện đại, tách biệt hoàn toàn giữa Frontend và Backend. Để đảm bảo hiệu suất ổn định, dữ liệu nhất quán và tối ưu quy trình làm việc nhóm, dự án tích hợp một hệ sinh thái công nghệ đồng bộ:

- **Nền tảng ứng dụng:** Java Spring Boot, Next.js
- **Quản trị dữ liệu:** PostgreSQL
- **DevOps & Kiểm thử tự động:** Docker, Cypress, GitHub Actions

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

- **Xác thực & Tài khoản:** Đăng ký và đăng nhập bằng tên đăng nhập, email hoặc số điện thoại.
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
| **Frontend** | Next.js (App Router), React, TailwindCSS, Fetch API |
| **Backend** | Java 17+, Spring Boot, Spring Security, Spring Data JPA, Flyway |
| **Cơ sở dữ liệu & Cache** | PostgreSQL, Redis, DBeaver |
| **Kiểm thử** | JUnit 5 / Spring Boot Test, Cypress (E2E) |
| **Triển khai (DevOps)** | Docker, Docker Compose, Supabase, Render, Vercel, GitHub Actions |

---

## 🏗️ Kiến trúc & Cấu trúc thư mục

```text
brewlite/
├── .github/
│   └── workflows/              # CI và CD (GitHub Actions)
├── apps/
│   ├── backend/                # Spring Boot API (port 8081), Dockerfile/.dockerignore
│   │   └── src/main/resources/
│   │       ├── application.properties
│   │       └── db/migration/   # V1 schema, V2 dữ liệu mẫu
│   └── frontend/               # Next.js (port 3000), Dockerfile/.dockerignore, .env.example
├── test/                       # Kiểm thử Cypress E2E
│   ├── package.json
│   ├── cypress.config.js
│   ├── pnpm-lock.yaml
│   └── e2e/                    # Kịch bản đăng nhập tài khoản mẫu
├── docker-compose.yml          # db, redis, backend, frontend
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
| **Node.js 20+ & pnpm 12** | Cài thư viện, chạy Frontend và bộ test Cypress | Bắt buộc (nếu chạy local/Cypress) |
| **PostgreSQL** | Hệ quản trị CSDL | Bắt buộc (nếu không dùng Docker) |
| **VS Code / DBeaver / REST Client** | Soạn code, quản trị CSDL, kiểm thử API | Khuyến nghị |

### 2. Lưu ý cấu hình trước khi chạy

1. **Khởi động Docker Desktop** trước khi chạy Docker Compose.
2. **Biến môi trường:**
   - **Backend:** cấu hình kết nối PostgreSQL qua `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`.
   - **Frontend local:** tạo `apps/frontend/.env.local` từ `.env.example`.
3. **Health endpoint:** `http://localhost:8081/actuator/health`.

> [!WARNING]
> **Tuyệt đối không** commit thông tin nhạy cảm (mật khẩu Database, khóa xác thực) lên GitHub.

---

## 🚀 Hướng dẫn chạy dự án ở Local

Hướng dẫn chạy hệ thống BrewLite (PostgreSQL + Backend + Frontend) trên máy cá nhân.

### Bước 1. Chuẩn bị

Cài đặt các công cụ theo mục [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống), sau đó tải mã nguồn:

```bash
git clone <URL_REPOSITORY>
cd <TEN_THU_MUC_DU_AN>
```

### Bước 2. Chọn cách chạy

#### Cách 1 — Chạy toàn bộ bằng Docker Compose (khuyên dùng)

Chỉ cần Docker đang chạy. Lệnh dưới build và khởi động đủ 4 dịch vụ: PostgreSQL (`db`), Redis, Backend và Frontend; Backend chỉ khởi động sau khi DB/Redis khỏe, Frontend chỉ khởi động sau khi Backend khỏe.

```bash
docker compose up --build --wait
```

Dừng hệ thống:

```bash
docker compose down
```

Muốn xóa cả dữ liệu PostgreSQL để kiểm tra cài mới:

```bash
docker compose down -v
```

#### Cách 2 — Chạy Backend và Frontend thủ công

Dùng Docker cho PostgreSQL; Backend và Frontend chạy trực tiếp trên máy (tiện để debug).

**2.1. Khởi động PostgreSQL**

```bash
docker compose up -d db redis
```

Thông tin kết nối (đã khớp sẵn với `docker-compose.yml` và `application.properties`, không cần sửa):

| Dịch vụ | Địa chỉ | Thông tin |
| :--- | :--- | :--- |
| PostgreSQL | `localhost:5432` | database `drinkshop_db`, user `brewlite`, mật khẩu `taidz@2026` (hoặc `DATABASE_PASSWORD`) |

> [!NOTE]
> Nếu máy đã cài PostgreSQL riêng, hãy tắt service đó hoặc đổi cổng để tránh trùng cổng `5432` của Docker.

**2.2. Chạy Backend**

```bash
cd apps/backend
./mvnw spring-boot:run        # Linux / macOS
# Windows PowerShell:
.\mvnw.cmd spring-boot:run
```

Flyway tự chạy các migration trong `src/main/resources/db/migration` khi backend khởi động; Hibernate chỉ kiểm tra schema (`ddl-auto=validate`), không tự tạo bảng.

**2.3. Chạy Frontend (Next.js)** — mở một terminal mới:

```bash
cd apps/frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

`NEXT_PUBLIC_API_URL` trong `.env.local` trỏ tới backend local (`http://localhost:8081`). Next.js chuyển tiếp request `/api` để trình duyệt gọi cùng origin.

### Bước 3. Địa chỉ truy cập

| Dịch vụ | Địa chỉ |
| :--- | :--- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8081 |
| Backend health | http://localhost:8081/actuator/health |
| PostgreSQL | `localhost:5432` |
| Redis | chỉ dùng nội bộ trong Compose |

### Bước 4. Kiểm tra nhanh

Mở http://localhost:3000, đăng nhập (hoặc đăng ký tài khoản mới, mật khẩu tối thiểu 8 ký tự). Thấy danh sách thực đơn là hệ thống đã chạy đúng.

Chức năng thanh toán dùng cơ chế **In-App QR Modal** ngay trên trang Checkout. Khi chọn MoMo/VietQR, hệ thống hiển thị mã QR động chứa sẵn số tiền và mã đơn hàng (không chuyển trang). Bạn có thể bấm **"Xác nhận đã thanh toán"** hoặc **"Giả lập thất bại"** trên Modal để kiểm tra các luồng trạng thái (`PAID`, `CANCELLED`).

### Bước 5. Tài khoản mẫu

| Vai trò | Tên đăng nhập | Email đăng nhập | Mật khẩu |
| :--- | :--- | :--- | :--- |
| Quản lý (MANAGER) | `demo-manager` | `manager@brewlite.vn` | `BrewLite123!` |
| Nhân viên (STAFF) | `demo-staff` | `staff@brewlite.vn` | `BrewLite123!` |
| Khách hàng (CUSTOMER) | `demo-customer` | `user@brewlite.vn` | `BrewLite123!` |

Khách hàng mới có thể đăng ký tài khoản ngay trên giao diện.

### Flyway migrations

- Khi backend kết nối PostgreSQL, Flyway chạy lần lượt migration chưa áp dụng và lưu lịch sử trong `flyway_schema_history`. Migration lỗi sẽ làm backend dừng; Flyway kiểm tra checksum mỗi lần migrate và Hibernate validate schema khi khởi động.
- Không sửa migration đã chạy trên môi trường dùng chung. Thêm thay đổi mới bằng file tiếp theo, ví dụ `apps/backend/src/main/resources/db/migration/V3__add_product_index.sql`; chỉ chứa SQL cho phần thay đổi đó.
- `V1` tạo schema PostgreSQL ban đầu, `V2` thêm dữ liệu mẫu. Với Supabase hoặc database đã có dữ liệu, sao lưu và đối chiếu schema trước khi kết nối; không để ứng dụng chạy các migration khởi tạo lên database đang dùng. Chỉ baseline có chủ đích sau khi xác nhận trạng thái schema và lịch sử phù hợp.

---

## 🧪 Kiểm thử (Testing)

Dự án kiểm thử backend bằng JUnit/Spring Boot Test và các luồng đăng nhập đầu cuối bằng Cypress.

### 1. Kiểm thử đơn vị (Unit Test — JUnit 5 & Mockito)

**Mục tiêu:** Kiểm tra các entity và service nghiệp vụ (đơn hàng, loyalty, thanh toán, người dùng) bằng JUnit/Mockito.

- **Vị trí mã nguồn:** `apps/backend/src/test/java/vn/doan`

```bash
cd apps/backend
./mvnw test
# Windows PowerShell:
.\mvnw.cmd test
```

### 2. Kiểm thử tích hợp (Spring Boot Test)

**Mục tiêu:** Kiểm tra các service nghiệp vụ và xác nhận Spring context khởi động với cấu hình H2 dành cho kiểm thử.

- **Vị trí mã nguồn:** `apps/backend/src/test/java/vn/doan/`

```bash
cd apps/backend

# Chạy riêng test thanh toán
./mvnw test -Dtest=PaymentServiceTest
# Windows PowerShell:
.\mvnw.cmd test -Dtest=PaymentServiceTest
```

> 📄 **Báo cáo chi tiết:** xem tại `apps/backend/target/surefire-reports/`.

### 3. Kiểm thử đầu cuối (End-to-End — Cypress)

**Mục tiêu:** Đăng nhập qua giao diện với đủ ba tài khoản mẫu và xác nhận điều hướng theo vai trò.

- **Vị trí mã nguồn:** `test/e2e/demo-login.cy.js`
- **Điều kiện trước khi chạy:** toàn bộ dịch vụ phải đang hoạt động:
  - Frontend tại `http://localhost:3000`
  - Backend khỏe tại `http://localhost:8081/actuator/health`
  - PostgreSQL đã migrate và có dữ liệu mẫu

```bash
# Bước 1: Khởi động stack từ thư mục gốc repo, đợi healthcheck hoàn tất
docker compose up --build -d --wait

# Bước 2: Vào thư mục test và cài thư viện
cd test
pnpm install

# Bước 3: Chạy kịch bản E2E
# Cách 1 — Giao diện trực quan (dùng khi demo):
pnpm exec cypress open

# Cách 2 — Chạy ẩn, không mở trình duyệt (dùng cho CI/CD):
pnpm exec cypress run
```

### Troubleshooting

- **Trùng cổng `5432`:** dừng PostgreSQL cài sẵn hoặc đổi cổng host `5432` trong `docker-compose.yml`.
- **Docker chưa bật:** khởi động Docker Desktop, kiểm tra `docker info`, rồi chạy lại Compose.
- **Thiếu `.env.local`:** trong `apps/frontend`, sao chép `.env.example` thành `.env.local` rồi khởi động lại Next.js.
- **Lỗi CORS/API:** dùng frontend tại `http://localhost:3000` để request `/api` đi qua Next.js rewrite; xác nhận backend khỏe tại `/actuator/health` và `BACKEND_URL` trong Compose trỏ tới `http://backend:8081`.

---

## 📦 Đóng gói (Build)

Đóng gói mã nguồn Backend thành file thực thi `.jar` và khởi chạy server.

```bash
# 1. Vào thư mục Backend
cd apps/backend

# 2. Đóng gói ứng dụng (lần đầu tải thư viện hơi lâu)
./mvnw clean package -DskipTests
# Windows PowerShell:
.\mvnw.cmd clean package -DskipTests

# Kết quả: file thực thi tại target/doan-cnpm-0.0.1-SNAPSHOT.jar
```

Khởi chạy ứng dụng:

```bash
# Cách 1: Chạy qua Maven (khuyên dùng khi phát triển)
./mvnw spring-boot:run          # Windows: .\mvnw.cmd spring-boot:run

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

- `.github/workflows/ci.yml` chạy backend tests, build frontend và Cypress sau khi Compose khỏe.
- `.github/workflows/cd.yml` build JAR và Docker image khi push lên `main` hoặc tag `v*`; workflow hiện lưu image thành artifact, không tự deploy lên Render.
- Cấu hình auto-deploy trên Render và Vercel riêng trong dashboard của từng dịch vụ.