/**
 * i18n 同步翻译函数
 * 用于在非组件环境中进行同步翻译（如路由标题、文档标题等）
 */

import { storage } from '@btc/shared-utils';
import { createI18n } from 'vue-i18n';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedLocalesZhCN from '@btc/shared-components/locales/zh-CN.json';
import sharedLocalesEnUS from '@btc/shared-components/locales/en-US.json';
import messages from '@intlify/unplugin-vue-i18n/messages';
// 导入 overview 模块的语言包
import overviewZhCN from '../modules/overview/locales/zh-CN.json';
import overviewEnUS from '../modules/overview/locales/en-US.json';

// 合并语言包
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  return Object.assign({}, ...sources.filter(Boolean));
};

const mergedMessages = {
  'zh-CN': mergeMessages(
    sharedCoreZh as Record<string, any>,
    sharedLocalesZhCN as Record<string, any>,
    overviewZhCN as Record<string, any>,
    (messages as Record<string, any>)['zh-CN'] || {}
  ),
  'en-US': mergeMessages(
    sharedCoreEn as Record<string, any>,
    sharedLocalesEnUS as Record<string, any>,
    overviewEnUS as Record<string, any>,
    (messages as Record<string, any>)['en-US'] || {}
  ),
};

// 创建独立的 i18n 实例用于同步翻译（作为后备）
let i18nInstance: ReturnType<typeof createI18n> | null = null;

const getI18nInstance = () => {
  // 优先使用主应用的 i18n 实例（包含预加载的子应用数据）
  if (typeof window !== 'undefined' && (window as any).__MAIN_APP_I18N__) {
    const mainI18n = (window as any).__MAIN_APP_I18N__;
    // 确保主应用 i18n 实例已初始化
    if (mainI18n && mainI18n.global) {
      return mainI18n;
    }
  }
  
  // 后备：使用独立的 i18n 实例（不包含子应用数据，但始终可用）
  if (!i18nInstance) {
    i18nInstance = createI18n({
      legacy: false,
      globalInjection: false,
      locale: 'zh-CN',
      fallbackLocale: ['zh-CN', 'en-US'],
      messages: mergedMessages,
    }) as any;
  }
  return i18nInstance;
};

/**
 * 同步翻译函数
 * @param key 翻译键
 * @returns 翻译后的文本，如果未找到则返回 key
 */
export function tSync(key: string): string {
  try {
    const i18n = getI18nInstance();

    // 获取当前语言设置（从 storage 读取，与 getLocaleFromStorage 保持一致）
    let currentLocale = 'zh-CN';
    try {
      const stored = storage.get<string>('locale');
      if (stored === 'zh-CN' || stored === 'en-US') {
        currentLocale = stored;
      }
    } catch {
      // 如果 storage 读取失败，使用默认值
    }

    // 更新 i18n 实例的语言
    const g = i18n.global as any;
    if (typeof g.locale === 'object' && 'value' in g.locale) {
      g.locale.value = currentLocale;
    } else {
      g.locale = currentLocale;
    }

    // 检查 i18n 是否已初始化
    if (!g || !g.te || !g.t) {
      return key;
    }

    // 优先直接访问消息对象，确保能访问到已合并的子应用语言包
    const localeMessages = g.getLocaleMessage(currentLocale) || {};
    if (key in localeMessages) {
      const value = localeMessages[key];
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'function') {
        // Vue I18n 编译时优化，返回函数需要调用
        try {
          return value({ normalize: (arr: any[]) => arr[0] });
        } catch {
          // 如果函数调用失败，继续使用 g.t
        }
      } else if (value !== null && value !== undefined) {
        // 其他类型的值，尝试转换为字符串
        return String(value);
      }
    }

    // 如果直接访问消息对象失败，使用 g.te 和 g.t
    if (g.te(key, currentLocale)) {
      const translated = g.t(key, currentLocale);
      if (translated && typeof translated === 'string' && translated !== key) {
        return translated;
      }
    }

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
        } catch {
          // 如果函数调用失败，继续使用 g.t
        }
      }
    }
    
    if (g.te(key, fallbackLocale)) {
      const translated = g.t(key, fallbackLocale);
      if (translated && typeof translated === 'string' && translated !== key) {
        return translated;
      }
    }

    return key;
  } catch (_error) {
    return key;
  }
}

