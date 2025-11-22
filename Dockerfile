# syntax=docker/dockerfile:1.7
# 通用多阶段构建：使用 --build-arg APP_DIR=apps/admin-app 指定子应用目录
ARG NODE_VERSION=20-alpine
ARG PNPM_VERSION=9
ARG APP_DIR=apps/admin-app

FROM node:${NODE_VERSION} AS base
WORKDIR /repo
ENV CI=true
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# 仅拷贝 workspace 元数据与锁文件，加快安装缓存命中
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY packages/shared-core/package.json packages/shared-core/package.json
COPY packages/shared-components/package.json packages/shared-components/package.json
COPY packages/shared-utils/package.json packages/shared-utils/package.json
COPY packages/vite-plugin/package.json packages/vite-plugin/package.json
COPY packages/subapp-manifests/package.json packages/subapp-manifests/package.json
COPY apps/admin-app/package.json apps/admin-app/package.json
COPY apps/docs-site-app/package.json apps/docs-site-app/package.json
COPY apps/engineering-app/package.json apps/engineering-app/package.json
COPY apps/finance-app/package.json apps/finance-app/package.json
COPY apps/logistics-app/package.json apps/logistics-app/package.json
COPY apps/production-app/package.json apps/production-app/package.json
COPY apps/quality-app/package.json apps/quality-app/package.json
COPY apps/system-app/package.json apps/system-app/package.json
COPY apps/mobile-app/package.json apps/mobile-app/package.json

FROM base AS deps
# 安装依赖（忽略 prepare 脚本，因为此时还没有源代码）
COPY pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --no-frozen-lockfile --ignore-scripts

FROM base AS build
ARG APP_DIR
# 先复制依赖（从 deps 阶段，利用缓存加速）
COPY --from=deps /repo/node_modules /repo/node_modules
COPY --from=deps /repo/pnpm-lock.yaml /repo/pnpm-lock.yaml
# 拷贝源代码（.dockerignore 已排除 node_modules）
COPY . .
# 重新安装依赖以确保 prepare 脚本正确执行（源代码现在已存在）
WORKDIR /repo
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline
# 构建指定子应用（从根目录使用 filter 构建，需要先构建依赖包）
# Vite build 默认会读取 .env.production 文件（如果存在）
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    APP_NAME=$(basename ${APP_DIR}) && \
    pnpm --filter @btc/vite-plugin build && \
    pnpm --filter @btc/shared-utils build && \
    pnpm --filter @btc/shared-core build && \
    pnpm --filter @btc/shared-components build && \
    pnpm --filter @btc/subapp-manifests build && \
    pnpm --filter ${APP_NAME} build

# 运行时镜像：使用 Node.js 提供静态资源服务
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS runner
ARG APP_DIR=apps/admin-app
ENV APP_DIR=${APP_DIR}
WORKDIR /app

# 安装 serve 用于提供静态文件服务
RUN npm install -g serve

# 拷贝构建产物
COPY --from=build /repo/${APP_DIR}/dist ./dist

# 验证 dist 目录是否存在且不为空
RUN if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then \
      echo "ERROR: dist directory is empty or does not exist!" && \
      echo "APP_DIR=${APP_DIR}" && \
      ls -la /app || true && \
      exit 1; \
    else \
      echo "✅ dist directory is valid" && \
      ls -la dist | head -10; \
    fi

EXPOSE 80
# 使用 -s 参数支持 SPA 路由，-n 参数禁用缓存
CMD ["serve", "-s", "dist", "-l", "80", "-n"]


