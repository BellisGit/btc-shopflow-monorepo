import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';
import { registerSubAppI18n, registerConfigsFromGlob } from '@btc/shared-core';

// 动态加载所有 config.ts 文件（应用级和页面级）
const configFiles = import.meta.glob<{ default: any }>(
  [
    '../locales/config.ts',
    '../modules/**/config.ts',
  ],
  { eager: true }
);

// 初始化配置注册表（用于 columns 和 forms）
registerConfigsFromGlob(configFiles);

// 关键：注册子应用的国际化消息获取器，让主应用能够访问子应用的国际化配置
if (typeof window !== 'undefined') {
  registerSubAppI18n('engineering', configFiles);
}

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

