#!/bin/bash

# BTC ShopFlow - 宝塔面板备份脚本
# 用于定时备份 Kubernetes 配置和应用数据

set -e

# 配置变量
BACKUP_DIR="/www/backup/btc-shopflow"
PROJECT_DIR="/www/wwwroot/btc-shopflow-monorepo"
DATE=$(date +%Y%m%d_%H%M%S)
NAMESPACE="btc-shopflow"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "🔄 开始备份 BTC ShopFlow 项目..."
echo "备份时间: $(date)"
echo "备份目录: $BACKUP_DIR"

# 1. 备份 Kubernetes 配置
echo "📦 备份 Kubernetes 配置..."
if command -v kubectl &> /dev/null; then
    kubectl get all -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/k8s-config-$DATE.yaml" 2>/dev/null || echo "⚠️ Kubernetes 配置备份失败"
    kubectl get configmap -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/k8s-configmap-$DATE.yaml" 2>/dev/null || echo "⚠️ ConfigMap 备份失败"
    kubectl get ingress -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/k8s-ingress-$DATE.yaml" 2>/dev/null || echo "⚠️ Ingress 配置备份失败"
    echo "✅ Kubernetes 配置备份完成"
else
    echo "⚠️ kubectl 未安装，跳过 Kubernetes 配置备份"
fi

# 2. 备份项目源码
echo "📁 备份项目源码..."
if [ -d "$PROJECT_DIR" ]; then
    tar -czf "$BACKUP_DIR/source-code-$DATE.tar.gz" -C "$(dirname $PROJECT_DIR)" "$(basename $PROJECT_DIR)" 2>/dev/null
    echo "✅ 项目源码备份完成"
else
    echo "⚠️ 项目目录不存在: $PROJECT_DIR"
fi

# 3. 备份 Docker 镜像
echo "🐳 备份 Docker 镜像..."
if command -v docker &> /dev/null; then
    docker images --format "table {{.Repository}}:{{.Tag}}" | grep "btc-shopflow" > "$BACKUP_DIR/docker-images-$DATE.txt" 2>/dev/null || echo "⚠️ Docker 镜像列表备份失败"
    
    # 导出关键镜像
    for app in system-app admin-app finance-app; do
        if docker images "btc-shopflow/$app:latest" --format "{{.Repository}}" | grep -q "$app"; then
            docker save "btc-shopflow/$app:latest" | gzip > "$BACKUP_DIR/docker-$app-$DATE.tar.gz" 2>/dev/null || echo "⚠️ $app 镜像导出失败"
        fi
    done
    echo "✅ Docker 镜像备份完成"
else
    echo "⚠️ Docker 未安装，跳过镜像备份"
fi

# 4. 备份数据库（如果有）
echo "🗄️ 备份数据库..."
# 这里可以根据实际数据库配置添加备份命令
# mysqldump -u root -p database_name > "$BACKUP_DIR/database-$DATE.sql"
echo "ℹ️ 数据库备份需要根据实际配置手动添加"

# 5. 清理旧备份（保留最近7天）
echo "🧹 清理旧备份文件..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.yaml" -mtime +7 -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.txt" -mtime +7 -delete 2>/dev/null || true

# 6. 生成备份报告
echo "📊 生成备份报告..."
cat > "$BACKUP_DIR/backup-report-$DATE.txt" << EOF
BTC ShopFlow 备份报告
===================

备份时间: $(date)
备份目录: $BACKUP_DIR

备份文件列表:
$(ls -la "$BACKUP_DIR"/*$DATE* 2>/dev/null || echo "无备份文件")

系统状态:
- Kubernetes: $(kubectl version --client --short 2>/dev/null || echo "未安装")
- Docker: $(docker --version 2>/dev/null || echo "未安装")
- 磁盘使用: $(df -h "$BACKUP_DIR" | tail -1)

备份完成时间: $(date)
EOF

echo ""
echo "✅ 备份完成！"
echo "📁 备份文件位置: $BACKUP_DIR"
echo "📊 备份报告: $BACKUP_DIR/backup-report-$DATE.txt"

# 发送通知（可选）
if command -v mail &> /dev/null; then
    echo "BTC ShopFlow 备份完成 - $(date)" | mail -s "备份通知" admin@bellis.com.cn 2>/dev/null || true
fi
