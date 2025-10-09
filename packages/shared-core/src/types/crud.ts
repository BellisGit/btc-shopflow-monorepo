/**
 * CRUD 表格列配置
 */
export interface CrudColumn {
  prop: string;
  label: string;
  width?: number;
  formatter?: (row: any) => string;
  dict?: string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

/**
 * CRUD 配置
 */
export interface CrudConfig {
  service: any;
  table: {
    columns: CrudColumn[];
    rowKey?: string;
    selection?: boolean;
  };
  search?: {
    items: any[];
  };
  upsert?: {
    items: any[];
  };
}

/**
 * CRUD 操作按钮配置
 */
export interface CrudOperation {
  label: string;
  type?: 'primary' | 'success' | 'warning' | 'danger';
  icon?: string;
  onClick: (row?: any) => void;
  permission?: string;
}
