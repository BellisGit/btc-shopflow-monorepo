/**
 * 表单项管理工具
 */
export declare function cloneDeep(obj: any): any;
export declare function isBoolean(val: any): val is boolean;
export declare function isFunction(val: any): val is (...args: any[]) => any;
/**
 * 判断是否隐藏
 */
export declare function parseHidden(value: any, scope: any): any;
/**
 * 折叠表单项
 */
export declare function collapseItem(item: any): void;
/**
 * 转换表单值
 */
export declare function invokeData(d: any): void;
