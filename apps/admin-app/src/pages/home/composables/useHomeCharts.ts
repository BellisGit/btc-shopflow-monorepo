import { ref } from 'vue';
import type {
  LineChartData,
  BarChartData,
  PieChartDataItem
} from '@btc/shared-components';

/**
 * 首页图表数据管理 composable
 */
export function useHomeCharts() {
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

  // K线图数据
  const klineChartData = ref([
    { date: '2024-01-01', value: [100, 120, 90, 110], volume: 1000 },
    { date: '2024-01-02', value: [110, 130, 100, 120], volume: 1200 },
    { date: '2024-01-03', value: [120, 140, 110, 130], volume: 1500 },
    { date: '2024-01-04', value: [130, 150, 120, 140], volume: 1800 },
    { date: '2024-01-05', value: [140, 160, 130, 150], volume: 2000 }
  ]);

  return {
    executionTrendData,
    executionTrendXAxis,
    responseTimeData,
    responseTimeXAxis,
    typeDistributionData,
    hBarChartData,
    hBarChartYAxis,
    dualBarData1,
    dualBarData2,
    dualBarXAxis,
    ringChartData,
    radarIndicators,
    radarChartData,
    scatterChartData,
    klineChartData
  };
}

