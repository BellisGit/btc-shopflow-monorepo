// i18n/getters.ts
import { createI18n } from 'vue-i18n';
import type { I18n } from 'vue-i18n';
import { zhCN as sharedCoreZh, enUS as sharedCoreEn } from '@btc/shared-core';

// 延迟加载 messages，避免初始化顺序问题
let messagesCache: Record<string, any> | null = null;
const getMessages = (): Record<string, any> => {
  if (!messagesCache) {
    try {
      // 使用动态导入，避免在模块顶层初始化
      // 注意：@intlify/unplugin-vue-i18n/messages 在构建时会被替换为实际的消息对象
      // 这里使用同步导入，因为 unplugin-vue-i18n 在构建时会处理
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const messagesModule = require('@intlify/unplugin-vue-i18n/messages');
      messagesCache = (messagesModule.default || messagesModule) as Record<string, any>;
    } catch {
      // 如果导入失败，使用空对象
      messagesCache = {};
    }
  }
  return messagesCache;
};

// 合并 shared-core 的语言包
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  return Object.assign({}, ...sources.filter(Boolean));
};

// 延迟初始化 i18n 实例，避免在模块顶层初始化
let i18nInstance: I18n | null = null;

const getI18nInstance = (): I18n => {
  if (!i18nInstance) {
    const messages = getMessages();
    // 合并所有语言包：shared-core + unplugin 自动加载的 messages
    const normalizedMessages = {
      'zh-CN': mergeMessages(
        sharedCoreZh as Record<string, any>,
        (messages as Record<string, any>)['zh-CN'] || {}
      ),
      'en-US': mergeMessages(
        sharedCoreEn as Record<string, any>,
        (messages as Record<string, any>)['en-US'] || {}
      ),
    };

    // 创建一个独立的 i18n 实例用于路由标题
    i18nInstance = createI18n({
      legacy: false,
      globalInjection: false, // 路由中不需要全局注入
      locale: 'zh-CN',
      fallbackLocale: ['zh-CN', 'en-US'],
      messages: normalizedMessages
    }) as I18n;
  }
  return i18nInstance;
};

export function tSync(key: string): string {
  try {
    // 延迟获取 i18n 实例，避免初始化顺序问题
    const i18n = getI18nInstance();

    // 获取当前语言设置（从 Cookie 读取，与主应用保持一致）
    let currentLocale = 'zh-CN';
    try {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          let c = cookies[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
          }
          if (c.indexOf('locale=') === 0) {
            currentLocale = c.substring('locale='.length, c.length);
            break;
          }
        }
      }
    } catch {
      // 如果 Cookie 读取失败，使用默认值
    }

    // 更新 i18n 实例的语言
    if (typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
      (i18n.global.locale as any).value = currentLocale;
    } else {
      (i18n.global as any).locale = currentLocale;
    }

    const g = i18n.global as any;

    // 检查 i18n 是否已初始化
    if (!g || !g.te) {
      return key;
    }

    // 直接检查消息对象中是否存在该键
    const localeMessages = g.getLocaleMessage(currentLocale) || {};

    if (localeMessages[key]) {
      const value = localeMessages[key];
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'function') {
        // Vue I18n 编译时优化，返回函数需要调用
        try {
          return value({ normalize: (arr: any[]) => arr[0] });
        } catch (_error) {
          return key;
        }
      }
    }

    // 如果直接检查失败，尝试使用 g.te 和 g.t
    if (g.te(key)) {
      return String(g.t(key));
    } else {
      // 如果当前语言没有找到，尝试回退语言
      const fallbackLocale = currentLocale === 'zh-CN' ? 'en-US' : 'zh-CN';
      const fallbackMessages = g.getLocaleMessage(fallbackLocale) || {};
      if (fallbackMessages[key]) {
        const value = fallbackMessages[key];
        if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'function') {
          try {
            return value({ normalize: (arr: any[]) => arr[0] });
          } catch (_error) {
            return key;
          }
        }
      }
      return key;
    }
  } catch (_error) {
    return key;
  }
}
