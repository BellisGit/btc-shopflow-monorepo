# 更新日志

本文档记录项目的所有重要变更。版本号遵循[语义化版本规范](https://semver.org/lang/zh-CN/)。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## [未发布]

### 新增
- 添加 Git 提交模板和标签规范文档
- 统一管理应用和物流应用的国际化配置方式

### 变更
- 将管理应用的 JSON 国际化文件置空，统一使用 config.ts 扫描方案
- 修复物流应用菜单层级结构，使用 `_` 键作为一级菜单文本

### 修复
- 修复 `registerSubAppI18n` 中 `flattenObject` 和 `unflattenObject` 对 `_` 键的处理逻辑

---

## [1.0.7] - 2026-01-07

### 变更
- 存储系统重构: 引入 pinia-plugin-persistedstate，统一管理所有 Store 持久化
- 存储工具重组: 统一到 utils/storage/ 目录，新增 SessionStorage 和 IndexedDB 工具
- 重构所有 Store: 移除手动持久化逻辑，使用插件自动管理
- 新增 IndexedDB 工具: 基于 Dexie.js，支持大容量历史数据查询（可视化看板场景）

---

## [1.0.6] - 2025-12-29

### 变更
- 加载样式系统优化

---

## [1.0.5] - 2025-12-27

### 新增
- 添加物流应用菜单配置
- 添加国际化扫描功能

---

## [1.0.4] - 2025-12-23

### 变更
- 优化构建流程
- 更新依赖版本

---

## [1.0.3] - 2025-12-20

### 修复
- 修复已知问题

---

## [1.0.2] - 2025-12-19

### 新增
- 新增功能

---

## [1.0.1] - 2025-12-18

### 修复
- 修复初始版本问题

---

## [1.0.0] - 2025-12-18

### 新增
- 项目初始版本
- 基础功能实现

---

## 版本说明

- **[未发布]**: 当前开发中的变更，将在下一个版本发布
- **[主版本.次版本.修订号]**: 已发布的版本标签

## 变更类型

- **新增**: 新功能
- **变更**: 现有功能的变更
- **废弃**: 即将移除的功能
- **移除**: 已移除的功能
- **修复**: Bug 修复
- **安全**: 安全相关的修复

## 相关链接

- [Git 标签规范指南](./docs/GIT_TAG_GUIDE.md)
- [版本发布指南](./docs/VERSION_RELEASE_GUIDE.md)
- [GitHub Releases](https://github.com/your-org/your-repo/releases)
