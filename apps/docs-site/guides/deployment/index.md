---
title: 文档中心部署指南
type: guide
project: deployment
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
- guides
- deployment
- production
sidebar_label: 部署指南
sidebar_order: 1
sidebar_group: guides
---

# 文档中心部署指南

## 问题说明

当前文档中心在访问时遇到以下问题：
- 无法从外部网络访问 `http://10.80.8.199:8080`
- 文档站点无法正常加载
- 需要解决网络访问和部署配置问题

## 解决方案

### 1. 网络访问配置

#### 1.1 检查防火墙设置

确保防火墙允许以下端口：
- `8080` - 主应用端口
- `8085` - 文档站点端口
- `8086` - VitePress HMR端口

#### 1.2 网络接口绑定

确保应用绑定到正确的网络接口：
```bash
# 主应用
npm run dev -- --host 0.0.0.0 --port 8080

# 文档站点
npm run dev -- --host 0.0.0.0 --port 8085
```

### 2. 部署环境配置

#### 2.1 开发环境

```bash
# 启动主应用
cd btc-shopflow-monorepo/apps/admin-app
npm run dev

# 启动文档站点
cd btc-shopflow-monorepo/apps/docs-site
npm run dev
```

#### 2.2 生产环境

```bash
# 构建文档站点
cd btc-shopflow-monorepo/apps/docs-site
npm run build

# 部署到静态服务器
npm run preview
```

### 3. VitePress 配置

#### 3.1 服务器配置

```typescript
// .vitepress/config.ts
export default defineConfig({
  vite: {
    server: {
      port: 8085,
      host: '0.0.0.0',
      strictPort: true,
      cors: true,
      hmr: {
        port: 8086,
        host: 'localhost'
      }
    }
  }
})
```

#### 3.2 路由配置

```typescript
// 确保 cleanUrls 和 trailingSlash 设置正确
export default defineConfig({
  cleanUrls: true,
  trailingSlash: false,
  ignoreDeadLinks: true
})
```

## 部署步骤

### 步骤1: 环境准备

1. 确保 Node.js 版本 >= 18
2. 安装依赖: `pnpm install`
3. 检查端口占用情况

### 步骤2: 启动服务

```bash
# 开发环境
pnpm dev

# 生产环境
pnpm build && pnpm preview
```

### 步骤3: 验证部署

1. 访问主应用: `http://10.80.8.199:8080`
2. 访问文档中心: `http://10.80.8.199:8080/docs`
3. 验证文档站点: `http://10.80.8.199:8085`

## 故障排除

### 常见问题

**问题1**: 端口被占用
- **解决方案**: 使用 `netstat -ano | findstr :8080` 查找占用进程并终止

**问题2**: 跨域问题
- **解决方案**: 确保 CORS 配置正确

**问题3**: 静态资源加载失败
- **解决方案**: 检查 publicPath 和 base 配置

## 监控和维护

### 日志监控

- 应用日志: 检查控制台输出
- 错误日志: 监控错误信息
- 访问日志: 跟踪用户访问

### 性能优化

- 启用 Gzip 压缩
- 配置缓存策略
- 优化静态资源

---

**部署状态**: 测试中
**维护团队**: 开发团队
**最后更新**: 2025-10-14
