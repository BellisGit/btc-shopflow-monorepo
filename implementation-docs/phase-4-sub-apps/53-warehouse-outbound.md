# 29.6 - 出库管理模块

> **阶段**: Phase 4 | **时间**: 4小时 | **前置**: 29.5

## 🎯 任务目标

开发出库管理模块，支持销售出库、生产领料等业务。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/modules/warehouse/views/outbound/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          outboundNo: 'OUT202501001',
          type: 1, // 1-销售出库 2-生产领料 3-其他出库
          relatedNo: 'SO202501001',
          warehouse: '仓库1',
          totalQuantity: 500,
          operator: '李四',
          status: 1, // 0-待审核 1-已审核 2-已出库
          outboundTime: '2025-01-15 14:30:00',
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
      { prop: 'outboundNo', label: '出库单号', width: 180 },
      {
        prop: 'type',
        label: '出库类型',
        width: 120,
        formatter: (row: any) => ['', '销售出库', '生产领料', '其他出库'][row.type],
      },
      { prop: 'relatedNo', label: '关联单号', width: 180 },
      { prop: 'warehouse', label: '仓库', width: 120 },
      { prop: 'totalQuantity', label: '总数量', width: 100 },
      { prop: 'operator', label: '操作人', width: 100 },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => ['待审核', '已审核', '已出库'][row.status],
      },
      { prop: 'outboundTime', label: '出库时间', width: 180 },
    ],

    actions: {
      custom: [
        {
          label: '审核',
          type: 'primary',
          visible: (row: any) => row.status === 0,
          click: (row: any) => {
            // 审核逻辑
          },
        },
        {
          label: '确认出库',
          type: 'warning',
          visible: (row: any) => row.status === 1,
          click: (row: any) => {
            // 出库逻辑
          },
        },
        {
          label: '打印拣货单',
          click: (row: any) => {
            // 打印逻辑
          },
        },
      ],
    },
  },

  search: {
    items: [
      { prop: 'keyword', label: '关键词', component: 'el-input' },
      {
        prop: 'type',
        label: '出库类型',
        component: 'el-select',
        dict: 'outbound_type',
      },
      {
        prop: 'status',
        label: '状态',
        component: 'el-select',
        dict: 'outbound_status',
      },
    ],
  },

  upsert: {
    width: '1000px',
    items: [
      {
        prop: 'type',
        label: '出库类型',
        component: 'el-select',
        options: [
          { label: '销售出库', value: 1 },
          { label: '生产领料', value: 2 },
          { label: '其他出库', value: 3 },
        ],
        rules: [{ required: true, message: '请选择出库类型' }],
      },
      {
        prop: 'relatedNo',
        label: '关联单号',
        component: 'el-input',
        tip: '销售订单号或生产计划号',
      },
      {
        prop: 'warehouseId',
        label: '出库仓库',
        component: 'el-select',
        dict: 'warehouse',
        rules: [{ required: true, message: '请选择仓库' }],
      },
      {
        prop: 'items',
        label: '出库明细',
        component: 'OutboundItemTable',
        rules: [
          {
            validator: (rule: any, value: any) => value && value.length > 0,
            message: '请添加出库明细',
          },
        ],
      },
      {
        prop: 'remark',
        label: '备注',
        component: 'el-input',
        componentProps: { type: 'textarea', rows: 3 },
      },
    ],
  },
} as CrudConfig;
```

### 2. 创建页面

**src/modules/warehouse/views/outbound/index.vue**:
```vue
<template>
  <div class="outbound-module">
    <CrudTable :config="crudConfig">
      <template #toolbar-extra>
        <el-button @click="handleBatchOutbound" :disabled="!hasSelected">
          批量出库
        </el-button>
      </template>
    </CrudTable>
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import { useTable } from '@btc/shared-core';
import crudConfig from './crud';

const { hasSelected, selectedRows } = useTable({ multipleSelection: true });

const handleBatchOutbound = async () => {
  // 批量出库逻辑
  console.log('批量出库:', selectedRows.value);
};
</script>
```

## ✅ 验收标准

### 检查：出库流程

```bash
# 访问 /logistics/warehouse/outbound
# 预期:
1. 显示出库单列表
2. 新增出库单 -> 选择类型 -> 添加明细 -> 保存
3. 审核出库单
4. 确认出库（库存扣减）
5. 打印拣货单
6. 支持批量出库
```

## 📝 检查清单

- [ ] CRUD 配置
- [ ] 出库明细组件
- [ ] 状态流转
- [ ] 批量出库
- [ ] 打印功能
- [ ] 库存联动
- [ ] 功能完整

## 🔗 下一步

- [30 - 生产应用初始化](./30-production-init.md)

