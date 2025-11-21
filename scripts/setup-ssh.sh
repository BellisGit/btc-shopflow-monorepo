#!/bin/bash

# BTC ShopFlow SSH Setup Script
# 用于快速配置SSH密钥认证

set -e

echo "=== BTC ShopFlow SSH Setup Script ==="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印彩色消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: $0 <server_ip> [user] [port]"
    echo "示例: $0 123.456.789.0"
    echo "示例: $0 123.456.789.0 root 22"
    exit 1
fi

SERVER_IP=$1
SERVER_USER=${2:-root}
SERVER_PORT=${3:-22}

print_info "配置SSH连接到: ${SERVER_USER}@${SERVER_IP}:${SERVER_PORT}"

# 步骤1: 检查本地SSH密钥
print_info "步骤1: 检查SSH密钥..."

SSH_KEY_PATH="$HOME/.ssh/id_rsa"
SSH_PUB_PATH="$HOME/.ssh/id_rsa.pub"

if [ ! -f "$SSH_KEY_PATH" ]; then
    print_warning "SSH私钥不存在，正在生成新的密钥对..."
    ssh-keygen -t rsa -b 4096 -C "btc-shopflow-deploy" -f "$SSH_KEY_PATH" -N ""
    print_success "SSH密钥对已生成"
else
    print_success "SSH私钥已存在: $SSH_KEY_PATH"
fi

# 步骤2: 生成公钥（如果不存在）
if [ ! -f "$SSH_PUB_PATH" ]; then
    print_info "从私钥生成公钥..."
    ssh-keygen -y -f "$SSH_KEY_PATH" > "$SSH_PUB_PATH"
    print_success "公钥已生成: $SSH_PUB_PATH"
fi

# 步骤3: 显示密钥信息
print_info "步骤2: SSH密钥信息"
echo "私钥指纹: $(ssh-keygen -l -f "$SSH_KEY_PATH")"
echo "公钥内容:"
echo "$(cat "$SSH_PUB_PATH")"
echo ""

# 步骤4: 测试连接
print_info "步骤3: 测试SSH连接..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes -i "$SSH_KEY_PATH" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_IP" "echo 'SSH连接测试成功'" 2>/dev/null; then
    print_success "SSH连接已配置正确！"
    echo ""
    print_info "GitHub Secrets配置:"
    echo "SERVER_HOST: $SERVER_IP"
    echo "SERVER_USER: $SERVER_USER"
    echo "SERVER_PORT: $SERVER_PORT"
    echo "SERVER_KEY: (私钥内容，见下方)"
    echo ""
    echo "=== 复制以下私钥内容到GitHub Secrets的SERVER_KEY ==="
    cat "$SSH_KEY_PATH"
    echo "=== 私钥内容结束 ==="
    exit 0
fi

print_warning "SSH连接失败，需要配置服务器..."

# 步骤5: 提供配置指令
print_info "步骤4: 服务器配置指令"
echo ""
echo "请在服务器上执行以下命令:"
echo ""
echo "# 1. 创建SSH目录"
echo "mkdir -p ~/.ssh"
echo "chmod 700 ~/.ssh"
echo ""
echo "# 2. 添加公钥到authorized_keys"
echo "cat >> ~/.ssh/authorized_keys << 'EOF'"
cat "$SSH_PUB_PATH"
echo "EOF"
echo ""
echo "# 3. 设置正确权限"
echo "chmod 600 ~/.ssh/authorized_keys"
echo "chown -R \$USER:\$USER ~/.ssh"
echo ""
echo "# 4. 检查SSH配置（可选）"
echo "sudo grep -E '^(PubkeyAuthentication|AuthorizedKeysFile)' /etc/ssh/sshd_config"
echo "# 如果需要，启用公钥认证:"
echo "# sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config"
echo "# sudo systemctl restart sshd"
echo ""

# 步骤6: 提供自动配置选项
print_info "步骤5: 自动配置选项"
echo ""
read -p "是否尝试自动配置服务器？(需要密码登录) [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "尝试自动配置服务器..."
    
    # 使用ssh-copy-id自动配置
    if command -v ssh-copy-id >/dev/null 2>&1; then
        print_info "使用ssh-copy-id配置..."
        if ssh-copy-id -i "$SSH_PUB_PATH" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_IP"; then
            print_success "自动配置成功！"
            
            # 再次测试连接
            if ssh -o ConnectTimeout=10 -o BatchMode=yes -i "$SSH_KEY_PATH" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_IP" "echo 'SSH连接测试成功'" 2>/dev/null; then
                print_success "SSH连接验证成功！"
                echo ""
                print_info "GitHub Secrets配置:"
                echo "SERVER_HOST: $SERVER_IP"
                echo "SERVER_USER: $SERVER_USER"
                echo "SERVER_PORT: $SERVER_PORT"
                echo "SERVER_KEY: (私钥内容，见下方)"
                echo ""
                echo "=== 复制以下私钥内容到GitHub Secrets的SERVER_KEY ==="
                cat "$SSH_KEY_PATH"
                echo "=== 私钥内容结束 ==="
            else
                print_error "自动配置后连接仍然失败，请手动检查服务器配置"
            fi
        else
            print_error "自动配置失败，请手动配置服务器"
        fi
    else
        print_error "ssh-copy-id命令不可用，请手动配置服务器"
    fi
else
    print_info "请手动在服务器上执行上述配置命令"
fi

echo ""
print_info "配置完成后，运行以下命令测试连接:"
echo "ssh -i $SSH_KEY_PATH -p $SERVER_PORT $SERVER_USER@$SERVER_IP"
