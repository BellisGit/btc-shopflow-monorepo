/**
 * BtcViewsTabsGroup 组件类型定义
 */
import type { TableColumn, FormItem } from '../../index';

/**
 * 查询参数配置
 */
export interface QueryParams {
  /** 搜索关键词 */
  keyword?: string;
  /** 排序字段 */
  order?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 排序方向 */
  sort?: 'asc' | 'desc';
}

/**
 * Tab 视图配置
 */
export interface TabViewConfig {
  /** tab 唯一标识 */
  name: string;
  /** tab 显示文字 */
  label: string;
  /** 左侧树服务名 (如 'sysdepartment') */
  masterService: string;
  /** 左侧标题 (如 '部门列表') */
  listLabel: string;
  /** 查询参数 */
  queryParams?: QueryParams;
}

/**
 * BtcViewsTabsGroup 组件配置
 */
export interface BtcViewsTabsGroupConfig {
  /** tab 配置列表 */
  tabs: TabViewConfig[];
  /** CRUD 表格服务名 (如 'sysuser') */
  crudService: string;
  /** 表格列定义 */
  columns: TableColumn[];
  /** 表单项定义 */
  formItems: FormItem[] | ((leftMenuData?: any) => FormItem[]);
  /** 左侧宽度，默认 '300px' */
  leftWidth?: string;
  /** 是否显示"未分配"，默认 true */
  showUnassigned?: boolean;
  /** "未分配"标签，默认 '未分配' */
  unassignedLabel?: string;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 表单宽度，默认 '800px' */
  upsertWidth?: string;
  /** 表单提交回调 */
  onFormSubmit?: (data: any, { close, done, next }: { close: () => void; done: () => void; next: (data: any) => Promise<any> }) => Promise<void>;
  /** 服务实例映射 */
  services?: Record<string, any>;
}
