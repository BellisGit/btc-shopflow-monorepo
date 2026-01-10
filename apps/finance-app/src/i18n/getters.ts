import { storage } from '@btc/shared-utils';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';

// 注意：zhCN 和 enUS 会在 getLocaleMessages 中使用，registerSubAppI18n 会从 configFiles 自动提取

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

// 关键：在模块加载时就注册国际化消息获取器，而不是等到应用启动
// 这样可以确保主应用在 beforeMount 时就能获取到动态生成的国际化消息
// 使用统一的 registerSubAppI18n 工具函数，保持与管理应用一致
// registerSubAppI18n 会从 configFiles 中提取国际化配置（不需要传入 additionalMessages，因为 JSON 文件内容已包含在 configFiles 中或不再使用）
if (typeof window !== 'undefined') {
  registerSubAppI18n('finance', configFiles);
}

// 优化：使用 Object.assign 的优化版本，避免多次合并
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  return Object.assign({}, ...sources.filter(Boolean));
};

/**
 * 将扁平化对象转换为嵌套对象
 * 支持点号分隔的键，如 { "app.loading.title": "..." } -> { app: { loading: { title: "..." } } }
 * 支持冲突处理：当同一个键既作为字符串值，又作为对象的父键时，使用 '_' 键存储字符串值
 * 例如：{ "menu.a": "A", "menu.a.b": "B" } -> { menu: { a: { "_": "A", "b": "B" } } }
 * 关键：按键的深度排序，先处理深度更深的键（子键），再处理深度较浅的键（父键）
 * 这样可以避免在字符串上创建属性的错误
 */
function unflattenObject(flat: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  // 按键的深度排序：先处理深度更深的键（子键），再处理深度较浅的键（父键）
  // 这样可以确保在处理子键时，父键还没有被设置为字符串
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
    if (!Object.prototype.hasOwnProperty.call(flat, key)) continue;

    const keys = key.split('.');
    if (keys.length === 0) continue;

    let current = result;

    // 构建到倒数第二层的路径
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!k || k.trim() === '') continue;

      // 确保 current 是对象
      if (typeof current !== 'object' || current === null || Array.isArray(current)) {
        current = {};
      }
      if (!(k in current)) {
        current[k] = {};
      } else if (typeof current[k] === 'string') {
        // 如果当前键已经是字符串，需要转换为对象（使用 '_' 键存储原值）
        const stringValue = current[k];
        current[k] = { '_': stringValue };
      }
      current = current[k];
    }

    // 确保 current 是对象
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      current = {};
    }
    const lastKey = keys[keys.length - 1];
    if (!lastKey || lastKey.trim() === '') continue;

    // 如果目标键已经存在
    if (lastKey in current) {
      if (typeof current[lastKey] === 'string') {
        // 如果当前键已经是字符串，但存在子键（因为按深度排序，子键先处理），需要转换为对象
        // 检查是否存在以当前键为前缀的其他键（子键）
        const hasChildKeys = sortedKeys.some(otherKey => {
          if (otherKey === key) return false;
          // 检查 otherKey 是否以 key + '.' 开头
          return otherKey.startsWith(key + '.');
        });

        if (hasChildKeys) {
          // 如果存在子键，将字符串值保存到 _ 键中，然后创建新对象
          // 这是 Vue I18n 需要的格式，用于处理父键同时有子键的情况
          const stringValue = current[lastKey];
          current[lastKey] = { '_': stringValue };
        } else {
          // 如果不存在子键，直接覆盖
          current[lastKey] = flat[key];
        }
      } else if (typeof current[lastKey] === 'object' && current[lastKey] !== null) {
        // 如果目标键已经是对象（包含子键），说明子键已经处理过了
        // 将父键的值保存到 _ 键中，这样父键和子键都能正确访问
        // 这是 Vue I18n 需要的格式，用于处理父键同时有子键的情况
        if (typeof flat[key] === 'string' && flat[key].trim() !== '') {
          current[lastKey]._ = flat[key];
        }
      } else {
        // 其他情况直接覆盖
        current[lastKey] = flat[key];
      }
    } else {
      // 目标键不存在，直接设置
      current[lastKey] = flat[key];
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
      // 页面级配置格式：{ locale: { 'zh-CN': { 'menu.finance.inventory_management': '...' }, 'en-US': {...} }, columns?: {...}, forms?: {...} }
      const localeConfig = config.locale;

      if (localeConfig) {
        // 模块级配置使用扁平化键，需要先转换为嵌套结构
        if (localeConfig['zh-CN']) {
          const zhCNUnflattened = unflattenObject(localeConfig['zh-CN']);

          // 合并到对应的层级
          if (zhCNUnflattened.app) {
            mergedZhCN.app = deepMerge(mergedZhCN.app, zhCNUnflattened.app);
          }
          if (zhCNUnflattened.menu) {
            mergedZhCN.menu = deepMerge(mergedZhCN.menu, zhCNUnflattened.menu);
          }
          if (zhCNUnflattened.page) {
            mergedZhCN.page = deepMerge(mergedZhCN.page, zhCNUnflattened.page);
          }
          if (zhCNUnflattened.common) {
            mergedZhCN.common = deepMerge(mergedZhCN.common, zhCNUnflattened.common);
          }
        }

        if (localeConfig['en-US']) {
          const enUSUnflattened = unflattenObject(localeConfig['en-US']);

          // 合并到对应的层级
          if (enUSUnflattened.app) {
            mergedEnUS.app = deepMerge(mergedEnUS.app, enUSUnflattened.app);
          }
          if (enUSUnflattened.menu) {
            mergedEnUS.menu = deepMerge(mergedEnUS.menu, enUSUnflattened.menu);
          }
          if (enUSUnflattened.page) {
            mergedEnUS.page = deepMerge(mergedEnUS.page, enUSUnflattened.page);
          }
          if (enUSUnflattened.common) {
            mergedEnUS.common = deepMerge(mergedEnUS.common, enUSUnflattened.common);
          }
        }
      }
    }
  }

  // 清理空的字段（移除空对象）
  if (mergedZhCN.page && Object.keys(mergedZhCN.page).length === 0) {
    delete mergedZhCN.page;
  }
  if (mergedEnUS.page && Object.keys(mergedEnUS.page).length === 0) {
    delete mergedEnUS.page;
  }
  if (mergedZhCN.app && Object.keys(mergedZhCN.app).length === 0) {
    delete mergedZhCN.app;
  }
  if (mergedEnUS.app && Object.keys(mergedEnUS.app).length === 0) {
    delete mergedEnUS.app;
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
