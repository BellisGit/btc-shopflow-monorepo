declare class StorageUtil {
    private prefix;
    constructor(prefix?: string);
    /**
     * 设置存储
     * @param key 键
     * @param value 值
     * @param expire 过期时间（秒）
     */
    set(key: string, value: unknown, expire?: number): void;
    /**
     * 获取存储
     * @param key 键
     * @returns 值
     */
    get<T = unknown>(key: string): T | null;
    /**
     * 移除存储
     * @param key 键
     */
    remove(key: string): void;
    /**
     * 清空存储
     */
    clear(): void;
}
export declare const storage: StorageUtil;
export {};
