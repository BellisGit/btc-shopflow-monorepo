// 导出所有图表组件
export { BtcLineChart } from './line';
export { BtcBarChart } from './bar';
export { BtcHBarChart } from './bar';
export { BtcDualBarCompareChart } from './bar';
export { BtcPieChart } from './pie';
export { BtcRingChart } from './pie';
export { BtcRadarChart } from './radar';
export { BtcScatterChart } from './scatter';
export { BtcKLineChart } from './kline';

// 导出所有类型
export type {
  // 基础类型
  BaseChartProps,
  AxisDisplayProps,
  InteractionProps,
  GridConfig,
  ChartThemeConfig,
  // 折线图类型
  LineChartProps,
  LineChartDataItem,
  // 柱状图类型
  BarChartProps,
  BarChartDataItem,
  HBarChartProps,
  DualBarCompareChartProps,
  // 饼图类型
  PieChartProps,
  PieChartDataItem,
  RingChartProps,
  // 雷达图类型
  RadarChartProps,
  RadarChartDataItem,
  RadarIndicator,
  // 散点图类型
  ScatterChartProps,
  ScatterChartDataItem,
  ScatterDataPoint,
  // K线图类型
  KLineChartProps,
  KLineChartDataItem,
  KLineDataPoint
} from './types';

// 向后兼容：导出旧类型名称作为新类型的别名
export type {
  LineChartDataItem as LineChartData,
  BarChartDataItem as BarChartData
} from './types';

// 导出 composables
export { useChart, useChartComponent } from './composables';

// 导出工具函数
export * from './utils';
