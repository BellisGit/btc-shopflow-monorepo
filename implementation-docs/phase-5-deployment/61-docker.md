# 34 - Docker 主应用镜像

> **阶段**: Phase 5 | **时间**: 2小时 | **前置**: 33

## 🎯 任务目标

编写主应用 Dockerfile，实现容器化部署。

## 📋 执行步骤

### 1. 创建 Dockerfile

**packages/main-app/Dockerfile**:
```dockerfile
# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/main-app/package.json ./packages/main-app/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建
RUN pnpm --filter main-app build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/packages/main-app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY packages/main-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. 创建 nginx 配置

**packages/main-app/nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### 3. 创建 .dockerignore

**packages/main-app/.dockerignore**:
```
node_modules
dist
.git
*.log
```

## ✅ 验收标准

### 检查：镜像构建

```bash
# 构建镜像
docker build -t main-app -f packages/main-app/Dockerfile .

# 运行容器
docker run -p 8080:80 main-app

# 访问
curl http://localhost:8080
# 预期: 返回 HTML 内容
```

## 📝 检查清单

- [ ] Dockerfile 创建
- [ ] nginx 配置
- [ ] .dockerignore 创建
- [ ] 镜像构建成功
- [ ] 容器运行正常

## 🔗 下一步

- [35 - Docker Compose 编排](./35-docker-compose.md)

