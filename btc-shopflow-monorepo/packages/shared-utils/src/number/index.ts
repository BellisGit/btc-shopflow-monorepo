/**
 * 数字工具函数
 */

/**
 * 数字精度处理
 * @param num 数字
 * @param precision 精度
 * @returns 处理后的数字
 */
export function toPrecision(num: number, precision = 2): number {
  return Number(num.toFixed(precision));
}

/**
 * 数字范围限制
 * @param num 数字
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数字
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * 随机数生成
 * @param min 最小值
 * @param max 最大值
 * @param integer 是否为整数
 * @returns 随机数
 */
export function random(min = 0, max = 1, integer = false): number {
  const num = Math.random() * (max - min) + min;
  return integer ? Math.floor(num) : num;
}

/**
 * 数字转中文
 * @param num 数字
 * @returns 中文数字
 */
export function toChineseNumber(num: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const units = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿'];
  
  if (num === 0) return digits[0];
  
  const str = num.toString();
  let result = '';
  
  for (let i = 0; i < str.length; i++) {
    const digit = parseInt(str[i]);
    const unit = units[str.length - 1 - i];
    
    if (digit !== 0) {
      result += digits[digit] + unit;
    } else if (result && !result.endsWith('零')) {
      result += digits[0];
    }
  }
  
  return result.replace(/零+$/, '').replace(/零+/g, '零');
}

/**
 * 数字转罗马数字
 * @param num 数字
 * @returns 罗马数字
 */
export function toRoman(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  
  let result = '';
  
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  
  return result;
}

/**
 * 数字转字节单位
 * @param bytes 字节数
 * @param precision 精度
 * @returns 带单位的字符串
 */
export function bytesToSize(bytes: number, precision = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${toPrecision(bytes / Math.pow(k, i), precision)} ${sizes[i]}`;
}

/**
 * 判断是否为偶数
 * @param num 数字
 * @returns 是否为偶数
 */
export function isEven(num: number): boolean {
  return num % 2 === 0;
}

/**
 * 判断是否为奇数
 * @param num 数字
 * @returns 是否为奇数
 */
export function isOdd(num: number): boolean {
  return num % 2 !== 0;
}

/**
 * 数字补零
 * @param num 数字
 * @param length 长度
 * @returns 补零后的字符串
 */
export function padZero(num: number, length = 2): string {
  return num.toString().padStart(length, '0');
}
