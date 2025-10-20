import type { UseCrudReturn } from '@btc/shared-core';
import type { TableProps } from '../types';
/**
 * 右键菜单处理（对齐 cool-admin table/helper/row.ts）
 */
export declare function useTableContextMenu(
  crud: UseCrudReturn<any>,
  props: TableProps,
  tableRef: any
): {
  contextMenuVisible: globalThis.Ref<boolean, boolean>;
  contextMenuStyle: globalThis.Ref<Record<string, any>, Record<string, any>>;
  contextMenuItems: globalThis.Ref<any[], any[]>;
  onRowContextMenu: (row: any, column: any, event: MouseEvent) => void;
  handleMenuClick: (item: any) => void;
};
