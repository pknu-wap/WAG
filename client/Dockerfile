FROM node:22.10.0-alpine AS base

WORKDIR /app

# 의존성 파일만 먼저 복사 (레이어 캐싱 최적화)
COPY package.json package-lock.json ./

# 의존성 설치 (package.json이 변경될 때만 재실행)
RUN npm ci --only=production

FROM base AS builder

# 의존성 재설치 (dev dependencies 포함)
COPY package.json package-lock.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 (GENERATE_SOURCEMAP 환경변수 설정)
RUN GENERATE_SOURCEMAP=false npm run build

# Nginx를 사용한 정적 파일 서빙
FROM nginx:alpine AS production

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]