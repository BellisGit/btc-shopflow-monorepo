import { setupAppI18n, SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE, loadFlatI18nMessages } from '@btc/shared-core';
import type { SupportedLocale, LocaleMessages } from '@btc/shared-core';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';
// 导入新的共享和领域翻译
import { common, crud, theme, auth, app } from '../../../../locales/shared';
import { warehouse } from '../../../../locales/domains';
import { logistics } from '../../../../locales/apps';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';

const configFiles = import.meta.glob<{ default: any }>(['../locales/config.ts', '../modules/**/config.ts'], { eager: true });

// 使用新的扁平加载器加载共享翻译
const sharedMessages = loadFlatI18nMessages([
  common,
  crud,
  theme,
  auth,
  app,
  warehouse,
  logistics,
]);

// 合并共享翻译到应用翻译中（共享翻译优先级更高）
const mergedAppZhCN = { ...sharedMessages['zh-CN'], ...zhCN };
const mergedAppEnUS = { ...sharedMessages['en-US'], ...enUS };

export const { getLocaleMessages, normalizeLocale, clearLocaleMessagesCache } = setupAppI18n({
  appId: 'logistics',
  configFiles,
  sharedCoreZh,
  sharedCoreEn,
  sharedComponentsZh,
  sharedComponentsEn,
  appZhCN: mergedAppZhCN,
  appEnUS: mergedAppEnUS,
});

export type { SupportedLocale, LocaleMessages };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE };
