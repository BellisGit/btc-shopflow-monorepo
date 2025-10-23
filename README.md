# BTC ShopFlow Monorepo

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js" alt="Vue 3.x" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Micro--Frontend-qiankun-FF6B6B?style=flat" alt="Micro Frontend" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License" />
</div>

<div align="center">
  <a href="./README.zh.md">中文</a> | <a href="./README.en.md">English</a>
</div>

---

## 📋 项目概述

BTC ShopFlow 是一个基于微前端架构的企业级供应链管理系统，采用 qiankun 微前端框架构建。

### 核心模块

- **主应用 (Main App)** - 系统管理和微前端容器
- **物流应用 (Logistics App)** - 物流管理模块  
- **生产应用 (Production App)** - 生产计划与管理
- **品质应用 (Quality App)** - 质量控制与检验
- **工程应用 (Engineering App)** - 工程设计与管理

### 技术栈

- **前端框架**: Vue 3 + TypeScript
- **微前端**: qiankun
- **构建工具**: Vite + Turbo
- **UI 组件**: Element Plus + 自定义组件库
- **样式方案**: SCSS + UnoCSS
- **包管理**: pnpm

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装和运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:main

# 构建项目
pnpm build
```

## 📚 文档

- [中文文档](./README.zh.md) - 完整的中文文档
- [English Documentation](./README.en.md) - Complete English documentation

## 📞 联系方式

- 项目维护者: BTC Team
- 邮箱: support@btc-shopflow.com
- 项目地址: https://github.com/BellisGit/btc-shopflow-monorepo

---

**注意**: 这是一个企业级项目，请确保在开发前阅读相关的架构文档和开发指南。