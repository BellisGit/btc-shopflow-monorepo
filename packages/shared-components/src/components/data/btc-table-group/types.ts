/**
 * BtcTableGroup 类型定义
 */

export interface TableGroupProps {
  // 左侧服务（Master List）
  leftService: any;
  leftTitle?: string;

  // 右侧服务（CRUD）
  rightService: any;
  rightTitle?: string;

  // 表格配置
  tableColumns?: any[];
  formItems: any[];

  // 操作列配置
  op?: { buttons?: any[] };

  // 字段配置
  idField?: string;
  labelField?: string;
  parentField?: string;

  // 时间列配置
  showCreateTime?: boolean; // 是否显示创建时间列，默认 true
  showUpdateTime?: boolean; // 是否显示更新时间列，默认 false

  // 功能配置
  enableDrag?: boolean;
  enableKeySearch?: boolean;
  showUnassigned?: boolean;
  unassignedLabel?: string;

  // 样式配置
  leftWidth?: string;
  upsertWidth?: string | number;
  searchPlaceholder?: string;
}

export interface TableGroupEmits {
  (event: 'select', item: any, keyword?: any): void;
  (event: 'update:selected', item: any): void;
  (event: 'refresh', params?: any): void;
  (event: 'form-submit', data: any, formEvent: { close: () => void; done: () => void; next: (data: any) => Promise<any>; defaultPrevented: boolean }): void;
  (event: 'load', data: any[]): void;
}

export interface TableGroupExpose {
  viewGroupRef: any;
  crudRef: any;
  refresh: (params?: any) => Promise<void>;
}
