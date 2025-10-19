/**
 * 格式化金额
 * @param value 金额
 * @param currency 货币符号
 * @returns 格式化后的金额字符串
 */
export declare function formatMoney(value: number, currency?: string): string;
/**
 * 格式化数字（千分位）
 * @param value 数字
 * @returns 格式化后的数字字符串
 */
export declare function formatNumber(value: number): string;
/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export declare function formatFileSize(bytes: number): string;
/**
 * 格式化百分比
 * @param value 数值（0-1）
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export declare function formatPercent(value: number, decimals?: number): string;
/**
 * 隐藏手机号中间4位
 * @param phone 手机号
 * @returns 隐藏后的手机号
 */
export declare function hidePhone(phone: string): string;
/**
 * 隐藏身份证号中间部分
 * @param idCard 身份证号
 * @returns 隐藏后的身份证号
 */
export declare function hideIdCard(idCard: string): string;
