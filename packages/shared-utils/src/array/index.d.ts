/**
 * 数组工具函数
 */
/**
 * 本地化排序
 * @param list 数组
 * @param selector 选择器函数
 * @returns 排序后的数组
 */
export declare function sortByLocale<T>(list: T[], selector?: (item: T) => string): T[];
/**
 * 数组去重
 * @param arr 数组
 * @param key 去重键（可选）
 * @returns 去重后的数组
 */
export declare function unique<T>(arr: T[], key?: keyof T): T[];
/**
 * 数组分组
 * @param arr 数组
 * @param key 分组键或函数
 * @returns 分组后的对象
 */
export declare function groupBy<T>(arr: T[], key: keyof T | ((item: T) => string | number)): Record<string, T[]>;
/**
 * 数组分块
 * @param arr 数组
 * @param size 块大小
 * @returns 分块后的数组
 */
export declare function chunk<T>(arr: T[], size: number): T[][];
/**
 * 数组扁平化
 * @param arr 数组
 * @param depth 深度
 * @returns 扁平化后的数组
 */
export declare function flatten<T>(arr: any[], depth?: number): T[];
/**
 * 数组深度扁平化
 * @param arr 数组
 * @returns 扁平化后的数组
 */
export declare function flattenDeep<T>(arr: any[]): T[];
/**
 * 数组交集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 交集数组
 */
export declare function intersection<T>(arr1: T[], arr2: T[]): T[];
/**
 * 数组差集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 差集数组
 */
export declare function difference<T>(arr1: T[], arr2: T[]): T[];
/**
 * 数组并集
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 并集数组
 */
export declare function union<T>(arr1: T[], arr2: T[]): T[];
/**
 * 随机打乱数组
 * @param arr 数组
 * @returns 打乱后的数组
 */
export declare function shuffle<T>(arr: T[]): T[];
/**
 * 随机取样
 * @param arr 数组
 * @param count 取样数量
 * @returns 取样后的数组
 */
export declare function sample<T>(arr: T[], count?: number): T[];
/**
 * 数组求和
 * @param arr 数组
 * @param key 求和键（可选）
 * @returns 求和结果
 */
export declare function sum<T>(arr: T[], key?: keyof T): number;
/**
 * 数组平均值
 * @param arr 数组
 * @param key 平均值键（可选）
 * @returns 平均值
 */
export declare function average<T>(arr: T[], key?: keyof T): number;
/**
 * 数组最大值
 * @param arr 数组
 * @param key 最大值键（可选）
 * @returns 最大值项
 */
export declare function maxBy<T>(arr: T[], key?: keyof T): T | undefined;
/**
 * 数组最小值
 * @param arr 数组
 * @param key 最小值键（可选）
 * @returns 最小值项
 */
export declare function minBy<T>(arr: T[], key?: keyof T): T | undefined;
