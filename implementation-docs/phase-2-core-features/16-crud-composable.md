# 11 - CRUD 表格组件

> **阶段**: Phase 2 | **时间**: 4小时 | **前置**: 10

## 🎯 任务目标

开发 CrudTable 表格组件，配合 useCrud 实现完整的表格展示功能。

## 📋 执行步骤

### 1. 创建组件

**packages/shared-components/src/crud/table/index.vue**:
```vue
<template>
  <div class="crud-table">
    <div class="toolbar">
      <slot name="toolbar-left">
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </slot>
      <slot name="toolbar-right">
        <el-button @click="handleRefresh">刷新</el-button>
      </slot>
    </div>

    <el-table :data="tableData" v-loading="loading">
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
      >
        <template #default="{ row }">
          <slot :name="`column-${col.prop}`" :row="row">
            <span v-if="col.formatter">{{ col.formatter(row) }}</span>
            <span v-else>{{ row[col.prop] }}</span>
          </slot>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      @change="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCrud, type CrudService } from '@btc/shared-core';

interface Column {
  prop: string;
  label: string;
  width?: number;
  formatter?: (row: any) => string;
}

const props = defineProps<{
  service: CrudService;
  columns: Column[];
}>();

const {
  tableData,
  loading,
  pagination,
  loadData,
  handleAdd,
  handleEdit,
  handleDelete,
  handleRefresh,
} = useCrud({
  service: props.service,
  onSuccess: (msg) => {
    // 消息提示
  },
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.crud-table {
  padding: 20px;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}
</style>
```

### 2. 导出组件

**packages/shared-components/src/index.ts**:
```typescript
import CrudTable from './crud/table/index.vue';

export { CrudTable };
```

## ✅ 验收标准

### 检查：组件使用

```vue
<template>
  <CrudTable :service="userService" :columns="columns" />
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';

const userService = {
  page: async () => ({ list: [], total: 0 }),
  add: async () => ({}),
  update: async () => ({}),
  delete: async () => ({}),
};

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名' },
];
</script>
```

## 📝 检查清单

- [ ] 组件创建完成
- [ ] 表格渲染正确
- [ ] 工具栏显示
- [ ] 操作列显示
- [ ] 分页功能正常
- [ ] 插槽可用
- [ ] 导出正确

## 🔗 下一步

- [12 - CRUD 表单组件](./12-crud-form-component.md)

---

**状态**: ✅ 就绪 | **预计时间**: 4小时

