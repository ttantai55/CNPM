# Giai đoạn 1: Cài đặt thư viện và build ứng dụng
FROM node:20-alpine AS builder
WORKDIR /app

# Dùng .npmrc* để không báo lỗi nếu dự án không có file .npmrc
COPY .npmrc* package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Giới hạn luồng tải và lưu cache để tránh lỗi timeout khi tải gói nặng
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    corepack enable && \
    pnpm install --frozen-lockfile --fetch-timeout=600000 --network-concurrency=4

COPY . .

# Truyền URL của Backend vào lúc build (Next.js đóng gói biến NEXT_PUBLIC_* ở bước build)
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN mkdir -p /app/public && pnpm run build

# Giai đoạn 2: Chạy ứng dụng Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]