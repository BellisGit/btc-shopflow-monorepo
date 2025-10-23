/**
 * 鏈湴瀛樺偍宸ュ叿绫? */
declare class StorageUtil {
    private prefix;
    constructor(prefix?: string);
    /**
     * 璁剧疆瀛樺偍
     * @param key 閿?     * @param value 鍊?     * @param expire 杩囨湡鏃堕棿锛堢锛?     */
    set(key: string, value: unknown, expire?: number): void;
    /**
     * 鑾峰彇瀛樺偍
     * @param key 閿?     * @returns 鍊?     */
    get<T = unknown>(key: string): T | null;
    /**
     * 绉婚櫎瀛樺偍
     * @param key 閿?     */
    remove(key: string): void;
    /**
     * 娓呯┖瀛樺偍
     */
    clear(): void;
}
export declare const storage: StorageUtil;
export {};




