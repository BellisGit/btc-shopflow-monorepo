import { setupAppI18n, SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE, mergeMessages, createTSync } from '@btc/shared-core';
import type { SupportedLocale, LocaleMessages } from '@btc/shared-core';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedLocalesZhCN from '@btc/shared-components/locales/zh-CN.json';
import sharedLocalesEnUS from '@btc/shared-components/locales/en-US.json';
import messages from '@intlify/unplugin-vue-i18n/messages';
import overviewZhCN from '../modules/overview/locales/zh-CN.json';
import overviewEnUS from '../modules/overview/locales/en-US.json';

const configFiles = {};

const { getLocaleMessages: getLocaleMessagesBase, normalizeLocale, clearLocaleMessagesCache } = setupAppI18n({
  configFiles,
  sharedCoreZh,
  sharedCoreEn,
  sharedComponentsZh: sharedLocalesZhCN,
  sharedComponentsEn: sharedLocalesEnUS,
  appZhCN: overviewZhCN,
  appEnUS: overviewEnUS,
  autoRegisterConfigs: false,
  autoRegisterSubAppI18n: false,
});

export const getLocaleMessages = (): LocaleMessages => {
  const baseMessages = getLocaleMessagesBase();
  const unpluginMessages = messages as Record<string, any>;
  if (unpluginMessages && typeof unpluginMessages === 'object') {
    return {
      'zh-CN': mergeMessages(baseMessages['zh-CN'], unpluginMessages['zh-CN'] || {}),
      'en-US': mergeMessages(baseMessages['en-US'], unpluginMessages['en-US'] || {}),
    };
  }
  return baseMessages;
};

export { normalizeLocale, clearLocaleMessagesCache };
export type { SupportedLocale, LocaleMessages };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE };

export const tSync = createTSync({ getLocaleMessages, mainAppI18nKey: '__MAIN_APP_I18N__' });
