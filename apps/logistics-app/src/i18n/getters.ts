// 使用动态导入避免同步加载大量 JSON 文件，优化初始化性能
// @ts-expect-error TS6307 - 共享核心 locale 文件不在当前项目的文件列表中，但运行时可用
import sharedCoreZh from '../../../../packages/shared-core/src/btc/plugins/i18n/locales/zh-CN';
// @ts-expect-error TS6307 - 共享核心 locale 文件不在当前项目的文件列表中，但运行时可用
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

