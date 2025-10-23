/**
 * 鏈湴瀛樺偍宸ュ叿绫? */
class StorageUtil {
  private prefix: string;

  constructor(prefix = 'btc_') {
    this.prefix = prefix;
  }

  /**
   * 璁剧疆瀛樺偍
   * @param key 閿?   * @param value 鍊?   * @param expire 杩囨湡鏃堕棿锛堢锛?   */
  set(key: string, value: unknown, expire?: number): void {
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  /**
   * 鑾峰彇瀛樺偍
   * @param key 閿?   * @returns 鍊?   */
  get<T = unknown>(key: string): T | null {
    const str = localStorage.getItem(this.prefix + key);
    if (!str) return null;

    try {
      const data = JSON.parse(str);
      if (data.expire && data.expire < Date.now()) {
        this.remove(key);
        return null;
      }
      return data.value;
    } catch {
      return null;
    }
  }

  /**
   * 绉婚櫎瀛樺偍
   * @param key 閿?   */
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * 娓呯┖瀛樺偍
   */
  clear(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const storage = new StorageUtil();




