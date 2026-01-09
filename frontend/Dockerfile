# 1. 빌드 스테이지
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 설치 (캐시 활용을 위해 먼저 복사)
COPY package*.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2. 실행 스테이지
FROM node:20-alpine AS runner
WORKDIR /app

# 보안을 위해 시스템 환경 변수 설정
ENV NODE_ENV production

# 빌드 스테이지에서 생성된 결과물만 복사 (이미지 용량 최적화)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]