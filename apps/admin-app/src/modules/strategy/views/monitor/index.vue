<template>
  <div class="strategy-monitor">
    <!-- 策略详情视图 -->
    <div class="strategy-details">
      <BtcCrud ref="crudRef" :service="wrappedService" :on-before-refresh="onBeforeRefresh" class="strategy-monitor-crud">
        <BtcRow>
          <BtcRefreshBtn />

          <!-- 策略状态筛选 -->
          <el-select v-model="selectedStatus" placeholder="策略状态" clearable style="width: 120px; margin-left: 8px;" @change="handleStatusFilter">
            <el-option label="全部" value="" />
            <el-option label="激活" value="ACTIVE" />
            <el-option label="停用" value="INACTIVE" />
            <el-option label="测试中" value="TESTING" />
          </el-select>

          <BtcFlex1 />
          <BtcSearchKey />
          <BtcCrudActions />
        </BtcRow>

        <BtcRow>
          <BtcTable
            ref="tableRef"
            :columns="columns"
            :op="{ buttons: ['view', 'history', 'alerts'] }"
            border
          >
            <!-- 自定义操作按钮 -->
            <template #op-view="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="viewStrategyDetail(row)"
              >
                查看详情
              </el-button>
            </template>

            <template #op-history="{ row }">
              <el-button
                type="info"
                size="small"
                @click="viewExecutionHistory(row)"
              >
                执行历史
              </el-button>
            </template>

            <template #op-alerts="{ row }">
              <el-button
                type="warning"
                size="small"
                @click="configureAlerts(row)"
              >
                告警配置
              </el-button>
            </template>
          </BtcTable>
        </BtcRow>

        <BtcRow>
          <BtcFlex1 />
          <BtcPagination />
        </BtcRow>
      </BtcCrud>
    </div>

    <!-- 策略详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="策略详情" width="1000px">
      <StrategyDetailPanel
        v-if="selectedStrategy"
        :strategy="selectedStrategy"
        :stats="selectedStrategyStats"
      />
    </el-dialog>

    <!-- 执行历史对话框 -->
    <el-dialog v-model="showHistoryDialog" title="执行历史" width="1200px">
      <StrategyExecutionHistory
        v-if="selectedStrategy"
        :strategy-id="selectedStrategy.id"
      />
    </el-dialog>

    <!-- 告警配置对话框 -->
    <el-dialog v-model="showAlertsDialog" title="告警配置" width="800px">
      <StrategyAlertConfig
        v-if="selectedStrategy"
        :strategy="selectedStrategy"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcConfirm, BtcMessage, BtcCrud, BtcRow, BtcRefreshBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import type {
  Strategy,
  StrategyMonitorStats
} from '@/types/strategy';
import {
  StrategyType,
  StrategyStatus
} from '@/types/strategy';
import { strategyService } from '@/services/strategy';
import StrategyDetailPanel from './components/StrategyDetailPanel.vue';
import StrategyExecutionHistory from './components/StrategyExecutionHistory.vue';
import StrategyAlertConfig from './components/StrategyAlertConfig.vue';

const { t } = useI18n();
const message = useMessage();

// 响应式数据
const crudRef = ref();
const selectedStatus = ref<StrategyStatus | ''>('');

// 对话框状态
const showDetailDialog = ref(false);
const showHistoryDialog = ref(false);
const showAlertsDialog = ref(false);
const selectedStrategy = ref<Strategy | null>(null);
const selectedStrategyStats = ref<StrategyMonitorStats | null>(null);

// 策略服务适配器
const wrappedService = {
  ...strategyService,
  delete: async (id: string) => {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // 单个删除：直接传递 ID
    await strategyService.deleteStrategy(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: string[]) => {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // 批量删除：调用 deleteStrategies 方法
    await strategyService.deleteStrategies(ids);

    message.success(t('crud.message.delete_success'));
  }
};

// 表格列配置
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'name', label: '策略名称', minWidth: 180 },
  {
    prop: 'type',
    label: '类型',
    width: 120,
    dict: [
      { label: '权限', value: 'PERMISSION', type: 'danger' },
      { label: '业务', value: 'BUSINESS', type: 'success' },
      { label: '数据', value: 'DATA', type: 'warning' },
      { label: '工作流', value: 'WORKFLOW', type: 'info' }
    ]
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    dict: [
      { label: '草稿', value: 'DRAFT', type: 'info' },
      { label: '测试中', value: 'TESTING', type: 'warning' },
      { label: '激活', value: 'ACTIVE', type: 'success' },
      { label: '停用', value: 'INACTIVE', type: 'danger' },
      { label: '已归档', value: 'ARCHIVED', type: 'default' }
    ]
  },
  { prop: 'priority', label: '优先级', width: 100 },
  { prop: 'version', label: '版本', width: 100 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'updatedAt', label: '更新时间', width: 180 }
]);

// 事件处理方法
const handleStatusFilter = () => {
  setTimeout(() => crudRef.value?.crud.loadData(), 50);
};

function onBeforeRefresh(params: Record<string, unknown>) {
  // 仅注入状态筛选；关键字由 BtcSearchKey 注入 keyword
  const next = { ...params };
  if (selectedStatus.value) {
    (next as any).status = selectedStatus.value;
  }
  return next;
}
const viewStrategyDetail = async (strategy: Strategy) => {
  selectedStrategy.value = strategy;
  try {
    selectedStrategyStats.value = await strategyService.getStrategyStats(strategy.id);
  } catch (error) {
    console.error('Failed to load strategy stats:', error);
  }
  showDetailDialog.value = true;
};

const viewExecutionHistory = (strategy: Strategy) => {
  selectedStrategy.value = strategy;
  showHistoryDialog.value = true;
};

const configureAlerts = (strategy: Strategy) => {
  selectedStrategy.value = strategy;
  showAlertsDialog.value = true;
};



const handleAlertSave = () => {
  BtcMessage.success('告警配置保存成功');
  showAlertsDialog.value = false;
};

// 生命周期
onMounted(() => {
  // 延迟加载数据
  setTimeout(() => crudRef.value?.crud.loadData(), 100);
});
</script>

<style lang="scss" scoped>
.strategy-monitor {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  box-sizing: border-box;

  .strategy-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .strategy-monitor-crud {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }
}
</style>
