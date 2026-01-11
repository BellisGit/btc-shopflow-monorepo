/**
 * 创建国际化消息获取器的工厂函数
 * 统一封装各应用 getters.ts 中的重复逻辑
 * 
 * 注意：这是可选工具，各应用可以选择使用统一逻辑，也可以继续使用自己的实现
 */

import { mergeConfigFiles, deepMerge, unflattenObject, mergeMessages } from './locale-utils';
import { createTSync } from './create-tsync';

export type LocaleMessages = Record<'zh-CN' | 'en-US', Record<string, any>>;
export type SupportedLocale = 'zh-CN' | 'en-US';
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';
export const FALLBACK_LOCALE: SupportedLocale = 'zh-CN';

export interface CreateLocaleGettersOptions {
  /**
   * 子应用 ID（用于 registerSubAppI18n）
   */
  appId?: string;
  /**
   * 通过 import.meta.glob 加载的 config.ts 文件
   */
  configFiles: Record<string, { default: any }>;
  /**
   * shared-core 的国际化消息（中文）
   */
  sharedCoreZh: any;
  /**
   * shared-core 的国际化消息（英文）
   */
  sharedCoreEn: any;
  /**
   * shared-components 的国际化消息（中文）
   */
  sharedComponentsZh: any;
  /**
   * shared-components 的国际化消息（英文）
   */
  sharedComponentsEn: any;
  /**
   * 应用级国际化消息（中文，可选，扁平化格式，会自动转换为嵌套格式）
   */
  appZhCN?: Record<string, any>;
  /**
   * 应用级国际化消息（英文，可选，扁平化格式，会自动转换为嵌套格式）
   */
  appEnUS?: Record<string, any>;
  /**
   * 是否在开发环境每次重新合并（默认：true）
   */
  devRefresh?: boolean;
  /**
   * 是否需要 tSync 功能（默认：false）
   * 如果为 true，会在返回的对象中包含 tSync 函数
   */
  needsTSync?: boolean;
  /**
   * 可选的 i18n 实例获取函数（用于复用已有的 i18n 实例，如 system-app 的 getI18nInstance）
   * 仅在 needsTSync 为 true 时生效
   */
  getI18nInstance?: () => any;
  /**
   * 主应用的 i18n 实例的全局 key（用于 main-app 优先使用主应用 i18n）
   * 例如：'__MAIN_APP_I18N__'
   * 仅在 needsTSync 为 true 时生效
   */
  mainAppI18nKey?: string;
}

export interface LocaleGetters {
  /**
   * 获取合并后的国际化消息
   */
  getLocaleMessages: () => LocaleMessages;
  /**
   * 标准化语言代码
   */
  normalizeLocale: (locale?: string) => SupportedLocale;
  /**
   * 清除缓存
   */
  clearLocaleMessagesCache: () => void;
  /**
   * 同步翻译函数（仅在 needsTSync 为 true 时存在）
   */
  tSync?: (key: string) => string;
}

/**
 * 创建国际化消息获取器
 * 
 * @param options 配置选项
 * @returns 返回 getLocaleMessages, normalizeLocale, clearLocaleMessagesCache 函数
 */
export function createLocaleGetters(options: CreateLocaleGettersOptions): LocaleGetters {
  const {
    appId,
    configFiles,
    sharedCoreZh,
    sharedCoreEn,
    sharedComponentsZh,
    sharedComponentsEn,
    appZhCN,
    appEnUS,
    devRefresh = true,
    needsTSync = false,
    getI18nInstance,
    mainAppI18nKey,
  } = options;

  // 注意：注册配置应该在调用此函数之前完成
  // 这样可以避免循环依赖，并让各应用保持对注册过程的控制
  // 示例：
  // import { registerConfigsFromGlob, registerSubAppI18n } from '@btc/shared-core';
  // registerConfigsFromGlob(configFiles);
  // if (typeof window !== 'undefined') {
  //   registerSubAppI18n(appId, configFiles);
  // }

  // 缓存合并结果，避免每次调用都重新合并
  let cachedMessages: LocaleMessages | null = null;

  /**
   * 清除缓存
   */
  const clearLocaleMessagesCache = () => {
    cachedMessages = null;
  };

  /**
   * 获取合并后的国际化消息
   * 统一返回嵌套格式（基于四个正常工作的应用的共同模式）
   */
  const getLocaleMessages = (): LocaleMessages => {
    // 开发环境：根据 devRefresh 选项决定是否每次重新合并
    // 生产环境：使用缓存以提高性能
    if ((devRefresh && import.meta.env.DEV) || !cachedMessages) {
      // 处理 sharedCore 的默认导出（TypeScript 文件使用 export default）
      // Vite 在构建时会处理默认导出，但在开发环境中可能需要手动处理
      const sharedCoreZhMessages = (sharedCoreZh as any)?.default ?? sharedCoreZh;
      const sharedCoreEnMessages = (sharedCoreEn as any)?.default ?? sharedCoreEn;

      // 从 config.ts 文件中合并配置（返回扁平化结构）
      const configMessages = mergeConfigFiles(configFiles);

      // 统一流程：转换为嵌套格式（基于四个正常工作的应用的共同模式）
      // 1. 转换 configMessages 为嵌套格式
      const configMessagesZhCN = configMessages.zhCN ? unflattenObject(configMessages.zhCN) : {};
      const configMessagesEnUS = configMessages.enUS ? unflattenObject(configMessages.enUS) : {};

      // 2. 转换旧 JSON 文件为嵌套格式（如果存在）
      const appZhCNNested = appZhCN ? unflattenObject(appZhCN) : {};
      const appEnUSNested = appEnUS ? unflattenObject(appEnUS) : {};

      // 3. 深度合并所有源（统一顺序：sharedCore -> sharedComponents -> config.ts -> 旧 JSON 文件）
      // 与 admin-app, finance-app, logistics-app 保持一致
      const zhCNMessages = deepMerge(
        deepMerge(
          deepMerge(
            sharedCoreZhMessages || {},
            sharedComponentsZh as Record<string, any> || {}
          ),
          configMessagesZhCN
        ),
        appZhCNNested
      );

      const enUSMessages = deepMerge(
        deepMerge(
          deepMerge(
            sharedCoreEnMessages || {},
            sharedComponentsEn as Record<string, any> || {}
          ),
          configMessagesEnUS
        ),
        appEnUSNested
      );

      // 4. 更新缓存（统一返回嵌套格式）
      cachedMessages = {
        'zh-CN': zhCNMessages,
        'en-US': enUSMessages,
      };
    }

    return cachedMessages!;
  };

  /**
   * 标准化语言代码
   */
  const normalizeLocale = (locale?: string): SupportedLocale => {
    if (!locale) return DEFAULT_LOCALE;
    return (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? (locale as SupportedLocale) : DEFAULT_LOCALE;
  };

  // 如果需要 tSync 功能，创建 tSync 函数
  let tSync: ((key: string) => string) | undefined;
  if (needsTSync) {
    tSync = createTSync({
      getLocaleMessages,
      getI18nInstance,
      mainAppI18nKey,
    });
  }

  return {
    getLocaleMessages,
    normalizeLocale,
    clearLocaleMessagesCache,
    ...(tSync && { tSync }),
  };
}
