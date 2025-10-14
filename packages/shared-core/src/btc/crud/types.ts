/**
 * CRUD Composable 类型定义
 */

/**
 * CRUD 服务接口
 */
export interface CrudService<T = Record<string, unknown>> {
  page(params: Record<string, unknown>): Promise<{ list: T[]; total: number }>;
  add(data: Partial<T>): Promise<T>;
  update(data: Partial<T>): Promise<T>;
  delete(params: { ids: (number | string)[] }): Promise<void>;
  info?(params: any): Promise<T>; // 获取详情（可选）
}

/**
 * CRUD 配置选项
 */
export interface CrudOptions<T = Record<string, unknown>> {
  service: CrudService<T>;

  // 生命周期钩子
  onLoad?: () => void;
  onSuccess?: (message: string) => void;
  onError?: (error: unknown) => void;

  // 高级钩子（对应 cool-admin 的 onRefresh/onDelete）
  onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown> | void;
  onAfterRefresh?: (data: { list: T[]; total: number }) => void;
  onBeforeDelete?: (rows: T[]) => boolean | Promise<boolean>;
  onAfterDelete?: () => void;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  page: number;
  size: number;
  total: number;
}

/**
 * useCrud 返回类型
 */
export interface UseCrudReturn<T> {
  // 数据状态
  tableData: import('vue').Ref<T[]>;
  loading: import('vue').Ref<boolean>;
  pagination: PaginationConfig;
  searchParams: import('vue').Ref<Record<string, unknown>>;
  selection: import('vue').Ref<T[]>;
  upsertVisible: import('vue').Ref<boolean>;
  currentRow: import('vue').Ref<T | null>;
  upsertMode: import('vue').Ref<'add' | 'update' | 'info'>; // 新增：弹窗模式
  viewVisible: import('vue').Ref<boolean>;
  viewRow: import('vue').Ref<T | null>;
  service: CrudService; // 新增：暴露 service

  // 数据加载
  loadData: () => Promise<void>;
  handleSearch: (params: Record<string, unknown>) => void;
  handleReset: () => void;
  handleRefresh: () => void;

  // 新增/编辑/查看
  handleAdd: () => void;
  handleEdit: (row: T) => void;
  handleInfo: (row: T) => void; // 新增：info 模式
  handleAppend: (row?: T) => void;  // 对应 cool-admin 的 rowAppend
  handleView: (row: T) => void;
  handleViewClose: () => void;
  closeDialog: () => void;  // 对应 cool-admin 的 rowClose

  // 删除
  handleDelete: (row: T & { id: number | string }) => Promise<void>;
  handleMultiDelete: () => Promise<void>;

  // 选择管理
  handleSelectionChange: (rows: T[]) => void;
  clearSelection: () => void;
  toggleSelection: (row: T, selected?: boolean) => void;

  // 分页
  handlePageChange: (page: number) => void;
  handleSizeChange: (size: number) => void;

  // 参数管理（对应 cool-admin 的 getParams/setParams）
  getParams: () => Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
}

