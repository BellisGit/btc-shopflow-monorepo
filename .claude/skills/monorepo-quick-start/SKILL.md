---
name: monorepo-quick-start
description: BTC ShopFlow Monorepo 快速上手指南，项目结构、应用列表、包依赖、快速定位文件和模块
---

# Monorepo 快速上手

## 何时使用此技能

当你需要：
- 了解项目整体结构
- 查找特定应用或包的位置
- 理解应用和包的依赖关系
- 快速定位功能模块

## 项目结构概览

BTC ShopFlow 是一个基于 pnpm + Turbo 的 Monorepo 项目，采用微前端架构。

项目根目录: btc-shopflow-monorepo/
├── apps/              # 15 个应用
│   ├── main-app       # 主应用（核心）
│   ├── layout-app     # 布局应用（核心）
│   ├── system-app     # 系统配置
│   ├── admin-app      # 管理后台
│   ├── logistics-app  # 物流管理
│   ├── quality-app    # 品质管理
│   ├── production-app # 生产管理
│   ├── engineering-app # 工程管理
│   ├── finance-app    # 财务管理
│   ├── operations-app # 运维管理
│   ├── personnel-app  # 人事管理
│   ├── dashboard-app  # 仪表盘
│   ├── mobile-app     # 移动端
│   ├── docs-app       # 文档站点
│   └── home-app       # 公司首页
├── packages/          # 7 个共享包
│   ├── shared-core         # 核心工具和类型
│   ├── shared-components   # BTC 组件库
│   ├── shared-router       # 路由工具
│   ├── design-tokens       # 设计令牌
│   ├── vite-plugin         # Vite 插件
│   ├── @build-utils/logger # 日志工具
│   └── subapp-manifests    # 子应用清单
└── scripts/           # 构建和部署脚本

## 应用分类

核心应用（必需）:
- main-app: 主应用，负责微前端容器、路由、认证
- layout-app: 布局应用，提供统一布局模板

业务应用（按需加载）:
- system-app: 系统配置、基础数据、仓库管理
- admin-app: 权限管理、菜单管理、策略引擎
- logistics-app: 物流、仓库、盘点
- quality-app, production-app, engineering-app, finance-app
- operations-app, personnel-app, dashboard-app

工具应用:
- docs-app: VitePress 文档站点
- home-app: 公司首页
- mobile-app: 移动端盘点

## 常用命令速查

查看应用配置:
  cat apps.config.json

列出所有应用:
  node scripts/commands/tools/turbo.js ls

在特定应用中运行命令:
  pnpm --filter=@btc/admin-app <command>
  pnpm build:app --app=admin-app

查看应用依赖:
  cat apps/admin-app/package.json
  pnpm --filter=@btc/admin-app list --depth=1

## 快速定位

应用入口: apps/{app-name}/src/main.ts
应用路由: apps/{app-name}/src/router/
应用模块: apps/{app-name}/src/modules/{module-name}/
私有组件: apps/{app-name}/src/components/
共享组件: packages/shared-components/src/components/
国际化: apps/{app-name}/src/locales/{lang}.json

## 应用端口

main: 5100, layout: 5101, system: 5102, admin: 5103
logistics: 5104, quality: 5105, production: 5106
engineering: 5107, finance: 5108, operations: 5109
dashboard: 5110, personnel: 5111, mobile: 5112
docs: 5113, home: 5114

## 技术栈

包管理器: pnpm 8.15.0
构建工具: Vite + Turbo
框架: Vue 3 + TypeScript
微前端: qiankun
UI 库: Element Plus + UnoCSS
