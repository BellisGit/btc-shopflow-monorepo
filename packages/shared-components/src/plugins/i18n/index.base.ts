/**
 * 国际化插件核心逻辑
 */
import { createI18n } from 'vue-i18n';
import type { App } from 'vue';
import { getLocaleFromStorage, type AppLocale, type AppLocaleMessages } from '@btc/shared-components/i18n';
import { globalMessages } from '@btc/shared-components/i18n/locales';

export interface I18nPluginBaseOptions {
  locale?: AppLocale;
  messages?: Record<AppLocale, AppLocaleMessages<any>>;
}

/**
 * 创建 i18n 插件基础实例
 */
export function createI18nPluginBase(options: I18nPluginBaseOptions = {}) {
  const defaultLocale = options.locale || getLocaleFromStorage() || 'zh-CN';
  
  // 合并全局词条和应用自定义词条
  const messages: Record<AppLocale, AppLocaleMessages<any>> = {
    'zh-CN': { ...globalMessages['zh-CN'], ...options.messages?.['zh-CN'] },
    'en-US': { ...globalMessages['en-US'], ...options.messages?.['en-US'] },
  };

  const i18n = createI18n({
    locale: defaultLocale,
    fallbackLocale: 'zh-CN',
    messages,
    legacy: false,
    globalInjection: true,
    fallbackWarn: false,
    missingWarn: false,
  });

  return {
    i18n,
    install(app: App) {
      app.use(i18n);
    },
  };
}

