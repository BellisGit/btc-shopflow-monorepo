/**
 * 鏍煎紡鍖栭噾棰? * @param value 閲戦
 * @param currency 璐у竵绗﹀彿
 * @returns 鏍煎紡鍖栧悗鐨勯噾棰濆瓧绗︿覆
 */
export function formatMoney(value: number, currency = '楼'): string {
  return `${currency}${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

/**
 * 鏍煎紡鍖栨暟瀛楋紙鍗冨垎浣嶏級
 * @param value 鏁板瓧
 * @returns 鏍煎紡鍖栧悗鐨勬暟瀛楀瓧绗︿覆
 */
export function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 鏍煎紡鍖栨枃浠跺ぇ灏? * @param bytes 瀛楄妭鏁? * @returns 鏍煎紡鍖栧悗鐨勬枃浠跺ぇ灏忓瓧绗︿覆
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 鏍煎紡鍖栫櫨鍒嗘瘮
 * @param value 鏁板€硷紙0-1锛? * @param decimals 灏忔暟浣嶆暟
 * @returns 鏍煎紡鍖栧悗鐨勭櫨鍒嗘瘮瀛楃涓? */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 闅愯棌鎵嬫満鍙蜂腑闂?浣? * @param phone 鎵嬫満鍙? * @returns 闅愯棌鍚庣殑鎵嬫満鍙? */
export function hidePhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 闅愯棌韬唤璇佸彿涓棿閮ㄥ垎
 * @param idCard 韬唤璇佸彿
 * @returns 闅愯棌鍚庣殑韬唤璇佸彿
 */
export function hideIdCard(idCard: string): string {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}




