<template>
  <div class="btc-chart-demo">
    <BtcContainer :gap="gap" :cols-per-row="colsPerRow">
      <div v-for="chart in visibleCharts" :key="chart.key" class="chart-item">
        <h4 v-if="chart.title">{{ chart.title }}</h4>
        <component
          :is="chart.component"
          v-bind="chart.props"
          :height="chartHeight"
        />
      </div>
    </BtcContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BtcContainer from '../../layout/btc-container/index.vue';
import {
  BtcLineChart,
  BtcBarChart,
  BtcPieChart,
  BtcHBarChart,
  BtcDualBarCompareChart,
  BtcRingChart,
  BtcRadarChart,
  BtcScatterChart
} from '../../../charts';
import type {
  LineChartData,
  BarChartData,
  PieChartDataItem
} from '../../../charts';

defineOptions({
  name: 'BtcChartDemo'
});

interface ChartItem {
  key: string;
  title?: string;
  component: any;
  props: Record<string, any>;
}

interface Props {
  /** 图表间距 */
  gap?: number;
  /** 每行显示的列数 */
  colsPerRow?: number;
  /** 图表高度 */
  chartHeight?: string;
  /** 要显示的图表类型，不传则显示全部 */
  chartTypes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  gap: 8,
  colsPerRow: 4,
  chartHeight: '300px'
});

// 折线图数据
const executionTrendData = ref<LineChartData[]>([
  {
    name: '执行次数',
    data: [120, 132, 101, 134, 90, 230, 210],
    color: '#409eff',
    smooth: true,
    areaStyle: true
  }
]);
const executionTrendXAxis = ref<string[]>(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);

// 柱状图数据
const responseTimeData = ref<BarChartData[]>([
  {
    name: '响应时间分布',
    data: [320, 280, 150, 80, 20],
    color: '#67c23a'
  }
]);
const responseTimeXAxis = ref<string[]>(['0-50ms', '50-100ms', '100-200ms', '200-500ms', '500ms+']);

// 饼图数据
const typeDistributionData = ref<PieChartDataItem[]>([
  { name: '权限策略', value: 35, color: '#f56c6c' },
  { name: '业务策略', value: 25, color: '#67c23a' },
  { name: '数据策略', value: 20, color: '#e6a23c' },
  { name: '工作流策略', value: 20, color: '#409eff' }
]);

// 横向柱状图数据
const hBarChartData = ref<BarChartData[]>([
  {
    name: '数据量',
    data: [120, 200, 150, 80, 70, 110, 130],
    color: '#409eff'
  }
]);
const hBarChartYAxis = ref<string[]>(['类别A', '类别B', '类别C', '类别D', '类别E', '类别F', '类别G']);

// 双柱对比图数据
const dualBarData1 = ref<BarChartData[]>([
  {
    name: '本月',
    data: [120, 200, 150, 80, 70],
    color: '#409eff'
  }
]);
const dualBarData2 = ref<BarChartData[]>([
  {
    name: '上月',
    data: [100, 180, 130, 90, 60],
    color: '#67c23a'
  }
]);
const dualBarXAxis = ref<string[]>(['项目1', '项目2', '项目3', '项目4', '项目5']);

// 环形图数据
const ringChartData = ref<PieChartDataItem[]>([
  { name: '类型A', value: 35, color: '#409eff' },
  { name: '类型B', value: 25, color: '#67c23a' },
  { name: '类型C', value: 20, color: '#e6a23c' },
  { name: '类型D', value: 20, color: '#f56c6c' }
]);

// 雷达图数据
const radarIndicators = ref([
  { name: '指标A', max: 100 },
  { name: '指标B', max: 100 },
  { name: '指标C', max: 100 },
  { name: '指标D', max: 100 },
  { name: '指标E', max: 100 }
]);
const radarChartData = ref([
  {
    name: '数据系列1',
    data: [80, 90, 70, 85, 75],
    color: '#409eff',
    areaStyle: true
  }
]);

// 散点图数据
const scatterChartData = ref([
  {
    name: '数据点',
    data: [
      { value: [10, 20], name: '点1' },
      { value: [15, 30], name: '点2' },
      { value: [20, 25], name: '点3' },
      { value: [25, 40], name: '点4' },
      { value: [30, 35], name: '点5' },
      { value: [35, 50], name: '点6' },
      { value: [40, 45], name: '点7' },
      { value: [45, 60], name: '点8' }
    ],
    color: '#409eff'
  }
]);

// 所有图表配置
const allCharts = computed<ChartItem[]>(() => [
  {
    key: 'line',
    title: '折线图',
    component: BtcLineChart,
    props: {
      data: executionTrendData.value,
      'x-axis-data': executionTrendXAxis.value,
      showTooltip: false
    }
  },
  {
    key: 'bar',
    title: '柱状图',
    component: BtcBarChart,
    props: {
      data: responseTimeData.value,
      'x-axis-data': responseTimeXAxis.value,
      showTooltip: false
    }
  },
  {
    key: 'pie',
    title: '饼图',
    component: BtcPieChart,
    props: {
      data: typeDistributionData.value,
      showTooltip: false
    }
  },
  {
    key: 'hbar',
    title: '横向柱状图',
    component: BtcHBarChart,
    props: {
      data: hBarChartData.value,
      'y-axis-data': hBarChartYAxis.value,
      showTooltip: false
    }
  },
  {
    key: 'dual-bar',
    title: '双柱对比图',
    component: BtcDualBarCompareChart,
    props: {
      data1: dualBarData1.value,
      data2: dualBarData2.value,
      'x-axis-data': dualBarXAxis.value,
      label1: '本月',
      label2: '上月',
      showTooltip: false
    }
  },
  {
    key: 'ring',
    title: '环形图',
    component: BtcRingChart,
    props: {
      data: ringChartData.value,
      showTooltip: false
    }
  },
  {
    key: 'radar',
    title: '雷达图',
    component: BtcRadarChart,
    props: {
      indicators: radarIndicators.value,
      data: radarChartData.value,
      showTooltip: false
    }
  },
  {
    key: 'scatter',
    title: '散点图',
    component: BtcScatterChart,
    props: {
      data: scatterChartData.value,
      'x-axis-name': 'X轴',
      'y-axis-name': 'Y轴',
      showTooltip: false
    }
  }
]);

// 根据 chartTypes 过滤要显示的图表
const visibleCharts = computed(() => {
  if (!props.chartTypes || props.chartTypes.length === 0) {
    return allCharts.value;
  }
  return allCharts.value.filter(chart => props.chartTypes!.includes(chart.key));
});
</script>

<style scoped lang="scss">
.btc-chart-demo {
  width: 100%;
  height: 100%;
  // 确保容器使用 flex 布局，能够自适应填充父容器
  // 如果父容器是 flex 布局，使用 flex: 1 自适应；否则使用 height: 100%
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;

  :deep(.btc-container) {
    flex: 1;
    min-height: 0;
    height: 100%;
    align-content: start;
    grid-auto-flow: row;
  }

  .chart-item {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    min-height: 0;
    height: 100%; // 让图表项填充网格行的高度

    h4 {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 13px;
      font-weight: 500;
      flex-shrink: 0;
      height: 20px;
      line-height: 20px;
    }

    :deep(.btc-line-chart),
    :deep(.btc-bar-chart),
    :deep(.btc-pie-chart),
    :deep(.btc-h-bar-chart),
    :deep(.btc-dual-bar-compare-chart),
    :deep(.btc-ring-chart),
    :deep(.btc-radar-chart),
    :deep(.btc-scatter-chart) {
      width: 100%;
      flex: 1;
      min-height: 0;
    }
  }
}
</style>

