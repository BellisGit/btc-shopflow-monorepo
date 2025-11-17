# BtcViewsTabsGroup 组件

`BtcViewsTabsGroup` 是一个高度封装的复合组件，整合了 `BtcViewGroup`、`BtcTabs`、`BtcMasterList` 和 `BtcCrud`，支持多 tab 视图切换和自动数据刷新。

## 功能特性

- 支持多 tab 视图切换
- 左侧树状菜单自动刷新
- 右侧 CRUD 表格
- 支持查询参数传递
- 自动处理服务切换

## 基本用法

```vue
<template>
  <BtcViewsTabsGroup :config="viewsTabsConfig" />
</template>

<script setup lang="ts">
import { BtcViewsTabsGroup } from '@btc/shared-components';
import { userColumns, userFormItems } from './config';

const viewsTabsConfig = {
  tabs: [
    {
      name: 'department',
      label: '部门列表',
      masterService: 'sysdepartment',
      listLabel: '部门列表',
      queryParams: {
        keyword: '',
        order: 'createdAt',
        page: 1,
        size: 100,
        sort: 'asc'
      }
    },
    {
      name: 'role',
      label: '角色列表',
      masterService: 'sysrole',
      listLabel: '角色列表',
      queryParams: {
        keyword: '',
        order: 'name',
        page: 1,
        size: 50,
        sort: 'desc'
      }
    }
  ],
  crudService: 'sysuser',
  columns: userColumns,
  formItems: userFormItems,
  leftWidth: '300px',
  showUnassigned: true,
  unassignedLabel: '未分配',
  searchPlaceholder: '搜索用户...',
  upsertWidth: '800px',
  onFormSubmit: handleFormSubmit,
  services: {
    sysdepartment: service.sysdepartment,
    sysrole: service.sysrole,
    sysuser: service.sysuser
  }
};
</script>
```

## 配置选项

### BtcViewsTabsGroupConfig

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| tabs | TabViewConfig[] | 是 | - | tab 配置列表 |
| crudService | string | 是 | - | CRUD 表格服务名 |
| columns | TableColumn[] | 是 | - | 表格列定义 |
| formItems | FormItem[] | 是 | - | 表单项定义 |
| leftWidth | string | 否 | '300px' | 左侧宽度 |
| showUnassigned | boolean | 否 | true | 是否显示"未分配" |
| unassignedLabel | string | 否 | '未分配' | "未分配"标签 |
| searchPlaceholder | string | 否 | '搜索...' | 搜索框占位符 |
| upsertWidth | string | 否 | '800px' | 表单宽度 |
| onFormSubmit | function | 否 | - | 表单提交回调 |
| services | Record<string, any> | 是 | - | 服务实例映射 |

### TabViewConfig

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| name | string | 是 | - | tab 唯一标识 |
| label | string | 是 | - | tab 显示文字 |
| masterService | string | 是 | - | 左侧树服务名 |
| listLabel | string | 是 | - | 左侧标题 |
| queryParams | QueryParams | 否 | - | 查询参数 |

### QueryParams

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| keyword | string | 否 | '' | 搜索关键词 |
| order | string | 否 | 'createdAt' | 排序字段 |
| page | number | 否 | 1 | 页码 |
| size | number | 否 | 100 | 每页大小 |
| sort | 'asc' \| 'desc' | 否 | 'asc' | 排序方向 |

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| tab-change | (tab: any, index: number) | tab 切换时触发 |
| selected-change | (item: any) | 选中项变化时触发 |

## 查询参数示例

### 基本查询参数

```typescript
const queryParams = {
  keyword: '',           // 搜索关键词
  order: 'createdAt',    // 排序字段
  page: 1,              // 页码
  size: 100,            // 每页大小
  sort: 'asc'           // 排序方向
};
```

### 不同 tab 使用不同参数

```typescript
const viewsTabsConfig = {
  tabs: [
    {
      name: 'department',
      label: '部门列表',
      masterService: 'sysdepartment',
      listLabel: '部门列表',
      queryParams: {
        keyword: '',
        order: 'createdAt',
        page: 1,
        size: 100,
        sort: 'asc'
      }
    },
    {
      name: 'role',
      label: '角色列表',
      masterService: 'sysrole',
      listLabel: '角色列表',
      queryParams: {
        keyword: '',
        order: 'name',
        page: 1,
        size: 50,
        sort: 'desc'
      }
    }
  ],
  // ... 其他配置
};
```

### 空对象支持

```typescript
// 传递空对象，使用默认参数
queryParams: {}

// 或者不传递，使用默认参数
// queryParams: undefined
```

## 完整示例

```vue
<template>
  <div class="user-management">
    <BtcViewsTabsGroup 
      :config="userViewsConfig"
      @tab-change="handleTabChange"
      @selected-change="handleSelectedChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcViewsTabsGroup } from '@btc/shared-components';
import { userColumns, userFormItems } from './config';

const userViewsConfig = {
  tabs: [
    {
      name: 'department',
      label: '部门列表',
      masterService: 'sysdepartment',
      listLabel: '部门列表',
      queryParams: {
        keyword: '',
        order: 'createdAt',
        page: 1,
        size: 100,
        sort: 'asc'
      }
    },
    {
      name: 'role',
      label: '角色列表',
      masterService: 'sysrole',
      listLabel: '角色列表',
      queryParams: {
        keyword: '',
        order: 'name',
        page: 1,
        size: 50,
        sort: 'desc'
      }
    }
  ],
  crudService: 'sysuser',
  columns: userColumns,
  formItems: userFormItems,
  leftWidth: '300px',
  showUnassigned: true,
  unassignedLabel: '未分配',
  searchPlaceholder: '搜索用户...',
  upsertWidth: '800px',
  onFormSubmit: handleFormSubmit,
  services: {
    sysdepartment: service.sysdepartment,
    sysrole: service.sysrole,
    sysuser: service.sysuser
  }
};

const handleTabChange = (tab: any, index: number) => {
  console.log('Tab changed:', tab, index);
};

const handleSelectedChange = (item: any) => {
  console.log('Selected item changed:', item);
};

const handleFormSubmit = async (data: any) => {
  console.log('Form submitted:', data);
  return data;
};
</script>
```