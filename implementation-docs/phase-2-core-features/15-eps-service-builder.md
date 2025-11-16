# 10 - CRUD Composable 实现

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 09

## 🎯 任务目标

实现 useCrud composable，封装 CRUD 通用逻辑。

## 📋 执行步骤

### 1. 创建类型定义

**packages/shared-core/src/btc/crud/types.ts**:
```typescript
export interface CrudService {
  page(params: any): Promise<{ list: any[]; total: number }>;
  add(data: any): Promise<any>;
  update(data: any): Promise<any>;
  delete(params: { ids: number[] }): Promise<any>;
}

export interface CrudOptions {
  service: CrudService;
  onLoad?: () => void;
  onSuccess?: (message: string) => void;
  onError?: (error: any) => void;
}
```

### 2. 实现 useCrud

**packages/shared-core/src/btc/crud/use-crud.ts**:
```typescript
import { ref, reactive } from 'vue';
import type { CrudOptions } from './types';

export function useCrud(options: CrudOptions) {
  const { service, onLoad, onSuccess, onError } = options;

  const tableData = ref<any[]>([]);
  const loading = ref(false);
  const pagination = reactive({
    page: 1,
    size: 20,
    total: 0,
  });

  const searchParams = ref<any>({});
  const upsertVisible = ref(false);
  const currentRow = ref<any>(null);

  // 加载数据
  const loadData = async () => {
    loading.value = true;
    onLoad?.();

    try {
      const res = await service.page({
        page: pagination.page,
        size: pagination.size,
        ...searchParams.value,
      });

      tableData.value = res.list;
      pagination.total = res.total;
    } catch (error) {
      onError?.(error);
    } finally {
      loading.value = false;
    }
  };

  // 搜索
  const handleSearch = (params: any) => {
    searchParams.value = params;
    pagination.page = 1;
    loadData();
  };

  // 重置
  const handleReset = () => {
    searchParams.value = {};
    pagination.page = 1;
    loadData();
  };

  // 新增
  const handleAdd = () => {
    currentRow.value = null;
    upsertVisible.value = true;
  };

  // 编辑
  const handleEdit = (row: any) => {
    currentRow.value = { ...row };
    upsertVisible.value = true;
  };

  // 删除
  const handleDelete = async (row: any) => {
    try {
      await service.delete({ ids: [row.id] });
      onSuccess?.('删除成功');
      loadData();
    } catch (error) {
      onError?.(error);
    }
  };

  // 刷新
  const handleRefresh = () => {
    loadData();
  };

  return {
    tableData,
    loading,
    pagination,
    searchParams,
    upsertVisible,
    currentRow,
    loadData,
    handleSearch,
    handleReset,
    handleAdd,
    handleEdit,
    handleDelete,
    handleRefresh,
  };
}
```

### 3. 导出

**packages/shared-core/src/btc/crud/index.ts**:
```typescript
export { useCrud } from './use-crud';
export type { CrudOptions, CrudService } from './types';
```

**packages/shared-core/src/index.ts**:
```typescript
export { useCrud } from './btc/crud';
export type { CrudOptions, CrudService } from './btc/crud';
```

## ✅ 验收标准

### 检查: useCrud 可用

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useCrud } from '@btc/shared-core';

const mockService = {
  page: async (params: any) => ({
    list: [{ id: 1, name: 'Test' }],
    total: 1,
  }),
  add: async (data: any) => ({ id: 2 }),
  update: async (data: any) => ({}),
  delete: async (params: any) => ({}),
};

const {
  tableData,
  loading,
  pagination,
  loadData,
  handleAdd,
  handleEdit,
  handleDelete,
} = useCrud({
  service: mockService,
  onSuccess: (msg) => console.log(msg),
});

onMounted(() => {
  loadData();
});
</script>
```

## 📝 检查清单

- [ ] 类型定义完整
- [ ] useCrud 实现
- [ ] loadData 逻辑正确
- [ ] 搜索/重置功能
- [ ] 增删改操作
- [ ] 分页逻辑
- [ ] 导出正确

## 🔗 下一步

- [11 - CRUD 表格组件](./11-crud-table-component.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

