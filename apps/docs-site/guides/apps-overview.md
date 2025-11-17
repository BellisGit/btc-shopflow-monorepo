---
title: 应用目录说明
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- apps
- micro-frontend
sidebar_label: 应用概览
sidebar_order: 3
sidebar_group: guides
---

# 应用目录说明

本目录包含所有微前端应用

## 应用列表

### 1. admin-app（主应用）
- **端口**：8080
- **功能**：系统管理权限配置qiankun容器
- **特点**：包含全局布局汉堡菜单应用切换器

### 2. logistics-app（物流应用）
- **端口**：8081
- **功能**：物流管理相关功能
- **特点**：独立的业务模块应用

### 3. engineering-app（工程应用）
- **端口**：8082
- **功能**：工程管理相关功能
- **特点**：独立的业务模块应用

### 4. quality-app（质量应用）
- **端口**：8083
- **功能**：质量管理相关功能
- **特点**：独立的业务模块应用

### 5. production-app（生产应用）
- **端口**：8084
- **功能**：生产管理相关功能
- **特点**：独立的业务模块应用

### 6. docs-site（文档站点）
- **端口**：8085
- **功能**：项目文档和技术文档
- **特点**：基于VitePress的文档系统

## 微前端架构

### qiankun框架
- **主应用**: admin-app作为容器应用
- **子应用**: 各业务应用作为独立应用
- **通信**: 通过qiankun的通信机制

### 独立开发
- **技术栈**: 每个应用可以独立选择技术栈
- **部署**: 支持独立部署和更新
- **团队**: 支持多团队并行开发

## 开发指南

### 启动所有应用
```bash
pnpm dev
```

### 启动单个应用
```bash
pnpm dev:main      # 主应用
pnpm dev:logistics # 物流应用
pnpm dev:docs      # 文档站点
```

### 构建应用
```bash
pnpm build:all     # 构建所有应用
pnpm build:main    # 构建主应用
```

---

**架构类型**: 微前端
**框架**: qiankun
**维护团队**: 前端团队
