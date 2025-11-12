import { computed } from 'vue';
import type { TableProps } from '../types';
import { autoFormatTableColumns } from '../utils/formatters';
import { CommonColumns } from '../utils/common-columns';
import { useI18n } from '@btc/shared-core';

/**
 * 表格列配置处理
 */
export function useTableColumns(props: TableProps) {
  const { t } = useI18n();

  /**
   * 格式化字典值
   */
  function formatDictValue(value: any, dict: any[], allLevels: boolean = false): string {
    if (!dict || dict.length === 0) return value;
    if (value === null || value === undefined || value === '') return '';

    // 如果是树形字典且需要显示所有层级
    if (allLevels) {
      const path: string[] = [];

      const findPath = (list: any[], val: any): boolean => {
        for (const item of list) {
          path.push(item.label);

          if (item.value === val) {
            return true;
          }

          if (item.children && findPath(item.children, val)) {
            return true;
          }

          path.pop();
        }
        return false;
      };

      if (findPath(dict, value)) {
        return path.join(' / ');
      }
    }

    // 普通字典匹配
    function find(list: any[]): any {
      for (const item of list) {
        if (item.value === value) {
          return item;
        }
        if (item.children) {
          const found = find(item.children);
          if (found) return found;
        }
      }
      return null;
    }

    const item = find(dict);
    return item ? item.label : value;
  }

  /**
   * 计算列配置 - 智能列宽分配 + 字典匹配 + 自动时间格式化 + 自动添加通用列
   */
  const computedColumns = computed(() => {
    const columns = props.columns || [];

    // 检查是否已有创建时间列和操作列
    const hasCreatedAt = columns.some(col => col.prop === 'createdAt' || col.prop === 'createTime');
    const hasOpColumn = columns.some(col => col.type === 'op');

    // 自动添加通用列
    const enhancedColumns = [...columns];

    // 自动添加创建时间列（如果不存在）
    if (!hasCreatedAt && !props.disableAutoCreatedAt) {
      enhancedColumns.push(CommonColumns.createdAt());
    }

    // 自动添加操作列（如果不存在且 props.op 不为 undefined）
    if (!hasOpColumn && props.op !== undefined) {
      // 从 props.op 获取按钮配置
      const opButtons = props.op?.buttons ?? ['edit', 'delete'];
      enhancedColumns.push(CommonColumns.operation(opButtons));
    }

    // 先进行自动时间格式化
    const formattedColumns = autoFormatTableColumns(enhancedColumns);
    return formattedColumns.map((column) => {
      const isFixedWidthColumn =
        column.type === 'selection' || column.type === 'index' || column.type === 'op';

      const config: any = {
        ...column,
        align: column.align || 'center',
        headerAlign: column.headerAlign || 'center',
        resizable: column.resizable ?? (column.type === 'selection' || column.type === 'index' ? false : true), // 智能列宽调整
        // 操作列不显示溢出提示，其他列默认显示
        showOverflowTooltip: column.showOverflowTooltip ?? (column.type === 'op' ? false : true),
        toggleable:
          typeof column.toggleable === 'boolean'
            ? column.toggleable
            : !(column.type === 'selection' || column.type === 'index'),
        alwaysVisible: column.alwaysVisible ?? column.toggleable === false,
      };

      // 处理操作列的国际化标签
      if (column.type === 'op') {
        if (column.label && typeof column.label === 'string') {
          // 如果手动指定了label且是国际化key，进行翻译
          if (column.label.includes('.')) {
            config.label = t(column.label);
          }
        } else if (!column.label) {
          // 如果没有指定label，使用默认的国际化标签
          config.label = t('ui.table.operation');
        }
      }

      // selection 和 index 列默认固定在左侧（对齐 cool-admin）
      if ((column.type === 'selection' || column.type === 'index') && column.fixed === undefined) {
        config.fixed = 'left';
      }

      // 操作列默认固定在右侧（对齐 cool-admin）
      if (column.type === 'op' && column.fixed === undefined) {
        config.fixed = 'right';
      }

      // 智能列宽：非固定列自动转换为 minWidth 以实现灵活布局
      if (!isFixedWidthColumn && !column.minWidth) {
        // 对于内容列，优先使用 minWidth 而不是 width
        if (column.width) {
          config.minWidth = column.width;
          delete config.width;
        } else {
          // 没有指定宽度时，根据标签长度估算合理的 minWidth
          const labelLength = column.label?.length || 0;
          config.minWidth = Math.max(100, labelLength * 20);
        }
      }

      // 字典匹配（对齐 cool-admin）
      if (column.dict && column.prop) {
        // 保存原始 formatter
        const originalFormatter = column.formatter;

        // 如果启用了 dictColor，使用组件渲染
        if (column.dictColor) {
          config._dictFormatter = (row: any) => {
            const value = row[column.prop!];
            const dict = column.dict!;

            // 处理 null/undefined/空值
            if (value === null || value === undefined || value === '') {
              return { label: '', type: 'info' };
            }

            function find(list: any[]): any {
              for (const item of list) {
                if (item.value === value) return item;
                if (item.children) {
                  const found = find(item.children);
                  if (found) return found;
                }
              }
              return null;
            }

            const item = find(dict);
            return item || { label: value, type: 'info' };
          };
        } else {
          // 普通字典匹配，覆盖 formatter
          if (!originalFormatter) {
            config.formatter = (row: any) => {
              const value = row[column.prop!];
              if (value === null || value === undefined || value === '') {
                return '';
              }
              return formatDictValue(value, column.dict!, column.dictAllLevels || false);
            };
          }
        }
      }

      return config;
    });
  });

  return {
    computedColumns,
    formatDictValue,
  };
}
