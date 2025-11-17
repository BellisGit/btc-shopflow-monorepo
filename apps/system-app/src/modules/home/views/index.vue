<template>
  <div class="system-home">
    <!-- 策略监控图表分析 -->
    <div class="strategy-charts">
      <BtcContainer :gap="10">
        <div class="chart-item">
          <h4>执行次数趋势</h4>
          <BtcLineChart
            v-if="chartsReady"
            :data="executionTrendData"
            :x-axis-data="executionTrendXAxis"
            height="100%"
          />
        </div>
        <div class="chart-item">
          <h4>响应时间分布</h4>
          <BtcBarChart
            v-if="chartsReady"
            :data="responseTimeData"
            :x-axis-data="responseTimeXAxis"
            height="100%"
          />
        </div>
        <div class="chart-item">
          <h4>策略类型分布</h4>
          <BtcPieChart
            v-if="chartsReady"
            :data="typeDistributionData"
            height="100%"
          />
        </div>
        <div class="chart-item">
          <h4>成功率统计</h4>
          <BtcBarChart
            v-if="chartsReady"
            :data="successRateData"
            :x-axis-data="successRateXAxis"
            y-axis-formatter="%"
            height="100%"
          />
        </div>
      </BtcContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import {
  BtcContainer,
  BtcLineChart,
  BtcBarChart,
  BtcPieChart
} from '@btc/shared-components';
import type {
  LineChartData,
  BarChartData,
  PieChartDataItem
} from '@btc/shared-components';

defineOptions({
  name: 'SystemHome',
});

// 延迟渲染图表，确保容器有尺寸
const chartsReady = ref(false);

onMounted(() => {
  nextTick(() => {
    // 使用 requestAnimationFrame 确保 DOM 完全渲染
    requestAnimationFrame(() => {
      chartsReady.value = true;
    });
  });
});

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
</script>

<style scoped lang="scss">
.system-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
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
</style>
