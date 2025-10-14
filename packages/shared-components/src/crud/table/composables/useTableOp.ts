import { ref } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import type { TableColumn, OpButton, TableProps } from '../types';

/**
 * 操作列处理 + 列控制
 */
export function useTableOp(crud: UseCrudReturn<any>, tableProps: TableProps) {
  const { t } = useI18n();

  /**
   * 获取操作按钮列表
   */
  const getOpButtons = (column: TableColumn, _scope: any): OpButton[] => {
    const buttons = column.buttons;
    if (!buttons) return ['edit', 'delete'];
    if (typeof buttons === 'function') {
      return buttons({ scope: _scope });
    }
    return buttons;
  };

  /**
   * 获取按钮类型
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
   * 获取按钮文本
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
   * 处理操作按钮点击
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
   * 查找列（支持多级表头）
   */
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
   * 显示列
   */
  function showColumn(prop: string | string[], status?: boolean) {
    findColumns(prop, (col) => {
      col.hidden = typeof status === 'boolean' ? !status : false;
    });
  }

  /**
   * 隐藏列
   */
  function hideColumn(prop: string | string[]) {
    showColumn(prop, false);
  }

  /**
   * 设置列配置（动态替换整个列配置）
   */
  function setColumns(columns: TableColumn[]) {
    if (tableProps && tableProps.columns) {
      tableProps.columns.splice(0, tableProps.columns.length, ...columns);
    }
  }

  /**
   * 重新构建表格（刷新渲染）
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
    getOpButtons,
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

