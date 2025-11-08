/**
 * BtcTableGroup 类型定义
 */
export interface TableGroupProps {
    leftService: any;
    leftTitle?: string;
    rightService: any;
    rightTitle?: string;
    tableColumns?: any[];
    formItems: any[];
    op?: {
        buttons?: any[];
    };
    idField?: string;
    labelField?: string;
    parentField?: string;
    showCreateTime?: boolean;
    showUpdateTime?: boolean;
    enableDrag?: boolean;
    enableKeySearch?: boolean;
    showUnassigned?: boolean;
    unassignedLabel?: string;
    leftWidth?: string;
    upsertWidth?: string | number;
    searchPlaceholder?: string;
}
export interface TableGroupEmits {
    (event: 'select', item: any, keyword?: any): void;
    (event: 'update:selected', item: any): void;
    (event: 'refresh', params?: any): void;
    (event: 'form-submit', data: any, formEvent: {
        close: () => void;
        done: () => void;
        next: (data: any) => Promise<any>;
        defaultPrevented: boolean;
    }): void;
    (event: 'load', data: any[]): void;
}
export interface TableGroupExpose {
    viewGroupRef: any;
    crudRef: any;
    refresh: (params?: any) => Promise<void>;
}
