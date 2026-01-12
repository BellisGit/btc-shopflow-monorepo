/**
 * BtcFilterGroup 类型定义
 */

import type { Ref, ComputedRef } from 'vue';
import type { FilterCategory, FilterResult } from '../btc-filter-list/types';

export interface BtcFilterGroupProps {
  // 左侧 FilterList 配置
  /**
   * 筛选分类数据（直接传入）
   */
  filterCategory?: FilterCategory[];

  /**
   * 筛选分类服务（EPS 服务）
   */
  filterService?: {
    list: (params?: any) => Promise<FilterCategory[]>;
  };

  /**
   * 左侧标题（当前未使用）
   */
  leftTitle?: string;

  /**
   * 右侧标题
   */
  rightTitle?: string;

  /**
   * 是否启用搜索功能
   */
  enableFilterSearch?: boolean;

  /**
   * 默认展开的分类数量
   */
  defaultExpandedCount?: number;

  // 布局配置
  /**
   * 左侧宽度（优先级最高）
   */
  leftWidth?: string;

  /**
   * 左侧宽度类型
   */
  leftSize?: 'default' | 'small' | 'middle';

  /**
   * 是否默认展开
   */
  defaultExpand?: boolean;

  /**
   * 移动端自动收起
   */
  autoCollapseOnMobile?: boolean;

  /**
   * 存储 key，用于区分不同页面的尺寸设置（如果不提供，则不存储）
   */
  storageKey?: string;
}

export interface BtcFilterGroupEmits {
  /**
   * 筛选结果变化
   */
  'filter-change': [result: FilterResult[]];

  /**
   * 展开/收起状态变化
   */
  'expand-change': [isExpand: boolean];
}

export interface BtcFilterGroupExpose {
  /**
   * 筛选结果
   */
  filterResult: ComputedRef<FilterResult[]>;

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
   */
  expand: (value?: boolean) => void;

  /**
   * FilterList 组件引用
   */
  filterListRef: any;
}
