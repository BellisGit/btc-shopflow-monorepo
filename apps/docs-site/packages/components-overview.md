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

### 通用组件 (Common Components)

#### 基础组件
- **[BTC 按钮](/packages/components/btc-button)** - 按钮组件
- **[BTC SVG](/packages/components/btc-svg)** - SVG图标组件，提供统一的图标管理
- **[BTC 容器](/packages/components/btc-container)** - 容器组件，提供统一的布局容器

#### 表单组件
- **[BTC 表单](/packages/components/btc-form)** - 表单输入和验证组件，支持复杂表单场景
- **[BTC 表单卡片](/packages/components/btc-form-card)** - 表单卡片组件，用于表单分组
- **[BTC 表单标签页](/packages/components/btc-form-tabs)** - 表单标签页组件，用于表单分页
- **[BTC 搜索](/packages/components/btc-search)** - 搜索组件，用于快速搜索功能

#### 布局组件
- **[BTC 视图组](/packages/components/btc-view-group)** - 视图组合组件，支持多种视图模式
- **[BTC 网格组](/packages/components/btc-grid-group)** - 网格组组件，用于网格布局
- **[BTC 选择按钮](/packages/components/btc-select-button)** - 选择按钮组件

#### 交互组件
- **[BTC 对话框](/packages/components/btc-dialog)** - 对话框和弹窗组件，支持多种交互模式

### 业务组件 (Business Components)

- **[BTC 主列表](/packages/components/btc-master-list)** - 通用主列表组件，用于处理主从关系场景
- **[BTC 卡片](/packages/components/btc-card)** - 卡片组件
- **[BTC 标签页](/packages/components/btc-tabs)** - 标签页组件
- **[BTC 视图标签组](/packages/components/btc-views-tabs-group)** - 视图标签组组件，支持多个视图的标签切换
- **[BTC 级联选择器](/packages/components/btc-cascader)** - 级联选择器组件
- **[BTC 表格组](/packages/components/btc-table-group)** - 表格组组件，用于多表格场景
- **[BTC 消息](/packages/components/btc-message)** - 消息提示组件（全局 API）
- **[BTC 通知](/packages/components/btc-notification)** - 通知组件（全局 API）
- **[BTC 上传](/packages/components/btc-upload)** - 文件上传组件

### CRUD 组件 (CRUD Components)

#### 核心组件
- **[BTC CRUD](/packages/components/btc-crud)** - CRUD操作的核心组件，提供数据表格和操作功能
- **[BTC 表格](/packages/components/btc-table)** - 数据表格组件，支持排序、筛选、分页等功能
- **[BTC 新增编辑](/packages/components/btc-upsert)** - 新增/编辑组件，统一的数据操作界面

#### 辅助组件
- **[BTC 分页](/packages/components/btc-pagination)** - 分页组件
- **[BTC 新增按钮](/packages/components/btc-add-btn)** - 新增按钮
- **[BTC 刷新按钮](/packages/components/btc-refresh-btn)** - 刷新按钮
- **[BTC 批量删除按钮](/packages/components/btc-multi-delete-btn)** - 批量删除按钮
- **[BTC 行](/packages/components/btc-row)** - 行组件
- **[BTC 弹性布局](/packages/components/btc-flex1)** - 弹性布局组件
- **[BTC 搜索关键字](/packages/components/btc-search-key)** - 搜索关键字组件
- **[BTC 菜单展开](/packages/components/btc-menu-exp)** - 菜单展开组件

### 图表组件 (Chart Components)

- **[BTC 折线图](/packages/components/btc-line-chart)** - 折线图组件
- **[BTC 柱状图](/packages/components/btc-bar-chart)** - 柱状图组件
- **[BTC 饼图](/packages/components/btc-pie-chart)** - 饼图组件

### 插件组件 (Plugin Components)

#### Excel 插件
- **[BTC 导出按钮](/packages/components/btc-export-btn)** - Excel导出按钮组件
- **[BTC 导入按钮](/packages/components/btc-import-btn)** - Excel导入按钮组件

#### Code 插件
- **[BTC 代码JSON](/packages/components/btc-code-json)** - JSON代码展示组件

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
