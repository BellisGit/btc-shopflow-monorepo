/**
 * BtcDialog Props
 */
export interface DialogProps {
  // 鏄惁鍙
  modelValue: boolean;

  // 鏍囬
  title?: string;

  // 楂樺害
  height?: string | number;

  // 瀹藉害
  width?: string | number;

  // 内边距
  padding?: string;

  // 鏄惁缂撳瓨
  keepAlive?: boolean;

  // 鏄惁鍏ㄥ睆
  fullscreen?: boolean;

  // 鎺у埗鎸夐挳
  controls?: string[];

  // 闅愯棌澶撮儴鍏冪礌
  hideHeader?: boolean;

  // 关闭前
  beforeClose?: () => void | Promise<void>;

  // 鏄惁闇€瑕佹粴鍔ㄦ潯
  scrollbar?: boolean;

  // 鑳屾櫙閫忔槑
  transparent?: boolean;

  // 是否居中
  alignCenter?: boolean;
}

/**
 * BtcDialog Emits
 */
export interface DialogEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'fullscreen-change', value: boolean): void;
  (e: 'closed'): void;
}

