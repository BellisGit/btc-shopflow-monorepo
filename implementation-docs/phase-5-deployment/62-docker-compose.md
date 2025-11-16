# 35 - Docker Compose 编排

> **阶段**: Phase 5 | **时间**: 2小时 | **前置**: 34

## 🎯 任务目标

使用 Docker Compose 编排所有应用。

## 📋 执行步骤

### 1. 创建 docker-compose.yml

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  main-app:
    build:
      context: .
      dockerfile: packages/main-app/Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    networks:
      - btc-shopflow-network

  logistics-app:
    build:
      context: .
      dockerfile: packages/logistics-app/Dockerfile
    ports:
      - "81:80"
    networks:
      - btc-shopflow-network

  production-app:
    build:
      context: .
      dockerfile: packages/production-app/Dockerfile
    ports:
      - "82:80"
    networks:
      - btc-shopflow-network

networks:
  btc-shopflow-network:
    driver: bridge
```

### 2. 为子应用创建 Dockerfile

**packages/logistics-app/Dockerfile**:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/logistics-app/package.json ./packages/logistics-app/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter logistics-app build

FROM nginx:alpine

COPY --from=builder /app/packages/logistics-app/dist /usr/share/nginx/html
COPY packages/logistics-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. 复制配置到生产应用

```bash
cp packages/logistics-app/Dockerfile packages/production-app/
cp packages/logistics-app/nginx.conf packages/production-app/
```

## ✅ 验收标准

### 检查：多容器启动

```bash
# 启动所有服务
docker-compose up -d

# 检查服务
docker-compose ps

# 访问测试
curl http://localhost:80   # 主应用
curl http://localhost:81   # 物流应用
curl http://localhost:82   # 生产应用

# 停止服务
docker-compose down
```

## 📝 检查清单

- [ ] docker-compose.yml 创建
- [ ] 子应用 Dockerfile 创建
- [ ] 网络配置
- [ ] 多容器启动成功
- [ ] 所有应用可访问

## 🔗 下一步

- [36 - Nginx 配置](./36-nginx-config.md)

