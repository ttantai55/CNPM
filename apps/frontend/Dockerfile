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

# Cấu hình URL backend cho rewrite server-side của Next.js
ARG BACKEND_URL=http://backend:8081
ENV BACKEND_URL=$BACKEND_URL

RUN mkdir -p /app/public && pnpm run build

# Giai đoạn 2: Chạy ứng dụng Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node

EXPOSE 3000
CMD ["node", "server.js"]