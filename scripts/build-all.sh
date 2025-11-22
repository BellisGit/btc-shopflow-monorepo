#!/bin/bash

# BTC ShopFlow - 构建所有 Docker 镜像脚本
# 用于宝塔面板部署

set -e

echo "🚀 开始构建 BTC ShopFlow 所有应用镜像..."

# 项目根目录
PROJECT_ROOT=$(pwd)
REGISTRY="btc-shopflow"

# 应用列表
APPS=(
    "system-app"
    "admin-app" 
    "finance-app"
    "logistics-app"
    "quality-app"
    "production-app"
    "engineering-app"
    "docs-site-app"
    "mobile-app"
)

# 构建函数
build_app() {
    local app_name=$1
    local app_path="apps/${app_name}"
    
    echo "📦 构建 ${app_name}..."
    
    if [ ! -d "${app_path}" ]; then
        echo "⚠️  警告: ${app_path} 目录不存在，跳过构建"
        return
    fi
    
    # 检查是否有 Dockerfile
    if [ ! -f "${app_path}/Dockerfile" ]; then
        echo "📝 创建 ${app_name} 的 Dockerfile..."
        cat > "${app_path}/Dockerfile" << EOF
# Multi-stage build for ${app_name}
FROM node:20-alpine AS builder

WORKDIR /app

# 复制所有 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY auth/ ./auth/
COPY scripts/ ./scripts/
COPY configs/ ./configs/

# 安装 pnpm
RUN npm install -g pnpm

# 安装所有依赖
RUN pnpm install --no-frozen-lockfile

# 构建依赖包（按依赖顺序）
RUN pnpm --filter @btc/vite-plugin run build
RUN pnpm --filter @btc/shared-utils run build
RUN pnpm --filter @btc/shared-core run build
RUN pnpm --filter @btc/shared-components run build
RUN pnpm --filter @btc/subapp-manifests run build

# 构建应用
RUN cd apps/${app_name} && pnpm run build

# Production stage
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/apps/${app_name}/dist /usr/share/nginx/html

# 复制 nginx 配置或创建默认配置
RUN if [ -f "apps/${app_name}/nginx.conf" ]; then \
        cp apps/${app_name}/nginx.conf /etc/nginx/conf.d/default.conf; \
    else \
        echo 'server { listen 80; location / { try_files \$uri \$uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf; \
    fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
    fi
    
    # 构建镜像
    docker build -t "${REGISTRY}/${app_name}:latest" -f "${app_path}/Dockerfile" .
    
    if [ $? -eq 0 ]; then
        echo "✅ ${app_name} 构建成功"
    else
        echo "❌ ${app_name} 构建失败"
        exit 1
    fi
}

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查是否在项目根目录
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo "❌ 请在项目根目录执行此脚本"
    exit 1
fi

# 构建所有应用
for app in "${APPS[@]}"; do
    build_app "$app"
done

echo ""
echo "🎉 所有应用镜像构建完成！"
echo ""
echo "📋 构建的镜像列表:"
for app in "${APPS[@]}"; do
    if docker images "${REGISTRY}/${app}:latest" --format "table {{.Repository}}:{{.Tag}}" | grep -q "${app}"; then
        echo "  ✅ ${REGISTRY}/${app}:latest"
    fi
done

echo ""
echo "🚀 接下来可以执行部署命令:"
echo "   cd k8s && ./deploy.sh"
