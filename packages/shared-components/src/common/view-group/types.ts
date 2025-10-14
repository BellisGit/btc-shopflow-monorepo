/**
 * BtcViewGroup 类型定义
 */

export interface ViewGroupOptions {
  label?: string;
  title?: string;
  leftWidth?: string;
  data?: Record<string, any>;
  service?: any;
  enableContextMenu?: boolean;
  enableRefresh?: boolean;
  enableKeySearch?: boolean;
  enableDrag?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  custom?: boolean;
  tree?: TreeConfig;
  onSelect?: (item: any) => void;
  onEdit?: (item?: any) => any;
  onDelete?: (item: any, ctx: { next: Function; done: Function }) => void;
  onData?: (list: any[]) => any[];
  onContextMenu?: (item: any) => any;
  onDragEnd?: (list: any[]) => void;
}

export interface TreeConfig {
  visible?: boolean;
  lazy?: boolean;
  props?: TreeProps;
  onLoad?: Function;
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

