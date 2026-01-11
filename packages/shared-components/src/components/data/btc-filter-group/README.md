# BtcFilterGroup 组件

一个增强型的复合组件，基于 `BtcSplitLayout` 布局，左侧默认集成 `BtcFilterList`，右侧完全自定义。用于"左侧筛选列表 + 右侧内容"的布局场景。

## 概述

`BtcFilterGroup` 是一个复合组件，提供以下功能：
- 左侧：默认集成 `BtcFilterList`（多分类筛选）
- 右侧：完全自定义内容（通过插槽）
- 布局：基于 `BtcSplitLayout`（纯布局组件）
- 筛选结果：自动管理并传递给右侧内容

**组件地位：**
- 与 `BtcViewGroup` 同级，是独立的数据组件
- 左侧默认使用 `BtcFilterList`（而不是 `BtcMasterList`）
- 右侧完全自定义，不包含默认业务逻辑

**与其他组件的关系：**
- `BtcSplitLayout`（纯布局）→ `BtcFilterGroup`（左侧: BtcFilterList，右侧: 自定义）
- `BtcSplitLayout`（纯布局）→ `BtcViewGroup`（左侧: BtcMasterList）→ `BtcTableGroup`（右侧: CRUD）

## 特性

- ✅ **左侧筛选列表**：默认集成 `BtcFilterList`，支持多分类筛选
- ✅ **右侧自定义**：右侧内容完全由插槽控制
- ✅ **筛选结果管理**：自动管理筛选结果，并传递给右侧内容
- ✅ **布局能力**：基于 `BtcSplitLayout`，支持折叠/展开、响应式设计
- ✅ **灵活配置**：支持自定义左侧和右侧内容
- ✅ **TypeScript**：完整的 TypeScript 类型支持

## 基本用法

### 简单使用（推荐）

```vue
<template>
  <BtcFilterGroup
    ref="filterGroupRef"
    :filter-category="filterCategories"
    right-title="数据列表"
    @filter-change="handleFilterChange"
  >
    <template #right="{ filterResult }">
      <BtcCrud :service="dataService">
        <BtcTable :columns="tableColumns" />
      </BtcCrud>
    </template>
  </BtcFilterGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcFilterGroup } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

const filterGroupRef = ref();

const filterCategories: FilterCategory[] = [
  {
    id: 'status',
    name: '状态',
    options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' },
    ],
  },
];

const handleFilterChange = (result: FilterResult[]) => {
  console.log('筛选结果:', result);
  // 根据筛选结果刷新右侧数据
};
</script>
```

### 使用 EPS 服务

```vue
<template>
  <BtcFilterGroup
    :filter-service="filterService"
    right-title="数据列表"
    @filter-change="handleFilterChange"
  >
    <template #right="{ filterResult }">
      <BtcCrud :service="dataService">
        <BtcTable :columns="tableColumns" />
      </BtcCrud>
    </template>
  </BtcFilterGroup>
</template>

<script setup lang="ts">
import { BtcFilterGroup } from '@btc/shared-components';
import type { FilterResult } from '@btc/shared-components';
import { service } from '@btc/shared-core';

const filterService = {
  list: async () => {
    const res = await service.admin?.test?.getFilterCategories();
    return res || [];
  },
};

const handleFilterChange = (result: FilterResult[]) => {
  // 处理筛选结果
};
</script>
```

### 自定义左侧内容

```vue
<template>
  <BtcFilterGroup>
    <template #left="{ filterResult }">
      <!-- 完全自定义左侧内容 -->
      <div>自定义筛选组件</div>
    </template>
    
    <template #right="{ filterResult }">
      <div>右侧内容</div>
    </template>
  </BtcFilterGroup>
</template>
```

### 自定义右侧头部

```vue
<template>
  <BtcFilterGroup :filter-category="filterCategories">
    <template #title="{ filterResult }">
      <span>数据列表（已选 {{ filterResult.length }} 个筛选条件）</span>
    </template>
    
    <template #actions="{ filterResult }">
      <el-button type="primary" @click="handleExport">导出</el-button>
      <el-button @click="handleClear">清空筛选</el-button>
    </template>
    
    <template #right="{ filterResult }">
      <BtcCrud :service="dataService">
        <BtcTable :columns="tableColumns" />
      </BtcCrud>
    </template>
  </BtcFilterGroup>
</template>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `filterCategory` | 筛选分类数据（直接传入） | `FilterCategory[]` | - |
| `filterService` | 筛选分类服务（EPS 服务） | `{ list: (params?: any) => Promise<FilterCategory[]> }` | - |
| `leftTitle` | 左侧标题（当前未使用） | `string` | - |
| `rightTitle` | 右侧标题 | `string` | - |
| `enableFilterSearch` | 是否启用搜索功能 | `boolean` | `true` |
| `defaultExpandedCount` | 默认展开的分类数量 | `number` | `3` |
| `leftWidth` | 左侧宽度（优先级最高） | `string` | - |
| `leftSize` | 左侧宽度类型：`default`(300px)、`small`(150px)、`middle`(225px) | `'default' \| 'small' \| 'middle'` | `'default'` |
| `defaultExpand` | 是否默认展开 | `boolean` | `true` |
| `autoCollapseOnMobile` | 移动端自动收起 | `boolean` | `true` |

### 数据优先级

1. 如果提供了 `filterCategory`，优先使用 `filterCategory`（直接数据）
2. 否则使用 `filterService.list()` 方法加载数据（EPS 服务）
3. 如果两者都未提供，左侧将显示空状态

## 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `filter-change` | 筛选结果变化时触发 | `result: FilterResult[]` |
| `expand-change` | 展开/收起状态变化时触发 | `isExpand: boolean` |

### 筛选结果格式

```typescript
interface FilterResult {
  name: string;    // 分类的 id
  value: any[];    // 选中的选项值数组
}

// 示例
[
  { name: 'status', value: ['enabled', 'pending'] },
  { name: 'type', value: ['type_a', 'type_b'] }
]
```

## 插槽

| 插槽名 | 说明 | 作用域 |
|--------|------|--------|
| `left` | 左侧内容（如果提供，将覆盖默认的 BtcFilterList） | `{ isExpand: boolean, expand: (value?: boolean) => void, filterResult: FilterResult[] }` |
| `right` | 右侧内容 | `{ isExpand: boolean, filterResult: FilterResult[] }` |
| `title` | 右侧头部标题（仅在未提供 `header` 插槽时生效） | `{ isExpand: boolean, filterResult: FilterResult[] }` |
| `actions` | 右侧头部操作区（仅在未提供 `header` 插槽时生效） | `{ isExpand: boolean, filterResult: FilterResult[] }` |

### 插槽说明

- **`left` 插槽**：如果提供，会完全替换默认的 `BtcFilterList`；如果不提供，会使用默认的 `BtcFilterList`
- **`right` 插槽**：右侧内容区域，**必须提供**
- **`title` 和 `actions` 插槽**：右侧头部区域，可选

## Expose

通过 `ref` 可以访问以下属性和方法：

| 属性/方法 | 说明 | 类型 |
|-----------|------|------|
| `filterResult` | 当前筛选结果（只读） | `ComputedRef<FilterResult[]>` |
| `isExpand` | 是否展开（只读） | `ComputedRef<boolean>` |
| `isMobile` | 是否移动端（只读） | `ComputedRef<boolean>` |
| `expand` | 展开/收起方法 | `(value?: boolean) => void` |
| `filterListRef` | FilterList 组件引用 | `any` |

### 使用 Expose

```vue
<template>
  <BtcFilterGroup ref="filterGroupRef">
    <!-- 内容 -->
  </BtcFilterGroup>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BtcFilterGroup } from '@btc/shared-components';

const filterGroupRef = ref<InstanceType<typeof BtcFilterGroup>>();

onMounted(() => {
  // 访问筛选结果
  console.log('筛选结果:', filterGroupRef.value?.filterResult);
  
  // 切换展开状态
  filterGroupRef.value?.expand();
  
  // 访问 FilterList 引用
  console.log('FilterList 引用:', filterGroupRef.value?.filterListRef);
});
</script>
```

## 使用示例

### 示例 1：左侧筛选 + 右侧表格

```vue
<template>
  <BtcFilterGroup
    :filter-category="filterCategories"
    :enable-filter-search="true"
    :default-expanded-count="3"
    left-size="middle"
    right-title="数据列表"
    @filter-change="handleFilterChange"
  >
    <template #actions="{ filterResult }">
      <el-button type="primary" @click="handleExport">导出</el-button>
    </template>
    
    <template #right="{ filterResult }">
      <BtcCrud :service="dataService" :auto-load="false">
        <BtcRow>
          <BtcRefreshBtn />
          <BtcAddBtn />
        </BtcRow>
        <BtcRow>
          <BtcTable :columns="tableColumns" />
        </BtcRow>
        <BtcRow>
          <BtcFlex1 />
          <BtcPagination />
        </BtcRow>
      </BtcCrud>
    </template>
  </BtcFilterGroup>
</template>

<script setup lang="ts">
import { BtcFilterGroup } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

const filterCategories: FilterCategory[] = [
  // 筛选分类数据
];

const handleFilterChange = (result: FilterResult[]) => {
  // 根据筛选结果刷新表格
  // 可以将 result 转换为查询参数传递给后端
};
</script>
```

### 示例 2：使用 EPS 服务

```vue
<template>
  <BtcFilterGroup
    :filter-service="filterService"
    right-title="数据列表"
    @filter-change="handleFilterChange"
  >
    <template #right="{ filterResult }">
      <BtcCrud :service="dataService">
        <BtcTable :columns="tableColumns" />
      </BtcCrud>
    </template>
  </BtcFilterGroup>
</template>

<script setup lang="ts">
import { BtcFilterGroup } from '@btc/shared-components';
import { service } from '@btc/shared-core';

const filterService = {
  list: async () => {
    return await service.admin?.test?.getFilterCategories() || [];
  },
};

const handleFilterChange = (result: FilterResult[]) => {
  // 处理筛选结果
};
</script>
```

### 示例 3：根据筛选结果刷新数据

```vue
<template>
  <BtcFilterGroup
    ref="filterGroupRef"
    :filter-category="filterCategories"
    @filter-change="handleFilterChange"
  >
    <template #right="{ filterResult }">
      <BtcCrud ref="crudRef" :service="dataService" :auto-load="false">
        <BtcTable :columns="tableColumns" />
      </BtcCrud>
    </template>
  </BtcFilterGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcFilterGroup } from '@btc/shared-components';
import type { FilterResult } from '@btc/shared-components';

const filterGroupRef = ref();
const crudRef = ref();

const handleFilterChange = (result: FilterResult[]) => {
  // 将筛选结果转换为查询参数
  const params: any = {
    page: 1,
    size: 20,
  };
  
  // 将筛选结果转换为 keyword 对象
  const keyword: Record<string, any> = {};
  result.forEach(item => {
    keyword[item.name] = item.value;
  });
  
  if (Object.keys(keyword).length > 0) {
    params.keyword = keyword;
  }
  
  // 刷新表格
  crudRef.value?.refresh(params);
};
</script>
```

### 示例 4：自定义左侧内容

```vue
<template>
  <BtcFilterGroup>
    <template #left="{ filterResult, expand }">
      <div class="custom-filter">
        <el-button @click="expand()">切换</el-button>
        <!-- 自定义筛选组件 -->
      </div>
    </template>
    
    <template #right="{ filterResult }">
      <div>右侧内容</div>
    </template>
  </BtcFilterGroup>
</template>
```

## 与其他组件的关系

### 架构层次

```
BtcSplitLayout (纯布局)
  ├── BtcFilterGroup (左侧: BtcFilterList, 右侧: 自定义)
  └── BtcViewGroup (左侧: BtcMasterList, 右侧: 默认头部 + 内容)
      └── BtcTableGroup (右侧: CRUD 表格)
```

### 与 BtcViewGroup 的区别

| 特性 | BtcFilterGroup | BtcViewGroup |
|------|----------------|--------------|
| 左侧默认组件 | `BtcFilterList` | `BtcMasterList` |
| 左侧数据结构 | 分类 + 选项 | 列表项/树节点 |
| 选择方式 | 多选（每个分类内） | 单选（列表项） |
| 输出格式 | `FilterResult[]` | 选中的项对象 |
| 右侧默认头部 | 可选（通过插槽） | 有（带选中项逻辑） |
| 选中项逻辑 | 无 | 有 |
| 使用场景 | 多分类筛选 | 左侧列表 + 右侧 CRUD |

### 何时使用 BtcFilterGroup

✅ **适合使用 BtcFilterGroup 的场景：**
- 需要左侧多分类筛选的场景
- 需要根据多个筛选条件查询数据的场景
- 左侧是 `BtcFilterList` 的场景

❌ **不适合使用 BtcFilterGroup 的场景：**
- 左侧需要 `BtcMasterList` 的场景（应使用 `BtcViewGroup`）
- 只需要单个选中项的场景（应使用 `BtcViewGroup`）

## 样式定制

组件使用 CSS 变量，可以通过覆盖变量来定制样式：

```scss
.btc-filter-group {
  --el-bg-color: #ffffff;
  --el-border-color-light: #e4e7ed;
}
```

## 注意事项

1. **必须提供数据源**：`filterCategory` 和 `filterService` 至少提供一个
2. **必须提供右侧内容**：`right` 插槽必须提供
3. **筛选结果格式**：筛选结果中，`name` 字段对应分类的 `id`
4. **数据刷新**：筛选结果变化时，需要在 `filter-change` 事件中手动刷新右侧数据
5. **布局继承**：组件基于 `BtcSplitLayout`，继承其所有布局能力

## 最佳实践

1. **数据转换**：在 `filter-change` 事件中将 `FilterResult[]` 转换为后端需要的查询参数格式
2. **性能优化**：大量数据时，考虑防抖处理筛选变化事件
3. **用户体验**：合理设置 `defaultExpandedCount`，避免默认展开过多分类
4. **响应式**：确保移动端时左侧内容适合全屏显示
5. **错误处理**：使用 EPS 服务时，注意处理加载失败的情况

## 常见问题

### Q: 如何根据筛选结果刷新右侧数据？

A: 在 `filter-change` 事件中，将筛选结果转换为查询参数，然后调用右侧组件的刷新方法。

### Q: 可以禁用左侧的 BtcFilterList 吗？

A: 可以通过提供 `#left` 插槽来完全替换左侧内容。

### Q: 筛选结果如何传递给后端？

A: 筛选结果格式为 `[{ name: 'categoryId', value: [optionValue1, ...] }]`，需要转换为后端需要的格式（通常是 `keyword` 对象）。
