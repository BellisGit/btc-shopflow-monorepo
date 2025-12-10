import sharedCoreZh from '../../../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN';
import sharedCoreEn from '../../../../packages/shared-core/src/btc/plugins/i18n/locales/en-US';
import sharedComponentsZh from '../../../../packages/shared-components/src/locales/zh-CN.json';
import sharedComponentsEn from '../../../../packages/shared-components/src/locales/en-US.json';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';
import baseZhCN from '../modules/base/locales/zh-CN.json';
import baseEnUS from '../modules/base/locales/en-US.json';

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

// 清除缓存（开发环境使用，确保获取最新消息）
export const clearLocaleMessagesCache = () => {
  cachedMessages = null;
};

export const getLocaleMessages = (): LocaleMessages => {
  // 开发环境：每次都重新合并，确保包含最新的国际化文件
  // 生产环境：使用缓存以提高性能
  if (import.meta.env.DEV || !cachedMessages) {
    // 合并消息（每次都重新合并，确保包含最新的国际化文件）
    // 合并顺序：sharedCore -> sharedComponents -> app locales -> base locales
    // 后面的会覆盖前面的，所以 baseZhCN 会覆盖 sharedCoreZh 中的相同键
    // 但两个文件都应该有相同的键，所以这应该没问题
  
  // 处理 sharedCore 的默认导出（TypeScript 文件使用 export default）
  // Vite 在构建时会处理默认导出，但在开发环境中可能需要手动处理
  const sharedCoreZhMessages = (sharedCoreZh as any)?.default ?? sharedCoreZh;
  const sharedCoreEnMessages = (sharedCoreEn as any)?.default ?? sharedCoreEn;
  
  // 确保所有源都是对象
  const zhCNMessages = mergeMessages(
    sharedCoreZhMessages || {},
    sharedComponentsZh as Record<string, any> || {},
    zhCN || {},
    baseZhCN || {}
  );
  const enUSMessages = mergeMessages(
    sharedCoreEnMessages || {},
    sharedComponentsEn as Record<string, any> || {},
    enUS || {},
    baseEnUS || {}
  );
  
  // 开发环境调试：验证关键键是否存在
  if (import.meta.env.DEV) {
    const testKey = 'menu.test_features.inventory_ticket_print';
    if (!zhCNMessages[testKey]) {
      console.error(`[i18n] Key "${testKey}" not found in zhCNMessages after merge`);
      console.log('Available keys containing "inventory_ticket":', Object.keys(zhCNMessages).filter(k => k.includes('inventory_ticket')));
      console.log('baseZhCN has key?', testKey in baseZhCN);
      console.log('sharedCoreZhMessages has key?', testKey in sharedCoreZhMessages);
      console.log('sharedCoreZh type:', typeof sharedCoreZh, 'has default?', 'default' in (sharedCoreZh as any));
    }
    if (!enUSMessages[testKey]) {
      console.error(`[i18n] Key "${testKey}" not found in enUSMessages after merge`);
      console.log('Available keys containing "inventory_ticket":', Object.keys(enUSMessages).filter(k => k.includes('inventory_ticket')));
      console.log('baseEnUS has key?', testKey in baseEnUS);
      console.log('sharedCoreEnMessages has key?', testKey in sharedCoreEnMessages);
      console.log('sharedCoreEn type:', typeof sharedCoreEn, 'has default?', 'default' in (sharedCoreEn as any));
    }
  }
  
    // 更新缓存（与物流域和财务域保持一致，只返回标准格式）
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
