import { ref } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import type { TableColumn, OpButton, TableProps } from '../types';

/**
 * 鎿嶄綔鍒楀鐞?+ 鍒楁帶鍒? */
export function useTableOp(crud: UseCrudReturn<any>, tableProps: TableProps) {
  const { t } = useI18n();

  /**
   * 鑾峰彇鎿嶄綔鎸夐挳鍒楄〃
   */
  const _getOpButtons = (column: TableColumn, _scope: any): OpButton[] => {
    const buttons = column.buttons;
    // 如果是 undefined，返回默认按钮（编辑、删除）
    if (buttons === undefined) return ['edit', 'delete'];
    // 如果是空数组，返回空数组（不显示任何按钮）
    if (Array.isArray(buttons) && buttons.length === 0) return [];
    // 如果是函数，执行函数获取按钮
    if (typeof buttons === 'function') {
      return buttons({ scope: _scope });
    }
    // 直接返回按钮配置
    return buttons;
  };

  /**
   * 鑾峰彇鎸夐挳绫诲瀷
   */
  const getButtonType = (btn: string): string => {
    const typeMap: Record<string, string> = {
      edit: 'primary',
      delete: 'danger',
      info: 'success',
    };
    return typeMap[btn] || 'default';
  };

  /**
   * 鑾峰彇鎸夐挳鏂囨湰
   */
  const getButtonText = (btn: string): string => {
    const textMap: Record<string, string> = {
      edit: t('crud.button.edit'),
      delete: t('crud.button.delete'),
      info: t('crud.button.info'),
    };
    return textMap[btn] || btn;
  };

  /**
   * 澶勭悊鎿嶄綔鎸夐挳鐐瑰嚮
   */
  const handleOpClick = (btn: string, row: any) => {
    switch (btn) {
      case 'edit':
        crud.handleEdit(row);
        break;
      case 'delete':
        crud.handleDelete(row);
        break;
      case 'info':
        crud.handleView(row);
        break;
    }
  };

  /**
   * 鏌ユ壘鍒楋紙鏀寔澶氱骇琛ㄥご锛?   */
  function findColumns(prop: string | string[], callback: (col: TableColumn) => void) {
    const propList = Array.isArray(prop) ? prop : [prop];

    function deep(list: TableColumn[]) {
      list.forEach(col => {
        if (col.prop && propList.includes(col.prop)) {
          callback(col);
        }
        if (col.children) {
          deep(col.children);
        }
      });
    }

    if (tableProps && tableProps.columns) {
      deep(tableProps.columns);
    }
  }

  /**
   * 鏄剧ず鍒?   */
  function showColumn(prop: string | string[], status?: boolean) {
    findColumns(prop, (col) => {
      col.hidden = typeof status === 'boolean' ? !status : false;
    });
  }

  /**
   * 闅愯棌鍒?   */
  function hideColumn(prop: string | string[]) {
    showColumn(prop, false);
  }

  /**
   * 璁剧疆鍒楅厤缃紙鍔ㄦ€佹浛鎹㈡暣涓垪閰嶇疆锛?   */
  function setColumns(columns: TableColumn[]) {
    if (tableProps && tableProps.columns) {
      tableProps.columns.splice(0, tableProps.columns.length, ...columns);
    }
  }

  /**
   * 閲嶆柊鏋勫缓琛ㄦ牸锛堝埛鏂版覆鏌擄級
   */
  const rebuildKey = ref(0);
  function reBuild(callback?: () => void) {
    rebuildKey.value++;
    if (callback) {
      callback();
    }
  }

  return {
    // 操作列
    getOpButtons: _getOpButtons,
    getButtonType,
    getButtonText,
    handleOpClick,

    // 列控制
    showColumn,
    hideColumn,
    setColumns,
    reBuild,
    rebuildKey,
  };
}


