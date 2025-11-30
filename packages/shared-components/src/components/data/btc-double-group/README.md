# BtcDoubleGroup 组件

`BtcDoubleGroup` 提供“双列左侧 + 右侧 CRUD” 的联动布局。左侧包含两个 `BtcMasterList`（默认 small 尺寸），可实现“一级分类 / 二级分类”或“域 / 子域” 的双列选择；右侧集成 `BtcCrud`，自动根据当前选中项刷新列表。

## 功能特性

- 左侧双列：内置两个 `BtcMasterList`，复用了主应用双列菜单的交互。
- 选中联动：一级、二级列表选中后自动刷新右侧 CRUD。
- 参数透传：自动将选中结果转换为 `keyword`，传给右侧 `page` 请求。
- 完整 CRUD：支持新增、批量删除、导出、Upsert 等能力。
- 灵活扩展：提供插槽，可自定义工具栏、按钮、行为。

## 基本用法

```vue
<template>
  <BtcDoubleGroup
    :primary-service="services.domain"
    :secondary-service="services.project"
    :right-service="services.asset"
    :table-columns="assetColumns"
    :form-items="assetFormItems"
    primary-title="业务域"
    secondary-title="子模块"
    search-placeholder="搜索资产"
    :resolve-secondary-params="resolveProjectParams"
  />
</template>

<script setup lang="ts">
import { BtcDoubleGroup } from '@btc/shared-components';
import { services, assetColumns, assetFormItems } from './config';

const resolveProjectParams = (domain: any) => ({
  domainId: domain?.id,
});
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| primaryService | 一级列表服务，需实现 `list` | `ServiceLike` | 必填 |
| secondaryService | 二级列表服务，需实现 `list` | `ServiceLike` | 必填 |
| rightService | 右侧 CRUD 服务 | `any` | 必填 |
| tableColumns | 表格列配置 | `TableColumn[]` | `[]` |
| formItems | Upsert 表单项 | `FormItem[]` | `[]` |
| primaryTitle | 一级列表标题 | `string` | `一级列表` |
| secondaryTitle | 二级列表标题 | `string` | `二级列表` |
| rightTitle | 右侧标题 | `string` | `详情` |
| showPrimaryUnassigned | 一级是否显示“未分配” | `boolean` | `false` |
| showSecondaryUnassigned | 二级是否显示“未配置” | `boolean` | `false` |
| primaryUnassignedLabel | 一级未分配名称 | `string` | `未分配` |
| secondaryUnassignedLabel | 二级未分配名称 | `string` | `未配置` |
| enablePrimarySearch | 一级启用关键字搜索 | `boolean` | `false` |
| enableSecondarySearch | 二级启用关键字搜索 | `boolean` | `false` |
| resolveSecondaryParams | 生成二级列表查询参数 | `(primary, params) => object` | `parentId` 方案 |
| secondaryFilterKey | 默认二级请求的父级字段 | `string` | `parentId` |
| primaryIdField | 一级数据 ID 字段 | `string` | `id` |
| leftColumnWidth | 左侧单列宽度（px） | `number` | `160` |
| columnGap | 两列间距（px） | `number` | `8` |
| upsertWidth | Upsert 弹窗宽度 | `number \| string` | `800` |
| searchPlaceholder | 搜索占位 | `string` | `搜索` |
| showAddBtn / showMultiDeleteBtn / showSearchKey / showToolbar | 控制按钮显示 | `boolean` | `true` |
| showCreateTime / showUpdateTime | 自动追加时间列 | `boolean` | `true / false` |
| op | 操作列配置 | `{ buttons?: string[] }` | `['edit','delete']` |
| secondaryKeywordStrategy | 二级选中如何影响右侧查询 keyword（`inherit` 使用二级结果或回退一级、`override` 强制使用二级、`ignore` 始终沿用一级） | `'inherit' \| 'override' \| 'ignore'` | `'inherit'` |

## 事件

| 事件 | 说明 |
|------|------|
| `primary-select(item, keyword)` | 一级列表选中项变化 |
| `secondary-select(item, keyword)` | 二级列表选中项变化 |
| `select(item, keyword)` | 二级选中后触发（兼容旧事件） |
| `refresh(params)` | 手动刷新组件 |
| `form-submit(data, event)` | Upsert 表单提交 |
| `load(data)` | 一级数据加载完成 |

## 插槽

| 插槽 | 说明 |
|------|------|
| `add-btn` | 覆盖新增按钮 |
| `multi-delete-btn` | 覆盖批量删除按钮 |
| `actions` | 右侧工具栏按钮，透出 `selected`、`primary`、`secondary`、`keyword`、`left-data` |

## 方法

通过 `ref` 获取组件实例，可调用：

```ts
const doubleGroupRef = ref();

doubleGroupRef.value?.refresh();
```

暴露字段见 `DoubleGroupExpose`。

