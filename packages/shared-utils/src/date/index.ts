// 使用兼容方式导入 dayjs，同时支持默认导出和命名空间导出
import * as dayjsModule from 'dayjs';
// dayjs 在 ES 模块中可能没有 default，需要处理兼容性
// 获取默认导出或命名空间导出
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dayjsRaw = (dayjsModule as any).default || dayjsModule;
// 类型断言：dayjs 是一个可调用的函数，兼容 ES 模块和 CommonJS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dayjs = dayjsRaw as any;

/**
 * 鏍煎紡鍖栨棩鏈? * @param date 鏃ユ湡瀵硅薄鎴栧瓧绗︿覆
 * @param format 鏍煎紡鍖栨ā鏉? * @returns 鏍煎紡鍖栧悗鐨勬棩鏈熷瓧绗︿覆
 */
export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

/**
 * 鏍煎紡鍖栨棩鏈熸椂闂? * @param date 鏃ユ湡瀵硅薄鎴栧瓧绗︿覆
 * @returns 鏍煎紡鍖栧悗鐨勬棩鏈熸椂闂村瓧绗︿覆
 */
export function formatDateTime(date: Date | string | number): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 鏍煎紡鍖栨棩鏈熸椂闂达紙鐢ㄦ埛鍙嬪ソ鏍煎紡锛? * @param date 鏃ユ湡瀵硅薄鎴栧瓧绗︿覆
 * @returns 鏍煎紡鍖栧悗鐨勬棩鏈熸椂闂村瓧绗︿覆
 */
export function formatDateTimeFriendly(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 妫€鏌ユ槸鍚︿负鏃堕棿瀛楁
 * @param fieldName 瀛楁鍚? * @returns 鏄惁涓烘椂闂村瓧娈? */
export function isDateTimeField(fieldName: string): boolean {
  return /^(createdAt|updatedAt|createTime|updateTime|deletedAt)$/i.test(fieldName);
}

/**
 * 鑾峰彇鏃ユ湡鑼冨洿
 * @param type 鑼冨洿绫诲瀷
 * @returns [寮€濮嬫椂闂? 缁撴潫鏃堕棿]
 */
export function getDateRange(type: 'today' | 'week' | 'month'): [string, string] {
  const now = dayjs();

  switch (type) {
    case 'today':
      return [now.startOf('day').format(), now.endOf('day').format()];
    case 'week':
      return [now.startOf('week').format(), now.endOf('week').format()];
    case 'month':
      return [now.startOf('month').format(), now.endOf('month').format()];
  }
}

/**
 * 璁＄畻鏃ユ湡宸? * @param date1 鏃ユ湡1
 * @param date2 鏃ユ湡2
 * @param unit 鍗曚綅
 * @returns 鏃ユ湡宸? */
export function dateDiff(
  date1: Date | string,
  date2: Date | string,
  unit: 'day' | 'hour' | 'minute' = 'day'
): number {
  return dayjs(date1).diff(dayjs(date2), unit);
}




