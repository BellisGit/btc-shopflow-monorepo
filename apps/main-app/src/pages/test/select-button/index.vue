<template>
  <div class="select-button-demo">
    <el-card shadow="hover" class="demo-card">
      <template #header>
        <div class="card-header">
          <span>基础用法 - 双状态切换</span>
          <el-tag>推荐场景：状态筛选</el-tag>
        </div>
      </template>

      <div class="demo-section">
        <div class="demo-label">用户状态筛选：</div>
        <BtcSelectButton v-model="status" :options="statusOptions" @change="handleStatusChange" />
        <div class="demo-result">当前选择：{{ getStatusLabel(status) }}</div>
      </div>
    </el-card>

    <el-card shadow="hover" class="demo-card">
      <template #header>
        <div class="card-header">
          <span>三状态切换 - 视图模式</span>
          <el-tag type="success">推荐场景：视图切换</el-tag>
        </div>
      </template>

      <div class="demo-section">
        <div class="demo-label">视图模式：</div>
        <BtcSelectButton v-model="viewMode" :options="viewModeOptions" />
        <div class="demo-result">
          当前视图：{{ viewMode === 'list' ? '列表' : viewMode === 'card' ? '卡片' : '时间线' }}
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="demo-card">
      <template #header>
        <div class="card-header">
          <span>小尺寸模式</span>
          <el-tag type="warning">适合工具栏</el-tag>
        </div>
      </template>

      <div class="demo-section">
        <div class="demo-label">时间范围（小尺寸）：</div>
        <BtcSelectButton v-model="timeRange" :options="timeRangeOptions" small />
        <div class="demo-result">选择：{{ getTimeRangeLabel(timeRange) }}</div>
      </div>
    </el-card>

    <el-card shadow="hover" class="demo-card">
      <template #header>
        <div class="card-header">
          <span>配合 CRUD 使用</span>
          <el-tag type="danger">实际应用</el-tag>
        </div>
      </template>

      <BtcCrud ref="crudRef" :service="userService">
        <BtcRow>
          <span style="margin-right: 10px; color: var(--el-text-color-secondary);">状态筛选：</span>
          <BtcSelectButton v-model="crudStatus" :options="crudStatusOptions" @change="handleCrudFilter" />
          <BtcFlex1 />
          <BtcSearchKey />
        </BtcRow>
        <BtcRow>
          <BtcTable :columns="columns" />
        </BtcRow>
        <BtcRow>
          <BtcFlex1 />
          <BtcPagination />
        </BtcRow>
      </BtcCrud>
    </el-card>

    <el-card shadow="hover" class="demo-card">
      <template #header>
        <div class="card-header">
          <span>vs el-tabs 对比</span>
          <el-tag type="info">设计理念</el-tag>
        </div>
      </template>

      <div class="comparison">
        <div class="comparison-item">
          <h4>BtcSelectButton（推荐 2-5 个选项）</h4>
          <BtcSelectButton v-model="tabA" :options="comparisonOptions" />
          <div class="comparison-desc">✅ 紧凑、现代、分段控制器风格</div>
        </div>

        <div class="comparison-item">
          <h4>el-tabs（推荐 >5 个选项）</h4>
          <el-tabs v-model="tabB" type="card">
            <el-tab-pane v-for="opt in comparisonOptions" :key="opt.value" :label="opt.label" :name="opt.value" />
          </el-tabs>
          <div class="comparison-desc">❌ 传统标签页，占用空间较大</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { TableColumn } from '@btc/shared-components';
import { createMockCrudService } from '../../../utils/mock';

// 基础用法 - 双状态
const status = ref(1);
const statusOptions = [
  { label: '全部', value: undefined },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

const getStatusLabel = (val: any) => {
  const opt = statusOptions.find(o => o.value === val);
  return opt?.label || '未知';
};

const handleStatusChange = (val: any) => {
  ElMessage.success(`状态切换为：${getStatusLabel(val)}`);
};

// 三状态 - 视图模式
const viewMode = ref('list');
const viewModeOptions = [
  { label: '列表', value: 'list' },
  { label: '卡片', value: 'card' },
  { label: '时间线', value: 'timeline' },
];

// 小尺寸 - 时间范围
const timeRange = ref('today');
const timeRangeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
];

const getTimeRangeLabel = (val: string) => {
  const opt = timeRangeOptions.find(o => o.value === val);
  return opt?.label || '未知';
};

// CRUD 示例
const crudRef = ref();
const crudStatus = ref(1);
const crudStatusOptions = [
  { label: '全部', value: undefined },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

const userService = createMockCrudService('select_button_users', {
  defaultData: [
    { id: 1, name: '张三', phone: '13800138001', status: 1, createTime: '2024-01-01' },
    { id: 2, name: '李四', phone: '13800138002', status: 0, createTime: '2024-01-02' },
    { id: 3, name: '王五', phone: '13800138003', status: 1, createTime: '2024-01-03' },
  ],
});

const columns = computed<TableColumn[]>(() => [
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'phone', label: '手机号', minWidth: 140 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    formatter: (row: any) => (row.status === 1 ? '启用' : '禁用'),
  },
  { prop: 'createTime', label: '创建时间', minWidth: 150 },
]);

const handleCrudFilter = (val: any) => {
  crudRef.value?.crud.loadData({ status: val });
};

// 对比示例
const tabA = ref('installed');
const tabB = ref('installed');
const comparisonOptions = [
  { label: '已安装', value: 'installed' },
  { label: '全部插件', value: 'shop' },
  { label: '我的收藏', value: 'favorite' },
];
</script>

<style lang="scss" scoped>
.select-button-demo {
  padding: 20px;
}

.demo-card {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;

  .el-tag {
    font-size: 12px;
  }
}

.demo-section {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.demo-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  min-width: 120px;
}

.demo-result {
  margin-left: auto;
  padding: 6px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-color-primary);
}

.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 10px 0;

  &-item {
    h4 {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }

  &-desc {
    margin-top: 15px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    padding: 8px 12px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
  }
}
</style>

