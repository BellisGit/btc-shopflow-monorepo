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
COPY apps/admin-app/package.json apps/admin-app/package.json
COPY apps/docs-site-app/package.json apps/docs-site-app/package.json
COPY apps/engineering-app/package.json apps/engineering-app/package.json
COPY apps/finance-app/package.json apps/finance-app/package.json
COPY apps/logistics-app/package.json apps/logistics-app/package.json
COPY apps/production-app/package.json apps/production-app/package.json
COPY apps/quality-app/package.json apps/quality-app/package.json
COPY apps/system-app/package.json apps/system-app/package.json

FROM base AS deps
# 使用 frozen-lockfile 保证一致性；若无 pnpm-lock.yaml，会回退到 install
COPY pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

FROM base AS build
COPY --from=deps /repo/node_modules /repo/node_modules
# 完整拷贝源代码用于构建
COPY . .
# 构建指定子应用
WORKDIR /repo/${APP_DIR}
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm build

# 运行时镜像：Nginx 提供静态资源，并支持 SPA fallback
FROM nginx:1.27-alpine AS runner
ARG APP_DIR=apps/admin-app
ENV APP_DIR=${APP_DIR}
# 拷贝通用 nginx 配置（若存在）
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# 拷贝构建产物到 nginx 根目录
COPY --from=build /repo/${APP_DIR}/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


