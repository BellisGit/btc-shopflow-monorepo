import type { TableColumn } from '../types';
import { formatDateTimeFriendly, isDateTimeField } from '@btc/shared-utils';

/**
 * 自动格式化表格列（针对时间字段）
 * @param columns 表格列配置
 * @returns 处理后的表格列配置
 */
export function autoFormatTableColumns(columns: TableColumn[]): TableColumn[] {
  return columns.map(column => {
    // 如果是时间字段，自动添加格式化器
    if (column.prop && isDateTimeField(column.prop) && !column.formatter) {
      return {
        ...column,
        formatter: (_row: any, _column: any, cellValue: any) => {
          return formatDateTimeFriendly(cellValue);
        }
      };
    }
    return column;
  });
}

/**
 * 创建时间字段格式化器
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化器函数
 */
export function createDateTimeFormatter(_format = 'YYYY-MM-DD HH:mm:ss') {
  return (_row: any, _column: any, cellValue: any) => {
    return formatDateTimeFriendly(cellValue);
  };
}

/**
 * 为特定字段创建时间格式化器
 * @param fieldName 字段名
 * @returns 表格列配置
 */
export function createDateTimeColumn(fieldName: string, label = '时间', width = 180): TableColumn {
  return {
    prop: fieldName,
    label,
    width,
    formatter: createDateTimeFormatter()
  };
}

/**
 * 为创建时间字段创建列配置
 * @param fieldName 字段名，默认为 'createdAt'
 * @returns 表格列配置
 */
export function createCreatedAtColumn(fieldName = 'createdAt'): TableColumn {
  return createDateTimeColumn(fieldName, '创建时间');
}

/**
 * 为更新时间字段创建列配置
 * @param fieldName 字段名，默认为 'updatedAt'
 * @returns 表格列配置
 */
export function createUpdatedAtColumn(fieldName = 'updatedAt'): TableColumn {
  return createDateTimeColumn(fieldName, '更新时间');
}
