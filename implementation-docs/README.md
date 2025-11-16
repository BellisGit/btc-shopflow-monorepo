# BTC-ShopFlow 微前端实施文档

> 基于 Qiankun + Monorepo 的微前端架构实施指南

## 📋 项目规范

- **项目**: btc-shopflow-monorepo
- **前缀**: btc
- **包名**: @btc/*
- **组件**: btc-*

## 📚 文档列表（01-76）

### 阶段一：基础设施（01-11）
01. monorepo-init - Monorepo 初始化
02. typescript-config - TypeScript 配置
03. eslint-prettier - 代码规范
04. git-hooks - Git 提交规范
05. shared-utils - @btc/shared-utils
06. shared-components-base - @btc/shared-components
07. shared-core-base - @btc/shared-core
08. turbo-build-setup - Turborepo
09. tailwind-unocss - UnoCSS
10. i18n-setup - 国际化
11. auto-import - 自动导入

### 阶段二：核心功能（12-26）
12. vite-plugin-eps - EPS 插件
13. eps-virtual-module - 虚拟模块
14. eps-service-builder - 服务构建
15. crud-composable - useCrud
16-19. CRUD 组件（Table/Form/Search/Upsert）
20. plugin-manager - 插件管理
21-23. 业务插件（Excel/PDF/Upload）
24. dict-system - 数据字典
25. permission-system - 权限系统
26. composables-advanced - 高级 Composables

### 阶段三：主应用（27-41）
26-30. qiankun 集成
31-36. 布局系统
37-38. 认证系统
39-41. 系统管理

### 阶段四：子应用（42-57）
42-46. 子应用基础
47-49. 采购模块
50-52. 仓储模块
53-56. 生产模块
57. 跨应用通信

### 阶段五：部署（58-68）
58-61. 构建和容器
62-65. 服务器和CI/CD
66-68. 监控和优化

### 阶段六：工具（69-76）
69-71. CLI 工具
72-76. 文档和培训

## 🚀 开始

```bash
cd implementation-docs/phase-1-infrastructure
cat 01-monorepo-init.md
```

## 📖 参考

- 设计文档：qiankun-microfrontend-design-enhanced.md
- 里程碑：milestones.md

---

v2.0 BTC Edition | 76个文档 | 已完成命名和编号整理
