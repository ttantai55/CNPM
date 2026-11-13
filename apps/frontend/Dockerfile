# Giai đoạn 1: Cài đặt thư viện và build ứng dụng
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

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

RUN corepack enable

EXPOSE 3000
CMD ["pnpm", "start"]