# BtcSplitLayout 组件

一个纯布局的左右分栏组件，不包含任何业务逻辑和默认内容。主要用于需要完全自定义左右栏内容的场景。

## 概述

`BtcSplitLayout` 是一个基础布局组件，提供左右分栏的布局能力，包括：
- 左右分栏布局
- 折叠/展开功能
- 响应式设计（移动端自动折叠）
- 可选的右侧头部区域
- 完全可定制的插槽

**与其他组件的关系：**
- `BtcSplitLayout`（纯布局）→ `BtcViewGroup`（左侧: BtcMasterList）→ `BtcTableGroup`（右侧: CRUD）
- `BtcSplitLayout`（纯布局）→ `BtcFilterGroup`（左侧: BtcFilterList，右侧: 自定义）

## 特性

- ✅ **纯布局组件**：不包含任何业务逻辑，不渲染默认内容
- ✅ **完全可定制**：左右栏内容完全由插槽控制
- ✅ **响应式设计**：移动端自动折叠左侧面板
- ✅ **灵活宽度**：支持自定义宽度或预设尺寸（default/small/middle）
- ✅ **折叠功能**：支持展开/收起，带平滑动画
- ✅ **可选头部**：右侧支持可选的头部区域（标题、操作按钮等）
- ✅ **TypeScript**：完整的 TypeScript 类型支持

## 基本用法

### 最简单的用法（左右栏都为空）

```vue
<template>
  <BtcSplitLayout>
    <template #left>
      <!-- 左侧内容 -->
      <div>左侧面板</div>
    </template>
    
    <template #right>
      <!-- 右侧内容 -->
      <div>右侧内容</div>
    </template>
  </BtcSplitLayout>
</template>

<script setup lang="ts">
import { BtcSplitLayout } from '@btc/shared-components';
</script>
```

### 带右侧头部的用法

```vue
<template>
  <BtcSplitLayout>
    <template #left>
      <BtcFilterList :category="categories" @change="handleFilterChange" />
    </template>
    
    <!-- 右侧头部（可选） -->
    <template #title>
      <span>筛选结果</span>
    </template>
    
    <template #actions>
      <el-button type="primary">导出</el-button>
    </template>
    
    <template #right>
      <BtcCrud :service="service">
        <BtcTable :columns="columns" />
      </BtcCrud>
    </template>
  </BtcSplitLayout>
</template>

<script setup lang="ts">
import { BtcSplitLayout, BtcFilterList } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

const categories: FilterCategory[] = [
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
};
</script>
```

### 自定义头部（完全控制）

```vue
<template>
  <BtcSplitLayout>
    <template #left>
      <div>左侧内容</div>
    </template>
    
    <!-- 完全自定义头部 -->
    <template #header="{ isExpand, expand }">
      <div class="custom-header">
        <el-button @click="expand()">
          {{ isExpand ? '收起' : '展开' }}
        </el-button>
        <span>自定义标题</span>
        <el-button type="primary">操作</el-button>
      </div>
    </template>
    
    <template #right>
      <div>右侧内容</div>
    </template>
  </BtcSplitLayout>
</template>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `leftWidth` | 左侧宽度（优先级最高），支持任意 CSS 单位（px、%、rem 等） | `string` | - |
| `leftSize` | 左侧宽度类型：`default`(300px)、`small`(150px)、`middle`(225px) | `'default' \| 'small' \| 'middle'` | `'default'` |
| `defaultExpand` | 是否默认展开 | `boolean` | `true` |
| `autoCollapseOnMobile` | 移动端自动收起 | `boolean` | `true` |

### 宽度优先级

1. 如果指定了 `leftWidth`，则使用 `leftWidth`（优先级最高）
2. 否则根据 `leftSize` 计算：
   - `default`: 300px
   - `small`: 150px
   - `middle`: 225px

## 插槽

| 插槽名 | 说明 | 作用域 |
|--------|------|--------|
| `left` | 左侧内容 | `{ isExpand: boolean, expand: (value?: boolean) => void }` |
| `right` | 右侧内容 | `{ isExpand: boolean }` |
| `header` | 右侧头部（完全自定义，如果使用此插槽，将覆盖 `title` 和 `actions`） | `{ isExpand: boolean, expand: (value?: boolean) => void }` |
| `title` | 右侧头部标题（仅在未提供 `header` 插槽时生效） | `{ isExpand: boolean }` |
| `actions` | 右侧头部操作区（仅在未提供 `header` 插槽时生效） | `{ isExpand: boolean }` |

### 插槽说明

- **`left` 插槽**：左侧面板内容，**必须提供**（即使是空的），否则左侧面板不会显示
- **`right` 插槽**：右侧内容区域，**必须提供**
- **`header` 插槽**：如果提供，会完全替换默认的头部结构（包括折叠按钮、标题、操作区）
- **`title` 和 `actions` 插槽**：仅在未提供 `header` 插槽时生效，会使用默认头部结构，你只需要填充标题和操作区内容

## 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `expand-change` | 展开/收起状态变化时触发 | `isExpand: boolean` |

## Expose

通过 `ref` 可以访问以下属性和方法：

| 属性/方法 | 说明 | 类型 |
|-----------|------|------|
| `isExpand` | 是否展开（只读） | `ComputedRef<boolean>` |
| `isMobile` | 是否移动端（只读） | `ComputedRef<boolean>` |
| `expand` | 展开/收起方法 | `(value?: boolean) => void` |

### 使用 Expose

```vue
<template>
  <BtcSplitLayout ref="splitLayoutRef">
    <!-- 内容 -->
  </BtcSplitLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BtcSplitLayout } from '@btc/shared-components';

const splitLayoutRef = ref<InstanceType<typeof BtcSplitLayout>>();

onMounted(() => {
  // 访问展开状态
  console.log('是否展开:', splitLayoutRef.value?.isExpand);
  
  // 切换展开状态
  splitLayoutRef.value?.expand();
  
  // 收起
  splitLayoutRef.value?.expand(false);
  
  // 展开
  splitLayoutRef.value?.expand(true);
});
</script>
```

## 使用示例

### 示例 1：左侧筛选列表 + 右侧表格

```vue
<template>
  <BtcSplitLayout left-size="middle" :default-expand="true">
    <template #left>
      <BtcFilterList
        :category="filterCategories"
        :enable-search="true"
        :default-expanded-count="3"
        @change="handleFilterChange"
      />
    </template>
    
    <template #title>
      <span>数据列表</span>
    </template>
    
    <template #actions>
      <el-button type="primary" @click="handleExport">导出</el-button>
    </template>
    
    <template #right>
      <BtcCrud :service="dataService">
        <BtcTable :columns="tableColumns" />
      </BtcCrud>
    </template>
  </BtcSplitLayout>
</template>

<script setup lang="ts">
import { BtcSplitLayout, BtcFilterList } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

const filterCategories: FilterCategory[] = [
  // 筛选分类数据
];

const handleFilterChange = (result: FilterResult[]) => {
  // 根据筛选结果刷新表格
};
</script>
```

### 示例 2：左侧菜单 + 右侧内容（无头部）

```vue
<template>
  <BtcSplitLayout :auto-collapse-on-mobile="true">
    <template #left>
      <el-menu>
        <el-menu-item index="1">菜单项 1</el-menu-item>
        <el-menu-item index="2">菜单项 2</el-menu-item>
      </el-menu>
    </template>
    
    <template #right>
      <div class="content-area">
        <router-view />
      </div>
    </template>
  </BtcSplitLayout>
</template>
```

### 示例 3：完全自定义头部

```vue
<template>
  <BtcSplitLayout>
    <template #left>
      <div>左侧内容</div>
    </template>
    
    <template #header="{ isExpand, expand }">
      <div class="custom-header">
        <el-button circle @click="expand()">
          <el-icon><ArrowLeft v-if="isExpand" /><ArrowRight v-else /></el-icon>
        </el-button>
        <div class="header-center">
          <el-breadcrumb>
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>列表</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-button type="primary">操作</el-button>
        </div>
      </div>
    </template>
    
    <template #right>
      <div>右侧内容</div>
    </template>
  </BtcSplitLayout>
</template>
```

### 示例 4：响应式宽度

```vue
<template>
  <BtcSplitLayout
    :left-width="isMobile ? '100%' : '320px'"
    :default-expand="!isMobile"
    :auto-collapse-on-mobile="true"
  >
    <template #left>
      <div>左侧内容</div>
    </template>
    
    <template #right>
      <div>右侧内容</div>
    </template>
  </BtcSplitLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { BtcSplitLayout } from '@btc/shared-components';

const isMobile = computed(() => window.innerWidth <= 768);
</script>
```

## 与其他组件的关系

### 架构层次

```
BtcSplitLayout (纯布局，无业务逻辑)
  ├── BtcViewGroup (左侧: BtcMasterList, 右侧: 默认头部 + 内容)
  │   └── BtcTableGroup (右侧: CRUD 表格)
  └── BtcFilterGroup (左侧: BtcFilterList, 右侧: 自定义)
```

### 何时使用 BtcSplitLayout

✅ **适合使用 BtcSplitLayout 的场景：**
- 需要左侧 `BtcFilterList` 的场景
- 需要完全自定义左右栏内容的场景
- 左侧不是 `BtcMasterList` 的场景
- 不需要选中项逻辑的场景

❌ **不适合使用 BtcSplitLayout 的场景：**
- 左侧需要 `BtcMasterList` 的场景（应使用 `BtcViewGroup`）
- 右侧需要默认头部和选中项逻辑的场景（应使用 `BtcViewGroup`）

## 样式定制

组件使用 CSS 变量，可以通过覆盖变量来定制样式：

```scss
.btc-split-layout {
  --el-bg-color: #ffffff;
  --el-border-color-extra-light: #e4e7ed;
  --el-color-primary: #409eff;
}
```

### 自定义样式类

组件提供以下 CSS 类，可以通过深度选择器覆盖：

- `.btc-split-layout`：根容器
- `.btc-split-layout__left`：左侧面板
- `.btc-split-layout__right`：右侧面板
- `.btc-split-layout__header`：右侧头部
- `.btc-split-layout__content`：右侧内容区域
- `.is-expand`：展开状态
- `.is-collapse`：折叠状态
- `.is-left-size-small`：小尺寸左侧
- `.is-left-size-middle`：中等尺寸左侧

## 注意事项

1. **必须提供插槽**：`left` 和 `right` 插槽必须提供，否则对应区域不会显示
2. **移动端行为**：默认情况下，移动端（宽度 ≤ 768px）会自动收起左侧面板
3. **宽度设置**：`leftWidth` 优先级高于 `leftSize`，如果同时指定，会使用 `leftWidth`
4. **响应式监听**：组件会自动监听窗口大小变化，调整移动端状态
5. **内容高度**：组件会自动触发内容高度重新计算，确保内部滚动正常工作

## 与 BtcViewGroup 的区别

| 特性 | BtcSplitLayout | BtcViewGroup |
|------|----------------|--------------|
| 定位 | 纯布局组件 | 业务组件（集成 BtcMasterList） |
| 左侧默认内容 | 无（必须提供插槽） | BtcMasterList（可通过插槽覆盖） |
| 右侧默认头部 | 可选（通过插槽） | 有（带选中项逻辑） |
| 选中项逻辑 | 无 | 有 |
| 数据加载 | 无 | 支持 leftService 和 rightService |
| 使用场景 | 完全自定义布局 | 左侧列表 + 右侧 CRUD |

## 最佳实践

1. **使用 BtcSplitLayout**：当左侧是 `BtcFilterList` 或其他自定义组件时
2. **使用 BtcViewGroup**：当左侧是 `BtcMasterList` 时
3. **避免过度使用**：如果只需要简单的左右布局，考虑使用 CSS Grid 或 Flexbox
4. **移动端优化**：确保移动端时左侧内容适合全屏显示
5. **性能考虑**：大量数据时，考虑使用虚拟滚动
