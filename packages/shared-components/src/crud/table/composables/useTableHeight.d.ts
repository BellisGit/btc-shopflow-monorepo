import { type Ref } from 'vue';
import type { TableProps } from '../types';
/**
 * 表格高度自动计算（对齐 cool-admin table/helper/height.ts）
 */
export declare function useTableHeight(props: TableProps, tableRef: Ref): {
    maxHeight: Ref<number | undefined, number | undefined>;
    calcMaxHeight: () => void;
};
