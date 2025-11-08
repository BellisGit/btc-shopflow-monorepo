/**
 * 鏍煎紡鍖栨棩鏈? * @param date 鏃ユ湡瀵硅薄鎴栧瓧绗︿覆
 * @param format 鏍煎紡鍖栨ā鏉? * @returns 鏍煎紡鍖栧悗鐨勬棩鏈熷瓧绗︿覆
 */
export declare function formatDate(date: Date | string | number, format?: string): string;
/**
 * 鏍煎紡鍖栨棩鏈熸椂闂? * @param date 鏃ユ湡瀵硅薄鎴栧瓧绗︿覆
 * @returns 鏍煎紡鍖栧悗鐨勬棩鏈熸椂闂村瓧绗︿覆
 */
export declare function formatDateTime(date: Date | string | number): string;
/**
 * 鏍煎紡鍖栨棩鏈熸椂闂达紙鐢ㄦ埛鍙嬪ソ鏍煎紡锛? * @param date 鏃ユ湡瀵硅薄鎴栧瓧绗︿覆
 * @returns 鏍煎紡鍖栧悗鐨勬棩鏈熸椂闂村瓧绗︿覆
 */
export declare function formatDateTimeFriendly(date: Date | string | number | null | undefined): string;
/**
 * 妫€鏌ユ槸鍚︿负鏃堕棿瀛楁
 * @param fieldName 瀛楁鍚? * @returns 鏄惁涓烘椂闂村瓧娈? */
export declare function isDateTimeField(fieldName: string): boolean;
/**
 * 鑾峰彇鏃ユ湡鑼冨洿
 * @param type 鑼冨洿绫诲瀷
 * @returns [寮€濮嬫椂闂? 缁撴潫鏃堕棿]
 */
export declare function getDateRange(type: 'today' | 'week' | 'month'): [string, string];
/**
 * 璁＄畻鏃ユ湡宸? * @param date1 鏃ユ湡1
 * @param date2 鏃ユ湡2
 * @param unit 鍗曚綅
 * @returns 鏃ユ湡宸? */
export declare function dateDiff(date1: Date | string, date2: Date | string, unit?: 'day' | 'hour' | 'minute'): number;
