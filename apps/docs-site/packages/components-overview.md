---
title: 组件包文档
type: package
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
sidebar_label: 组件包
sidebar_order: 1
sidebar_group: packages
---

# 组件包文档

本部分包含了所有BTC组件包的详细文档，提供完整的API说明使用示例和最佳实践

## 组件列表

### 核心组件
- **[BTC CRUD](/packages/components/btc-crud)** - CRUD操作的核心组件，提供数据表格和操作功能
- **[BTC 对话框](/packages/components/btc-dialog)** - 对话框和弹窗组件，支持多种交互模式
- **[BTC 表单](/packages/components/btc-form)** - 表单输入和验证组件，支持复杂表单场景
- **[BTC 更新](/packages/components/btc-upsert)** - 新增/编辑组件，统一的数据操作界面

### 辅助组件
- **[BTC SVG](/packages/components/btc-svg)** - SVG图标组件，提供统一的图标管理
- **[BTC 视图组](/packages/components/btc-view-group)** - 视图组合组件，支持多种视图模式

---

## 设计理念

### 1. 一致性
- 统一的视觉设计语言
- 一致的交互模式
- 标准化的API设计

### 2. 可扩展性
- 灵活的配置选项
- 丰富的自定义能力
- 插件化的扩展机制

### 3. 易用性
- 简单的API设计
- 完整的文档说明
- 丰富的使用示例

---

## 架构特点

### 基于Element Plus
- 继承Element Plus的设计语言
- 扩展Element Plus的功能
- 保持API的一致性

### TypeScript支持
- 完整的类型定义
- 智能的代码提示
- 编译时类型检查

### 响应式设计
- 支持移动端适配
- 灵活的布局系统
- 自适应的组件尺寸

---

## 安装使用

### 安装
```bash
pnpm add @btc/shared-components
```

### 基础使用
```typescript
import { BtcCrud, BtcForm, BtcDialog } from '@btc/shared-components'
```

### 完整导入
```typescript
import * as BtcComponents from '@btc/shared-components'
```

---

## 相关文档

- [组件开发指南](/guides/components)
- [设计规范](/guides/design)
- [API参考](/api/components)
