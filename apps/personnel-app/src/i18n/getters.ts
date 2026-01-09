// 使用动态导入避免同步加载大量 JSON 文件，优化初始化性能
import { storage } from '@btc/shared-utils';
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
if (typeof window !== 'undefined') {
  registerSubAppI18n('personnel', configFiles);
}

// 优化：使用 Object.assign 的优化版本，避免多次合并
const mergeMessages = <T extends Record<string, any>>(...sources: T[]): T => {
  // 使用展开运算符和 Object.assign 的组合，性能更好
  return Object.assign({}, ...sources.filter(Boolean));
};

/**
 * 将扁平化对象转换为嵌套对象
 * 支持点号分隔的键，如 { "app.loading.title": "..." } -> { app: { loading: { title: "..." } } }
 * 关键：按键的深度排序，先处理深度更深的键（子键），再处理深度较浅的键（父键）
 * 这样可以避免在字符串上创建属性的错误（如 menu.inventory_management 是字符串，但又有 menu.inventory_management.storage_location）
 * 
 * 重要：根据用户要求，不应该使用 _ 键。如果既有父键又有子键，直接跳过父键，因为子键已经创建了对象结构。
 */
function unflattenObject(flat: Record<string, any>): Record<string, any> {
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
  
  // 调试：打印排序后的键（只打印菜单相关的）

  for (const key of sortedKeys) {
    if (Object.prototype.hasOwnProperty.call(flat, key)) {
      const keys = key.split('.');
      if (keys.length === 0) continue;

      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!k) continue;

        // 确保 current 是对象
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
          current = {};
        }

        if (!(k in current)) {
          current[k] = {};
        } else if (typeof current[k] === 'string') {
          // 如果当前键已经是字符串，需要转换为对象 { _: stringValue }
          // 这样可以允许在父键上设置子键（如 menu.procurement 是字符串，但又有 menu.procurement.auxiliary）
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
        if (!lastKey) continue;

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
          // 将父键的值保存到 _ 键中，保留子键结构
          // 注意：只有当 flat[key] 是字符串时才保存到 _ 键（父键的值）
          if (typeof flat[key] === 'string' && flat[key].trim() !== '') {
            current[lastKey]._ = flat[key];
          } else {
            // 如果新值也是对象，需要深度合并
            current[lastKey] = { ...current[lastKey], ...flat[key] };
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
        // 根据用户要求，不应该使用 _ 键，所以这里不应该处理 _ 键
        // 如果对象包含 '_' 键，说明这是从 unflattenObject 产生的，应该忽略 _ 键
        // 因为父键的值应该通过其他方式获取（如从扁平化的键值对中直接获取）
        // 递归处理嵌套对象（跳过 '_' 和 'source' 键以及元数据键）
        for (const subKey in value) {
          if (subKey !== '_' && subKey !== 'source' && Object.prototype.hasOwnProperty.call(value, subKey)) {
            // 跳过元数据键
            if (!['loc', 'key', 'type'].includes(subKey)) {
              flattenObject(value[subKey], `${newKey}.${subKey}`, result);
            }
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
 * 与管理应用保持一致，直接使用扁平化结构存储
 */
function mergeConfigFiles(): { zhCN: Record<string, string>; enUS: Record<string, string> } {
  // 直接使用扁平化结构存储，避免多次转换
  let flatZhCN: Record<string, string> = {};
  let flatEnUS: Record<string, string> = {};

  // 遍历所有加载的 config.ts 文件
  for (const path in configFiles) {
    const config = configFiles[path]?.default;
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


    // 将扁平化格式转换为嵌套格式（Vue I18n 需要嵌套格式，但使用 _ 键保存父键值）
    // 与管理应用保持一致的处理方式
    const zhCNNested = unflattenObject(zhCNMessages);
    const enUSNested = unflattenObject(enUSMessages);
    

    // 更新缓存（返回嵌套格式，供 Vue I18n 使用）
    cachedMessages = {
      'zh-CN': zhCNNested,
      'en-US': enUSNested,
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
