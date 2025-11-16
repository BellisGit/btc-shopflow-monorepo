# 31.5 - 生产排期模块

> **阶段**: Phase 4 | **时间**: 4小时 | **前置**: 31

## 🎯 任务目标

开发生产排期模块，支持甘特图展示和拖拽排期。

## 📋 执行步骤

### 1. 安装甘特图库

```bash
cd packages/production-app
pnpm add gantt-schedule-timeline-calendar
```

### 2. 创建 CRUD 配置

**src/modules/production-plan/views/schedule/crud.ts**:
```typescript
import type { CrudConfig } from '@btc/shared-core';

export default {
  service: {
    page: async (params: any) => ({
      list: [
        {
          id: 1,
          scheduleNo: 'SCH202501001',
          planNo: 'PLAN202501001',
          workstation: '生产线A',
          startTime: '2025-01-10 08:00:00',
          endTime: '2025-01-15 18:00:00',
          progress: 60,
          status: 1, // 0-未开始 1-进行中 2-已完成 3-已暂停
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
      { prop: 'scheduleNo', label: '排期编号', width: 180 },
      { prop: 'planNo', label: '计划编号', width: 180 },
      { prop: 'workstation', label: '工位', width: 150 },
      { prop: 'startTime', label: '开始时间', width: 170 },
      { prop: 'endTime', label: '结束时间', width: 170 },
      {
        prop: 'progress',
        label: '进度',
        width: 120,
        formatter: (row: any) => `${row.progress}%`,
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: any) => ['未开始', '进行中', '已完成', '已暂停'][row.status],
      },
    ],

    actions: {
      custom: [
        {
          label: '开始生产',
          type: 'success',
          visible: (row: any) => row.status === 0,
          click: (row: any) => {},
        },
        {
          label: '暂停',
          type: 'warning',
          visible: (row: any) => row.status === 1,
          click: (row: any) => {},
        },
        {
          label: '完成',
          type: 'primary',
          visible: (row: any) => row.status === 1,
          click: (row: any) => {},
        },
      ],
    },
  },
} as CrudConfig;
```

### 3. 创建甘特图视图

**src/modules/production-plan/views/schedule/index.vue**:
```vue
<template>
  <div class="schedule-module">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="列表视图" name="list">
        <CrudTable :config="crudConfig" />
      </el-tab-pane>

      <el-tab-pane label="甘特图" name="gantt">
        <div id="gantt-container" style="height: 600px;"></div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { CrudTable } from '@btc/shared-components';
import GSTC from 'gantt-schedule-timeline-calendar';
import crudConfig from './crud';

const activeTab = ref('list');

const initGantt = () => {
  const config = {
    list: {
      rows: [
        { id: '1', label: '生产线A' },
        { id: '2', label: '生产线B' },
      ],
      columns: {
        data: {
          id: { id: 'id', data: 'label', width: 200 },
        },
      },
    },
    chart: {
      items: [
        {
          id: '1',
          rowId: '1',
          label: 'PLAN202501001',
          time: {
            start: new Date('2025-01-10').getTime(),
            end: new Date('2025-01-15').getTime(),
          },
        },
      ],
    },
  };

  GSTC.create(document.getElementById('gantt-container')!, config);
};

watch(activeTab, (val) => {
  if (val === 'gantt') {
    nextTick(() => initGantt());
  }
});
</script>
```

## ✅ 验收标准

### 检查：排期功能

```bash
# 访问 /production/plan/schedule
# 预期:
- 列表视图显示排期
- 甘特图显示时间轴
- 可拖拽调整时间
- 状态流转正常
```

## 📝 检查清单

- [ ] CRUD 配置
- [ ] 甘特图集成
- [ ] 拖拽排期
- [ ] 状态管理
- [ ] 功能完整

## 🔗 下一步

- [31.6 - 物料需求模块](./31.6-production-material.md)

