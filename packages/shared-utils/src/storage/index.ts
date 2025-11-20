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
    // 禁止创建独立的键，统一使用 settings 和 user 存储
    // 允许的键：settings, user, locale, i18n 相关的缓存键
    const allowedKeys = ['settings', 'user', 'locale'];
    const isI18nKey = key.startsWith('i18n-') || key.startsWith('locale-');
    
    if (!allowedKeys.includes(key) && !isI18nKey) {
      // 检查是否是应该统一存储的键
      const unifiedStorageKeys = [
        'button-style',
        'systemThemeType',
        'systemThemeMode',
        'systemThemeColor',
        'menuType',
        'menuThemeType',
        'containerWidth',
        'boxBorderMode',
        'showMenuButton',
        'showFastEnter',
        'showRefreshButton',
        'showCrumbs',
        'showWorkTab',
        'showGlobalSearch',
        'showLanguage',
        'showNprogress',
        'watermarkVisible',
        'uniqueOpened',
        'tabStyle',
        'pageTransition',
        'customRadius',
        'menuOpenWidth',
        'menuOpen',
        'colorWeak',
        'theme',
        'isDark',
        'username', // 用户名应该存储在 user.username 中
        'user_avatar', // 头像应该存储在 user.avatar 中
        'user_name', // 用户名应该存储在 user.name 中
      ];
      
      if (unifiedStorageKeys.includes(key)) {
        console.error(`[Storage] 禁止创建独立的 ${key} 键！请使用统一的 settings 存储`);
        console.trace('调用堆栈：');
        return;
      }
    }
    
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




