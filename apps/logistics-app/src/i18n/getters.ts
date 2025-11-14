import sharedCoreZh from '@btc/shared-core/btc/plugins/i18n/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/btc/plugins/i18n/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';

const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => Object.assign({}, ...sources);

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';
export const FALLBACK_LOCALE: SupportedLocale = 'zh-CN';

export const getLocaleMessages = () => ({
  'zh-CN': mergeMessages(sharedCoreZh, sharedComponentsZh as Record<string, any>, zhCN),
  'en-US': mergeMessages(sharedCoreEn, sharedComponentsEn as Record<string, any>, enUS),
});

export const normalizeLocale = (locale?: string) => {
  if (!locale) return DEFAULT_LOCALE;
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? (locale as SupportedLocale) : DEFAULT_LOCALE;
};

