/**
 * btc-filterlist 组件类型定义
 */

export interface FilterOption {
  label: string;
  value: any;
}

export interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
}

export interface FilterResult {
  name: string; // 分类的 id
  value: any[]; // 选中的选项值数组
}

export interface BtcFilterListProps {
  // 数据来源：EPS 服务或直接数据
  service?: {
    list: (params?: any) => Promise<FilterCategory[]>;
  };
  category?: FilterCategory[];
  
  // 其他配置
  title?: string;
  enableSearch?: boolean;
  defaultExpandedCount?: number; // 默认展开的分类数量
  multiple?: boolean; // 是否支持多选（默认 true）
}

export interface BtcFilterListEmits {
  change: [result: FilterResult[]];
  'update:modelValue': [result: FilterResult[]];
}
