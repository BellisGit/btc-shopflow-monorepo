#!/bin/bash

# 本地构建并推送 Docker 镜像到远程仓库
# 用于快速更新生产环境镜像

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 默认配置
GITHUB_REPO="${GITHUB_REPO:-BellisGit/btc-shopflow-monorepo}"
REPO_LOWER=$(echo "$GITHUB_REPO" | tr '[:upper:]' '[:lower:]')
REGISTRY="ghcr.io"
APP_NAME="${1:-system-app}"

if [ -z "$1" ]; then
    log_error "请指定要构建的应用名称"
    echo "用法: $0 <app-name>"
    echo "示例: $0 system-app"
    echo "示例: $0 admin-app"
    exit 1
fi

# 检查 Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查是否在项目根目录
if [ ! -f "Dockerfile" ]; then
    log_error "未找到 Dockerfile，请在项目根目录运行此脚本"
    exit 1
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🚀 本地构建并推送 Docker 镜像"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "应用: $APP_NAME"
log_info "仓库: $GITHUB_REPO"
log_info "注册表: $REGISTRY"
echo ""

# 检查 GitHub Token
if [ -z "$GITHUB_TOKEN" ]; then
    log_warning "未设置 GITHUB_TOKEN 环境变量"
    log_info "请运行: export GITHUB_TOKEN=your_token"
    log_info "或者在 ~/.bashrc 中添加: export GITHUB_TOKEN=your_token"
    read -p "是否继续尝试登录? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 登录到 GitHub Container Registry
log_info "🔐 登录到 GitHub Container Registry..."
if [ -n "$GITHUB_TOKEN" ]; then
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$(git config user.name)" --password-stdin 2>/dev/null || {
        log_error "登录失败，请检查 GITHUB_TOKEN 是否有效"
        exit 1
    }
    log_success "登录成功"
else
    log_warning "跳过登录，如果镜像为私有，构建可能会失败"
fi
echo ""

# 设置镜像标签
IMAGE_TAG_LATEST="${REGISTRY}/${REPO_LOWER}/${APP_NAME}:latest"
IMAGE_TAG_SHA="${REGISTRY}/${REPO_LOWER}/${APP_NAME}:$(git rev-parse --short HEAD)"

log_info "📦 构建镜像..."
log_info "标签: $IMAGE_TAG_LATEST"
log_info "标签: $IMAGE_TAG_SHA"
echo ""

# 使用 Docker BuildKit 构建镜像
export DOCKER_BUILDKIT=1

if docker build \
    --build-arg APP_DIR=apps/$APP_NAME \
    --tag "$IMAGE_TAG_LATEST" \
    --tag "$IMAGE_TAG_SHA" \
    --file ./Dockerfile \
    --progress=plain \
    .; then
    log_success "镜像构建成功"
else
    log_error "镜像构建失败"
    exit 1
fi
echo ""

# 推送镜像
log_info "📤 推送镜像到 $REGISTRY..."
if docker push "$IMAGE_TAG_LATEST" && docker push "$IMAGE_TAG_SHA"; then
    log_success "镜像推送成功"
else
    log_error "镜像推送失败"
    exit 1
fi
echo ""

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "✅ 构建并推送完成！"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "📋 镜像信息:"
log_info "  - $IMAGE_TAG_LATEST"
log_info "  - $IMAGE_TAG_SHA"
echo ""
log_info "🚀 下一步："
log_info "  1. 在服务器上运行: docker pull $IMAGE_TAG_LATEST"
log_info "  2. 或运行重新部署脚本: ./scripts/force-redeploy.sh"
echo ""

