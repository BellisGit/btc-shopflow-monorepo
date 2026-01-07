/**
 * 国际化工具函数
 */

import type { AppLocale } from './types';

const STORAGE_KEY = 'app-locale';

/**
 * 存储当前语言到 localStorage
 */
export function setLocaleToStorage(locale: AppLocale): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale);
  }
}

/**
 * 从 localStorage 获取当前语言
 */
export function getLocaleFromStorage(): AppLocale {
  if (typeof localStorage === 'undefined') {
    return 'zh-CN';
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return isValidLocale(stored) ? stored : 'zh-CN';
}

/**
 * 校验语言是否合法
 */
export function isValidLocale(locale: string | null): locale is AppLocale {
  return locale === 'zh-CN' || locale === 'en-US';
}

