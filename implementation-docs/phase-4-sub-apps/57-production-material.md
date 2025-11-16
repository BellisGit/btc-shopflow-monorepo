# 31.6 - 物料需求模块

> **阶段**: Phase 4 | **时间**: 3小时 | **前置**: 31.5

## 🎯 任务目标

开发物料需求计划（MRP）模块，支持物料需求计算。

## 📋 执行步骤

### 1. 创建 CRUD 配置

**src/modules/production-plan/views/material/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          mrpNo: 'MRP202501001',
          planNo: 'PLAN202501001',
          materialName: '原材料A',
          sku: 'MAT001',
          requiredQuantity: 10000,
          availableQuantity: 8000,
          shortageQuantity: 2000,
          purchaseQuantity: 2000,
          status: 0, // 0-待采购 1-已采购 2-已到货
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
      { prop: 'mrpNo', label: 'MRP编号', width: 180 },
      { prop: 'planNo', label: '生产计划', width: 180 },
      { prop: 'materialName', label: '物料名称', width: 200 },
      { prop: 'sku', label: 'SKU', width: 120 },
      { prop: 'requiredQuantity', label: '需求数量', width: 120 },
      { prop: 'availableQuantity', label: '可用数量', width: 120 },
      {
        prop: 'shortageQuantity',
        label: '缺口数量',
        width: 120,
        formatter: (row: any) => {
          const shortage = row.shortageQuantity;
          return shortage > 0 ? `<span style="color: red;">${shortage}</span>` : '0';
        },
      },
      { prop: 'purchaseQuantity', label: '采购数量', width: 120 },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => ['待采购', '已采购', '已到货'][row.status],
      },
    ],

    actions: {
      custom: [
        {
          label: '生成采购单',
          type: 'primary',
          visible: (row: any) => row.status === 0 && row.shortageQuantity > 0,
          click: (row: any) => {
            // 跳转到采购模块并带上物料信息
            // 跨应用通信
          },
        },
      ],
    },
  },

  upsert: {
    items: [
      {
        prop: 'planId',
        label: '生产计划',
        component: 'el-select',
        dict: 'production_plan',
        rules: [{ required: true, message: '请选择生产计划' }],
      },
      {
        prop: 'materialId',
        label: '物料',
        component: 'el-select',
        dict: 'material',
        rules: [{ required: true, message: '请选择物料' }],
      },
      {
        prop: 'requiredQuantity',
        label: '需求数量',
        component: 'el-input-number',
        rules: [{ required: true, message: '请输入需求数量' }],
      },
    ],
  },
} as CrudConfig;
```

### 2. 跨应用通信集成

**生产应用发起采购请求**:
```vue
<script setup lang="ts">
import { eventBus } from '@btc/shared-utils';

const handleGeneratePurchase = (row: any) => {
  // 发送事件到物流应用
  eventBus.emit('create-purchase-order', {
    materialId: row.materialId,
    materialName: row.materialName,
    quantity: row.shortageQuantity,
    sourceType: 'mrp',
    sourceNo: row.mrpNo,
  });

  ElMessage.success('已通知采购部门');
  
  // 跳转到物流应用
  router.push('/logistics/procurement/order?from=mrp');
};
</script>
```

**物流应用接收请求**:
```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { eventBus } from '@btc/shared-utils';

onMounted(() => {
  eventBus.on('create-purchase-order', (data) => {
    console.log('收到采购需求:', data);
    
    // 自动填充采购单
    formData.value = {
      materialId: data.materialId,
      quantity: data.quantity,
      sourceNo: data.sourceNo,
    };
    
    // 打开新增弹窗
    upsertVisible.value = true;
  });
});

onUnmounted(() => {
  eventBus.off('create-purchase-order');
});
</script>
```

## ✅ 验收标准

### 检查：物料需求

```bash
# 访问 /production/plan/material
# 预期:
- 显示物料需求列表
- 缺口数量用红色标注
- 可生成采购单
- 跨应用通信成功
```

## 📝 检查清单

- [ ] CRUD 配置
- [ ] MRP 计算逻辑
- [ ] 缺口提示
- [ ] 跨应用通信
- [ ] 自动生成采购单
- [ ] 功能完整

## 🔗 下一步

- [32 - 跨应用事件通信](./32-inter-app-events.md)

