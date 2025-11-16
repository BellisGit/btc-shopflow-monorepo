# 28.5 - 供应商管理模块

> **阶段**: Phase 4 | **时间**: 3小时 | **前置**: 28

## 🎯 任务目标

开发供应商管理模块，支持供应商信息维护。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/modules/procurement/views/supplier/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          name: '供应商A',
          code: 'SUP001',
          contact: '张三',
          phone: '13800138000',
          email: 'supplier-a@example.com',
          address: '北京市朝阳区xxx',
          level: 'A',
          status: 1,
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
      { prop: 'code', label: '供应商编码', width: 150 },
      { prop: 'name', label: '供应商名称', width: 200 },
      { prop: 'contact', label: '联系人', width: 100 },
      { prop: 'phone', label: '联系电话', width: 150 },
      { prop: 'email', label: '邮箱', width: 180 },
      {
        prop: 'level',
        label: '等级',
        width: 80,
        formatter: (row: any) => row.level,
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => row.status === 1 ? '合作中' : '已停用',
      },
    ],

    actions: {
      custom: [
        {
          label: '查看详情',
          type: 'primary',
          click: (row: any) => {
            // 打开详情弹窗
          },
        },
      ],
    },
  },

  search: {
    items: [
      { prop: 'keyword', label: '关键词', component: 'el-input' },
      {
        prop: 'level',
        label: '等级',
        component: 'el-select',
        options: [
          { label: '全部', value: '' },
          { label: 'A级', value: 'A' },
          { label: 'B级', value: 'B' },
          { label: 'C级', value: 'C' },
        ],
      },
      {
        prop: 'status',
        label: '状态',
        component: 'el-select',
        options: [
          { label: '全部', value: '' },
          { label: '合作中', value: 1 },
          { label: '已停用', value: 0 },
        ],
      },
    ],
  },

  upsert: {
    width: '800px',
    items: [
      {
        prop: 'code',
        label: '供应商编码',
        component: 'el-input',
        rules: [{ required: true, message: '请输入供应商编码' }],
        tip: '唯一标识，如：SUP001',
      },
      {
        prop: 'name',
        label: '供应商名称',
        component: 'el-input',
        rules: [{ required: true, message: '请输入供应商名称' }],
      },
      {
        prop: 'contact',
        label: '联系人',
        component: 'el-input',
        rules: [{ required: true, message: '请输入联系人' }],
      },
      {
        prop: 'phone',
        label: '联系电话',
        component: 'el-input',
        rules: [
          { required: true, message: '请输入联系电话' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
        ],
      },
      {
        prop: 'email',
        label: '邮箱',
        component: 'el-input',
        rules: [
          { type: 'email', message: '邮箱格式不正确' },
        ],
      },
      {
        prop: 'address',
        label: '地址',
        component: 'el-input',
        componentProps: { type: 'textarea', rows: 2 },
      },
      {
        prop: 'level',
        label: '供应商等级',
        component: 'el-select',
        options: [
          { label: 'A级', value: 'A' },
          { label: 'B级', value: 'B' },
          { label: 'C级', value: 'C' },
        ],
        defaultValue: 'B',
      },
      {
        prop: 'status',
        label: '状态',
        component: 'el-radio-group',
        options: [
          { label: '合作中', value: 1 },
          { label: '已停用', value: 0 },
        ],
        defaultValue: 1,
      },
    ],
  },
} as CrudConfig;
```

### 2. 创建页面

**src/modules/procurement/views/supplier/index.vue**:
```vue
<template>
  <div class="supplier-management">
    <CrudTable :config="crudConfig">
      <template #toolbar-extra>
        <el-button @click="handleImport">导入供应商</el-button>
        <el-button @click="handleExport">导出</el-button>
      </template>
    </CrudTable>
  </div>
</template>

<script setup lang="ts">
import { CrudTable } from '@btc/shared-components';
import crudConfig from './crud';

const handleImport = () => {
  // Excel 导入
};

const handleExport = () => {
  // Excel 导出
};
</script>
```

### 3. 更新模块配置

**src/modules/procurement/config.ts**:
```typescript
export default {
  name: 'procurement',
  title: '采购管理',
  icon: 'el-icon-shopping-cart',
  sort: 1,
  
  routes: [
    {
      path: 'order',
      component: () => import('./views/order/index.vue'),
      meta: { title: '采购订单' },
    },
    {
      path: 'supplier',
      component: () => import('./views/supplier/index.vue'),
      meta: { title: '供应商管理' },
    },
  ],
} as ModuleConfig;
```

## ✅ 验收标准

### 检查：供应商管理

```bash
# 访问 /logistics/procurement/supplier
# 预期:
- 显示供应商列表
- 可搜索（关键词、等级、状态）
- 可新增供应商
- 可编辑供应商
- 表单校验正确（手机号、邮箱）
- 可导入/导出
```

## 📝 检查清单

- [ ] CRUD 配置完整
- [ ] 表单校验规则
- [ ] 搜索条件配置
- [ ] 自定义操作
- [ ] 导入导出功能
- [ ] 模块配置更新
- [ ] 路由正确
- [ ] 功能完整

## 🔗 下一步

- [28.6 - 采购合同模块](./28.6-procurement-contract.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

