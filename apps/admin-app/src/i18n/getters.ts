import { storage } from '@btc/shared-utils';
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

// 优化：使用 Object.assign 的优化版本，避免多次合并
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  // 使用展开运算符和 Object.assign 的组合，性能更好
  const merged = Object.assign({}, ...sources.filter(Boolean));

  // 处理函数值：如果值是函数（Vue I18n 编译后的消息函数），调用它获取字符串
  const cleaned: any = {};
  for (const key in merged) {
    const value = merged[key];
    if (typeof value === 'function') {
      // Vue I18n 编译时优化，某些消息会被编译为函数
      // 优先从 loc.source 获取原始消息模板（最可靠的方法，避免复杂的函数调用）
      const locSource = (value as any).loc?.source;
      if (typeof locSource === 'string') {
        cleaned[key] = locSource;
      } else {
        // 如果没有 loc.source，尝试从其他可能的属性获取
        const possibleSources = [
          (value as any).source,
          (value as any).message,
          (value as any).template,
        ];

        const source = possibleSources.find(s => typeof s === 'string');
        if (source) {
          cleaned[key] = source;
        }
        // 如果所有方法都失败，静默跳过（这些是包含命名参数的消息，运行时会被正确翻译）
      }
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned as T;
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
  // 如果 obj 本身是字符串，直接设置
  if (typeof obj === 'string' && prefix) {
    result[prefix] = obj;
    return result;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      // 如果当前键是 'subapp'，且值是对象，需要特殊处理其子属性（扁平结构）
      if (key === 'subapp' && value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // 递归处理 subapp 对象的子属性，使用 'subapp' 作为前缀
        flattenObject(value, 'subapp', result);
        continue;
      }

      // 对于 subapp 对象的子属性（prefix === 'subapp'），如果值已经是字符串，直接设置（扁平结构）
      if (prefix === 'subapp' && typeof value === 'string') {
        result[newKey] = value;
        continue;
      }

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
  // 直接使用扁平化结构存储，避免多次转换
  let flatZhCN: Record<string, string> = {};
  let flatEnUS: Record<string, string> = {};

  // 遍历所有加载的 config.ts 文件
  for (const path in configFiles) {
    const config = configFiles[path].default;
    if (!config) continue;

    // 处理应用级配置（src/locales/config.ts）
    // 应用级配置格式：{ 'zh-CN': { app: {...}, menu: {...}, page: {...} }, 'en-US': {...} }
    if (path.includes('/locales/config.ts')) {
      if (config['zh-CN']) {
        const flat = flattenObject(config['zh-CN']);
        flatZhCN = { ...flatZhCN, ...flat };
      }
      if (config['en-US']) {
        const flat = flattenObject(config['en-US']);
        flatEnUS = { ...flatEnUS, ...flat };
      }
    } else {
      // 处理模块级配置（src/modules/**/config.ts）
      const localeConfig = config.locale;

      if (localeConfig) {
        // 检查是否是扁平结构（包含 'zh-CN' 和 'en-US' 键）
        if (localeConfig['zh-CN'] || localeConfig['en-US']) {
          // 扁平结构：localeConfig['zh-CN'] 已经是扁平化的键值对，直接合并
          if (localeConfig['zh-CN']) {
            flatZhCN = { ...flatZhCN, ...localeConfig['zh-CN'] };
          }
          if (localeConfig['en-US']) {
            flatEnUS = { ...flatEnUS, ...localeConfig['en-US'] };
          }
        } else {
          // 旧格式：嵌套结构（兼容处理）
          // 先转换为嵌套结构，再扁平化
          let nestedZhCN: any = {};
          let nestedEnUS: any = {};
          
          // 页面级配置可能包含 app 和 menu（用于覆盖）
          if (localeConfig.app) {
            nestedZhCN.app = deepMerge(nestedZhCN.app || {}, localeConfig.app);
            nestedEnUS.app = deepMerge(nestedEnUS.app || {}, localeConfig.app || {});
          }
          if (localeConfig.menu) {
            nestedZhCN.menu = deepMerge(nestedZhCN.menu || {}, localeConfig.menu);
            nestedEnUS.menu = deepMerge(nestedEnUS.menu || {}, localeConfig.menu || {});
          }
          // 将模块配置直接合并到顶层（不再使用 page 层级）
          // localeConfig 中除了 app 和 menu 之外的所有键都是模块配置
          for (const key in localeConfig) {
            if (key !== 'app' && key !== 'menu' && key !== 'page') {
              // 直接合并模块配置到顶层
              if (!nestedZhCN[key]) {
                nestedZhCN[key] = {};
              }
              if (!nestedEnUS[key]) {
                nestedEnUS[key] = {};
              }
              nestedZhCN[key] = deepMerge(nestedZhCN[key], localeConfig[key]);
              nestedEnUS[key] = deepMerge(nestedEnUS[key], localeConfig[key] || {});
            }
          }
          // 兼容旧格式：如果还有 page 层级，也处理（逐步迁移）
          if (localeConfig.page) {
            // 将 page 下的内容直接合并到顶层
            for (const moduleKey in localeConfig.page) {
              if (!nestedZhCN[moduleKey]) {
                nestedZhCN[moduleKey] = {};
              }
              if (!nestedEnUS[moduleKey]) {
                nestedEnUS[moduleKey] = {};
              }
              nestedZhCN[moduleKey] = deepMerge(nestedZhCN[moduleKey], localeConfig.page[moduleKey]);
              nestedEnUS[moduleKey] = deepMerge(nestedEnUS[moduleKey], localeConfig.page[moduleKey] || {});
            }
          }
          
          // 扁平化嵌套结构并合并
          const flat = flattenObject(nestedZhCN);
          flatZhCN = { ...flatZhCN, ...flat };
          const flatEn = flattenObject(nestedEnUS);
          flatEnUS = { ...flatEnUS, ...flatEn };
        }
      }
    }
  }

  // 返回扁平化结构
  return {
    zhCN: flatZhCN,
    enUS: flatEnUS,
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

  // 从 config.ts 文件中合并配置（返回扁平化结构）
  const configMessages = mergeConfigFiles();

  // 将扁平化的 configMessages 转换为嵌套对象
  // 因为 Vue I18n 需要嵌套对象，而 mergeConfigFiles 返回的是扁平化结构
  // 关键：按键的深度排序，先处理深度更深的键（子键），再处理深度较浅的键（父键）
  // 这样可以避免在字符串上创建属性的错误（如 menu.access 是字符串，但又有 menu.access.config）
  const unflattenObject = (flat: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};

    // 按键的深度排序：先处理深度更深的键（子键），再处理深度较浅的键（父键）
    const sortedKeys = Object.keys(flat).sort((a, b) => {
      const depthA = a.split('.').length;
      const depthB = b.split('.').length;
      // 深度更深的键排在前面
      if (depthA !== depthB) {
        return depthB - depthA;
      }
      // 如果深度相同，按字母顺序排序
      return a.localeCompare(b);
    });

    for (const key of sortedKeys) {
      if (Object.prototype.hasOwnProperty.call(flat, key)) {
        const keys = key.split('.');
        let current = result;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          
          // 确保 current 是对象
          if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            current = {};
          }
          
          if (!(k in current)) {
            current[k] = {};
          } else if (typeof current[k] === 'string') {
            // 如果当前键已经是字符串，需要转换为对象 { _: stringValue }
            // 这样可以允许在父键上设置子键（如 menu.access 是字符串，但又有 menu.access.config）
            const stringValue = current[k];
            current[k] = { _: stringValue };
          }
          
          current = current[k];
        }
        
        // 确保 current 是对象
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
          current = {};
        }
        
        const lastKey = keys[keys.length - 1];
        
        // 如果目标键已经存在且是字符串，需要转换为对象
        if (lastKey in current && typeof current[lastKey] === 'string') {
          const stringValue = current[lastKey];
          current[lastKey] = { _: stringValue };
          // 然后设置新值（覆盖 _ 键）
          current[lastKey] = flat[key];
        } else {
          current[lastKey] = flat[key];
        }
      }
    }
    
    return result;
  };

  const configMessagesZhCN = configMessages.zhCN ? unflattenObject(configMessages.zhCN) : {};
  const configMessagesEnUS = configMessages.enUS ? unflattenObject(configMessages.enUS) : {};

  // 确保所有源都是对象
  const zhCNMessages = mergeMessages(
    sharedCoreZhMessages || {},
    sharedComponentsZh as Record<string, any> || {},
    configMessagesZhCN, // 从 config.ts 合并的配置（已转换为嵌套对象）
    zhCN || {} // 旧的 JSON 文件（兼容，逐步迁移）
  );
  const enUSMessages = mergeMessages(
    sharedCoreEnMessages || {},
    sharedComponentsEn as Record<string, any> || {},
    configMessagesEnUS, // 从 config.ts 合并的配置（已转换为嵌套对象）
    enUS || {} // 旧的 JSON 文件（兼容，逐步迁移）
  );

  // 开发环境调试：验证关键键是否存在
  if (import.meta.env.DEV) {
    // 验证菜单键
    const menuKeys = [
      'menu.org.tenants',
      'menu.org.departments',
      'menu.org.users',
      'menu.platform.domains',
      'menu.access.resources',
      'menu.navigation.menus',
      'menu.ops.logs',
      'menu.strategy.management',
    ];
  }

    // 更新缓存（与物流域和财务域保持一致，只返回标准格式）
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

// 创建一个独立的 i18n 实例用于路由标题（保留原有的 tSync 函数）
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
    const currentLocale = storage.get<string>('locale') || 'zh-CN';
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

// 关键：在模块加载时就注册国际化消息获取器，而不是等到 createAdminApp
// 这样可以确保主应用在 beforeMount 时就能获取到动态生成的国际化消息
// 使用统一的 registerSubAppI18n 工具函数，保持与其他应用一致
if (typeof window !== 'undefined') {
  registerSubAppI18n('admin', configFiles);
}
