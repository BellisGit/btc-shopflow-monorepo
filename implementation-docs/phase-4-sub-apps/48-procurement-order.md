# 28 - 采购订单模块

> **阶段**: Phase 4 | **时间**: 4小时 | **前置**: 27

## 🎯 任务目标

使用 CRUD 配置化开发采购订单管理模块。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/modules/procurement/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          orderNo: 'PO202501001',
          supplierName: '供应商A',
          totalAmount: 50000,
          status: 0,
          createTime: '2025-01-01',
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
      { prop: 'orderNo', label: '订单编号', width: 180 },
      { prop: 'supplierName', label: '供应商', width: 200 },
      {
        prop: 'totalAmount',
        label: '总金额',
        width: 120,
        formatter: (row: any) => `¥${row.totalAmount.toFixed(2)}`,
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => ['待审核', '已审核', '已拒绝'][row.status],
      },
      { prop: 'createTime', label: '创建时间', width: 180 },
    ],
  },
} as CrudConfig;
```

### 2. 创建页面

**src/modules/procurement/index.vue**:
```vue
<template>
  <div class="procurement-module">
    <h3>采购订单管理</h3>
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import crudConfig from './crud';
</script>
```

## ✅ 验收标准

### 检查：订单列表

```bash
# 访问 http://localhost:5000/logistics/procurement
# 预期:
- 显示订单列表
- 有新增按钮
- 有编辑/删除按钮
- 显示总金额格式化
- 显示状态翻译
```

## 📝 检查清单

- [ ] CRUD 配置创建
- [ ] 页面创建
- [ ] 表格显示
- [ ] 格式化正确
- [ ] 操作按钮显示

## 🔗 下一步

- [29 - 仓储库存模块](./29-warehouse-inventory.md)

