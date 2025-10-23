import type { Component } from 'vue';
/**
 * 琛ㄦ牸鍒楅厤缃紙瀵归綈 cool-admin锛? */
export interface TableColumn {
    type?: 'selection' | 'index' | 'expand' | 'op' | string;
    prop?: string;
    label?: string;
    width?: string | number;
    minWidth?: string | number;
    align?: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
    fixed?: boolean | 'left' | 'right';
    sortable?: boolean | 'custom';
    showOverflowTooltip?: boolean;
    resizable?: boolean;
    hidden?: boolean;
    formatter?: (row: any, column: any, cellValue: any, index: number) => string;
    component?: {
        name: string | Component;
        props?: Record<string, any>;
    };
    dict?: Array<{
        label: string;
        value: any;
        type?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
        [key: string]: any;
    }>;
    dictColor?: boolean;
    dictAllLevels?: boolean;
    buttons?: OpButton[] | ((options: {
        scope: any;
    }) => OpButton[]);
    children?: TableColumn[];
    [key: string]: any;
}
/**
 * 鎿嶄綔鎸夐挳閰嶇疆
 */
export type OpButton = 'edit' | 'delete' | 'info' | `slot-${string}` | {
    label: string;
    type?: string;
    onClick?: (options: {
        scope: any;
    }) => void;
};
/**
 * Props 閰嶇疆
 */
export interface TableProps {
    columns?: TableColumn[];
    autoHeight?: boolean;
    height?: string | number;
    rowKey?: string;
    emptyText?: string;
    defaultSort?: {
        prop: string;
        order: 'ascending' | 'descending';
    };
    sortRefresh?: boolean;
    contextMenu?: Array<string | any> | boolean;
}

