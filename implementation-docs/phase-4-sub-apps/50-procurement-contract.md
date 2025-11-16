# 28.6 - 采购合同模块

> **阶段**: Phase 4 | **时间**: 3小时 | **前置**: 28.5

## 🎯 任务目标

开发采购合同管理模块，支持合同全生命周期管理。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/modules/procurement/views/contract/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          contractNo: 'CON202501001',
          supplierName: '供应商A',
          amount: 500000,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          signDate: '2024-12-25',
          status: 1, // 0-草稿 1-生效中 2-已到期 3-已终止
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
      { prop: 'contractNo', label: '合同编号', width: 180 },
      { prop: 'supplierName', label: '供应商', width: 200 },
      {
        prop: 'amount',
        label: '合同金额',
        width: 150,
        formatter: (row: any) => `¥${row.amount.toLocaleString()}`,
      },
      { prop: 'startDate', label: '开始日期', width: 120 },
      { prop: 'endDate', label: '结束日期', width: 120 },
      { prop: 'signDate', label: '签订日期', width: 120 },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => ['草稿', '生效中', '已到期', '已终止'][row.status],
      },
    ],

    actions: {
      custom: [
        {
          label: '上传附件',
          click: (row: any) => {
            // 上传合同文件
          },
        },
        {
          label: '查看附件',
          click: (row: any) => {
            // 查看合同文件
          },
        },
        {
          label: '终止合同',
          type: 'danger',
          visible: (row: any) => row.status === 1,
          click: async (row: any) => {
            // 终止合同逻辑
          },
        },
      ],
    },
  },

  search: {
    items: [
      { prop: 'keyword', label: '关键词', component: 'el-input' },
      {
        prop: 'supplierId',
        label: '供应商',
        component: 'el-select',
        dict: 'supplier',
      },
      {
        prop: 'status',
        label: '状态',
        component: 'el-select',
        options: [
          { label: '全部', value: '' },
          { label: '草稿', value: 0 },
          { label: '生效中', value: 1 },
          { label: '已到期', value: 2 },
          { label: '已终止', value: 3 },
        ],
      },
      {
        prop: 'dateRange',
        label: '签订日期',
        component: 'el-date-picker',
        componentProps: { type: 'daterange' },
      },
    ],
  },

  upsert: {
    width: '900px',
    items: [
      {
        prop: 'supplierId',
        label: '供应商',
        component: 'el-select',
        dict: 'supplier',
        rules: [{ required: true, message: '请选择供应商' }],
      },
      {
        prop: 'amount',
        label: '合同金额',
        component: 'el-input-number',
        componentProps: { min: 0, precision: 2 },
        rules: [{ required: true, message: '请输入合同金额' }],
      },
      {
        prop: 'startDate',
        label: '开始日期',
        component: 'el-date-picker',
        rules: [{ required: true, message: '请选择开始日期' }],
      },
      {
        prop: 'endDate',
        label: '结束日期',
        component: 'el-date-picker',
        rules: [{ required: true, message: '请选择结束日期' }],
      },
      {
        prop: 'signDate',
        label: '签订日期',
        component: 'el-date-picker',
        defaultValue: new Date(),
      },
      {
        prop: 'attachment',
        label: '合同附件',
        component: 'BtcUpload',
        componentProps: {
          accept: '.pdf,.doc,.docx',
          maxSize: 20,
        },
      },
      {
        prop: 'terms',
        label: '合同条款',
        component: 'el-input',
        componentProps: { type: 'textarea', rows: 5 },
      },
    ],
  },
} as CrudConfig;
```

### 2. 创建页面

**src/modules/procurement/views/contract/index.vue**:
```vue
<template>
  <div class="contract-module">
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import crudConfig from './crud';
</script>
```

## ✅ 验收标准

### 检查：合同管理

```bash
# 访问 /logistics/procurement/contract
# 预期:
- 显示合同列表
- 可新增合同
- 可上传附件
- 可终止合同
- 金额格式化正确
- 状态显示正确
```

## 📝 检查清单

- [ ] CRUD 配置完整
- [ ] 合同状态流转
- [ ] 附件上传功能
- [ ] 自定义操作
- [ ] 金额格式化
- [ ] 日期验证
- [ ] 功能完整

## 🔗 下一步

- [29 - 仓储库存模块](./29-warehouse-inventory.md)

