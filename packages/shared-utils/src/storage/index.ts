/**
 * 本地存储工具类
 */
class StorageUtil {
  private prefix: string;

  constructor(prefix = 'btc_') {
    this.prefix = prefix;
  }

  /**
   * 设置存储
   * @param key 键
   * @param value 值
   * @param expire 过期时间（秒）
   */
  set(key: string, value: unknown, expire?: number): void {
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  /**
   * 获取存储
   * @param key 键
   * @returns 值
   */
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
   * 移除存储
   * @param key 键
   */
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * 清空存储
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
