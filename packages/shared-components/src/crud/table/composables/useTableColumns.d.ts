import type { TableProps } from '../types';
/**
 * 表格列配置处理
 */
export declare function useTableColumns(props: TableProps): {
    computedColumns: globalThis.ComputedRef<any[]>;
    formatDictValue: (value: any, dict: any[], allLevels?: boolean) => string;
};
