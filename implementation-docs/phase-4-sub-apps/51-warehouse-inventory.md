# 29 - 仓储库存模块

> **阶段**: Phase 4 | **时间**: 4小时 | **前置**: 28

## 🎯 任务目标

开发仓储库存管理模块。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/modules/warehouse/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          productName: '产品A',
          sku: 'SKU001',
          quantity: 1000,
          unit: '个',
          warehouse: '仓库1',
          location: 'A-01-01',
        },
      ],
      total: 1,
    }),
    add: async (data: any) => ({ id: 2 }),
    update: async (data: any) => ({}),
    delete: async (params: any) => ({}),
  },

  table: {
    columns: [
      { prop: 'productName', label: '产品名称', width: 200 },
      { prop: 'sku', label: 'SKU', width: 150 },
      { prop: 'quantity', label: '库存数量', width: 120 },
      { prop: 'unit', label: '单位', width: 80 },
      { prop: 'warehouse', label: '仓库', width: 120 },
      { prop: 'location', label: '库位', width: 120 },
    ],
  },
} as CrudConfig;
```

### 2. 创建页面

**src/modules/warehouse/index.vue**:
```vue
<template>
  <div class="warehouse-module">
    <h3>仓储库存管理</h3>
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import crudConfig from './crud';
</script>
```

## ✅ 验收标准

### 检查：库存列表

```bash
# 访问 http://localhost:5000/logistics/warehouse
# 预期: 显示库存列表及完整功能
```

## 📝 检查清单

- [ ] CRUD 配置创建
- [ ] 页面创建
- [ ] 列表显示正常
- [ ] 功能完整

## 🔗 下一步

- [30 - 生产应用初始化](./30-production-init.md)

