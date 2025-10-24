import type { Component } from 'vue';

/**
 * 菜单项接口
 */
export interface ContextMenuItem {
  /** 菜单项标签 */
  label: string;
  /** 前置图标 */
  prefixIcon?: Component | string;
  /** 后置图标 */
  suffixIcon?: Component | string;
  /** 点击回调函数 */
  callback?: (done: () => void) => void;
  /** 子菜单项 */
  children?: ContextMenuItem[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示分割线 */
  divider?: boolean;
  /** 文本溢出处理 */
  ellipsis?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * 右键菜单配置选项
 */
export interface ContextMenuOptions {
  /** 菜单项列表 */
  list: ContextMenuItem[];
  /** 鼠标事件对象 */
  event: MouseEvent;
  /** 自定义类名 */
  customClass?: string;
  /** 菜单宽度 */
  width?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 是否显示箭头 */
  showArrow?: boolean;
  /** 偏移量 */
  offset?: {
    x?: number;
    y?: number;
  };
}

/**
 * 菜单位置信息
 */
export interface MenuPosition {
  /** 水平位置 */
  x: number;
  /** 垂直位置 */
  y: number;
  /** 是否在右侧显示 */
  right?: boolean;
  /** 是否在底部显示 */
  bottom?: boolean;
}

/**
 * 子菜单位置信息
 */
export interface SubMenuPosition {
  /** 水平位置 */
  x: number;
  /** 垂直位置 */
  y: number;
  /** 是否在右侧显示 */
  right?: boolean;
  /** 是否在底部显示 */
  bottom?: boolean;
}

/**
 * 菜单状态
 */
export interface MenuState {
  /** 是否可见 */
  visible: boolean;
  /** 菜单位置 */
  position: MenuPosition;
  /** 菜单项列表 */
  menuList: ContextMenuItem[];
  /** 当前激活的子菜单索引 */
  activeSubMenuIndex: number | null;
  /** 子菜单位置 */
  subMenuPositions: SubMenuPosition[];
}

/**
 * 菜单实例
 */
export interface MenuInstance {
  /** 打开菜单 */
  open: (event: MouseEvent, options: ContextMenuOptions) => void;
  /** 关闭菜单 */
  close: () => void;
  /** 销毁菜单 */
  destroy: () => void;
}
