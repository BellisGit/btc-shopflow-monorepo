/**
 * BtcDialog Props
 */
export interface DialogProps {
  // 是否可见
  modelValue: boolean;

  // 标题
  title?: string;

  // 高度
  height?: string | number;

  // 宽度
  width?: string | number;

  // 內间距
  padding?: string;

  // 是否缓存
  keepAlive?: boolean;

  // 是否全屏
  fullscreen?: boolean;

  // 控制按钮
  controls?: string[];

  // 隐藏头部元素
  hideHeader?: boolean;

  // 关闭前
  beforeClose?: Function;

  // 是否需要滚动条
  scrollbar?: boolean;

  // 背景透明
  transparent?: boolean;
}

/**
 * BtcDialog Emits
 */
export interface DialogEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'fullscreen-change', value: boolean): void;
  (e: 'closed'): void;
}

