# 31 - 生产计划模块

> **阶段**: Phase 4 | **时间**: 4小时 | **前置**: 30

## 🎯 任务目标

开发生产计划管理模块。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/modules/production-plan/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          planNo: 'PLAN202501001',
          productName: '产品A',
          quantity: 5000,
          startDate: '2025-01-10',
          endDate: '2025-01-20',
          status: 0,
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
      { prop: 'planNo', label: '计划编号', width: 180 },
      { prop: 'productName', label: '产品名称', width: 200 },
      { prop: 'quantity', label: '计划数量', width: 120 },
      { prop: 'startDate', label: '开始日期', width: 120 },
      { prop: 'endDate', label: '结束日期', width: 120 },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => ['待执行', '执行中', '已完成'][row.status],
      },
    ],
  },
} as CrudConfig;
```

### 2. 创建页面

**src/modules/production-plan/index.vue**:
```vue
<template>
  <div class="production-plan-module">
    <h3>生产计划管理</h3>
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import crudConfig from './crud';
</script>
```

## ✅ 验收标准

### 检查：计划列表

```bash
# 访问 http://localhost:5000/production/plan
# 预期: 显示生产计划列表
```

## 📝 检查清单

- [ ] CRUD 配置创建
- [ ] 页面创建
- [ ] 列表显示
- [ ] 功能完整

## 🔗 下一步

- [32 - 跨应用事件通信](./32-inter-app-events.md)

