import type { UseCrudReturn } from '@btc/shared-core';
import type { TableProps } from '../types';
/**
 * 表格排序处理（对齐 cool-admin table/helper/sort.ts）
 */
export declare function useTableSort(crud: UseCrudReturn<any>, props: TableProps, emit: any): {
    defaultSort: globalThis.ComputedRef<{
        prop: string;
        order: string;
    } | undefined>;
    currentSort: globalThis.Ref<{
        prop: string;
        order: string;
    } | null, {
        prop: string;
        order: string;
    } | {
        prop: string;
        order: string;
    } | null>;
    onSortChange: ({ prop, order }: {
        prop: string;
        order: string;
    }) => void;
    clearSort: () => void;
};
