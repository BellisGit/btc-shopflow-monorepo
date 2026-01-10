// 使用动态导入避免同步加载大量 JSON 文件，优化初始化性能
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';
import { registerSubAppI18n, registerConfigsFromGlob } from '@btc/shared-core';

// 动态加载所有 config.ts 文件（应用级和页面级，如果存在）
const configFiles = import.meta.glob<{ default: any }>(
  [
    '../locales/config.ts',
    '../modules/**/config.ts',
  ],
  { eager: true }
);

// 初始化配置注册表（用于 columns 和 forms，如果存在）
if (Object.keys(configFiles).length > 0) {
  registerConfigsFromGlob(configFiles);
  
  // 关键：注册子应用的国际化消息获取器，让主应用能够访问子应用的国际化配置
  if (typeof window !== 'undefined') {
    registerSubAppI18n('operations', configFiles);
  }
}

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

