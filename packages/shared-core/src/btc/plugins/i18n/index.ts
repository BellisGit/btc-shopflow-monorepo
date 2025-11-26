/* eslint-disable @typescript-eslint/no-explicit-any */
import { createI18n, useI18n as useI18nOriginal } from 'vue-i18n';
import type { App } from 'vue';
import type { Composer } from 'vue-i18n';
import { watch } from 'vue';
import { storage } from '@btc/shared-utils';

// import { buildMessages } from './buildMessages'; // 暂时不使用

// 不再硬编码语言包，改为支持外部传入

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
  // 不再支持别名映射，只使用标准格式：zh-CN, en-US
  function normalizeLocale(loc: string): string {
    return loc;
  }

  const currentLocale = normalizeLocale((storage.get('locale') as string) || options.locale || 'zh-CN');

  // 初始化时也写 cookie（确保服务端能读到）
  if (typeof document !== 'undefined') {
    document.cookie = `locale=${currentLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  // 直接使用传入的 messages（完全类似 cool-admin 的方式）
  const messages = options.messages || {};


  const i18n = createI18n({
    legacy: false,
    globalInjection: true, // 全局注入 $t, $tc, $te, $d, $n 等方法，避免解构时丢失上下文
    locale: currentLocale,
    fallbackLocale: [options.fallbackLocale || 'zh-CN', 'en-US'], // 回退链
    messages, // 直接使用传入的 messages（完全类似 cool-admin）
    missing: (locale, key) => {
      // 丢键时统一埋点/告警，而不是在组件里炸栈
      console.warn(`[i18n] missing key "${key}" in locale ${locale}`);
    },
  });

  // 保存应用自定义语言包，用于后续合并
  const customMessages = options.messages || {};


  // 安全的翻译包装器：始终返回 string，防止 composer 报类型错
  function tSafe(key: string, params?: any): string {
    try {
      if ((i18n.global as any).te(key)) {
        const result = (i18n.global as any).t(key, params);
        return typeof result === 'string' ? result : String(result);
      }
    } catch (error) {
      console.warn('[i18n] Translation error:', error);
    }
    return key;
  }

  return {
    name: 'i18n',
    install(app: App) {
      app.use(i18n as any);

      // 明确挂载 $ts 函数，避免被遮蔽
      app.config.globalProperties.$ts = (key: string, params?: any) => {
        const gp = app.config.globalProperties as any;
        if (!gp.$te(key)) return String(key);
        const v = gp.$t(key, params);
        return typeof v === 'string' ? v : String(key); // ✅ 永远返回字符串
      };
      app.provide('tSafe', tSafe);


      // 监听语言切换并持久化
      const { locale } = i18n.global;
      if (typeof locale !== 'string') {
        watch(() => locale.value, (newLocale: string) => {
          storage.set('locale', newLocale);

          // 同时写 cookie（供服务端读取，实现首帧标题正确）
          document.cookie = `locale=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;

          // 触发自定义事件，通知浏览器标题等更新（同步）
          window.dispatchEvent(new CustomEvent('locale-change', { detail: { locale: newLocale } }));

          // 如果启用远程加载，切换语言时加载远程语言包
          if (options.loadFromApi && options.apiUrl) {
            loadRemoteMessages(options.apiUrl, newLocale, options.scope).then((remoteMessages) => {
              if (Object.keys(remoteMessages).length > 0) {
                // 先合并 API 数据
                i18n.global.mergeLocaleMessage(newLocale, remoteMessages);
                // 再合并应用自定义（确保优先级最高）
                if (customMessages[newLocale]) {
                  i18n.global.mergeLocaleMessage(newLocale, customMessages[newLocale]);
                }
              }
            });
          }
        });
      }

      // 初始化时加载远程语言包
      if (options.loadFromApi && options.apiUrl) {
        loadRemoteMessages(options.apiUrl, currentLocale, options.scope).then((remoteMessages) => {
          if (Object.keys(remoteMessages).length > 0) {
            // 先合并 API 数据
            i18n.global.mergeLocaleMessage(currentLocale, remoteMessages);
            // 再合并应用自定义（确保优先级最高）
            if (customMessages[currentLocale]) {
              i18n.global.mergeLocaleMessage(currentLocale, customMessages[currentLocale]);
            }
          }
        });
      } else {
        // 不使用 API 时，直接合并应用自定义
        Object.keys(customMessages).forEach((lang) => {
          i18n.global.mergeLocaleMessage(lang, customMessages[lang]);
        });
      }
    },
    i18n,
  };
}

// 自定义 useI18n hook
export function useI18n(): Composer {
  return useI18nOriginal();
}

// 带默认值的翻译助手，防止渲染期报错
export function td(_key: string, def: string, _params?: any) {
  // 这里需要从全局 i18n 实例获取，暂时返回默认值
  // 在实际使用时，应该在组件内部通过 useI18n() 获取
  return def;
}

// 导出语言包
export { default as zhCN } from './locales/zh-CN';
export { default as enUS } from './locales/en-US';

// 导出类型安全相关
export type { TypeSafeT } from './type-safe';

