import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';

// 动态加载 config.ts 文件
const configFiles = import.meta.glob<{ default: any }>(
  [
    '../../locales/config.ts',
  ],
  { eager: true }
);

const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => Object.assign({}, ...sources.filter(Boolean));

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (typeof target === 'object' && typeof source === 'object' && !Array.isArray(target) && !Array.isArray(source)) {
    Object.keys(source).forEach((key) => {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function flattenObject(obj: any, prefix = '', result: Record<string, string> = {}): Record<string, string> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        flattenObject(value, newKey, result);
      } else if (value !== null && value !== undefined) {
        result[newKey] = String(value);
      }
    }
  }
  return result;
}

function mergeConfigFiles(): { zhCN: Record<string, string>; enUS: Record<string, string> } {
  let mergedZhCN: any = { app: {}, menu: {}, page: {}, common: {} };
  let mergedEnUS: any = { app: {}, menu: {}, page: {}, common: {} };

  for (const path in configFiles) {
    const config = configFiles[path].default;
    if (!config) continue;
    if (config['zh-CN']) {
      mergedZhCN = deepMerge(mergedZhCN, config['zh-CN']);
    }
    if (config['en-US']) {
      mergedEnUS = deepMerge(mergedEnUS, config['en-US']);
    }
  }

  return {
    zhCN: flattenObject(mergedZhCN),
    enUS: flattenObject(mergedEnUS),
  };
}

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';
export const FALLBACK_LOCALE: SupportedLocale = 'zh-CN';

let cachedMessages: Record<'zh-CN' | 'en-US', Record<string, any>> | null = null;

export const getLocaleMessages = (): Record<'zh-CN' | 'en-US', Record<string, any>> => {
  if (import.meta.env.DEV || !cachedMessages) {
    const sharedCoreZhMessages = (sharedCoreZh as any)?.default ?? sharedCoreZh;
    const sharedCoreEnMessages = (sharedCoreEn as any)?.default ?? sharedCoreEn;
    const configMessages = mergeConfigFiles();
    
    const zhCNMessages = mergeMessages(
      sharedCoreZhMessages || {},
      sharedComponentsZh as Record<string, any> || {},
      configMessages.zhCN || {}
    );
    const enUSMessages = mergeMessages(
      sharedCoreEnMessages || {},
      sharedComponentsEn as Record<string, any> || {},
      configMessages.enUS || {}
    );
    
    cachedMessages = {
      'zh-CN': zhCNMessages,
      'en-US': enUSMessages,
    };
  }
  
  return cachedMessages!;
};

export const normalizeLocale = (locale?: string) => {
  if (!locale) return DEFAULT_LOCALE;
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? (locale as SupportedLocale) : DEFAULT_LOCALE;
};

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
