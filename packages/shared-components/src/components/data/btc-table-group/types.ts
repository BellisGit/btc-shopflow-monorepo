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
  formItems?: any[];

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
  showAddBtn?: boolean; // 是否显示新增按钮，默认 true
  showMultiDeleteBtn?: boolean; // 是否显示批量删除按钮，默认 true

  // 样式配置
  leftWidth?: string;
  leftSize?: 'default' | 'small'; // 左侧宽度类型：default（300px）或 small（150px）
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
