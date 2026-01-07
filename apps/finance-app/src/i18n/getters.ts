import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';

// 动态加载所有 config.ts 文件（应用级和页面级）
// 使用 import.meta.glob 扫描所有 config.ts 文件
const configFiles = import.meta.glob<{ default: any }>(
  [
    '../locales/config.ts',
    '../modules/**/config.ts',
  ],
  { eager: true }
);

// 初始化配置注册表（用于 columns 和 forms）
import { registerConfigsFromGlob } from '@btc/shared-core';
registerConfigsFromGlob(configFiles);

// 优化：使用 Object.assign 的优化版本，避免多次合并
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  return Object.assign({}, ...sources.filter(Boolean));
};

/**
 * 深度合并对象
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 将嵌套对象转换为扁平化对象
 * 支持多层嵌套，如 { app: { loading: { title: "..." } } } -> { "app.loading.title": "..." }
 */
function flattenObject(obj: any, prefix = '', result: Record<string, string> = {}): Record<string, string> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // 递归处理嵌套对象
        flattenObject(value, newKey, result);
      } else if (value !== null && value !== undefined) {
        // 处理字符串值
        result[newKey] = String(value);
      }
    }
  }
  return result;
}

/**
 * 从 config.ts 文件中提取并合并国际化配置
 */
function mergeConfigFiles(): { zhCN: Record<string, string>; enUS: Record<string, string> } {
  let mergedZhCN: any = {
    app: {},
    menu: {},
    page: {},
  };
  let mergedEnUS: any = {
    app: {},
    menu: {},
    page: {},
  };

  // 遍历所有加载的 config.ts 文件
  for (const path in configFiles) {
    const config = configFiles[path].default;
    if (!config) continue;

    // 处理应用级配置（src/locales/config.ts）
    // 应用级配置格式：{ 'zh-CN': { app: {...}, menu: {...}, page: {...} }, 'en-US': {...} }
    if (path.includes('/locales/config.ts')) {
      if (config['zh-CN']) {
        mergedZhCN = deepMerge(mergedZhCN, config['zh-CN']);
      }
      if (config['en-US']) {
        mergedEnUS = deepMerge(mergedEnUS, config['en-US']);
      }
    } else {
      // 处理页面级配置（src/modules/**/config.ts）
      // 页面级配置格式：{ locale: { page: {...} }, columns?: {...}, forms?: {...} }
      const localeConfig = config.locale;
      
      if (localeConfig) {
        // 页面级配置通常只包含 page 配置，但可能也包含 app 和 menu（用于覆盖）
        if (localeConfig.app) {
          mergedZhCN.app = deepMerge(mergedZhCN.app, localeConfig.app);
          mergedEnUS.app = deepMerge(mergedEnUS.app, localeConfig.app || {});
        }
        if (localeConfig.menu) {
          mergedZhCN.menu = deepMerge(mergedZhCN.menu, localeConfig.menu);
          mergedEnUS.menu = deepMerge(mergedEnUS.menu, localeConfig.menu || {});
        }
        if (localeConfig.page) {
          mergedZhCN.page = deepMerge(mergedZhCN.page, localeConfig.page);
          // 页面级配置通常只有中文，如果需要英文可以扩展
          // 暂时使用中文配置作为英文的占位符
          mergedEnUS.page = deepMerge(mergedEnUS.page, localeConfig.page || {});
        }
      }
    }
  }

  // 转换为扁平化结构
  return {
    zhCN: flattenObject(mergedZhCN),
    enUS: flattenObject(mergedEnUS),
  };
}

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';
export const FALLBACK_LOCALE: SupportedLocale = 'zh-CN';

// 缓存合并结果，避免每次调用都重新合并
type LocaleMessages = Record<'zh-CN' | 'en-US', Record<string, any>>;
let cachedMessages: LocaleMessages | null = null;

// 清除缓存（开发环境使用，确保获取最新消息）
export const clearLocaleMessagesCache = () => {
  cachedMessages = null;
};

export const getLocaleMessages = (): LocaleMessages => {
  // 开发环境：每次都重新合并，确保包含最新的国际化文件
  // 生产环境：使用缓存以提高性能
  if (import.meta.env.DEV || !cachedMessages) {
    // 合并消息（每次都重新合并，确保包含最新的国际化文件）
    // 合并顺序：sharedCore -> sharedComponents -> config.ts (应用级+页面级) -> 旧的 JSON 文件（兼容）
    // 后面的会覆盖前面的
  
    // 处理 sharedCore 的默认导出（TypeScript 文件使用 export default）
    // Vite 在构建时会处理默认导出，但在开发环境中可能需要手动处理
    const sharedCoreZhMessages = (sharedCoreZh as any)?.default ?? sharedCoreZh;
    const sharedCoreEnMessages = (sharedCoreEn as any)?.default ?? sharedCoreEn;
    
    // 从 config.ts 文件中合并配置
    const configMessages = mergeConfigFiles();
    
    // 确保所有源都是对象
    const zhCNMessages = mergeMessages(
      sharedCoreZhMessages || {},
      sharedComponentsZh as Record<string, any> || {},
      configMessages.zhCN || {}, // 从 config.ts 合并的配置
      zhCN || {} // 旧的 JSON 文件（兼容，逐步迁移）
    );
    const enUSMessages = mergeMessages(
      sharedCoreEnMessages || {},
      sharedComponentsEn as Record<string, any> || {},
      configMessages.enUS || {}, // 从 config.ts 合并的配置
      enUS || {} // 旧的 JSON 文件（兼容，逐步迁移）
    );
    
    // 更新缓存
    cachedMessages = {
      'zh-CN': zhCNMessages,
      'en-US': enUSMessages,
    };
  }
  
  return cachedMessages!;
};

export const normalizeLocale = (locale?: string) => {
  if (!locale) return DEFAULT_LOCALE;
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? (locale as SupportedLocale) : DEFAULT_LOCALE;
};

