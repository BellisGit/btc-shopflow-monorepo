# 29.5 - 入库管理模块

> **阶段**: Phase 4 | **时间**: 4小时 | **前置**: 29

## 🎯 任务目标

开发入库管理模块，支持采购入库、退货入库等业务。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/modules/warehouse/views/inbound/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          inboundNo: 'IN202501001',
          type: 1, // 1-采购入库 2-退货入库 3-其他入库
          orderNo: 'PO202501001',
          warehouse: '仓库1',
          totalQuantity: 1000,
          operator: '张三',
          status: 1, // 0-待审核 1-已审核 2-已入库
          inboundTime: '2025-01-10 10:30:00',
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
      { prop: 'inboundNo', label: '入库单号', width: 180 },
      {
        prop: 'type',
        label: '入库类型',
        width: 120,
        formatter: (row: any) => ['', '采购入库', '退货入库', '其他入库'][row.type],
      },
      { prop: 'orderNo', label: '关联单号', width: 180 },
      { prop: 'warehouse', label: '仓库', width: 120 },
      { prop: 'totalQuantity', label: '总数量', width: 100 },
      { prop: 'operator', label: '操作人', width: 100 },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => ['待审核', '已审核', '已入库'][row.status],
      },
      { prop: 'inboundTime', label: '入库时间', width: 180 },
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
          label: '确认入库',
          type: 'success',
          visible: (row: any) => row.status === 1,
          click: (row: any) => {
            // 入库逻辑
          },
        },
        {
          label: '查看明细',
          click: (row: any) => {
            // 打开明细弹窗
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
        label: '入库类型',
        component: 'el-select',
        options: [
          { label: '全部', value: '' },
          { label: '采购入库', value: 1 },
          { label: '退货入库', value: 2 },
          { label: '其他入库', value: 3 },
        ],
      },
      {
        prop: 'status',
        label: '状态',
        component: 'el-select',
        dict: 'inbound_status',
      },
      {
        prop: 'dateRange',
        label: '入库日期',
        component: 'el-date-picker',
        componentProps: { type: 'daterange' },
      },
    ],
  },

  upsert: {
    width: '1000px',
    items: [
      {
        prop: 'type',
        label: '入库类型',
        component: 'el-select',
        options: [
          { label: '采购入库', value: 1 },
          { label: '退货入库', value: 2 },
          { label: '其他入库', value: 3 },
        ],
        rules: [{ required: true, message: '请选择入库类型' }],
      },
      {
        prop: 'orderNo',
        label: '关联单号',
        component: 'el-input',
        tip: '采购入库需填写采购订单号',
      },
      {
        prop: 'warehouseId',
        label: '入库仓库',
        component: 'el-select',
        dict: 'warehouse',
        rules: [{ required: true, message: '请选择仓库' }],
      },
      {
        prop: 'items',
        label: '入库明细',
        component: 'InboundItemTable', // 自定义组件
        rules: [
          {
            validator: (rule: any, value: any) => {
              return value && value.length > 0;
            },
            message: '请添加入库明细',
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

### 2. 创建入库明细组件

**src/modules/warehouse/views/inbound/components/ItemTable.vue**:
```vue
<template>
  <div class="inbound-items">
    <el-button size="small" @click="handleAdd">添加明细</el-button>

    <el-table :data="items" class="mt-2">
      <el-table-column label="产品名称" prop="productName" width="200">
        <template #default="{ row, $index }">
          <el-select v-model="row.productId" @change="handleProductChange($index)">
            <el-option
              v-for="p in products"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </template>
      </el-table-column>
      
      <el-table-column label="数量" prop="quantity" width="120">
        <template #default="{ row }">
          <el-input-number v-model="row.quantity" :min="1" />
        </template>
      </el-table-column>

      <el-table-column label="库位" prop="location" width="150">
        <template #default="{ row }">
          <el-input v-model="row.location" placeholder="A-01-01" />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100">
        <template #default="{ $index }">
          <el-button link type="danger" @click="handleRemove($index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: any[];
}>();

const emit = defineEmits(['update:modelValue']);

const items = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val),
});

const products = ref([
  { id: 1, name: '产品A', sku: 'SKU001' },
  { id: 2, name: '产品B', sku: 'SKU002' },
]);

const handleAdd = () => {
  items.value.push({
    productId: null,
    productName: '',
    quantity: 1,
    location: '',
  });
};

const handleRemove = (index: number) => {
  items.value.splice(index, 1);
};

const handleProductChange = (index: number) => {
  const product = products.value.find(
    p => p.id === items.value[index].productId
  );
  if (product) {
    items.value[index].productName = product.name;
  }
};
</script>
```

### 3. 创建页面

**src/modules/warehouse/views/inbound/index.vue**:
```vue
<template>
  <div class="inbound-module">
    <CrudTable :config="crudConfig" />
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import crudConfig from './crud';
</script>
```

## ✅ 验收标准

### 检查：入库流程

```bash
# 访问 /logistics/warehouse/inbound
# 预期:
1. 显示入库单列表
2. 点击"新增" -> 填写入库信息 -> 添加明细 -> 保存
3. 待审核单据显示"审核"按钮
4. 审核通过后显示"确认入库"按钮
5. 确认入库后库存更新
```

## 📝 检查清单

- [ ] CRUD 配置完整
- [ ] 入库明细组件
- [ ] 产品选择功能
- [ ] 数量和库位输入
- [ ] 自定义操作（审核、入库）
- [ ] 状态流转正确
- [ ] 功能完整

## 🔗 下一步

- [29.6 - 出库管理模块](./29.6-warehouse-outbound.md)

---

**状态**: ✅ 就绪 | **预计时间**: 4小时

