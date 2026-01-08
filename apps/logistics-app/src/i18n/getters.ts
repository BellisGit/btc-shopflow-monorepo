// 使用动态导入避免同步加载大量 JSON 文件，优化初始化性能
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';
import { registerSubAppI18n, registerConfigsFromGlob } from '@btc/shared-core';

// 动态加载所有 config.ts 文件（应用级和页面级）
const configFiles = import.meta.glob<{ default: any }>(
  [
    '../locales/config.ts',
    '../modules/**/config.ts',
  ],
  { eager: true }
);

// 初始化配置注册表（用于 columns 和 forms）
registerConfigsFromGlob(configFiles);

// 关键：注册子应用的国际化消息获取器，让主应用能够访问子应用的国际化配置
// 使用 registerSubAppI18n 统一注册，与 admin-app 保持一致
// registerSubAppI18n 会从 configFiles 中提取国际化配置，并合并 additionalMessages（JSON 文件）
if (typeof window !== 'undefined') {
  registerSubAppI18n('logistics', configFiles, {
    'zh-CN': zhCN as Record<string, any>,
    'en-US': enUS as Record<string, any>,
  });
}

// 优化：使用 Object.assign 的优化版本，避免多次合并
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  // 使用展开运算符和 Object.assign 的组合，性能更好
  return Object.assign({}, ...sources.filter(Boolean));
};

/**
 * 将扁平化对象转换为嵌套对象
 * 支持点号分隔的键，如 { "app.loading.title": "..." } -> { app: { loading: { title: "..." } } }
 * 注意：如果扁平化键已经包含顶级键（如 "common.xxx"），转换为嵌套对象时不应该再创建额外的层级
 */
function unflattenObject(flat: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in flat) {
    if (Object.prototype.hasOwnProperty.call(flat, key)) {
      const keys = key.split('.');
      let current = result;
      
      // 如果第一个键是 'common'、'app'、'menu' 等顶级键，直接从这些键开始构建嵌套结构
      // 这样避免了在已有的嵌套结构基础上再次创建嵌套层级
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k];
      }
      
      current[keys[keys.length - 1]] = flat[key];
    }
  }
  
  return result;
}

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
  // 如果 obj 本身是字符串，直接设置
  if (typeof obj === 'string' && prefix) {
    result[prefix] = obj;
    return result;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // 如果对象包含 '_' 键，将其值设置为父键的值
        if ('_' in value && typeof value._ === 'string') {
          result[newKey] = value._;
        }
        // 递归处理嵌套对象（跳过 '_' 键）
        for (const subKey in value) {
          if (subKey !== '_' && Object.prototype.hasOwnProperty.call(value, subKey)) {
            flattenObject(value[subKey], `${newKey}.${subKey}`, result);
          }
        }
      } else if (value !== null && value !== undefined) {
        // 处理各种类型的值
        if (typeof value === 'string') {
          result[newKey] = value;
        } else if (typeof value === 'function') {
          // Vue I18n 编译时优化，某些消息会被编译为函数
          // 优先从 loc.source 获取原始消息模板（最可靠的方法，避免复杂的函数调用）
          const locSource = (value as any).loc?.source;
          if (typeof locSource === 'string') {
            result[newKey] = locSource;
          } else {
            // 如果没有 loc.source，尝试从其他可能的属性获取
            const possibleSources = [
              (value as any).source,
              (value as any).message,
              (value as any).template,
            ];

            const source = possibleSources.find(s => typeof s === 'string');
            if (source) {
              result[newKey] = source;
            } else {
              // 如果所有方法都失败，静默跳过（这些是包含命名参数的消息，运行时会被正确翻译）
              // 不打印警告，因为这些消息在运行时会被 Vue I18n 正确处理
            }
          }
        } else {
          // 其他类型转换为字符串
          result[newKey] = String(value);
        }
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
    common: {},
  };
  let mergedEnUS: any = {
    app: {},
    menu: {},
    page: {},
    common: {},
  };

  // 遍历所有加载的 config.ts 文件
  for (const path in configFiles) {
    const config = configFiles[path].default;
    if (!config) continue;

    // 处理应用级配置（src/locales/config.ts）
    // 应用级配置格式：{ 'zh-CN': { app: {...}, menu: {...}, page: {...}, common: {...} }, 'en-US': {...} }
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
        // 页面级配置通常只包含 page 配置，但可能也包含 app、menu 和 common（用于覆盖）
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
        if (localeConfig.common) {
          mergedZhCN.common = deepMerge(mergedZhCN.common, localeConfig.common);
          mergedEnUS.common = deepMerge(mergedEnUS.common, localeConfig.common || {});
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

export const getLocaleMessages = (): LocaleMessages => {
  // 开发环境：每次都重新合并，确保包含最新的国际化文件
  // 生产环境：使用缓存以提高性能
  if (import.meta.env.DEV || !cachedMessages) {
    // 处理 sharedCore 的默认导出（TypeScript 文件使用 export default）
    // Vite 在构建时会处理默认导出，但在开发环境中可能需要手动处理
    const sharedCoreZhMessages = (sharedCoreZh as any)?.default ?? sharedCoreZh;
    const sharedCoreEnMessages = (sharedCoreEn as any)?.default ?? sharedCoreEn;

    // 从 config.ts 文件中合并配置
    const configMessages = mergeConfigFiles();

    // 确保所有源都是对象
    // 注意：与 admin-app 和 system-app 保持一致，返回扁平化对象
    // registerSubAppI18n 内部会处理格式转换
    const zhCNMessages = mergeMessages(
      sharedCoreZhMessages || {},
      sharedComponentsZh as Record<string, any> || {},
      configMessages.zhCN || {}, // 从 config.ts 合并的配置（扁平化）
      zhCN || {} // 旧的 JSON 文件（兼容，逐步迁移）
    );
    const enUSMessages = mergeMessages(
      sharedCoreEnMessages || {},
      sharedComponentsEn as Record<string, any> || {},
      configMessages.enUS || {}, // 从 config.ts 合并的配置（扁平化）
      enUS || {} // 旧的 JSON 文件（兼容，逐步迁移）
    );

    // 更新缓存（与 admin-app 和 system-app 保持一致，返回扁平化格式）
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

