/* eslint-disable @typescript-eslint/no-explicit-any */
import { createI18n } from 'vue-i18n';
import type { App } from 'vue';
import { watch } from 'vue';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import { storage } from '@btc/shared-utils';

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export interface I18nPluginOptions {
  locale?: string;
  fallbackLocale?: string;
  messages?: Record<string, any>;
}

/**
 * 创建 i18n 插件
 * @param options 配置选项
 * @returns i18n 插件
 */
export function createI18nPlugin(options: I18nPluginOptions = {}) {
  const i18n = createI18n({
    legacy: false,
    locale: storage.get<string>('locale') || options.locale || 'zh-CN',
    fallbackLocale: options.fallbackLocale || 'zh-CN',
    messages: {
      ...messages,
      ...options.messages, // 允许应用扩展语言包
    },
  });

  return {
    name: 'i18n',
    install(app: App) {
      app.use(i18n);

      // 监听语言切换并持久化
      const { locale } = i18n.global;
      if (typeof locale !== 'string') {
        // 使用 watch 监听 locale 变化
        watch(locale, (newLocale: string) => {
          storage.set('locale', newLocale);
        });
      }
    },
    i18n,
  };
}

// 导出 useI18n hook
export { useI18n } from 'vue-i18n';
