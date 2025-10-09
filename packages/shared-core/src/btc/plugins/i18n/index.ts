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
  /**
   * 是否从后端加载语言包
   */
  loadFromApi?: boolean;
  /**
   * API 地址
   */
  apiUrl?: string;
  /**
   * 语言包范围（用于域级隔离）
   * common - 通用翻译
   * logistics - 物流域
   * production - 生产域
   */
  scope?: string;
}

/**
 * 从后端加载语言包
 * @param apiUrl API 地址
 * @param locale 语言
 * @param scope 范围（common/logistics/production）
 */
async function loadRemoteMessages(apiUrl: string, locale: string, scope = 'common') {
  try {
    const cacheKey = `i18n_${scope}_${locale}`;
    const cached = storage.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 支持 scope 参数
    const url = `${apiUrl}?locale=${locale}&scope=${scope}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.code === 2000 && result.data?.messages) {
      // 缓存 1 天
      storage.set(cacheKey, result.data.messages, 86400);
      return result.data.messages;
    }
  } catch (error) {
    console.warn(`[i18n] Failed to load remote messages (${scope}):`, error);
  }
  return {};
}

/**
 * 创建 i18n 插件（混合架构）
 * @param options 配置选项
 * @returns i18n 插件
 */
export function createI18nPlugin(options: I18nPluginOptions = {}) {
  const currentLocale = storage.get<string>('locale') || options.locale || 'zh-CN';

  const i18n = createI18n({
    legacy: false,
    locale: currentLocale,
    fallbackLocale: options.fallbackLocale || 'zh-CN',
    messages: {
      ...messages, // 本地默认语言包（兜底）
      ...options.messages, // 应用自定义语言包
    },
  });

  return {
    name: 'i18n',
    install(app: App) {
      app.use(i18n);

      // 监听语言切换并持久化
      const { locale } = i18n.global;
      if (typeof locale !== 'string') {
        watch(locale, (newLocale: string) => {
          storage.set('locale', newLocale);

          // 如果启用远程加载，切换语言时加载远程语言包
          if (options.loadFromApi && options.apiUrl) {
            loadRemoteMessages(options.apiUrl, newLocale, options.scope).then((remoteMessages) => {
              if (Object.keys(remoteMessages).length > 0) {
                i18n.global.mergeLocaleMessage(newLocale, remoteMessages);
              }
            });
          }
        });
      }

      // 初始化时加载远程语言包
      if (options.loadFromApi && options.apiUrl) {
        loadRemoteMessages(options.apiUrl, currentLocale, options.scope).then((remoteMessages) => {
          if (Object.keys(remoteMessages).length > 0) {
            i18n.global.mergeLocaleMessage(currentLocale, remoteMessages);
          }
        });
      }
    },
    i18n,
  };
}

// 导出 useI18n hook
export { useI18n } from 'vue-i18n';
