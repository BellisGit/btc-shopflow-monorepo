import type { BaseChartProps, InteractionProps, GridConfig } from './base';

/**
 * K线图数据点 [开盘, 收盘, 最低, 最高]
 */
export type KLineDataPoint = [number, number, number, number];

/**
 * K线图数据项
 */
export interface KLineChartDataItem {
  /** 日期/时间 */
  date: string;
  /** K线数据 [开盘, 收盘, 最低, 最高] */
  value: KLineDataPoint;
  /** 成交量（可选） */
  volume?: number;
}

/**
 * K线图属性
 */
export interface KLineChartProps extends BaseChartProps, InteractionProps {
  /** K线图数据 */
  data: KLineChartDataItem[];
  /** 网格配置 */
  grid?: GridConfig;
  /** 是否显示成交量 */
  showVolume?: boolean;
  /** 上涨颜色 */
  upColor?: string;
  /** 下跌颜色 */
  downColor?: string;
}

