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
import { registerConfigsFromGlob, registerSubAppI18n } from '@btc/shared-core';
registerConfigsFromGlob(configFiles);

// 关键：注册子应用的国际化消息获取器，让主应用能够访问子应用的国际化配置
// 使用 getLocaleMessages 函数来注册，确保返回完整的国际化消息（包含所有合并后的消息）
if (typeof window !== 'undefined') {
  // 创建一个包装函数，使用 getLocaleMessages 来获取完整的国际化消息
  const getLocaleMessagesWrapper = () => getLocaleMessages();
  
  // 注册到全局
  if (!(window as any).__SUBAPP_I18N_GETTERS__) {
    (window as any).__SUBAPP_I18N_GETTERS__ = new Map();
  }
  (window as any).__SUBAPP_I18N_GETTERS__.set('finance', getLocaleMessagesWrapper);
  
  // 同时调用 registerSubAppI18n 以保持兼容性（虽然它不会被使用，因为我们已经直接注册了）
  // registerSubAppI18n('finance', configFiles, {
  //   'zh-CN': zhCN as Record<string, any>,
  //   'en-US': enUS as Record<string, any>,
  // });
}

// 优化：使用 Object.assign 的优化版本，避免多次合并
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  return Object.assign({}, ...sources.filter(Boolean));
};

/**
 * 将扁平化对象转换为嵌套对象
 * 支持点号分隔的键，如 { "app.loading.title": "..." } -> { app: { loading: { title: "..." } } }
 */
function unflattenObject(flat: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in flat) {
    if (Object.prototype.hasOwnProperty.call(flat, key)) {
      const keys = key.split('.');
      let current = result;
      
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
    
    // 将扁平化的 configMessages 转换为嵌套对象
    const configMessagesZhCN = unflattenObject(configMessages.zhCN || {});
    const configMessagesEnUS = unflattenObject(configMessages.enUS || {});
    
    // 旧的 JSON 文件也是扁平化键，需要先转换为嵌套结构
    const zhCNUnflattened = unflattenObject(zhCN as Record<string, any> || {});
    const enUSUnflattened = unflattenObject(enUS as Record<string, any> || {});
    
    // 合并所有语言包（使用深度合并，确保嵌套对象正确合并）
    // 合并顺序：sharedCore -> sharedComponents -> config.ts (应用级+页面级) -> 旧的 JSON 文件（兼容）
    const zhCNMessages = deepMerge(
      deepMerge(
        deepMerge(
          sharedCoreZhMessages || {},
          sharedComponentsZh as Record<string, any> || {}
        ),
        configMessagesZhCN // 从 config.ts 合并的配置（已转换为嵌套结构）
      ),
      zhCNUnflattened // 旧的 JSON 文件（已转换为嵌套结构）
    );
    const enUSMessages = deepMerge(
      deepMerge(
        deepMerge(
          sharedCoreEnMessages || {},
          sharedComponentsEn as Record<string, any> || {}
        ),
        configMessagesEnUS // 从 config.ts 合并的配置（已转换为嵌套结构）
      ),
      enUSUnflattened // 旧的 JSON 文件（已转换为嵌套结构）
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

// 创建一个独立的 i18n 实例用于同步翻译（保留原有的 tSync 函数）
import { createI18n } from 'vue-i18n';
const normalizedMessages = getLocaleMessages();

const i18n = createI18n({
  legacy: false,
  globalInjection: false,
  locale: 'zh-CN',
  fallbackLocale: ['zh-CN', 'en-US'],
  messages: normalizedMessages
});

export function tSync(key: string): string {
  try {
    const currentLocale = localStorage.getItem('locale') || 'zh-CN';
    i18n.global.locale.value = currentLocale as any;
    const g = i18n.global as any;

    if (!g || !g.te) {
      return key;
    }

    const localeMessages = g.getLocaleMessage(currentLocale) || {};
    if (localeMessages[key]) {
      const value = localeMessages[key];
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'function') {
        try {
          return value({ normalize: (arr: any[]) => arr[0] });
        } catch (_error) {
          return key;
        }
      }
    }

    if (g.te(key)) {
      return String(g.t(key));
    } else {
      const fallbackLocale = currentLocale === 'zh-CN' ? 'en-US' : 'zh-CN';
      const fallbackMessages = g.getLocaleMessage(fallbackLocale) || {};
      if (fallbackMessages[key]) {
        const value = fallbackMessages[key];
        if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'function') {
          try {
            return value({ normalize: (arr: any[]) => arr[0] });
          } catch (_error) {
            return key;
          }
        }
      }
      return key;
    }
  } catch (_error) {
    return key;
  }
}
