#!/bin/bash

# BTC ShopFlow 一键部署脚本
# 适用于 CentOS/RHEL 7/8 系统
# 包含 Docker、K8s 安装和项目部署的完整流程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        exit 1
    fi
}

# 检测系统版本
detect_os() {
    if [ -f /etc/redhat-release ]; then
        OS="centos"
        VERSION=$(cat /etc/redhat-release | grep -oE '[0-9]+\.[0-9]+' | cut -d. -f1)
    elif [ -f /etc/debian_version ]; then
        OS="ubuntu"
        VERSION=$(lsb_release -rs | cut -d. -f1)
    else
        log_error "不支持的操作系统"
        exit 1
    fi
    log_info "检测到系统: $OS $VERSION"
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    if [ "$OS" = "centos" ]; then
        yum update -y
        yum install -y curl wget git vim net-tools
    else
        apt update && apt upgrade -y
        apt install -y curl wget git vim net-tools
    fi
    log_success "系统更新完成"
}

# 安装Docker
install_docker() {
    log_info "检查Docker安装状态..."
    
    if command -v docker &> /dev/null; then
        log_success "Docker已安装: $(docker --version)"
        return
    fi
    
    log_info "开始安装Docker..."
    
    # 尝试多种安装方式
    if [ "$OS" = "centos" ]; then
        # 方法1: 使用阿里云镜像源
        log_info "使用阿里云镜像源安装Docker..."
        yum install -y yum-utils device-mapper-persistent-data lvm2
        yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
        yum install -y docker-ce docker-ce-cli containerd.io
        
        # 如果失败，尝试方法2
        if [ $? -ne 0 ]; then
            log_warning "阿里云源安装失败，尝试系统源..."
            yum install -y docker
        fi
    else
        # Ubuntu系统
        apt install -y docker.io
    fi
    
    # 启动Docker服务
    systemctl start docker
    systemctl enable docker
    
    # 验证安装
    if docker --version &> /dev/null; then
        log_success "Docker安装成功: $(docker --version)"
        
        # 配置Docker镜像加速
        log_info "配置Docker镜像加速..."
        mkdir -p /etc/docker
        cat > /etc/docker/daemon.json << EOF
{
    "registry-mirrors": [
        "https://mirror.ccs.tencentyun.com",
        "https://docker.mirrors.ustc.edu.cn",
        "https://reg-mirror.qiniu.com"
    ],
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    }
}
EOF
        systemctl restart docker
        log_success "Docker镜像加速配置完成"
    else
        log_error "Docker安装失败"
        exit 1
    fi
}

# 安装K3s (轻量级Kubernetes)
install_k3s() {
    log_info "检查K3s安装状态..."
    
    if command -v kubectl &> /dev/null; then
        log_success "K3s已安装: $(kubectl version --client --short)"
        return
    fi
    
    log_info "开始安装K3s..."
    
    # 安装K3s
    curl -sfL https://get.k3s.io | sh -
    
    if [ $? -ne 0 ]; then
        log_warning "官方源安装失败，尝试国内镜像..."
        curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn sh -
    fi
    
    # 配置kubectl
    mkdir -p ~/.kube
    cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
    chown $(id -u):$(id -g) ~/.kube/config
    
    # 验证安装
    sleep 10
    if kubectl get nodes &> /dev/null; then
        log_success "K3s安装成功"
        kubectl get nodes
    else
        log_error "K3s安装失败"
        exit 1
    fi
}

# 克隆或更新项目
clone_or_update_project() {
    log_info "检查项目目录..."
    
    cd /www/wwwroot
    
    if [ ! -d "btc-shopflow-monorepo" ]; then
        log_info "克隆项目master分支..."
        git clone -b master --single-branch https://github.com/BellisGit/btc-shopflow-monorepo.git
        
        if [ $? -ne 0 ]; then
            log_error "项目克隆失败"
            exit 1
        fi
        log_success "项目克隆完成"
    else
        log_info "项目目录已存在，更新代码..."
        cd btc-shopflow-monorepo
        git fetch origin master
        git reset --hard origin/master
        log_success "项目更新完成"
    fi
    
    cd /www/wwwroot/btc-shopflow-monorepo
    log_success "项目准备完成"
}

# 构建Docker镜像
build_images() {
    log_info "开始构建Docker镜像..."
    
    # 给脚本添加执行权限
    chmod +x scripts/*.sh
    chmod +x k8s/deploy.sh
    
    # 构建镜像
    ./scripts/build-all.sh
    
    if [ $? -eq 0 ]; then
        log_success "Docker镜像构建完成"
        docker images | grep btc-shopflow
    else
        log_error "Docker镜像构建失败"
        exit 1
    fi
}

# 部署到Kubernetes
deploy_to_k8s() {
    log_info "开始部署到Kubernetes..."
    
    cd k8s
    ./deploy.sh
    
    if [ $? -eq 0 ]; then
        log_success "Kubernetes部署完成"
        
        # 等待Pod启动
        log_info "等待Pod启动..."
        sleep 30
        
        # 检查部署状态
        kubectl get pods -n btc-shopflow
        kubectl get svc -n btc-shopflow
        
    else
        log_error "Kubernetes部署失败"
        exit 1
    fi
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙规则..."
    
    # 检查防火墙状态
    if systemctl is-active --quiet firewalld; then
        log_info "配置firewalld规则..."
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=30080-30091/tcp
        firewall-cmd --reload
    elif systemctl is-active --quiet iptables; then
        log_info "配置iptables规则..."
        iptables -A INPUT -p tcp --dport 80 -j ACCEPT
        iptables -A INPUT -p tcp --dport 443 -j ACCEPT
        iptables -A INPUT -p tcp --dport 30080:30091 -j ACCEPT
        service iptables save
    else
        log_warning "未检测到防火墙服务，请手动开放端口: 80, 443, 30080-30091"
    fi
    
    log_success "防火墙配置完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 检查端口监听
    local ports=(30080 30081 30086)
    for port in "${ports[@]}"; do
        if netstat -tlnp | grep ":$port " &> /dev/null; then
            log_success "端口 $port 正在监听"
        else
            log_warning "端口 $port 未监听"
        fi
    done
    
    # 检查HTTP响应
    sleep 10
    for port in "${ports[@]}"; do
        if curl -f -s --max-time 10 "http://localhost:$port" > /dev/null 2>&1; then
            log_success "应用 $port 健康检查通过"
        else
            log_warning "应用 $port 健康检查失败"
        fi
    done
}

# 生成部署报告
generate_report() {
    log_info "生成部署报告..."
    
    local report_file="/www/logs/btc-deploy-report-$(date +%Y%m%d_%H%M%S).txt"
    mkdir -p /www/logs
    
    cat > "$report_file" << EOF
BTC ShopFlow 部署报告
====================

部署时间: $(date)
服务器信息: $(uname -a)
系统版本: $OS $VERSION

安装的组件:
- Docker: $(docker --version 2>/dev/null || echo "未安装")
- Kubernetes: $(kubectl version --client --short 2>/dev/null || echo "未安装")

应用状态:
$(kubectl get pods -n btc-shopflow 2>/dev/null || echo "Kubernetes未配置")

服务状态:
$(kubectl get svc -n btc-shopflow 2>/dev/null || echo "服务未配置")

端口监听:
$(netstat -tlnp | grep -E ":(80|443|30080|30081|30086) ")

访问地址:
- 主应用: http://$(hostname -I | awk '{print $1}'):30080
- 管理后台: http://$(hostname -I | awk '{print $1}'):30081  
- 财务系统: http://$(hostname -I | awk '{print $1}'):30086

下一步操作:
1. 在宝塔面板中配置反向代理
2. 申请SSL证书
3. 配置域名解析
4. 设置定时备份和维护任务

部署日志: 查看控制台输出
EOF

    log_success "部署报告已生成: $report_file"
    echo ""
    echo "=== 部署完成 ==="
    cat "$report_file"
}

# 主函数
main() {
    echo "=================================="
    echo "🚀 BTC ShopFlow 一键部署脚本"
    echo "=================================="
    echo ""
    
    # 执行部署步骤
    check_root
    detect_os
    update_system
    install_docker
    install_k3s
    clone_or_update_project
    build_images
    deploy_to_k8s
    configure_firewall
    health_check
    generate_report
    
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📋 后续操作："
    echo "1. 在宝塔面板中配置反向代理"
    echo "2. 申请SSL证书并配置HTTPS"
    echo "3. 设置定时备份: ./scripts/btc-backup.sh"
    echo "4. 设置定时维护: ./scripts/btc-maintenance.sh"
    echo ""
    echo "🌐 临时访问地址："
    echo "- 主应用: http://$(hostname -I | awk '{print $1}'):30080"
    echo "- 管理后台: http://$(hostname -I | awk '{print $1}'):30081"
    echo "- 财务系统: http://$(hostname -I | awk '{print $1}'):30086"
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"
