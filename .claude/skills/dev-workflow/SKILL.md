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
  pnpm dev:all

默认启动: main, admin, logistics, system, finance, engineering, quality, production, docs, operations, home

## 开发服务器端口

main: 5100, system: 5102, admin: 5103, logistics: 5104
quality: 5105, production: 5106, engineering: 5107
finance: 5108, operations: 5109, docs: 5113

访问: http://localhost:5100 (主应用入口)
子应用: http://localhost:5100/admin, /system, /logistics 等

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

检查: netstat -ano | findstr :5100
解决: taskkill /PID <PID> /F
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
