/**
 * BtcSplitLayout 组件类型定义
 */

import type { ComputedRef } from 'vue';

export interface BtcSplitLayoutProps {
  /**
   * 左侧宽度（优先级最高）
   * 如果指定了 leftWidth，将忽略 leftSize
   */
  leftWidth?: string;

  /**
   * 左侧宽度类型
   * - default: 300px
   * - small: 150px
   * - middle: 225px
   */
  leftSize?: 'default' | 'small' | 'middle';

  /**
   * 是否默认展开
   * @default true
   */
  defaultExpand?: boolean;

  /**
   * 移动端自动收起
   * @default true
   */
  autoCollapseOnMobile?: boolean;
}

export interface BtcSplitLayoutEmits {
  /**
   * 展开/收起状态变化
   */
  'expand-change': [isExpand: boolean];
}

export interface BtcSplitLayoutExpose {
  /**
   * 是否展开
   */
  isExpand: ComputedRef<boolean>;

  /**
   * 是否移动端
   */
  isMobile: ComputedRef<boolean>;

  /**
   * 展开/收起
   * @param value - true: 展开, false: 收起, undefined: 切换
   */
  expand: (value?: boolean) => void;
}
