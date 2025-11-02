# BTC ShopFlow Monorepo

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js" alt="Vue 3.x" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Micro--Frontend-qiankun-FF6B6B?style=flat" alt="Micro Frontend" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License" />
</div>

> 🌐 **多语言版本**: [English](./README_EN.md) | [简体中文](./README_ZH.md)

---

一个基于微前端架构的企业级供应链管理系统，采用 qiankun 微前端框架构建。

## 📋 项目概述

BTC ShopFlow 是一个完整的供应链管理解决方案，包含以下核心模块：

- **主应用 (Main App)** - 系统管理和微前端容器
- **物流应用 (Logistics App)** - 物流管理模块
- **生产应用 (Production App)** - 生产计划与管理
- **品质应用 (Quality App)** - 质量控制与检验
- **工程应用 (Engineering App)** - 工程设计与管理

## 🏗️ 技术架构

### 核心技术栈

- **前端框架**: Vue 3 + TypeScript
- **微前端**: qiankun
- **构建工具**: Vite + Turbo
- **UI 组件**: Element Plus + 自定义组件库
- **样式方案**: SCSS + UnoCSS
- **包管理**: pnpm
- **代码规范**: ESLint + Prettier + Commitlint

### 项目结构

```
btc-shopflow-monorepo/
├── apps/                          # 应用目录
│   ├── main-app/                  # 主应用 (微前端容器)
│   ├── logistics-app/             # 物流应用
│   ├── production-app/             # 生产应用
│   ├── quality-app/                # 品质应用
│   ├── engineering-app/            # 工程应用
│   └── docs-site/                  # 文档站点
├── packages/                       # 共享包
│   ├── shared-components/         # 共享组件库
│   ├── shared-core/               # 核心功能库
│   ├── shared-utils/              # 工具函数库
│   ├── vite-plugin/               # Vite 插件
│   └── proxy/                     # 代理配置
├── configs/                        # 配置文件
└── implementation-docs/           # 实现文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装所有子项目依赖
pnpm install --recursive
```

### 开发模式

```bash
# 启动主应用开发服务器
pnpm dev:main

# 启动所有应用开发服务器
pnpm dev:all

# 启动特定应用
pnpm --filter logistics-app dev
pnpm --filter production-app dev
```

### 构建项目

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm --filter main-app build
```

## 📦 包说明

### 共享包

- **@btc/shared-components**: 通用组件库，包含表格、表单、CRUD 等组件
- **@btc/shared-core**: 核心功能库，包含 CRUD 逻辑、服务管理等
- **@btc/shared-utils**: 工具函数库，包含通用工具函数
- **@btc/vite-plugin**: 自定义 Vite 插件，支持 SVG 处理和虚拟模块

### 应用包

- **main-app**: 主应用，作为微前端容器和系统管理
- **logistics-app**: 物流管理应用
- **production-app**: 生产管理应用
- **quality-app**: 品质管理应用
- **engineering-app**: 工程管理应用

## 🔧 开发指南

### 代码规范

项目使用 ESLint + Prettier 进行代码格式化，使用 Commitlint 规范提交信息。

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check
```

### 提交规范

使用 Conventional Commits 规范：

```bash
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式化
refactor: 重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 组件开发

所有自定义组件都使用 `btc-` 前缀，遵循以下规范：

- 组件文件命名：`btc-component-name.vue`
- 组件注册名：`BtcComponentName`
- 每个组件需要提供对应的 README 文档

## 🌐 微前端架构

### qiankun 配置

项目使用 qiankun 实现微前端架构：

- **主应用**: 负责路由管理和子应用加载
- **子应用**: 独立开发和部署的业务模块
- **通信**: 通过 props 和全局状态管理进行应用间通信

### 子应用开发

每个子应用都是独立的 Vue 3 项目，支持：

- 独立开发和调试
- 独立构建和部署
- 与主应用的数据通信
- 共享组件和工具库

## 📚 文档

- [架构设计文档](./docs/cool-admin-vue-架构设计文档.md)
- [实现文档](./implementation-docs/)
- [组件文档](./apps/docs-site/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者: BTC Team
- 邮箱: support@btc-shopflow.com
- 项目地址: https://github.com/BellisGit/btc-shopflow-monorepo

---

**注意**: 这是一个企业级项目，请确保在开发前阅读相关的架构文档和开发指南。

