/**
 * i18n 初始化函数
 */
import { createI18n, type I18nOptions } from 'vue-i18n';
import type { AppLocale, AppLocaleMessages } from './types';
import { globalMessages } from './locales';

/**
 * 通用 i18n 初始化函数（基座/子应用均可调用）
 * @param locale 默认语言
 * @param appMessages 子应用扩展的业务词条（可选）
 */
export function createAppI18n<T extends Record<string, any> = Record<string, never>>(
  locale: AppLocale = 'zh-CN',
  appMessages?: Record<AppLocale, AppLocaleMessages<T>>
): ReturnType<typeof createI18n> {
  // 合并全局词条 + 子应用业务词条
  const messages: Record<AppLocale, AppLocaleMessages<T>> = {
    'zh-CN': { ...globalMessages['zh-CN'], ...(appMessages?.['zh-CN'] || {}) } as AppLocaleMessages<T>,
    'en-US': { ...globalMessages['en-US'], ...(appMessages?.['en-US'] || {}) } as AppLocaleMessages<T>,
  };

  const options: I18nOptions = {
    locale,
    fallbackLocale: 'zh-CN', // 语言缺失时回退到中文
    messages,
    legacy: false, // 启用 Composition API
    globalInjection: true, // 全局注入 $t 等方法
    fallbackWarn: false,
    missingWarn: false,
  };

  return createI18n(options);
}

