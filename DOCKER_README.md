# 部署与本地运行（Docker）

本文档演示如何为 monorepo 内任一子应用构建并运行容器。镜像使用多阶段构建：Node 构建前端产物，Nginx 负责静态资源与 SPA history 回退。

## 先决条件
- 已安装 Docker 与（可选）Docker Compose v2

## 目录结构
- `btc-shopflow-monorepo/Dockerfile`：通用构建文件，通过 `--build-arg APP_DIR=apps/<app-name>` 指定子应用
- `btc-shopflow-monorepo/docker/nginx.conf`：Nginx 静态站点与 SPA 回退配置
- `btc-shopflow-monorepo/docker-compose.yml`：示例定义了 `admin-app` 与 `system-app`
- 仓库根 `.dockerignore`：优化构建上下文大小

## 单应用构建与运行

以 admin-app 为例（在 `btc-shopflow-monorepo` 目录执行）：

```powershell
docker build --file ./Dockerfile --build-arg APP_DIR=apps/admin-app --tag btc-shopflow/admin-app:latest .;
docker run --rm -p 8081:80 --name btc-admin-app btc-shopflow/admin-app:latest
```

打开浏览器访问 `http://localhost:8081`。

更换到其它子应用，只需替换 `APP_DIR` 和镜像/容器名称，例如：

```powershell
docker build --file ./Dockerfile --build-arg APP_DIR=apps/system-app --tag btc-shopflow/system-app:latest .;
docker run --rm -p 8082:80 --name btc-system-app btc-shopflow/system-app:latest
```

## 使用 Compose 一键启多个子应用

在 `btc-shopflow-monorepo` 目录执行：

```powershell
docker compose up --build -d
```

默认暴露端口：
- admin-app: `http://localhost:8081`
- system-app: `http://localhost:8082`

按需编辑 `docker-compose.yml` 取消注释其它服务块。

## 常见问题

- 如果构建时间长：首次构建需要安装 workspace 依赖，后续利用缓存加速。也可在企业 CI 使用远程缓存。
- SPA 路由 404：默认 nginx.conf 已开启 `try_files ... /index.html`，确保你的应用使用相对路径构建产物（Vite `base` 默认为 `/` 时通常无问题）。


