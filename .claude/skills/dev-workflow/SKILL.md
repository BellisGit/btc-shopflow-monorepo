---
name: dev-workflow
description: BTC ShopFlow 开发工作流指南，包括启动开发服务器、热重载、端口配置、微前端联调等
---

# 开发工作流

## 何时使用此技能

当你需要：启动本地开发环境、运行开发服务器、调试微前端应用、解决端口冲突

## 快速启动

启动单个应用:
  pnpm --filter=@btc/admin-app dev
  pnpm dev:app --app=admin-app

启动多个应用（推荐）:
  pnpm dev
  pnpm dev:all              # 在当前终端启动（后台运行）
  pnpm dev:all:window       # 在新窗口中启动（推荐，便于查看日志）

默认启动: main, admin, logistics, system, finance, engineering, quality, production, docs, operations, home

## 应用列表和端口

### 核心应用
- **main-app** (端口 5100) - 主应用入口
  ```bash
  pnpm dev:app --app=main-app
  ```
  访问: http://localhost:5100

- **layout-app** (端口 5101) - 布局应用
  ```bash
  pnpm dev:app --app=layout-app
  ```

### 业务应用
- **system-app** (端口 5102) - 系统配置、基础数据、仓库管理
  ```bash
  pnpm dev:app --app=system-app
  ```
  访问: http://localhost:5100/system

- **admin-app** (端口 5103) - 权限管理、菜单管理、策略引擎
  ```bash
  pnpm dev:app --app=admin-app
  ```
  访问: http://localhost:5100/admin

- **logistics-app** (端口 5104) - 物流、仓库、盘点
  ```bash
  pnpm dev:app --app=logistics-app
  ```
  访问: http://localhost:5100/logistics

- **quality-app** (端口 5105) - 品质管理
  ```bash
  pnpm dev:app --app=quality-app
  ```
  访问: http://localhost:5100/quality

- **production-app** (端口 5106) - 生产管理
  ```bash
  pnpm dev:app --app=production-app
  ```
  访问: http://localhost:5100/production

- **engineering-app** (端口 5107) - 工程管理
  ```bash
  pnpm dev:app --app=engineering-app
  ```
  访问: http://localhost:5100/engineering

- **finance-app** (端口 5108) - 财务管理
  ```bash
  pnpm dev:app --app=finance-app
  ```
  访问: http://localhost:5100/finance

- **operations-app** (端口 5109) - 运维管理
  ```bash
  pnpm dev:app --app=operations-app
  ```
  访问: http://localhost:5100/operations

- **personnel-app** (端口 5111) - 人事管理
  ```bash
  pnpm dev:app --app=personnel-app
  ```
  访问: http://localhost:5100/personnel

- **dashboard-app** (端口 5110) - 仪表盘
  ```bash
  pnpm dev:app --app=dashboard-app
  ```
  访问: http://localhost:5100/dashboard

### 工具应用
- **docs-app** (端口 5113) - VitePress 文档站点
  ```bash
  pnpm dev:app --app=docs-app
  ```
  访问: http://localhost:5113

- **home-app** (端口 5114) - 公司首页
  ```bash
  pnpm dev:app --app=home-app
  ```
  访问: http://localhost:5114

- **mobile-app** (端口 5112) - 移动端盘点
  ```bash
  pnpm dev:app --app=mobile-app
  ```
  访问: http://localhost:5112

### 访问方式
- **主应用入口**: http://localhost:5100
- **子应用路由**: http://localhost:5100/{app-name} (如 /admin, /system, /logistics)
- **独立访问**: http://localhost:{port} (直接访问子应用端口)

## 开发前准备

首次运行:
  1. pnpm install
  2. pnpm build:share  # 必需！构建共享包
  3. pnpm dev

共享包更新后:
  pnpm build:share  # 重新构建
  # 然后重启开发服务器

## 热重载

应用代码: 自动热重载
共享包修改: 需要手动重启（或使用 pnpm build:ts:watch）

## 端口冲突

**自动处理**：执行 `pnpm dev:all` 时会自动检查并停止占用端口的Node.js进程。

手动检查:
  netstat -ano | findstr :5100

手动停止:
  taskkill /PID <PID> /F

或修改 vite.config.ts 中的端口

## 常见任务

添加新页面: apps/{app}/src/modules/{module}/views/
添加新模块: apps/{app}/src/modules/{module}/
使用共享组件: import { BtcTable } from '@btc/shared-components'
添加翻译: 在模块 config.ts 的 i18n 字段中

## 调试

Vue DevTools: 查看组件树、Pinia 状态
日志: import { logger } from '@btc/shared-core/logger'
网络: 浏览器 Network 面板

## 常见问题

Q: Cannot find module '@btc/shared-core'
A: 运行 pnpm build:share

Q: 修改共享包不生效
A: 重新构建并重启: pnpm build:share && pnpm dev

Q: 端口被占用
A: 查看并停止进程，或修改端口配置

Q: 热重载不工作
A: 重启服务器，或清理缓存: pnpm clean:vite
