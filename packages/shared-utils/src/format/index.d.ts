/**
 * 鏍煎紡鍖栭噾棰? * @param value 閲戦
 * @param currency 璐у竵绗﹀彿
 * @returns 鏍煎紡鍖栧悗鐨勯噾棰濆瓧绗︿覆
 */
export declare function formatMoney(value: number, currency?: string): string;
/**
 * 鏍煎紡鍖栨暟瀛楋紙鍗冨垎浣嶏級
 * @param value 鏁板瓧
 * @returns 鏍煎紡鍖栧悗鐨勬暟瀛楀瓧绗︿覆
 */
export declare function formatNumber(value: number): string;
/**
 * 鏍煎紡鍖栨枃浠跺ぇ灏? * @param bytes 瀛楄妭鏁? * @returns 鏍煎紡鍖栧悗鐨勬枃浠跺ぇ灏忓瓧绗︿覆
 */
export declare function formatFileSize(bytes: number): string;
/**
 * 鏍煎紡鍖栫櫨鍒嗘瘮
 * @param value 鏁板€硷紙0-1锛? * @param decimals 灏忔暟浣嶆暟
 * @returns 鏍煎紡鍖栧悗鐨勭櫨鍒嗘瘮瀛楃涓? */
export declare function formatPercent(value: number, decimals?: number): string;
/**
 * 闅愯棌鎵嬫満鍙蜂腑闂?浣? * @param phone 鎵嬫満鍙? * @returns 闅愯棌鍚庣殑鎵嬫満鍙? */
export declare function hidePhone(phone: string): string;
/**
 * 闅愯棌韬唤璇佸彿涓棿閮ㄥ垎
 * @param idCard 韬唤璇佸彿
 * @returns 闅愯棌鍚庣殑韬唤璇佸彿
 */
export declare function hideIdCard(idCard: string): string;




