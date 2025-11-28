# syntax=docker/dockerfile:1.7
# 优化后的 Dockerfile：仅负责运行，不进行构建
# 依赖于外部（CI Runner）已经构建好的 dist 目录

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION}

ARG APP_DIR=apps/admin-app
ENV APP_DIR=${APP_DIR}
WORKDIR /app

# 安装 serve
RUN npm install -g serve

# 直接复制构建产物
# 注意：这要求在运行 docker build 之前，已经在本地/Runner完成了 build 生成了 dist
COPY ${APP_DIR}/dist ./dist

# 验证 dist 目录
RUN if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then \
      echo "ERROR: dist directory is empty or does not exist!" && \
      echo "Please ensure you have run 'pnpm build' for ${APP_DIR} before building this Docker image." && \
      ls -la /app || true && \
      exit 1; \
    else \
      echo "✅ dist directory is valid" && \
      ls -la dist | head -10; \
    fi

EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80", "-n"]
