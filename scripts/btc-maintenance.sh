#!/bin/bash

# BTC ShopFlow - 宝塔面板维护脚本
# 用于日常维护和故障排除

set -e

NAMESPACE="btc-shopflow"
LOG_FILE="/www/logs/btc-maintenance.log"

# 创建日志目录
mkdir -p "$(dirname $LOG_FILE)"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔧 开始 BTC ShopFlow 系统维护..."

# 1. 检查系统资源
log "📊 检查系统资源使用情况..."
echo "=== 系统资源 ===" >> "$LOG_FILE"
df -h >> "$LOG_FILE" 2>&1
free -h >> "$LOG_FILE" 2>&1
top -bn1 | head -10 >> "$LOG_FILE" 2>&1

# 2. 检查 Docker 状态
log "🐳 检查 Docker 状态..."
if command -v docker &> /dev/null; then
    docker system df >> "$LOG_FILE" 2>&1
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" >> "$LOG_FILE" 2>&1
else
    log "⚠️ Docker 未安装"
fi

# 3. 检查 Kubernetes 状态
log "☸️ 检查 Kubernetes 状态..."
if command -v kubectl &> /dev/null; then
    echo "=== Pod 状态 ===" >> "$LOG_FILE"
    kubectl get pods -n "$NAMESPACE" -o wide >> "$LOG_FILE" 2>&1
    
    echo "=== 服务状态 ===" >> "$LOG_FILE"
    kubectl get svc -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
    
    echo "=== Ingress 状态 ===" >> "$LOG_FILE"
    kubectl get ingress -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
    
    # 检查异常 Pod
    FAILED_PODS=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running --no-headers 2>/dev/null | wc -l)
    if [ "$FAILED_PODS" -gt 0 ]; then
        log "⚠️ 发现 $FAILED_PODS 个异常 Pod"
        kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running >> "$LOG_FILE" 2>&1
        
        # 自动重启异常 Pod
        log "🔄 尝试重启异常应用..."
        kubectl rollout restart deployment -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
    else
        log "✅ 所有 Pod 运行正常"
    fi
else
    log "⚠️ kubectl 未安装"
fi

# 4. 检查应用健康状态
log "🏥 检查应用健康状态..."
check_app_health() {
    local app_name=$1
    local port=$2
    local url="http://localhost:$port"
    
    if curl -f -s --max-time 10 "$url" > /dev/null 2>&1; then
        log "✅ $app_name ($port) 健康"
    else
        log "❌ $app_name ($port) 不健康"
    fi
}

# 检查各应用
check_app_health "system-app" "30080"
check_app_health "admin-app" "30081"
check_app_health "finance-app" "30086"

# 5. 清理系统垃圾
log "🧹 清理系统垃圾..."
if command -v docker &> /dev/null; then
    # 清理未使用的 Docker 镜像和容器
    docker system prune -f >> "$LOG_FILE" 2>&1
    log "✅ Docker 垃圾清理完成"
fi

# 清理日志文件（保留最近30天）
find /www/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
log "✅ 日志文件清理完成"

# 6. 检查磁盘空间
log "💾 检查磁盘空间..."
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log "⚠️ 磁盘使用率过高: ${DISK_USAGE}%"
    # 可以添加清理逻辑或发送告警
else
    log "✅ 磁盘使用率正常: ${DISK_USAGE}%"
fi

# 7. 检查内存使用
log "🧠 检查内存使用..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -gt 80 ]; then
    log "⚠️ 内存使用率过高: ${MEMORY_USAGE}%"
else
    log "✅ 内存使用率正常: ${MEMORY_USAGE}%"
fi

# 8. 更新应用状态
log "🔄 检查应用更新..."
if [ -d "/www/wwwroot/btc-shopflow-monorepo" ]; then
    cd /www/wwwroot/btc-shopflow-monorepo
    
    # 检查是否有新的提交
    git fetch origin develop >> "$LOG_FILE" 2>&1
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/develop)
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        log "📦 发现新版本，建议更新"
        echo "本地版本: $LOCAL" >> "$LOG_FILE"
        echo "远程版本: $REMOTE" >> "$LOG_FILE"
    else
        log "✅ 应用版本最新"
    fi
fi

# 9. 生成维护报告
log "📊 生成维护报告..."
REPORT_FILE="/www/logs/maintenance-report-$(date +%Y%m%d).txt"
cat > "$REPORT_FILE" << EOF
BTC ShopFlow 维护报告
====================

维护时间: $(date)
系统负载: $(uptime)
磁盘使用: ${DISK_USAGE}%
内存使用: ${MEMORY_USAGE}%

应用状态:
$(kubectl get pods -n "$NAMESPACE" 2>/dev/null || echo "Kubernetes 未配置")

Docker 状态:
$(docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "Docker 未安装")

维护操作:
- 系统资源检查: 完成
- 应用健康检查: 完成  
- 垃圾清理: 完成
- 版本检查: 完成

详细日志: $LOG_FILE
EOF

log "✅ 维护完成！"
log "📊 维护报告: $REPORT_FILE"

# 10. 发送通知（可选）
if command -v mail &> /dev/null && [ "$DISK_USAGE" -gt 80 ] || [ "$MEMORY_USAGE" -gt 80 ]; then
    echo "BTC ShopFlow 系统资源告警 - $(date)" | mail -s "系统告警" admin@bellis.com.cn 2>/dev/null || true
fi
