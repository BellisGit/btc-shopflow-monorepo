import sharedCoreZh from '../../../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN';
import sharedCoreEn from '../../../../packages/shared-core/src/btc/plugins/i18n/locales/en-US';
import sharedComponentsZh from '../../../../packages/shared-components/src/locales/zh-CN.json';
import sharedComponentsEn from '../../../../packages/shared-components/src/locales/en-US.json';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';

// 优化：使用 Object.assign 的优化版本，避免多次合并
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  // 使用展开运算符和 Object.assign 的组合，性能更好
  return Object.assign({}, ...sources.filter(Boolean));
};

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';
export const FALLBACK_LOCALE: SupportedLocale = 'zh-CN';

// 缓存合并结果，避免每次调用都重新合并
type LocaleMessages = Record<'zh-CN' | 'en-US', Record<string, any>>;
let cachedMessages: LocaleMessages | null = null;

export const getLocaleMessages = (): LocaleMessages => {
  // 使用缓存，避免重复合并
  if (cachedMessages) {
    return cachedMessages;
  }
  
  cachedMessages = {
  'zh-CN': mergeMessages(sharedCoreZh, sharedComponentsZh as Record<string, any>, zhCN),
  'en-US': mergeMessages(sharedCoreEn, sharedComponentsEn as Record<string, any>, enUS),
  };
  
  return cachedMessages;
};

export const normalizeLocale = (locale?: string) => {
  if (!locale) return DEFAULT_LOCALE;
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? (locale as SupportedLocale) : DEFAULT_LOCALE;
};

// 创建一个独立的 i18n 实例用于路由标题（保留原有的 tSync 函数）
import { createI18n } from 'vue-i18n';
const normalizedMessages = getLocaleMessages();

const i18n = createI18n({
  legacy: false,
  globalInjection: false,
  locale: 'zh-CN',
  fallbackLocale: ['zh-CN', 'en-US'],
  messages: normalizedMessages
});

export function tSync(key: string): string {
  try {
    const currentLocale = localStorage.getItem('locale') || 'zh-CN';
    i18n.global.locale.value = currentLocale as any;
    const g = i18n.global as any;

    if (!g || !g.te) {
      return key;
    }

    const localeMessages = g.getLocaleMessage(currentLocale) || {};
    if (localeMessages[key]) {
      const value = localeMessages[key];
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

    if (g.te(key)) {
      return String(g.t(key));
    } else {
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
