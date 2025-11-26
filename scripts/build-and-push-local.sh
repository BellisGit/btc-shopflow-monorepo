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

# Windows 上尝试从注册表读取用户级环境变量（通过 PowerShell）
if [ -z "$GITHUB_TOKEN" ]; then
    # 检测是否为 Windows 环境
    IS_WINDOWS=false
    if [ -n "$WINDIR" ] || [ "$OS" = "Windows_NT" ] || [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ] || [ "$OSTYPE" = "win32" ]; then
        IS_WINDOWS=true
    fi
    
    # 如果检测到 Windows 或者 PowerShell 可用，尝试读取
    if [ "$IS_WINDOWS" = "true" ] || command -v powershell.exe > /dev/null 2>&1; then
        if command -v powershell.exe > /dev/null 2>&1; then
            # 使用和测试脚本完全相同的命令（已验证可以工作）
            # 注意：在双引号中使用 \$ 转义，确保 bash 不解释 PowerShell 变量
            PS_OUTPUT=$(powershell.exe -NoProfile -NonInteractive -Command "try { \$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User'); if (\$token) { Write-Output \$token } } catch { }" 2>&1)
            # 清理输出：移除回车符、换行符和可能的 PowerShell 提示符
            GITHUB_TOKEN=$(echo "$PS_OUTPUT" | grep -v "^PS " | grep -v "^所在位置" | grep -v "^标记" | grep -v "^CategoryInfo" | grep -v "^FullyQualifiedErrorId" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -1)
            # 如果读取成功但包含错误信息，清空变量
            if echo "$GITHUB_TOKEN" | grep -qiE "error|exception|无法|not found|不存在"; then
                GITHUB_TOKEN=""
            fi
            # 如果结果为空或只包含空白字符，清空变量
            if [ -z "${GITHUB_TOKEN// }" ]; then
                GITHUB_TOKEN=""
            fi
        fi
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
    log_info "  PowerShell (永久设置，推荐):"
    log_info "    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token_here', 'User')"
    log_info "    然后刷新环境变量: . scripts/refresh-env.ps1"
    log_info "    或者重新打开 PowerShell 终端"
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
    log_info "💡 提示:"
    log_info "  - 永久设置后，运行: . scripts/refresh-env.ps1"
    log_info "  - 或者重新打开 PowerShell 终端"
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
        log_error "GitHub Token 验证失败 (HTTP $TOKEN_CHECK_CODE)"
        log_warning "响应: $TOKEN_CHECK_BODY"
        log_info ""
        log_info "解决方案:"
        log_info "  1. 检查 Token 是否有效: https://github.com/settings/tokens"
        log_info "  2. 确认 Token 未过期"
        log_info "  3. 重新生成 Token 并设置:"
        log_info "     PowerShell: \$env:GITHUB_TOKEN=\"your_new_token\""
        log_info "     Git Bash: export GITHUB_TOKEN=\"your_new_token\""
        log_info "  4. 确保 Token 具有以下权限:"
        log_info "     - write:packages (推送镜像)"
        log_info "     - actions:write (触发工作流)"
        log_info "     - repo (如果仓库是私有的)"
        exit 1
    fi
    
    log_success "✅ GitHub Token 验证通过"
    
    # 触发 GitHub Actions 工作流
    # 根据应用名称确定工作流文件
    WORKFLOW_FILE="deploy-${APP_NAME}.yml"
    WORKFLOW_PATH=".github/workflows/${WORKFLOW_FILE}"
    log_info "触发部署工作流: $APP_NAME"
    log_info "工作流文件: $WORKFLOW_FILE"
    
    # 先尝试直接获取特定工作流的信息（使用文件名）
    # 这样可以避免依赖工作流列表 API
    log_info "尝试直接获取工作流信息..."
    WORKFLOW_INFO_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_FILE" 2>&1)
    
    WORKFLOW_INFO_HTTP_CODE=$(echo "$WORKFLOW_INFO_RESPONSE" | tail -n1)
    WORKFLOW_INFO_BODY=$(echo "$WORKFLOW_INFO_RESPONSE" | sed '$d')
    
    if [ "$WORKFLOW_INFO_HTTP_CODE" -eq 200 ]; then
        # 成功获取工作流信息，提取 ID
        WORKFLOW_ID=$(echo "$WORKFLOW_INFO_BODY" | grep -oE "\"id\":[0-9]+" | head -1 | cut -d':' -f2 | tr -d ' ')
        if [ -n "$WORKFLOW_ID" ]; then
            log_info "✅ 成功获取工作流 ID: $WORKFLOW_ID"
        fi
    else
        log_warning "无法直接获取工作流信息 (HTTP $WORKFLOW_INFO_HTTP_CODE)"
        if [ "$WORKFLOW_INFO_HTTP_CODE" -eq 404 ]; then
            log_info "💡 提示：工作流可能还没有被 GitHub 识别"
            log_info "💡 解决方案："
            log_info "   1. 在 GitHub 网页上手动触发一次工作流："
            log_info "      https://github.com/$GITHUB_REPO/actions/workflows/$WORKFLOW_FILE"
            log_info "   2. 或者创建一个测试提交来触发 push 事件，让工作流运行一次"
            log_info "   3. 等待几分钟后重试"
        fi
        log_info "尝试获取工作流列表..."
    fi
    
    # 如果直接获取失败，尝试获取工作流列表
    if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
        log_info "检查工作流是否存在（获取工作流列表）..."
        WORKFLOWS_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows?per_page=100" 2>&1)
    
    WORKFLOWS_HTTP_CODE=$(echo "$WORKFLOWS_RESPONSE" | tail -n1)
    WORKFLOWS_BODY=$(echo "$WORKFLOWS_RESPONSE" | sed '$d')
    
    WORKFLOW_ID=""
    if [ "$WORKFLOWS_HTTP_CODE" -eq 200 ]; then
        # GitHub API 返回格式: {"total_count":N,"workflows":[{"id":123,"node_id":"...","name":"...","path":".github/workflows/deploy-system-app.yml",...},...]}
        # 使用 jq 或更可靠的 JSON 解析方式提取工作流 ID
        # 方法1: 直接使用 jq（如果可用）
        if command -v jq > /dev/null 2>&1; then
            WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | jq -r ".workflows[] | select(.path == \"$WORKFLOW_PATH\" or .path | endswith(\"$WORKFLOW_FILE\")) | .id" | head -1)
        fi
        
        # 方法2: 如果 jq 不可用，使用 grep 和 sed
        if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
            # 提取包含工作流路径的所有行，然后提取 ID
            # GitHub API 返回的 JSON 格式中，path 和 id 可能在同一个对象中
            WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | grep -oE "\"id\":[0-9]+[^}]*\"path\":\"[^\"]*${WORKFLOW_FILE}\"" | grep -oE "\"id\":([0-9]+)" | head -1 | cut -d':' -f2 | tr -d ' ')
        fi
        
        # 方法3: 使用完整路径匹配
        if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
            WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | grep -oE "\"id\":[0-9]+[^}]*\"path\":\"${WORKFLOW_PATH}\"" | grep -oE "\"id\":([0-9]+)" | head -1 | cut -d':' -f2 | tr -d ' ')
        fi
        
        # 方法4: 反向匹配 - 先找路径再找 ID
        if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
            # 找到包含路径的行，然后向前查找 ID
            WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | grep -B 20 "\"path\":\".*${WORKFLOW_FILE}\"" | grep -oE "\"id\":[0-9]+" | tail -1 | cut -d':' -f2 | tr -d ' ')
        fi
        
        if [ -n "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
            log_info "找到工作流 ID: $WORKFLOW_ID"
        else
            log_warning "工作流 $WORKFLOW_FILE 未在可用工作流列表中找到"
            log_info "调试信息 - 可用工作流列表："
            echo "$WORKFLOWS_BODY" | grep -oE "\"path\":\"[^\"]*\"" | sed 's/"path":"//;s/"//' | grep -E "deploy-.*\.yml" | head -10
            
            # 调试：输出完整的 JSON 响应以便排查（保存到临时文件）
            DEBUG_FILE=$(mktemp 2>/dev/null || echo "/tmp/workflows-debug-$$.json")
            echo "$WORKFLOWS_BODY" > "$DEBUG_FILE"
            log_info "完整工作流列表已保存到: $DEBUG_FILE"
            log_info "工作流列表 API 响应（前 3000 字符）："
            echo "$WORKFLOWS_BODY" | head -c 3000
            echo ""
            
            # 调试：检查工作流列表是否包含我们的工作流（使用不同的匹配方式）
            if echo "$WORKFLOWS_BODY" | grep -q "$WORKFLOW_PATH"; then
                log_info "✅ 在响应中找到完整路径 $WORKFLOW_PATH"
                # 如果找到了路径但没提取到 ID，尝试更精确的提取
                log_info "尝试更精确地提取工作流 ID..."
                WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); wf=[w for w in data.get('workflows',[]) if w.get('path')=='$WORKFLOW_PATH']; print(wf[0]['id'] if wf else '')" 2>/dev/null || echo "")
            elif echo "$WORKFLOWS_BODY" | grep -q "$WORKFLOW_FILE"; then
                log_info "✅ 在响应中找到文件名 $WORKFLOW_FILE"
            else
                log_warning "⚠️  在响应中未找到工作流 $WORKFLOW_FILE 或 $WORKFLOW_PATH"
                log_info "💡 提示：工作流文件可能刚提交，GitHub 需要一些时间才能识别"
                log_info "💡 或者工作流文件可能有语法错误，导致 GitHub 无法识别"
            fi
        fi
    else
        log_warning "无法获取工作流列表 (HTTP $WORKFLOWS_HTTP_CODE)，将尝试使用完整路径触发..."
    fi
    
    # 优先使用 repository_dispatch（更可靠，不依赖工作流文件名）
    # repository_dispatch 不需要工作流文件被 GitHub 识别，可以直接触发
    log_info "尝试使用 repository_dispatch 触发工作流（更可靠）..."
    REPO_DISPATCH_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/dispatches" \
        -d "{
            \"event_type\": \"deploy-${APP_NAME}\",
            \"client_payload\": {
                \"app_name\": \"$APP_NAME\",
                \"github_sha\": \"$GIT_SHA\"
            }
        }" 2>&1)
    
    REPO_DISPATCH_HTTP_CODE=$(echo "$REPO_DISPATCH_RESPONSE" | tail -n1)
    REPO_DISPATCH_BODY=$(echo "$REPO_DISPATCH_RESPONSE" | sed '$d')
    
    if [ "$REPO_DISPATCH_HTTP_CODE" -eq 204 ]; then
        log_success "✅ 工作流已通过 repository_dispatch 触发"
        HTTP_CODE=204
        RESPONSE_BODY=""
    else
        log_warning "repository_dispatch 失败 (HTTP $REPO_DISPATCH_HTTP_CODE)，尝试 workflow_dispatch..."
        
        # 回退到 workflow_dispatch
        # 优先使用工作流 ID，其次尝试文件名，最后使用完整路径
        if [ -n "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
            WORKFLOW_IDENTIFIER="$WORKFLOW_ID"
            log_info "使用工作流 ID 触发: $WORKFLOW_IDENTIFIER"
        else
            WORKFLOW_IDENTIFIER="$WORKFLOW_FILE"
            log_info "尝试使用文件名触发: $WORKFLOW_IDENTIFIER"
        fi
        
        log_info "使用 workflow_dispatch 触发 $WORKFLOW_FILE 工作流..."
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            -H "Content-Type: application/json" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_IDENTIFIER/dispatches" \
            -d "{
                \"ref\": \"master\"
            }" 2>&1)
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
        
        # 如果使用文件名失败，尝试使用完整路径
        if [ "$HTTP_CODE" -eq 404 ] && [ "$WORKFLOW_IDENTIFIER" = "$WORKFLOW_FILE" ]; then
            log_warning "使用文件名触发失败，尝试使用完整路径..."
            WORKFLOW_IDENTIFIER="$WORKFLOW_PATH"
            log_info "使用完整路径触发: $WORKFLOW_IDENTIFIER"
            
            RESPONSE=$(curl -s -w "\n%{http_code}" \
                -X POST \
                -H "Accept: application/vnd.github+json" \
                -H "Authorization: Bearer $GITHUB_TOKEN" \
                -H "X-GitHub-Api-Version: 2022-11-28" \
                -H "Content-Type: application/json" \
                "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_IDENTIFIER/dispatches" \
                -d "{
                    \"ref\": \"master\"
                }" 2>&1)
            
            HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
            RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
        fi
    fi
    
    if [ "$HTTP_CODE" -eq 204 ]; then
        log_success "✅ 工作流已触发 (workflow_dispatch)"
        log_info "查看工作流运行状态: https://github.com/$GITHUB_REPO/actions"
        log_info "查找 'Deploy $APP_NAME' 工作流的最新运行"
        log_info ""
        log_info "📋 部署信息:"
        log_info "  - 应用: $APP_NAME"
        log_info "  - 工作流: $WORKFLOW_FILE"
        log_info "  - 环境: production"
        log_info "  - SHA: $GIT_SHA"
        log_info "  - 分支: master"
    else
        log_error "⚠️  触发部署工作流失败 (HTTP $HTTP_CODE)"
        if [ -n "$RESPONSE_BODY" ]; then
            log_warning "响应: $RESPONSE_BODY"
        fi
        log_info ""
        
        if [ "$HTTP_CODE" -eq 404 ]; then
            log_error "❌ 工作流未找到: $WORKFLOW_FILE 可能不在 master 分支上"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 确保 .github/workflows/$WORKFLOW_FILE 文件存在于 master 分支"
            log_info "  2. 检查工作流文件路径是否正确"
            log_info "  3. 确保工作流文件已提交并推送到 master 分支"
            log_info "  4. 检查工作流文件名是否正确（应该是 deploy-${APP_NAME}.yml）"
        elif [ "$HTTP_CODE" -eq 401 ]; then
            log_error "❌ 认证失败: Token 无效或已过期"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token 是否有效: https://github.com/settings/tokens"
            log_info "  2. 如果 Token 已过期，重新生成"
            log_info "  3. 确保 Token 有 actions:write 权限"
        elif [ "$HTTP_CODE" -eq 403 ]; then
            log_error "❌ 权限不足: Token 缺少必要的权限"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 确保 Token 具有以下权限:"
            log_info "     - actions:write (触发工作流)"
            log_info "     - repo (如果仓库是私有的)"
            log_info "  2. 重新生成 Token 并设置正确的权限"
        else
            log_error "❌ 未知错误 (HTTP $HTTP_CODE)"
            log_info ""
            log_info "💡 可能的原因:"
            log_info "  - 工作流文件语法错误"
            log_info "  - 工作流文件不在 master 分支上"
            log_info "  - GitHub API 临时问题"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 手动在 GitHub 上触发工作流测试"
            log_info "  2. 检查工作流文件: .github/workflows/deploy-only.yml"
            log_info "  3. 确保工作流文件已提交到 master 分支"
        fi
        exit 1
    fi
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
