# 12.5 - CRUD 搜索组件

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 12

## 🎯 任务目标

开发 SearchForm 搜索表单组件，支持多种搜索条件。

## 📋 执行步骤

### 1. 创建组件

**packages/shared-components/src/crud/search/index.vue**:
```vue
<template>
  <el-form 
    :model="formData" 
    :inline="true"
    class="search-form"
  >
    <el-form-item 
      v-for="item in items" 
      :key="item.prop"
      :label="item.label"
    >
      <!-- 输入框 -->
      <el-input
        v-if="item.component === 'el-input'"
        v-model="formData[item.prop]"
        :placeholder="item.placeholder || `请输入${item.label}`"
        clearable
        v-bind="item.componentProps"
      />

      <!-- 选择器 -->
      <el-select
        v-else-if="item.component === 'el-select'"
        v-model="formData[item.prop]"
        :placeholder="item.placeholder || `请选择${item.label}`"
        clearable
        v-bind="item.componentProps"
      >
        <el-option
          v-for="opt in item.options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <!-- 日期选择器 -->
      <el-date-picker
        v-else-if="item.component === 'el-date-picker'"
        v-model="formData[item.prop]"
        v-bind="item.componentProps"
      />

      <!-- 自定义组件 -->
      <component
        v-else
        :is="item.component"
        v-model="formData[item.prop]"
        v-bind="item.componentProps"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSearch">
        搜索
      </el-button>
      <el-button @click="handleReset">
        重置
      </el-button>
      <slot name="extra"></slot>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface SearchItem {
  prop: string;
  label: string;
  component: string;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  componentProps?: any;
  defaultValue?: any;
}

const props = defineProps<{
  items: SearchItem[];
}>();

const emit = defineEmits(['search', 'reset']);

const formData = ref<Record<string, any>>({});

// 初始化默认值
watch(
  () => props.items,
  (items) => {
    const data: Record<string, any> = {};
    items.forEach(item => {
      if (item.defaultValue !== undefined) {
        data[item.prop] = item.defaultValue;
      }
    });
    formData.value = data;
  },
  { immediate: true }
);

const handleSearch = () => {
  emit('search', formData.value);
};

const handleReset = () => {
  formData.value = {};
  emit('reset');
};
</script>

<style scoped>
.search-form {
  padding: 20px;
  background: #f5f7fa;
  margin-bottom: 16px;
}
</style>
```

### 2. 导出组件

**packages/shared-components/src/index.ts**:
```typescript
import SearchForm from './crud/search/index.vue';
export { SearchForm };
```

### 3. 集成到 CrudTable

**packages/shared-components/src/crud/table/index.vue**:
```vue
<template>
  <div class="crud-table">
    <!-- 搜索区域 -->
    <SearchForm
      v-if="config.search"
      :items="config.search.items"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格... -->
  </div>
</template>

<script setup lang="ts">
import SearchForm from '../search/index.vue';
</script>
```

## ✅ 验收标准

### 检查：搜索功能

```vue
<template>
  <CrudTable :config="crudConfig" />
</template>

<script setup lang="ts">
const crudConfig = {
  service: mockService,
  search: {
    items: [
      { prop: 'keyword', label: '关键词', component: 'el-input' },
      { 
        prop: 'status', 
        label: '状态', 
        component: 'el-select',
        options: [
          { label: '全部', value: '' },
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
      {
        prop: 'dateRange',
        label: '日期',
        component: 'el-date-picker',
        componentProps: { type: 'daterange' },
      },
    ],
  },
  table: { /* ... */ },
};
</script>
```

## 📝 检查清单

- [ ] 组件创建
- [ ] 支持多种输入类型
- [ ] 搜索事件
- [ ] 重置功能
- [ ] 默认值支持
- [ ] 集成到 CrudTable
- [ ] 功能正常

## 🔗 下一步

- [12.6 - CRUD 新增编辑组件](./12.6-crud-upsert-component.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

