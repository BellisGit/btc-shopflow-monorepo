#!/bin/bash

# 设置 Docker 远程连接配置脚本
# 用于快速配置本地连接到远程 Docker daemon

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

# 服务器配置
SERVER_HOST="${1:-47.112.31.96}"
SERVER_USER="${2:-root}"
SERVER_PORT="${3:-22}"

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🔧 配置 Docker 远程连接"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo ""

# 检测 SSH 密钥（支持 Windows 路径）
SSH_KEY=""
WIN_USER="${USERNAME:-${USER}}"

POSSIBLE_KEYS=(
    "/c/Users/$WIN_USER/.ssh/github_actions_key"
    "/c/Users/$USER/.ssh/github_actions_key"
    "$HOME/.ssh/github_actions_key"
    "/mnt/c/Users/$WIN_USER/.ssh/github_actions_key"
    "/mnt/c/Users/$USER/.ssh/github_actions_key"
    "$HOME/.ssh/id_rsa"
)

for key in "${POSSIBLE_KEYS[@]}"; do
    if [ -f "$key" ]; then
        SSH_KEY="$key"
        log_success "找到 SSH 密钥: $SSH_KEY"
        break
    fi
done

if [ -z "$SSH_KEY" ]; then
    log_error "未找到 SSH 密钥"
    log_info "请确保密钥存在于以下位置之一:"
    for key in "${POSSIBLE_KEYS[@]}"; do
        log_info "  - $key"
    done
    exit 1
fi

# 测试 SSH 连接
log_info "测试 SSH 连接..."
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$SSH_KEY" -p "$SERVER_PORT" \
    "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'" &> /dev/null; then
    log_success "SSH 连接成功"
else
    log_error "SSH 连接失败"
    log_info "请检查:"
    log_info "  1. 服务器地址是否正确: $SERVER_HOST"
    log_info "  2. SSH 密钥是否正确: $SSH_KEY"
    log_info "  3. 服务器是否允许 SSH 连接"
    exit 1
fi

# 检查远程 Docker
log_info "检查远程服务器上的 Docker..."
if ! ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" -p "$SERVER_PORT" \
    "$SERVER_USER@$SERVER_HOST" "docker --version" &> /dev/null; then
    log_error "远程服务器上未安装 Docker"
    exit 1
fi

if ! ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" -p "$SERVER_PORT" \
    "$SERVER_USER@$SERVER_HOST" "docker info" &> /dev/null; then
    log_error "远程服务器上的 Docker 未运行"
    exit 1
fi

log_success "远程服务器上的 Docker 已就绪"

# 配置 SSH config（用于直接连接模式）
log_info "配置 SSH config..."
SSH_CONFIG="$HOME/.ssh/config"
if [ ! -f "$SSH_CONFIG" ]; then
    mkdir -p "$HOME/.ssh"
    touch "$SSH_CONFIG"
    chmod 600 "$SSH_CONFIG"
    log_info "创建 SSH config 文件: $SSH_CONFIG"
fi

# 检查是否已存在配置
if grep -q "Host btc-shopflow-server" "$SSH_CONFIG" 2>/dev/null; then
    log_warning "SSH config 中已存在 btc-shopflow-server 配置"
    read -p "是否更新配置? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 删除旧配置
        sed -i '/^Host btc-shopflow-server/,/^$/d' "$SSH_CONFIG"
        log_info "已删除旧配置"
    else
        log_info "跳过 SSH config 配置"
    fi
fi

# 添加新配置
if ! grep -q "Host btc-shopflow-server" "$SSH_CONFIG" 2>/dev/null; then
    SSH_KEY_PATH="$SSH_KEY"
    # 转换 Windows 路径
    if [[ "$SSH_KEY_PATH" == C:* ]]; then
        SSH_KEY_PATH=$(echo "$SSH_KEY_PATH" | sed 's|^C:|/c|' | sed 's|\\|/|g')
    fi
    
    cat >> "$SSH_CONFIG" << EOF

Host btc-shopflow-server
    HostName $SERVER_HOST
    Port $SERVER_PORT
    User $SERVER_USER
    IdentityFile $SSH_KEY_PATH
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
    log_success "已添加 SSH config 配置"
fi

# 创建环境变量配置文件
log_info "创建环境变量配置文件..."

# PowerShell 配置文件
PS_PROFILE="$HOME/.docker-remote.ps1"
cat > "$PS_PROFILE" << EOF
# Docker 远程连接配置
# 使用: . \$HOME/.docker-remote.ps1

\$env:SERVER_HOST = "$SERVER_HOST"
\$env:SERVER_USER = "$SERVER_USER"
\$env:SERVER_PORT = "$SERVER_PORT"
\$env:DOCKER_HOST = "ssh://btc-shopflow-server"
\$env:GITHUB_TOKEN = \$env:GITHUB_TOKEN

Write-Host "Docker 远程连接已配置:" -ForegroundColor Green
Write-Host "  SERVER_HOST: \$env:SERVER_HOST"
Write-Host "  DOCKER_HOST: \$env:DOCKER_HOST"
Write-Host ""
Write-Host "测试连接: docker info" -ForegroundColor Yellow
EOF

# Bash 配置文件
BASH_PROFILE="$HOME/.docker-remote.sh"
cat > "$BASH_PROFILE" << EOF
# Docker 远程连接配置
# 使用: source \$HOME/.docker-remote.sh

export SERVER_HOST="$SERVER_HOST"
export SERVER_USER="$SERVER_USER"
export SERVER_PORT="$SERVER_PORT"
export DOCKER_HOST="ssh://btc-shopflow-server"

echo "Docker 远程连接已配置:"
echo "  SERVER_HOST: \$SERVER_HOST"
echo "  DOCKER_HOST: \$DOCKER_HOST"
echo ""
echo "测试连接: docker info"
EOF

chmod +x "$BASH_PROFILE"

log_success "已创建环境变量配置文件:"
log_info "  PowerShell: $PS_PROFILE"
log_info "  Bash: $BASH_PROFILE"

# 测试 Docker 直接连接
log_info ""
log_info "测试 Docker 直接连接..."
export DOCKER_HOST="ssh://btc-shopflow-server"
if docker info &> /dev/null; then
    log_success "✅ Docker 直接连接成功（与 WebStorm 相同）"
    echo ""
    log_info "📋 配置完成！使用以下方式加载配置:"
    echo ""
    log_info "PowerShell:"
    log_info "  . \$HOME/.docker-remote.ps1"
    echo ""
    log_info "Git Bash / Linux / Mac:"
    log_info "  source \$HOME/.docker-remote.sh"
    echo ""
    log_info "或者每次手动设置:"
    log_info "  export DOCKER_HOST=ssh://btc-shopflow-server"
    log_info "  export SERVER_HOST=$SERVER_HOST"
else
    log_warning "⚠️  Docker 直接连接失败，将使用 SSH 方式"
    echo ""
    log_info "📋 配置完成！使用以下方式加载配置（SSH 方式）:"
    echo ""
    log_info "PowerShell:"
    log_info "  . \$HOME/.docker-remote.ps1"
    log_info "  # 但不要设置 DOCKER_HOST"
    echo ""
    log_info "Git Bash / Linux / Mac:"
    log_info "  source \$HOME/.docker-remote.sh"
    log_info "  # 或者: export SERVER_HOST=$SERVER_HOST"
fi

echo ""
log_success "配置完成！现在可以使用:"
log_info "  pnpm build-deploy:system"
log_info "  pnpm deploy:finance"
echo ""

