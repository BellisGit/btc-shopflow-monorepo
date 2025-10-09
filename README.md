# BTC-ShopFlow 微前端 Monorepo

> 基于 Qiankun + pnpm workspaces 的微前端架构

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有应用
pnpm dev:all

# 或单独启动
pnpm dev:main        # 主应用
pnpm dev:logistics   # 物流应用
pnpm dev:production  # 生产应用
```

## 项目结构

```
packages/
├── main-app/              # 主应用（qiankun 基座）
├── logistics-app/         # 物流子应用
├── production-app/        # 生产子应用
├── shared-utils/          # @btc/shared-utils
├── shared-components/     # @btc/shared-components
├── shared-core/           # @btc/shared-core
└── vite-plugin-eps/       # @btc/vite-plugin-eps
```

## 技术栈

- 微前端: qiankun 2.x
- 包管理: pnpm + workspaces
- 构建: Vite 5.x + Turborepo
- 框架: Vue 3 + TypeScript
- UI: Element Plus + UnoCSS
- 状态: Pinia

## 开发规范

- 包命名: @btc/\*
- 组件前缀: btc-
- 提交规范: Conventional Commits

---

**项目版本**: v1.0.0  
**创建时间**: 2025-10-09
