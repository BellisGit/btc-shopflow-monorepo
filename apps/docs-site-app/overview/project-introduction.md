---
title: BTC 车间流程管理系统
type: overview
project: btc-shopflow
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- project
- introduction
sidebar_label: 项目介绍
sidebar_order: 1
sidebar_group: overview
---

# BTC 车间流程管理系统

基于 Qiankun 的微前端架构，提供车间流程管理的一站式解决方案

## 文档

**所有文档已迁移到文档中心，请访问：**

- **开发环境**：http://localhost:8085
- **生产环境**：`/internal/archive/`

或在主应用中点击"文档中心"菜单查看

## 快速开始

### 启动所有应用

```bash
cd btc-shopflow-monorepo
pnpm install
pnpm dev:all
```

### 启动单个应用

```bash
# 主应用
pnpm dev:main

# 物流应用
pnpm dev:logistics

# 工程应用
pnpm dev:engineering

# 品质应用
pnpm dev:quality

# 生产应用
pnpm dev:production

# 文档中心
pnpm dev:docs
```

## 项目结构

```
btc-shopflow-monorepo/
apps/ # 应用
admin-app/ # 主应用（系统管理）
logistics-app/ # 物流应用
engineering-app/ # 工程应用
quality-app/ # 品质应用
production-app/ # 生产应用
docs-site/ # 文档中心（VitePress）
packages/ # 共享包
shared-core/ # 核心功能
shared-components/ # 共享组件
shared-utils/ # 工具函数
vite-plugin/ # Vite 插件
README.md # 本文件
```

## 相关链接

- **文档中心**：查看完整文档组件 API架构决策操作手册
- **应用 README**：
- [主应用](/overview/admin-app-readme)
- [物流应用](/overview/logistics-app-readme)
- [工程应用](/overview/engineering-app-readme)
- [品质应用](/overview/quality-app-readme)
- [生产应用](/overview/production-app-readme)
- [文档站点](/overview/docs-site-readme)

## 重要提示

**所有技术文档组件文档架构决策记录（ADR）操作手册（SOP）都已迁移到文档中心（`apps/docs-site/`）**

**不允许在文档中心之外创建新的 Markdown 文档（防止孤儿文档）**

如需创建新文档，请：
1. 访问文档中心
2. 使用 `pnpm --filter docs-site-app new-doc` 命令创建
3. 或直接在 `apps/docs-site-app/` 相应目录下创建

## License

MIT
