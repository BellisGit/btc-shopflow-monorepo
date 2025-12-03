/**
 * 本地存储工具类
 */
import { syncSettingsToCookie, syncUserToCookie } from './cross-domain';

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
    
    // settings 和 user：写入 Cookie（主要存储），同时写入 localStorage（备份）
    if (key === 'settings' || key === 'user') {
      // 1. 写入 Cookie（主要存储）
      try {
        if (key === 'settings' && typeof value === 'object' && value !== null) {
          syncSettingsToCookie(value as Record<string, any>);
        } else if (key === 'user' && typeof value === 'object' && value !== null) {
          syncUserToCookie(value as Record<string, any>);
        }
      } catch (error) {
        console.error('[Storage] 同步到 Cookie 失败:', error);
      }
      
      // 2. 同时写入 localStorage 作为备份（仅在 Cookie 丢失时使用）
      try {
        const data = {
          value,
          expire: expire ? Date.now() + expire * 1000 : null,
        };
        localStorage.setItem(this.prefix + key, JSON.stringify(data));
      } catch (error) {
        // 忽略 localStorage 写入错误（可能是存储空间不足）
      }
      
      return;
    }
    
    // 其他键（如 locale、i18n 缓存）仍然写入 localStorage
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
    // settings 和 user：优先从 Cookie 读取，如果 Cookie 丢失则从 localStorage 恢复
    if (key === 'settings' || key === 'user') {
      if (typeof document === 'undefined') {
        return (key === 'settings' ? {} : null) as T;
      }
      
      try {
        const cookieName = key === 'settings' ? 'btc_settings' : 'btc_user';
        const nameEQ = cookieName + '=';
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
          }
          if (c.indexOf(nameEQ) === 0) {
            const cookieValue = c.substring(nameEQ.length, c.length);
            try {
              const parsed = JSON.parse(decodeURIComponent(cookieValue));
              // 对于 settings，确保返回的是对象而不是 null
              if (key === 'settings' && (parsed === null || typeof parsed !== 'object')) {
                return {} as T;
              }
              return parsed as T;
            } catch {
              return (key === 'settings' ? {} : null) as T;
            }
          }
        }
      } catch (error) {
        // 忽略错误
      }
      
      // Cookie 中没有数据，尝试从 localStorage 恢复（备份机制）
      try {
        const backupKey = this.prefix + key;
        const backupStr = localStorage.getItem(backupKey);
        if (backupStr) {
          try {
            const backupData = JSON.parse(backupStr);
            // 检查是否过期
            if (backupData.expire && backupData.expire < Date.now()) {
              // 备份已过期，删除
              localStorage.removeItem(backupKey);
              return (key === 'settings' ? {} : null) as T;
            }
            
            // 从备份恢复：将数据重新设置到 Cookie
            const backupValue = backupData.value;
            if (backupValue && typeof backupValue === 'object') {
              if (key === 'settings') {
                syncSettingsToCookie(backupValue as Record<string, any>);
                return backupValue as T;
              } else if (key === 'user') {
                syncUserToCookie(backupValue as Record<string, any>);
                return backupValue as T;
              }
            }
          } catch {
            // 备份数据解析失败，删除
            localStorage.removeItem(backupKey);
          }
        }
      } catch (error) {
        // 忽略 localStorage 读取错误
      }
      
      // 如果 Cookie 和备份都没有，对于 settings 返回空对象（而不是 null），这样后续代码可以正常工作
      if (key === 'settings') {
        return {} as T;
      }
      
      return null;
    }
    
    // 其他键从 localStorage 读取
    const str = localStorage.getItem(this.prefix + key);
    if (!str) {
      return null;
    }

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