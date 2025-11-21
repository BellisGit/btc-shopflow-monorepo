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
    
    if command -v kubectl &> /dev/null && systemctl is-active --quiet k3s; then
        log_success "K3s已安装: $(kubectl version --client --short 2>/dev/null || echo 'kubectl available')"
        return
    fi
    
    log_info "开始安装K3s..."
    
    # 方法1: 尝试官方源
    log_info "尝试官方源安装..."
    if curl -sfL --connect-timeout 10 https://get.k3s.io | sh -; then
        log_success "官方源安装成功"
    else
        log_warning "官方源安装失败，尝试国内镜像..."
        
        # 方法2: 尝试国内镜像
        if curl -sfL --connect-timeout 10 https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn sh -; then
            log_success "国内镜像安装成功"
        else
            log_warning "国内镜像也失败，尝试手动安装..."
            
            # 方法3: 手动安装
            install_k3s_manual
        fi
    fi
    
    # 配置kubectl
    if [ -f /etc/rancher/k3s/k3s.yaml ]; then
        mkdir -p ~/.kube
        cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
        chown $(id -u):$(id -g) ~/.kube/config
        
        # 验证安装
        sleep 15
        if kubectl get nodes &> /dev/null; then
            log_success "K3s安装成功"
            kubectl get nodes
        else
            log_error "K3s配置失败，但服务可能正在启动..."
            systemctl status k3s --no-pager
        fi
    else
        log_error "K3s安装失败，配置文件不存在"
        install_docker_compose_fallback
    fi
}

# 手动安装K3s
install_k3s_manual() {
    log_info "尝试手动安装K3s..."
    
    # 下载K3s二进制文件
    K3S_VERSION="v1.28.8+k3s1"
    
    if curl -L --connect-timeout 30 -o /usr/local/bin/k3s "https://github.com/k3s-io/k3s/releases/download/${K3S_VERSION}/k3s"; then
        chmod +x /usr/local/bin/k3s
        
        # 创建systemd服务
        cat > /etc/systemd/system/k3s.service << EOF
[Unit]
Description=Lightweight Kubernetes
Documentation=https://k3s.io
Wants=network-online.target
After=network-online.target

[Service]
Type=exec
ExecStartPre=/bin/sh -xc '! /usr/bin/systemctl is-enabled --quiet nm-cloud-setup.service'
ExecStartPre=-/sbin/modprobe br_netfilter
ExecStartPre=-/sbin/modprobe overlay
ExecStart=/usr/local/bin/k3s server
KillMode=process
Delegate=yes
LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
TimeoutStartSec=0
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
        
        systemctl daemon-reload
        systemctl enable k3s
        systemctl start k3s
        
        # 创建kubectl链接
        ln -sf /usr/local/bin/k3s /usr/local/bin/kubectl
        
        log_success "K3s手动安装完成"
    else
        log_error "K3s手动安装也失败"
        return 1
    fi
}

# Docker Compose备用方案
install_docker_compose_fallback() {
    log_warning "K3s安装失败，使用Docker Compose作为备用方案..."
    
    # 安装docker-compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "安装Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # 创建docker-compose.yml
    cat > /tmp/btc-shopflow-compose.yml << EOF
version: '3.8'
services:
  system-app:
    image: btc-shopflow/system-app:latest
    ports:
      - "30080:80"
    restart: unless-stopped
    
  admin-app:
    image: btc-shopflow/admin-app:latest
    ports:
      - "30081:80"
    restart: unless-stopped
    
  finance-app:
    image: btc-shopflow/finance-app:latest
    ports:
      - "30086:80"
    restart: unless-stopped
EOF
    
    log_info "Docker Compose配置已创建: /tmp/btc-shopflow-compose.yml"
    log_info "稍后可以使用: docker-compose -f /tmp/btc-shopflow-compose.yml up -d"
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

# 部署到Kubernetes或Docker Compose
deploy_to_k8s() {
    log_info "开始部署应用..."
    
    # 检查K3s是否可用
    if command -v kubectl &> /dev/null && kubectl get nodes &> /dev/null; then
        log_info "使用Kubernetes部署..."
        
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
            log_error "Kubernetes部署失败，尝试Docker Compose..."
            deploy_with_docker_compose
        fi
    else
        log_warning "Kubernetes不可用，使用Docker Compose部署..."
        deploy_with_docker_compose
    fi
}

# Docker Compose部署
deploy_with_docker_compose() {
    log_info "使用Docker Compose部署..."
    
    if [ -f /tmp/btc-shopflow-compose.yml ]; then
        cd /tmp
        docker-compose -f btc-shopflow-compose.yml up -d
        
        if [ $? -eq 0 ]; then
            log_success "Docker Compose部署完成"
            docker-compose -f btc-shopflow-compose.yml ps
        else
            log_error "Docker Compose部署失败"
            return 1
        fi
    else
        log_error "Docker Compose配置文件不存在"
        return 1
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
    log_info "等待应用启动..."
    sleep 15
    
    for port in "${ports[@]}"; do
        local app_name=""
        case $port in
            30080) app_name="主应用" ;;
            30081) app_name="管理应用" ;;
            30086) app_name="财务应用" ;;
        esac
        
        if curl -f -s --max-time 10 "http://localhost:$port" > /dev/null 2>&1; then
            log_success "$app_name ($port) 健康检查通过"
        else
            log_warning "$app_name ($port) 健康检查失败，可能仍在启动中"
        fi
    done
    
    # 检查部署方式
    if command -v kubectl &> /dev/null && kubectl get nodes &> /dev/null; then
        log_info "Kubernetes集群状态:"
        kubectl get pods -n btc-shopflow 2>/dev/null || log_warning "无法获取Pod状态"
    elif command -v docker-compose &> /dev/null; then
        log_info "Docker Compose服务状态:"
        docker-compose -f /tmp/btc-shopflow-compose.yml ps 2>/dev/null || log_warning "无法获取容器状态"
    fi
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

部署方式:
$(if command -v kubectl &> /dev/null && kubectl get nodes &> /dev/null; then echo "Kubernetes (K3s)"; elif command -v docker-compose &> /dev/null; then echo "Docker Compose"; else echo "未知"; fi)

应用状态:
$(if command -v kubectl &> /dev/null && kubectl get nodes &> /dev/null; then kubectl get pods -n btc-shopflow 2>/dev/null || echo "Kubernetes Pod状态获取失败"; else docker-compose -f /tmp/btc-shopflow-compose.yml ps 2>/dev/null || echo "Docker容器状态获取失败"; fi)

服务状态:
$(if command -v kubectl &> /dev/null && kubectl get nodes &> /dev/null; then kubectl get svc -n btc-shopflow 2>/dev/null || echo "Kubernetes服务状态获取失败"; else echo "Docker Compose模式 - 直接端口映射"; fi)

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
