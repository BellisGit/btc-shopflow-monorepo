import { computed } from 'vue';
import type { TableProps } from '../types';
import { autoFormatTableColumns } from '../utils/formatters';
import { CommonColumns } from '../utils/common-columns';
import { useI18n } from '@btc/shared-core';
import { useCrudLayout, DEFAULT_CRUD_GAP } from '../../context/layout';

/**
 * 表格列配置处理
 */
export function useTableColumns(props: TableProps) {
  const { t, locale } = useI18n();
  const crudLayout = useCrudLayout();
  const gap = crudLayout?.gap?.value ?? DEFAULT_CRUD_GAP;

  /**
   * 将 prop 转换为首字母大写的显示文本
   * 例如：deptCode -> Dept Code, parentId -> Parent Id, name -> Name
   */
  function formatPropToLabel(prop: string): string {
    // 将驼峰命名转换为空格分隔的单词
    const words = prop
      .replace(/([A-Z])/g, ' $1') // 在大写字母前添加空格
      .trim()
      .split(/\s+/); // 按空格分割成单词数组
    
    // 将每个单词首字母大写
    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * 判断当前是否为中文环境
   */
  function isChineseLocale(): boolean {
    const currentLocale = typeof locale === 'string' ? locale : locale.value;
    return currentLocale?.startsWith('zh') ?? false;
  }

  /**
   * 判断字符串是否是国际化 key（而不是翻译后的值）
   * 国际化 key 的格式：以字母开头，包含至少一个点，且点前后都有非空字符
   * 例如：'crud.table.index' 是 key，'No.' 不是 key
   */
  function isI18nKey(str: string): boolean {
    // 必须是字符串且包含点
    if (!str.includes('.')) {
      return false;
    }
    
    // 检查是否符合国际化 key 的格式：以字母开头，点前后都有非空字符
    // 例如：'crud.table.index' ✓, 'No.' ✗, 'A.B' ✓, '.B' ✗, 'A.' ✗
    const parts = str.split('.');
    if (parts.length < 2) {
      return false;
    }
    
    // 第一部分必须以字母开头
    const firstPart = parts[0].trim();
    if (!firstPart || !/^[a-zA-Z]/.test(firstPart)) {
      return false;
    }
    
    // 所有部分都不能为空
    return parts.every(part => part.trim().length > 0);
  }

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

      // 处理列的国际化标签
      // 优先处理特殊类型列（index、op）的国际化
      if (column.type === 'index') {
        // 序号列：如果 label 是国际化 key，翻译；否则使用默认的国际化标签
        if (column.label && typeof column.label === 'string' && isI18nKey(column.label)) {
            config.label = t(column.label);
        } else {
          config.label = t('crud.table.index');
          }
      } else if (column.type === 'op') {
        // 操作列：如果 label 是国际化 key，翻译；否则使用默认的国际化标签
        if (column.label && typeof column.label === 'string' && isI18nKey(column.label)) {
          config.label = t(column.label);
        } else {
          config.label = t('ui.table.operation');
        }
      } else if (column.label && typeof column.label === 'string') {
        // 普通列：如果 label 是国际化 key，进行翻译
        if (isI18nKey(column.label)) {
          config.label = t(column.label);
        } else {
          // 如果 label 不包含 '.'（可能是硬编码的中文），根据语言环境自动切换
          if (isChineseLocale()) {
            // 中文环境：显示 label（硬编码的中文）
            config.label = column.label;
          } else if (column.prop) {
            // 英文环境：显示 prop（首字母大写）
            config.label = formatPropToLabel(column.prop);
          } else {
            // 没有 prop，保持原 label
            config.label = column.label;
          }
        }
      } else if (!column.label && column.prop) {
        // 如果没有 label 但有 prop，根据语言环境显示
        if (isChineseLocale()) {
          // 中文环境：显示 prop（可能需要根据实际情况调整）
          config.label = column.prop;
        } else {
          // 英文环境：显示 prop（首字母大写）
          config.label = formatPropToLabel(column.prop);
        }
      }

      // selection 和 index 列默认固定在左侧（对齐 cool-admin）
      if ((column.type === 'selection' || column.type === 'index') && column.fixed === undefined) {
        config.fixed = 'left';
      }

      // 操作列默认固定在右侧（对齐 cool-admin）
      if (column.type === 'op' && column.fixed === undefined) {
        config.fixed = 'right';
        // 操作列宽度需要增加 gap（10px），这样搜索组件最右侧才能和操作列左侧对齐
        if (config.width && typeof config.width === 'number') {
          config.width = config.width + gap;
        } else if (config.minWidth && typeof config.minWidth === 'number') {
          config.minWidth = config.minWidth + gap;
        } else if (!config.width && !config.minWidth) {
          // 如果没有设置宽度，使用默认宽度 + gap
          config.width = 220 + gap;
        }
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
