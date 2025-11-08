/**
 * 日志中心配置
 */
import type { TableColumn } from '@btc/shared-components';
export declare const operationLogColumns: TableColumn[];
export declare const requestLogColumns: TableColumn[];
export declare const logServices: {
    operationLog: any;
    requestLog: any;
};
export declare const logTabs: {
    name: string;
    label: string;
}[];
