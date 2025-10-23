/**
 * 楠岃瘉閭
 * @param email 閭鍦板潃
 * @returns 鏄惁鏈夋晥
 */
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 楠岃瘉鎵嬫満鍙凤紙涓浗澶ч檰锛? * @param phone 鎵嬫満鍙? * @returns 鏄惁鏈夋晥
 */
export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 楠岃瘉韬唤璇佸彿锛堜腑鍥藉ぇ闄嗭級
 * @param idCard 韬唤璇佸彿
 * @returns 鏄惁鏈夋晥
 */
export function isIdCard(idCard: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
}

/**
 * 楠岃瘉URL
 * @param url URL鍦板潃
 * @returns 鏄惁鏈夋晥
 */
export function isUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url);
}

/**
 * 楠岃瘉鏄惁涓虹┖
 * @param value 鍊? * @returns 鏄惁涓虹┖
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}




