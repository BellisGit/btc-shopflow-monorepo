#!/bin/bash

# 强制重新部署脚本
# 用于解决容器使用旧镜像的问题

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 强制重新部署容器"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CONTAINER_NAME="btc-system-app"
IMAGE_NAME="btc-shopflow/system-app:latest"

# 1. 查找或创建 docker-compose.prod.yml
COMPOSE_FILE="docker-compose.prod.yml"

# 尝试在多个位置查找文件
if [ ! -f "$COMPOSE_FILE" ]; then
    # 尝试在常见位置查找
    if [ -f "/www/wwwroot/docker-compose.prod.yml" ]; then
        COMPOSE_FILE="/www/wwwroot/docker-compose.prod.yml"
        cd /www/wwwroot
    elif [ -f "/www/wwwroot/btc-shopflow-monorepo/docker-compose.prod.yml" ]; then
        COMPOSE_FILE="/www/wwwroot/btc-shopflow-monorepo/docker-compose.prod.yml"
        cd /www/wwwroot/btc-shopflow-monorepo
    elif [ -f "$HOME/docker-compose.prod.yml" ]; then
        COMPOSE_FILE="$HOME/docker-compose.prod.yml"
        cd "$HOME"
    else
        # 如果找不到，创建文件
        echo "📝 未找到 docker-compose.prod.yml，正在创建..."
        
        # 确定当前工作目录（优先使用 /www/wwwroot）
        if [ -d "/www/wwwroot" ]; then
            WORK_DIR="/www/wwwroot"
        else
            WORK_DIR="$(pwd)"
        fi
        
        cd "$WORK_DIR"
        
        cat > "$COMPOSE_FILE" << 'EOF'
version: '3.8'

services:
  system-app:
    image: btc-shopflow/system-app:latest
    container_name: btc-system-app
    ports:
      - "30080:80"
    restart: unless-stopped
    networks:
      - btc-network

  admin-app:
    image: btc-shopflow/admin-app:latest
    container_name: btc-admin-app
    ports:
      - "30081:80"
    restart: unless-stopped
    networks:
      - btc-network

  finance-app:
    image: btc-shopflow/finance-app:latest
    container_name: btc-finance-app
    ports:
      - "30086:80"
    restart: unless-stopped
    networks:
      - btc-network

  logistics-app:
    image: btc-shopflow/logistics-app:latest
    container_name: btc-logistics-app
    ports:
      - "30082:80"
    restart: unless-stopped
    networks:
      - btc-network

  quality-app:
    image: btc-shopflow/quality-app:latest
    container_name: btc-quality-app
    ports:
      - "30083:80"
    restart: unless-stopped
    networks:
      - btc-network

  production-app:
    image: btc-shopflow/production-app:latest
    container_name: btc-production-app
    ports:
      - "30084:80"
    restart: unless-stopped
    networks:
      - btc-network

  engineering-app:
    image: btc-shopflow/engineering-app:latest
    container_name: btc-engineering-app
    ports:
      - "30085:80"
    restart: unless-stopped
    networks:
      - btc-network

  mobile-app:
    image: btc-shopflow/mobile-app:latest
    container_name: btc-mobile-app
    ports:
      - "30091:80"
    restart: unless-stopped
    networks:
      - btc-network

networks:
  btc-network:
    driver: bridge
EOF
        echo "✅ 已创建 docker-compose.prod.yml 在: $WORK_DIR/$COMPOSE_FILE"
    fi
fi

echo "📄 使用 docker-compose 文件: $COMPOSE_FILE"
echo ""

echo "📦 当前容器状态:"
docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
echo ""

# 2. 停止并删除旧容器
echo "🛑 停止并删除旧容器..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true
echo "✅ 旧容器已删除"
echo ""

# 3. 删除旧镜像（强制重新拉取）
echo "🗑️  删除旧镜像..."
docker rmi ${IMAGE_NAME} 2>/dev/null || true
docker rmi ghcr.io/$(echo "${GITHUB_REPO:-bellisgit/btc-shopflow-monorepo}" | tr '[:upper:]' '[:lower:]')/system-app:latest 2>/dev/null || true
echo "✅ 旧镜像已删除"
echo ""

# 4. 使用 docker-compose 重新拉取并启动
echo "📥 重新拉取镜像并启动容器..."
if docker-compose -f "$COMPOSE_FILE" pull system-app; then
    echo "✅ 镜像拉取成功"
else
    echo "⚠️  镜像拉取失败，尝试从本地构建或检查网络连接"
fi
echo ""

# 5. 启动容器
echo "🚀 启动容器..."
docker-compose -f "$COMPOSE_FILE" up -d system-app
echo ""

# 6. 等待容器启动
echo "⏳ 等待容器启动..."
sleep 5

# 7. 检查容器状态
echo "📊 容器状态:"
docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
echo ""

# 8. 检查容器日志（最后 20 行）
echo "📋 容器日志（最后 20 行）:"
docker logs ${CONTAINER_NAME} --tail 20 2>&1
echo ""

# 9. 检查容器内的服务
echo "🔍 检查容器内服务:"
if docker exec ${CONTAINER_NAME} ps aux 2>/dev/null | grep -E "(serve|node)" | grep -v grep; then
    echo "✅ serve 服务正在运行"
elif docker exec ${CONTAINER_NAME} ps aux 2>/dev/null | grep nginx | grep -v grep; then
    echo "❌ 仍在运行 Nginx（使用旧镜像）"
    echo "   请检查 CI/CD 构建是否成功，或手动拉取最新镜像"
else
    echo "⚠️  无法检查服务状态"
fi
echo ""

# 10. 检查 dist 目录
echo "📁 检查 dist 目录:"
if docker exec ${CONTAINER_NAME} test -d /app/dist 2>/dev/null; then
    echo "✅ /app/dist 目录存在"
    docker exec ${CONTAINER_NAME} ls -la /app/dist 2>/dev/null | head -10
else
    echo "❌ /app/dist 目录不存在"
fi
echo ""

# 11. 测试端口连接
echo "🔌 测试端口连接:"
if curl -f -s -m 5 http://localhost:30080 > /dev/null 2>&1; then
    echo "✅ 端口 30080 可以访问"
    curl -I http://localhost:30080 2>&1 | head -5
else
    echo "❌ 端口 30080 无法访问"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 重新部署完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 如果问题仍然存在："
echo "   1. 检查 CI/CD 构建是否成功完成"
echo "   2. 确认 GitHub Actions 已构建并推送新镜像"
echo "   3. 检查镜像仓库中的镜像是否为最新版本"
echo "   4. 手动拉取镜像: docker pull ghcr.io/bellisgit/btc-shopflow-monorepo/system-app:latest"

