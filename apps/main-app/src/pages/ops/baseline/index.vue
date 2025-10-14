<template>
  <div class="baseline">
    <BtcCrud ref="crudRef" :service="wrappedService">
      <BtcRow>
        <BtcRefreshBtn />
        <el-button type="primary" @click="handleCreateSnapshot">创建快照</el-button>
        <el-button @click="handleCompare" :disabled="selection.length !== 2">对比基线</el-button>
        <BtcFlex1 />
        <BtcSearchKey />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" border @selection-change="handleSelectionChange" />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="700px" :on-submit="handleFormSubmit" />
    </BtcCrud>

    <!-- 对比弹窗 -->
    <el-dialog v-model="compareVisible" title="基线对比" width="80%">
      <el-row :gutter="20">
        <el-col :span="12">
          <h4>{{ compareData.baseline1?.baselineName }}</h4>
          <div class="compare-info">
            <div>权限数：{{ compareData.baseline1?.permissionCount }}</div>
            <div>创建时间：{{ compareData.baseline1?.createTime }}</div>
          </div>
        </el-col>
        <el-col :span="12">
          <h4>{{ compareData.baseline2?.baselineName }}</h4>
          <div class="compare-info">
            <div>权限数：{{ compareData.baseline2?.permissionCount }}</div>
            <div>创建时间：{{ compareData.baseline2?.createTime }}</div>
          </div>
        </el-col>
      </el-row>

      <el-divider>差异分析</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-tag type="success">新增权限：5</el-tag>
          <el-tag type="danger" style="margin-left: 10px;">删除权限：2</el-tag>
          <el-tag type="warning" style="margin-left: 10px;">修改权限：3</el-tag>
        </el-col>
      </el-row>

      <div style="margin-top: 20px; color: var(--el-text-color-secondary);">
        详细对比功能开发中...
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { createMockCrudService, mockHelpers } from '../../../utils/mock';

const { t } = useI18n();
const crudRef = ref();
const selection = ref<any[]>([]);
const compareVisible = ref(false);
const compareData = ref<any>({});

// Mock数据服务
const baselineService = createMockCrudService('btc_baselines', {
  defaultData: [
    {
      id: 1,
      baselineName: '初始基线',
      permissionCount: 50,
      description: '系统初始化时的权限快照',
      createTime: mockHelpers.randomDate(new Date(2024, 0, 1))
    },
    {
      id: 2,
      baselineName: '2024-Q1基线',
      permissionCount: 65,
      description: '第一季度权限基线',
      createTime: mockHelpers.randomDate(new Date(2024, 3, 1))
    },
    {
      id: 3,
      baselineName: '2024-Q2基线',
      permissionCount: 73,
      description: '第二季度权限基线',
      createTime: mockHelpers.randomDate(new Date(2024, 6, 1))
    },
  ]
});

// 添加delete确认
const wrappedService = {
  ...baselineService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await baselineService.delete({ ids });
    ElMessage.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'baselineName', label: '基线名称', minWidth: 150 },
  { prop: 'permissionCount', label: '权限数', width: 100 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'createTime', label: '创建时间', minWidth: 160 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'baselineName', label: '基线名称', span: 24, required: true, component: { name: 'el-input' } },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    // 自动获取当前权限数
    data.permissionCount = mockHelpers.randomNumber(50, 100);
    await next(data);
    ElMessage.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};

const handleSelectionChange = (val: any[]) => {
  selection.value = val;
};

const handleCreateSnapshot = async () => {
  try {
    await ElMessageBox.prompt('请输入快照名称', '创建权限快照', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
    });

    // Mock创建
    await baselineService.add({
      baselineName: `快照-${new Date().toLocaleDateString()}`,
      permissionCount: mockHelpers.randomNumber(70, 90),
      description: '手动创建的权限快照',
    });

    ElMessage.success('快照创建成功');
    crudRef.value?.crud.loadData();
  } catch (error) {
    // 用户取消
  }
};

const handleCompare = () => {
  if (selection.value.length !== 2) {
    ElMessage.warning('请选择两个基线进行对比');
    return;
  }

  compareData.value = {
    baseline1: selection.value[0],
    baseline2: selection.value[1],
  };

  compareVisible.value = true;
};

onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>

<style lang="scss" scoped>
.audit-log {
  padding: 20px;
}

.compare-info {
  margin-top: 10px;
  padding: 10px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;

  div {
    margin: 5px 0;
  }
}
</style>

