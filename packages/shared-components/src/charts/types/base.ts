/**
 * 基础图表类型定义
 */

/**
 * 基础图表属性
 */
export interface BaseChartProps {
  /** 图表标题 */
  title?: string;
  /** 数据（通用类型，具体图表会定义具体结构） */
  data?: any;
  /** 高度 */
  height?: string;
  /** 宽度 */
  width?: string;
  /** 是否自动调整大小 */
  autoresize?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 是否显示空状态 */
  showEmpty?: boolean;
}

/**
 * 坐标轴显示属性
 */
export interface AxisDisplayProps {
  /** 是否显示坐标轴 */
  show?: boolean;
  /** 坐标轴标签颜色 */
  labelColor?: string;
  /** 坐标轴线颜色 */
  lineColor?: string;
  /** 坐标轴分割线颜色 */
  splitLineColor?: string;
  /** 坐标轴标签格式化函数 */
  formatter?: string | ((value: any) => string);
}

/**
 * 交互属性
 */
export interface InteractionProps {
  /** 是否显示提示框 */
  showTooltip?: boolean;
  /** 是否显示图例 */
  showLegend?: boolean;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示标签 */
  showLabel?: boolean;
}

/**
 * 网格配置
 */
export interface GridConfig {
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
}

/**
 * 图表主题配置
 */
export interface ChartThemeConfig {
  /** 字体大小 */
  fontSize?: number;
  /** 字体颜色 */
  fontColor?: string;
  /** 主题颜色 */
  themeColor?: string;
  /** 颜色组 */
  colors?: string[];
}

