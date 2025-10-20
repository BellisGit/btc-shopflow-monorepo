/**
 * 通用表格列配置工具
 * 统一处理常见的表格列，如创建时间、更新时间等
 */

import type { TableColumn, OpButton } from '../types';
import { formatDateTimeFriendly } from '@btc/shared-utils';

/**
 * 创建时间列配置
 * 使用后端标准的 createdAt 字段
 */
export function createCreatedAtColumn(): TableColumn {
  return {
    prop: 'createdAt',
    label: '创建时间',
    width: 180,
    formatter: (_row: any, _column: any, cellValue: any) => {
      return formatDateTimeFriendly(cellValue);
    },
  };
}

/**
 * 更新时间列配置
 * 使用后端标准的 updatedAt 字段
 */
export function createUpdatedAtColumn(): TableColumn {
  return {
    prop: 'updatedAt',
    label: '更新时间',
    width: 180,
    formatter: (_row: any, _column: any, cellValue: any) => {
      return formatDateTimeFriendly(cellValue);
    },
  };
}

/**
 * 操作列配置
 * 标准的编辑、删除操作按钮
 */
export function createOperationColumn(buttons: OpButton[] = ['edit', 'delete']): TableColumn {
  return {
    type: 'op',
    label: '操作',
    width: 200,
    buttons,
  };
}

/**
 * 选择列配置
 */
export function createSelectionColumn(): TableColumn {
  return {
    type: 'selection',
    width: 60,
  };
}

/**
 * 序号列配置
 */
export function createIndexColumn(): TableColumn {
  return {
    type: 'index',
    label: '序号',
    width: 60,
  };
}

/**
 * 常用的表格列组合
 */
export const CommonColumns = {
  selection: createSelectionColumn,
  index: createIndexColumn,
  createdAt: createCreatedAtColumn,
  updatedAt: createUpdatedAtColumn,
  operation: createOperationColumn,
} as const;
