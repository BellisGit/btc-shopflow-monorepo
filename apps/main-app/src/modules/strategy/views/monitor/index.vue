<template>
  <div class="strategy-monitor">
    <!-- 视图切换 -->
    <div class="monitor-header">
      <BtcSelectButton
        v-model="viewMode"
        :options="viewModeOptions"
        @change="handleViewModeChange"
      />
    </div>

    <!-- 策略详情视图 -->
    <div v-if="viewMode === 'details'" class="strategy-details">
      <BtcCrud ref="crudRef" :service="wrappedService" class="strategy-monitor-crud">
        <BtcRow>
          <BtcRefreshBtn />

          <!-- 策略类型筛选 -->
          <el-select v-model="selectedType" placeholder="策略类型" clearable style="width: 120px; margin-left: 8px;" @change="handleTypeFilter">
            <el-option label="全部" value="" />
            <el-option label="权限策略" value="PERMISSION" />
            <el-option label="业务策略" value="BUSINESS" />
            <el-option label="数据策略" value="DATA" />
            <el-option label="工作流策略" value="WORKFLOW" />
          </el-select>

          <!-- 策略状态筛选 -->
          <el-select v-model="selectedStatus" placeholder="策略状态" clearable style="width: 120px; margin-left: 8px;" @change="handleStatusFilter">
            <el-option label="全部" value="" />
            <el-option label="激活" value="ACTIVE" />
            <el-option label="停用" value="INACTIVE" />
            <el-option label="测试中" value="TESTING" />
          </el-select>

          <BtcFlex1 />
          <BtcSearchKey />
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

    <!-- 图表分析视图 -->
    <div v-else-if="viewMode === 'charts'" class="strategy-charts">
      <BtcContainer :gap="10">
        <div class="chart-item">
          <h4>执行次数趋势</h4>
          <BtcLineChart
            :data="executionTrendData"
            :x-axis-data="executionTrendXAxis"
            height="100%"
          />
        </div>
        <div class="chart-item">
          <h4>响应时间分布</h4>
          <BtcBarChart
            :data="responseTimeData"
            :x-axis-data="responseTimeXAxis"
            height="100%"
          />
        </div>
        <div class="chart-item">
          <h4>策略类型分布</h4>
          <BtcPieChart
            :data="typeDistributionData"
            height="100%"
          />
        </div>
        <div class="chart-item">
          <h4>成功率统计</h4>
          <BtcBarChart
            :data="successRateData"
            :x-axis-data="successRateXAxis"
            y-axis-formatter="%"
            height="100%"
          />
        </div>
      </BtcContainer>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type {
  TableColumn,
  BtcLineChart,
  BtcBarChart,
  BtcPieChart,
  LineChartData,
  BarChartData,
  PieChartDataItem
} from '@btc/shared-components';
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
const viewMode = ref<'details' | 'charts'>('details');
const crudRef = ref();
const selectedType = ref<StrategyType | ''>('');
const selectedStatus = ref<StrategyStatus | ''>('');

// 对话框状态
const showDetailDialog = ref(false);
const showHistoryDialog = ref(false);
const showAlertsDialog = ref(false);
const selectedStrategy = ref<Strategy | null>(null);
const selectedStrategyStats = ref<StrategyMonitorStats | null>(null);

// 视图模式选项
const viewModeOptions = [
  { label: '策略详情', value: 'details' },
  { label: '图表分析', value: 'charts' }
];

// 策略服务适配器
const wrappedService = {
  ...strategyService,
  delete: async ({ ids }: { ids: string[] }) => {
    await ElMessageBox.confirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    if (ids.length === 1) {
      await strategyService.deleteStrategy(ids[0]);
    } else {
      await strategyService.deleteStrategies(ids);
    }

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

// 图表数据
const executionTrendData = ref<LineChartData[]>([
  {
    name: '执行次数',
    data: [120, 132, 101, 134, 90, 230, 210],
    color: '#409eff',
    smooth: true
  }
]);

const executionTrendXAxis = ref<string[]>(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);

const responseTimeData = ref<BarChartData[]>([
  {
    name: '响应时间分布',
    data: [320, 280, 150, 80, 20],
    color: '#67c23a'
  }
]);

const responseTimeXAxis = ref<string[]>(['0-50ms', '50-100ms', '100-200ms', '200-500ms', '500ms+']);

const typeDistributionData = ref<PieChartDataItem[]>([
  { name: '权限策略', value: 35, color: '#f56c6c' },
  { name: '业务策略', value: 25, color: '#67c23a' },
  { name: '数据策略', value: 20, color: '#e6a23c' },
  { name: '工作流策略', value: 20, color: '#409eff' }
]);

const successRateData = ref<BarChartData[]>([
  {
    name: '成功率',
    data: [95, 88, 92, 85],
    color: '#67c23a'
  }
]);

const successRateXAxis = ref<string[]>(['权限策略', '业务策略', '数据策略', '工作流策略']);

// 事件处理方法
const handleViewModeChange = () => {
  // 图表组件会自动处理渲染，无需手动初始化
};

const handleTypeFilter = () => {
  setTimeout(() => crudRef.value?.crud.loadData(), 50);
};

const handleStatusFilter = () => {
  setTimeout(() => crudRef.value?.crud.loadData(), 50);
};

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
  ElMessage.success('告警配置保存成功');
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
  padding: 16px;
  box-sizing: border-box;

  .monitor-header {
    margin-bottom: 16px;
    flex-shrink: 0;
  }

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

  .strategy-charts {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    // BtcContainer 占据剩余空间
    :deep(.btc-container) {
      flex: 1;
      min-height: 0;
    }

    .chart-item {
      background: var(--el-bg-color-page);
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      min-height: 0;

      h4 {
        margin: 0 0 16px 0;
        color: var(--el-text-color-primary);
        font-size: 16px;
        font-weight: 500;
        flex-shrink: 0;
      }

      // 图表容器占据剩余空间
      :deep(.btc-line-chart),
      :deep(.btc-bar-chart),
      :deep(.btc-pie-chart) {
        flex: 1;
        min-height: 0;
      }
    }
  }

}
</style>
