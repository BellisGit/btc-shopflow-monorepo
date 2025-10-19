import prettier from 'prettier';
/**
 * 获取项目根目录
 */
export declare function rootDir(path: string): string;
/**
 * 首字母大写
 */
export declare function firstUpperCase(value: string): string;
/**
 * 横杠转驼峰
 */
export declare function toCamel(str: string): string;
/**
 * 创建目录
 */
export declare function createDir(path: string, recursive?: boolean): void;
/**
 * 读取文件
 */
export declare function readFile(path: string, json?: boolean): any;
/**
 * 写入文件
 */
export declare function writeFile(path: string, data: string): void;
/**
 * 解析 body
 */
export declare function parseJson(req: any): Promise<any>;
/**
 * 格式化内容
 */
export declare function formatContent(content: string, options?: prettier.Options): Promise<string>;
/**
 * 错误日志
 */
export declare function error(message: string): void;
/**
 * 成功日志
 */
export declare function success(message: string): void;
/**
 * 比较两个版本号
 */
export declare function compareVersion(version1: string, version2: string): number;
