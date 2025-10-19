import type { Component } from 'vue';
/**
 * 表格列配置（对齐 cool-admin）
 */
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
 * 操作按钮配置
 */
export type OpButton = 'edit' | 'delete' | 'info' | `slot-${string}` | {
    label: string;
    type?: string;
    onClick?: (options: {
        scope: any;
    }) => void;
};
/**
 * Props 配置
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
