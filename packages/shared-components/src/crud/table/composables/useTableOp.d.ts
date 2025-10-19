import type { UseCrudReturn } from '@btc/shared-core';
import type { TableColumn, OpButton, TableProps } from '../types';
/**
 * 操作列处理 + 列控制
 */
export declare function useTableOp(crud: UseCrudReturn<any>, tableProps: TableProps): {
    getOpButtons: (column: TableColumn, _scope: any) => OpButton[];
    getButtonType: (btn: string) => string;
    getButtonText: (btn: string) => string;
    handleOpClick: (btn: string, row: any) => void;
    showColumn: (prop: string | string[], status?: boolean) => void;
    hideColumn: (prop: string | string[]) => void;
    setColumns: (columns: TableColumn[]) => void;
    reBuild: (callback?: () => void) => void;
    rebuildKey: globalThis.Ref<number, number>;
};
