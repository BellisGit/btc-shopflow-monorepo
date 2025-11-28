# syntax=docker/dockerfile:1.7
# 优化后的 Dockerfile：仅负责运行，不进行构建
# 依赖于外部（CI Runner）已经构建好的 dist 目录

ARG APP_DIR=apps/admin-app
FROM nginx:alpine

ARG APP_DIR
ENV APP_DIR=${APP_DIR}

# 复制构建产物到 Nginx 默认目录
COPY ${APP_DIR}/dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 验证 dist 目录
RUN if [ ! -d "/usr/share/nginx/html" ] || [ -z "$(ls -A /usr/share/nginx/html 2>/dev/null)" ]; then \
      echo "ERROR: dist directory is empty or does not exist!" && \
      echo "Please ensure you have run 'pnpm build' for ${APP_DIR} before building this Docker image." && \
      ls -la /usr/share/nginx/html || true && \
      exit 1; \
    else \
      echo "✅ dist directory is valid" && \
      ls -la /usr/share/nginx/html | head -10; \
    fi

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
