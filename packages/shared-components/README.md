# @btc/shared-components

BTC 共享组件库，提供项目中所有应用共享的可复用 Vue 组件。

## 📦 安装

```bash
pnpm add @btc/shared-components
```

## 🚀 快速开始

```typescript
import { BtcCrud, BtcForm, BtcDialog } from '@btc/shared-components';
```

## 📚 组件列表

### 通用组件 (Common Components)

#### 基础组件
- **BtcButton** - 按钮组件
- **BtcSvg** - SVG 图标组件，提供统一的图标管理
- **BtcContainer** - 容器组件，提供统一的布局容器
  - 📄 [文档](./src/common/container/README.md)

#### 表单组件
- **BtcForm** - 表单组件，支持复杂表单场景和验证
- **BtcFormCard** - 表单卡片组件，用于表单分组
- **BtcFormTabs** - 表单标签页组件，用于表单分页
- **BtcSearch** - 搜索组件，用于快速搜索功能
  - 📄 [文档](./src/common/search/README.md)

#### 布局组件
- **BtcViewGroup** - 视图组合组件，支持多种视图模式
- **BtcGridGroup** - 网格组组件，用于网格布局
  - 📄 [文档](./src/common/grid-group/README.md)
- **BtcSelectButton** - 选择按钮组件

#### 交互组件
- **BtcDialog** - 对话框和弹窗组件，支持多种交互模式

### 业务组件 (Business Components)

- **BtcMasterList** - 通用主列表组件，用于处理主从关系场景（如部门-用户、角色-权限等）
  - 📄 [文档](./src/components/btc-master-list/README.md)
- **BtcCard** - 卡片组件
- **BtcTabs** - 标签页组件
- **BtcViewsTabsGroup** - 视图标签组组件，支持多个视图的标签切换
  - 📄 [文档](./src/components/btc-views-tabs-group/README.md)
- **BtcCascader** - 级联选择器组件
  - 📄 [文档](./src/components/btc-cascader/README.md)
- **BtcTableGroup** - 表格组组件，用于多表格场景
  - 📄 [文档](./src/components/btc-table-group/README.md)
- **BtcDoubleGroup** - 双列分组组件，提供双左栏 + CRUD 联动
  - 📄 [文档](./src/components/btc-double-group/README.md)
- **BtcMessage** - 消息提示组件（全局 API）
  - 📄 [文档](./src/components/btc-message/README.md)
- **BtcNotification** - 通知组件（全局 API）
  - 📄 [文档](./src/components/btc-notification/README.md)
- **BtcUpload** - 文件上传组件（需单独导入）

### CRUD 组件 (CRUD Components)

CRUD 系统提供了完整的数据操作解决方案：

#### 核心组件
- **BtcCrud** - CRUD 上下文组件，提供全局状态管理
- **BtcTable** - 数据表格组件，支持排序、筛选、分页等功能
  - 📄 [文档](./src/crud/table/README.md)
- **BtcUpsert** - 新增/编辑组件，统一的数据操作界面

#### 辅助组件
- **BtcPagination** - 分页组件
- **BtcAddBtn** - 新增按钮
- **BtcRefreshBtn** - 刷新按钮
- **BtcMultiDeleteBtn** - 批量删除按钮
- **BtcRow** - 行组件
- **BtcFlex1** - 弹性布局组件
- **BtcSearchKey** - 搜索关键字组件
- **BtcMenuExp** - 菜单展开组件

### 图表组件 (Chart Components)

基于 ECharts 的图表组件：

- **BtcLineChart** - 折线图组件
- **BtcBarChart** - 柱状图组件
- **BtcPieChart** - 饼图组件

```typescript
import { BtcLineChart, BtcBarChart, BtcPieChart } from '@btc/shared-components';
```

### 插件系统 (Plugins)

#### Excel 插件
提供 Excel 导入导出功能：
- **BtcExportBtn** - 导出按钮组件
- **BtcImportBtn** - 导入按钮组件

```typescript
import { ExcelPlugin, BtcExportBtn, BtcImportBtn } from '@btc/shared-components';
```

#### Code 插件
提供代码展示功能：
- **BtcCodeJson** - JSON 代码展示组件

```typescript
import { CodePlugin, BtcCodeJson } from '@btc/shared-components';
```

## 📖 详细文档

每个组件都有对应的 README 文档，位于组件目录下。主要组件文档：

- [BtcTable 文档](./src/crud/table/README.md) - 数据表格组件
- [BtcMasterList 文档](./src/components/btc-master-list/README.md) - 主列表组件
- [BtcContainer 文档](./src/common/container/README.md) - 容器组件
- [BtcSearch 文档](./src/common/search/README.md) - 搜索组件
- [BtcGridGroup 文档](./src/common/grid-group/README.md) - 网格组组件
- [BtcViewsTabsGroup 文档](./src/components/btc-views-tabs-group/README.md) - 视图标签组组件
- [BtcTableGroup 文档](./src/components/btc-table-group/README.md) - 表格组组件
- [BtcDoubleGroup 文档](./src/components/btc-double-group/README.md) - 双列分组组件
- [BtcCascader 文档](./src/components/btc-cascader/README.md) - 级联选择器组件
- [BtcMessage 文档](./src/components/btc-message/README.md) - 消息提示组件
- [BtcNotification 文档](./src/components/btc-notification/README.md) - 通知组件

## 🔧 使用示例

### CRUD 完整示例

```vue
<template>
  <BtcCrud :service="userService">
    <template #table>
      <BtcTable :columns="columns" />
    </template>
    <template #upsert>
      <BtcUpsert :items="formItems" />
    </template>
  </BtcCrud>
</template>

<script setup lang="ts">
import { BtcCrud, BtcTable, BtcUpsert } from '@btc/shared-components';
import { createCrudService } from '@btc/shared-core';

const userService = createCrudService('user');
const columns = [/* ... */];
const formItems = [/* ... */];
</script>
```

### 表单示例

```vue
<template>
  <BtcForm :items="formItems" :model="formData" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { BtcForm } from '@btc/shared-components';
</script>
```

### 对话框示例

```vue
<template>
  <BtcDialog v-model="visible" title="编辑用户">
    <!-- 对话框内容 -->
  </BtcDialog>
</template>

<script setup lang="ts">
import { BtcDialog } from '@btc/shared-components';
</script>
```

### 图表示例

```vue
<template>
  <BtcLineChart :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { BtcLineChart } from '@btc/shared-components';
</script>
```

## 🎨 设计理念

### 1. 一致性
- 统一的视觉设计语言
- 一致的交互模式
- 标准化的 API 设计

### 2. 可扩展性
- 灵活的配置选项
- 丰富的自定义能力
- 插件化的扩展机制

### 3. 易用性
- 简单的 API 设计
- 完整的文档说明
- 丰富的使用示例

## 🏗️ 架构特点

### 基于 Element Plus
- 继承 Element Plus 的设计语言
- 扩展 Element Plus 的功能
- 保持 API 的一致性

### TypeScript 支持
- 完整的类型定义
- 智能的代码提示
- 编译时类型检查

### 响应式设计
- 支持移动端适配
- 灵活的布局系统
- 自适应的组件尺寸

## 📦 导出内容

### 组件导出
所有组件都从主入口导出：

```typescript
import {
  // 通用组件
  BtcButton,
  BtcSvg,
  BtcDialog,
  BtcViewGroup,
  BtcForm,
  BtcFormCard,
  BtcFormTabs,
  BtcSelectButton,
  BtcContainer,
  BtcGridGroup,
  BtcSearch,
  
  // 业务组件
  BtcMasterList,
  BtcCard,
  BtcTabs,
  BtcViewsTabsGroup,
  BtcCascader,
  BtcTableGroup,
  BtcMessage,
  BtcNotification,
  
  // CRUD 组件
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcAddBtn,
  BtcRefreshBtn,
  BtcMultiDeleteBtn,
  BtcRow,
  BtcFlex1,
  BtcSearchKey,
  BtcMenuExp,
  
  // 图表组件
  BtcLineChart,
  BtcBarChart,
  BtcPieChart,
  
  // 插件组件
  BtcExportBtn,
  BtcImportBtn,
  BtcCodeJson,
  
  // 插件对象
  ExcelPlugin,
  CodePlugin,
} from '@btc/shared-components';
```

### 工具函数导出

```typescript
import { CommonColumns } from '@btc/shared-components';
```

### 类型导出

```typescript
import type {
  TableColumn,
  OpButton,
  FormItem,
  UpsertPlugin,
  UpsertProps,
  DialogProps,
  BtcFormItem,
  BtcFormConfig,
  BtcFormProps,
  BtcViewsTabsGroupConfig,
  TabViewConfig,
  TableGroupProps,
  TableGroupEmits,
  TableGroupExpose,
  BtcContainerProps,
  BtcGridGroupProps,
} from '@btc/shared-components';
```

### 语言包导出

```typescript
import {
  sharedLocalesZhCN,
  sharedLocalesEnUS,
} from '@btc/shared-components';
```

## 🔗 相关依赖

- `@btc/shared-core` - 核心业务逻辑
- `@btc/shared-utils` - 工具函数库
- `element-plus` - UI 组件库
- `vue` - Vue 框架
- `echarts` - 图表库
- `vue-echarts` - Vue ECharts 封装

## 📝 开发规范

- 所有组件均以 `btc-` 前缀命名
- 每个组件都应包含完整的 TypeScript 类型定义
- 组件应支持暗黑模式
- 样式应使用全局样式文件，避免内联样式
- 新组件需要添加对应的 README 文档

## 🤝 贡献

欢迎贡献代码！请遵循项目的开发规范和代码风格。

## 📄 许可证

[MIT](./LICENSE)

