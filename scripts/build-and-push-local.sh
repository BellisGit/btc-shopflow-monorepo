#!/bin/bash

# 本地构建并推送 Docker 镜像到远程仓库，然后触发 GitHub Actions 工作流部署
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
APP_NAME=""
AUTO_DEPLOY=false
NO_PUSH=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --auto-deploy)
            AUTO_DEPLOY=true
            shift
            ;;
        --no-push)
            NO_PUSH=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 <app-name> [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --auto-deploy    构建并推送后自动触发部署工作流"
            echo "  --no-push        只构建，不推送镜像"
            echo "  --help, -h        显示帮助信息"
            echo ""
            echo "环境变量:"
            echo "  GITHUB_TOKEN     GitHub Personal Access Token（必需，用于推送镜像和触发工作流）"
            echo "  GITHUB_REPO      GitHub 仓库（默认: BellisGit/btc-shopflow-monorepo）"
            echo ""
            echo "示例:"
            echo "  $0 system-app"
            echo "  $0 admin-app --auto-deploy"
            echo "  $0 logistics-app --no-push"
            exit 0
            ;;
        *)
            if [ -z "$APP_NAME" ]; then
                APP_NAME="$1"
            else
                log_error "未知参数: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# 验证应用名称
if [ -z "$APP_NAME" ]; then
    log_error "请指定要构建的应用名称"
    echo "用法: $0 <app-name> [OPTIONS]"
    echo "示例: $0 system-app"
    echo "示例: $0 admin-app --auto-deploy"
    exit 1
fi

# 检查本地 Docker（不需要 SSH，直接在本地构建）
log_info "检查本地 Docker 环境..."

# 检测 Docker 命令（支持多种环境）
DOCKER_CMD=""

# 按优先级尝试不同的检测方法
# 方法 1: 直接尝试 docker 命令（适用于 PATH 中已配置的情况）
if docker --version > /dev/null 2>&1; then
    DOCKER_CMD="docker"
# 方法 2: 尝试 docker.exe（Windows 环境，Git Bash）
elif docker.exe --version > /dev/null 2>&1; then
    DOCKER_CMD="docker.exe"
# 方法 3: 尝试通过 cmd.exe 调用 docker（Windows/Git Bash 环境）
elif cmd.exe /c docker --version > /dev/null 2>&1; then
    DOCKER_CMD="cmd.exe /c docker"
# 方法 4: 使用 command -v 检测（bash）
elif command -v docker > /dev/null 2>&1; then
    DOCKER_CMD="docker"
# 方法 5: 使用 which 检测
elif which docker > /dev/null 2>&1; then
    DOCKER_CMD="docker"
# 方法 6: 尝试 Windows 常见安装路径
elif [ -f "/c/Program Files/Docker/Docker/resources/bin/docker.exe" ]; then
    DOCKER_CMD="/c/Program Files/Docker/Docker/resources/bin/docker.exe"
elif [ -f "/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe" ]; then
    DOCKER_CMD="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
# 方法 7: 尝试通过 WSL 访问（如果安装了 WSL）
elif command -v wsl > /dev/null 2>&1 && wsl docker --version > /dev/null 2>&1; then
    DOCKER_CMD="wsl docker"
fi

if [ -z "$DOCKER_CMD" ]; then
    log_error "Docker 未安装或未在 PATH 中"
    log_info ""
    log_info "请确保 Docker 已安装并正在运行:"
    log_info "  Windows: 请安装 Docker Desktop - https://www.docker.com/products/docker-desktop"
    log_info "  安装后请确保 Docker Desktop 正在运行（系统托盘中的 Docker 图标）"
    log_info ""
    log_info "验证 Docker 是否安装:"
    log_info "  - 在 PowerShell 中运行: docker --version"
    log_info "  - 在 Git Bash 中运行: cmd.exe /c docker --version"
    log_info ""
    log_info "如果已安装但无法找到，请确保 Docker Desktop 已添加到系统 PATH"
    exit 1
fi

# 验证 Docker 是否正在运行
log_info "验证 Docker 是否运行..."
if ! $DOCKER_CMD info > /dev/null 2>&1; then
    log_error "Docker 未运行或无法连接"
    log_info ""
    log_info "请启动 Docker Desktop:"
    log_info "  - 在 Windows 开始菜单中搜索 'Docker Desktop' 并启动"
    log_info "  - 等待 Docker Desktop 完全启动（系统托盘图标不再闪烁）"
    log_info ""
    log_info "验证 Docker 是否运行:"
    log_info "  $DOCKER_CMD info"
    exit 1
fi

log_success "本地 Docker 已就绪 (使用: $DOCKER_CMD)"

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

# 检查 GitHub Token（尝试多种方式获取）
if [ -z "$GITHUB_TOKEN" ]; then
    # 尝试从 Git 凭据管理器获取（Windows）
    if command -v git-credential-manager > /dev/null 2>&1; then
        GITHUB_TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep password | cut -d= -f2 | head -1)
    fi
fi

if [ -z "$GITHUB_TOKEN" ]; then
    log_error "未设置 GITHUB_TOKEN 环境变量"
    log_info ""
    log_info "📝 设置方法:"
    log_info ""
    log_info "  PowerShell (当前会话):"
    log_info "    \$env:GITHUB_TOKEN=\"your_token_here\""
    log_info ""
    log_info "  PowerShell (永久设置):"
    log_info "    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token_here', 'User')"
    log_info ""
    log_info "  Git Bash / WSL:"
    log_info "    export GITHUB_TOKEN=your_token_here"
    log_info "    或者在 ~/.bashrc 中添加: export GITHUB_TOKEN=your_token_here"
    log_info ""
    log_info "🔑 创建 GitHub Token:"
    log_info "  1. 访问: https://github.com/settings/tokens"
    log_info "  2. 点击 'Generate new token' -> 'Generate new token (classic)'"
    log_info "  3. 设置过期时间并选择以下权限:"
    log_info "     - ✅ write:packages (推送镜像到 GHCR)"
    log_info "     - ✅ actions:write (触发 GitHub Actions 工作流)"
    log_info "     - ✅ repo (如果仓库是私有的)"
    log_info "  4. 生成后复制 token（只显示一次！）"
    log_info ""
    log_info "💡 提示: 设置环境变量后，请重新运行此命令"
    exit 1
fi

# 获取当前 Git SHA
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")

# 设置镜像标签
IMAGE_TAG_LATEST="${REGISTRY}/${REPO_LOWER}/${APP_NAME}:latest"
IMAGE_TAG_SHA="${REGISTRY}/${REPO_LOWER}/${APP_NAME}:${GIT_SHA}"

log_info "📦 准备在本地构建镜像..."
log_info "标签: $IMAGE_TAG_LATEST"
log_info "标签: $IMAGE_TAG_SHA"
echo ""

# 本地构建并推送镜像（不使用 SSH，直接在本地 Docker 中构建）
log_info "📦 在本地构建 Docker 镜像..."
log_info "这可能需要一些时间，请耐心等待..."
echo ""

# 登录到 GitHub Container Registry
log_info "🔐 登录到 GitHub Container Registry..."
echo "$GITHUB_TOKEN" | $DOCKER_CMD login ghcr.io -u "$(git config user.name 2>/dev/null || echo 'github-actions')" --password-stdin 2>/dev/null || {
    log_error "登录失败，请检查 GITHUB_TOKEN 是否有效"
    exit 1
}
log_success "登录成功"
echo ""

# 构建镜像（本地 Docker）
export DOCKER_BUILDKIT=1

log_info "开始构建镜像: $IMAGE_TAG_LATEST"
if $DOCKER_CMD build \
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

# 推送镜像（推送到 GHCR）
if [ "$NO_PUSH" = false ]; then
    log_info "📤 推送镜像到 $REGISTRY..."
    if $DOCKER_CMD push "$IMAGE_TAG_LATEST" && $DOCKER_CMD push "$IMAGE_TAG_SHA"; then
        log_success "镜像推送成功"
    else
        log_error "镜像推送失败"
        exit 1
    fi
    echo ""
else
    log_warning "跳过推送（--no-push 选项）"
    echo ""
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "✅ 构建并推送完成！"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "📋 镜像信息:"
log_info "  - $IMAGE_TAG_LATEST"
log_info "  - $IMAGE_TAG_SHA"
echo ""

# 自动触发部署
if [ "$AUTO_DEPLOY" = true ] && [ "$NO_PUSH" = false ]; then
    log_info "🚀 自动触发部署工作流..."
    
    # 获取仓库 owner 和 repo 名称
    REPO_OWNER=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
    REPO_NAME=$(echo "$GITHUB_REPO" | cut -d'/' -f2)
    
    # 验证 Token 是否有效
    log_info "验证 GitHub Token..."
    TOKEN_CHECK=$(curl -s -w "\n%{http_code}" \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/user" 2>&1)
    
    TOKEN_CHECK_CODE=$(echo "$TOKEN_CHECK" | tail -n1)
    TOKEN_CHECK_BODY=$(echo "$TOKEN_CHECK" | sed '$d')
    
    if [ "$TOKEN_CHECK_CODE" -ne 200 ]; then
        log_error "❌ GitHub Token 验证失败 (HTTP $TOKEN_CHECK_CODE)"
        log_warning "响应: $TOKEN_CHECK_BODY"
        log_info ""
        log_info "💡 解决方案:"
        log_info "  1. 检查 Token 是否有效: https://github.com/settings/tokens"
        log_info "  2. 确认 Token 未过期"
        log_info "  3. 重新生成 Token 并设置:"
        log_info "     PowerShell: \$env:GITHUB_TOKEN=\"your_new_token\""
        log_info "     Git Bash: export GITHUB_TOKEN=\"your_new_token\""
        log_info "  4. 确保 Token 具有以下权限:"
        log_info "     - ✅ write:packages (推送镜像)"
        log_info "     - ✅ actions:write (触发工作流)"
        log_info "     - ✅ repo (如果仓库是私有的)"
        exit 1
    fi
    
    log_success "✅ GitHub Token 验证通过"
    
    # 触发 GitHub Actions 工作流
    log_info "触发轻量级部署工作流: $APP_NAME"
    
    # 方法1: 尝试使用 repository_dispatch API（更可靠，不依赖工作流文件名）
    log_info "尝试使用 repository_dispatch 触发 deploy-only 工作流..."
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/dispatches" \
        -d "{
            \"event_type\": \"deploy-apps\",
            \"client_payload\": {
                \"apps\": \"$APP_NAME\",
                \"environment\": \"production\",
                \"github_sha\": \"$GIT_SHA\"
            }
        }" 2>&1)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
    
    # 如果 repository_dispatch 失败，尝试 workflow_dispatch
    if [ "$HTTP_CODE" -ne 204 ]; then
        log_warning "repository_dispatch 失败 (HTTP $HTTP_CODE)，尝试 workflow_dispatch..."
        
        # 方法2: 使用 workflow_dispatch API（需要工作流文件名）
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            -H "Content-Type: application/json" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/deploy-only.yml/dispatches" \
            -d "{
                \"ref\": \"master\",
                \"inputs\": {
                    \"apps\": \"$APP_NAME\",
                    \"environment\": \"production\",
                    \"github_sha\": \"$GIT_SHA\"
                }
            }" 2>&1)
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
    fi
    
    if [ "$HTTP_CODE" -eq 204 ]; then
        log_success "✅ 轻量级部署工作流已触发"
        log_info "查看工作流运行状态: https://github.com/$GITHUB_REPO/actions"
        log_info ""
        log_info "📋 部署信息:"
        log_info "  - 应用: $APP_NAME"
        log_info "  - 环境: production"
        log_info "  - SHA: $GIT_SHA"
    else
        log_error "⚠️  触发部署工作流失败 (HTTP $HTTP_CODE)"
        log_warning "响应: $RESPONSE_BODY"
        log_info ""
        
        if [ "$HTTP_CODE" -eq 401 ]; then
            log_error "❌ 认证失败: Token 无效或已过期"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token 是否有效: https://github.com/settings/tokens"
            log_info "  2. 如果 Token 已过期，重新生成:"
            log_info "     - 访问: https://github.com/settings/tokens/new"
            log_info "     - 选择权限: write:packages, actions:write, repo"
            log_info "  3. 设置新 Token:"
            log_info "     PowerShell: \$env:GITHUB_TOKEN=\"your_new_token\""
            log_info "     Git Bash: export GITHUB_TOKEN=\"your_new_token\""
        elif [ "$HTTP_CODE" -eq 403 ]; then
            log_error "❌ 权限不足: Token 缺少必要的权限"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token 权限: https://github.com/settings/tokens"
            log_info "  2. 确保勾选了以下权限:"
            log_info "     - ✅ write:packages (推送镜像)"
            log_info "     - ✅ actions:write (触发工作流)"
            log_info "     - ✅ repo (如果仓库是私有的)"
            log_info "  3. 如果权限不足，重新生成 Token 并选择所有需要的权限"
        elif [ "$HTTP_CODE" -eq 404 ]; then
            log_error "❌ 工作流未找到: deploy-only.yml 可能尚未被 GitHub 识别"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 等待 2-5 分钟让 GitHub 识别新工作流"
            log_info "  2. 访问: https://github.com/$GITHUB_REPO/actions 查看工作流列表"
            log_info "  3. 手动触发部署:"
            log_info "     pnpm deploy:$APP_NAME"
            log_info "  4. 或在 GitHub 网页上手动触发:"
            log_info "     https://github.com/$GITHUB_REPO/actions/workflows/deploy-only.yml"
        else
            log_error "❌ 未知错误 (HTTP $HTTP_CODE)"
            log_info ""
            log_info "💡 可能的原因:"
            log_info "  1. Token 权限不足"
            log_info "  2. 工作流文件尚未被 GitHub 识别"
            log_info "  3. 网络连接问题"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token: https://github.com/settings/tokens"
            log_info "  2. 等待几分钟后重试"
            log_info "  3. 手动触发部署:"
            log_info "     pnpm deploy:$APP_NAME"
        fi
    fi
    echo ""
fi

if [ "$AUTO_DEPLOY" = false ]; then
    log_info "🚀 下一步："
    log_info "  1. 自动部署: 使用 --auto-deploy 选项"
    log_info "  2. 手动触发: pnpm deploy:$APP_NAME"
    echo ""
fi
