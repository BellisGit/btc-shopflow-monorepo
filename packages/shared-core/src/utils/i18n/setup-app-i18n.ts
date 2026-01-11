/**
 * 应用级国际化设置函数
 * 进一步简化各应用 getters.ts 的样板代码
 * 
 * 此函数自动处理：
 * 1. 注册配置（registerConfigsFromGlob）
 * 2. 注册子应用国际化（registerSubAppI18n）
 * 3. 创建 getters（createLocaleGetters）
 * 
 * 使用此函数后，应用的 getters.ts 可以简化为：
 * - 使用 import.meta.glob 加载 config.ts 文件
 * - 调用 setupAppI18n 并传入 appId、configFiles、语言包等配置
 * - 导出返回的 getLocaleMessages、normalizeLocale、clearLocaleMessagesCache 等函数
 */

import { createLocaleGetters } from './create-locale-getters';
import type { CreateLocaleGettersOptions, LocaleGetters } from './create-locale-getters';
import { registerConfigsFromGlob } from '../config-loader';
import { registerSubAppI18n } from '../../composables/subapp-i18n/registerSubAppI18n';

export interface SetupAppI18nOptions extends Omit<CreateLocaleGettersOptions, 'appId'> {
  /**
   * 子应用 ID（用于 registerSubAppI18n）
   * 如果提供，会自动调用 registerSubAppI18n
   */
  appId?: string;
  /**
   * 是否自动注册配置（默认：true）
   * 如果为 false，需要手动调用 registerConfigsFromGlob
   */
  autoRegisterConfigs?: boolean;
  /**
   * 是否自动注册子应用国际化（默认：true，仅在 appId 存在时生效）
   * 如果为 false，需要手动调用 registerSubAppI18n
   */
  autoRegisterSubAppI18n?: boolean;
}

/**
 * 设置应用级国际化
 * 自动处理配置注册和子应用国际化注册
 * 
 * @param options 配置选项
 * @returns 返回 getLocaleMessages, normalizeLocale, clearLocaleMessagesCache, tSync 等函数
 */
export function setupAppI18n(options: SetupAppI18nOptions): LocaleGetters {
  const {
    appId,
    configFiles,
    autoRegisterConfigs = true,
    autoRegisterSubAppI18n = true,
    ...restOptions
  } = options;

  // 自动注册配置（如果启用）
  if (autoRegisterConfigs && Object.keys(configFiles).length > 0) {
    registerConfigsFromGlob(configFiles);
  }

  // 自动注册子应用国际化（如果启用且 appId 存在）
  if (autoRegisterSubAppI18n && appId && typeof window !== 'undefined') {
    registerSubAppI18n(appId, configFiles);
  }

  // 创建 getters（包含所有逻辑）
  return createLocaleGetters({
    appId,
    configFiles,
    ...restOptions,
  });
}
