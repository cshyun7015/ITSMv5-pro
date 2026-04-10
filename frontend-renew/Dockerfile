# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# OTel 관련 패키지 설치를 위해 package.json 복사 후 설치
COPY package.json package-lock.json* ./
ARG VITE_API_URL
ARG VITE_ENABLE_MOCKS
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENABLE_MOCKS=$VITE_ENABLE_MOCKS
RUN npm install
RUN npx msw init public

# 소스 복사 및 빌드 (COPY 명령어 수정)
COPY . .
RUN npm run build

# Run Stage: OTel 모듈이 포함된 Nginx 이미지 사용
FROM nginxinc/nginx-unprivileged:otel
# 권한 문제를 방지하기 위해 root로 잠시 전환
USER root

# 기존 nginx.conf 대신 OTel 설정이 포함된 conf 사용
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

# 권한 설정 및 사용자 복구
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx
USER nginx

# 포트 번호 80으로 수정 (nginx.conf와 일치)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]