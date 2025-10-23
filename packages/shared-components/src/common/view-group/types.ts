/**
 * BtcViewGroup 类型定义
 */

export interface ViewGroupOptions {
  label: string;           // 左侧标题
  title?: string;          // 右侧标题
  leftWidth?: string;      // 左侧宽度
  service: any;            // 数据服务

  // BtcMasterList 相关配置
  showUnassigned?: boolean;     // 是否显示"未分配"
  unassignedLabel?: string;     // "未分配"标签
  parentField?: string;          // 父级字段名，默认 'parentId'

  // 功能开关（传递给 BtcMasterList）
  enableDrag?: boolean;    // 启用拖拽排序
  enableRefresh?: boolean; // 启用刷新（由 BtcMasterList 处理）

  // 树形配置
  tree: {
    props: {
      id: string;
      label: string;
    };
  };

  // 兼容性配置（保留但不再使用）
  data?: Record<string, any>;
  enableContextMenu?: boolean;
  enableKeySearch?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  custom?: boolean;
  autoRefresh?: boolean;
  onSelect?: (item: any) => void;
  onEdit?: (item?: any) => any;
  onDelete?: (item: any, ctx: { next: () => void; done: () => void }) => void;
  onData?: (list: any[]) => any[];
  onContextMenu?: (item: any) => any;
  onDragEnd?: (list: any[]) => void;
  onLoad?: (...args: any[]) => any;
}

export interface TreeConfig {
  visible?: boolean;
  lazy?: boolean;
  props?: TreeProps;
  onLoad?: (...args: any[]) => any;
  allowDrag?: (node: any) => boolean;
  allowDrop?: (draggingNode: any, dropNode: any, type: string) => boolean;
}

export interface TreeProps {
  label?: string;
  children?: string;
  disabled?: string;
  isLeaf?: string;
  id?: string;
}

export interface ViewGroupItem {
  id?: number | string;
  name?: string;
  icon?: any;
  [key: string]: any;
}

export interface ViewGroupExpose {
  list: any;
  selected: any;
  isExpand: any;
  expand: (value?: boolean) => void;
  select: (item?: any) => void;
  edit: (item?: any) => void;
  remove: (item: any) => void;
  refresh: (params?: any) => Promise<void>;
  isMobile: any;
}
