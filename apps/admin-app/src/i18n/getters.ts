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
  // 使用展开运算符和 Object.assign 的组合，性能更好
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
      const localeConfig = config.locale;

      if (localeConfig) {
        // 页面级配置可能包含 app 和 menu（用于覆盖）
        if (localeConfig.app) {
          mergedZhCN.app = deepMerge(mergedZhCN.app, localeConfig.app);
          mergedEnUS.app = deepMerge(mergedEnUS.app, localeConfig.app || {});
        }
        if (localeConfig.menu) {
          mergedZhCN.menu = deepMerge(mergedZhCN.menu, localeConfig.menu);
          mergedEnUS.menu = deepMerge(mergedEnUS.menu, localeConfig.menu || {});
        }
        // 将模块配置直接合并到顶层（不再使用 page 层级）
        // localeConfig 中除了 app 和 menu 之外的所有键都是模块配置
        for (const key in localeConfig) {
          if (key !== 'app' && key !== 'menu' && key !== 'page') {
            // 直接合并模块配置到顶层
            if (!mergedZhCN[key]) {
              mergedZhCN[key] = {};
            }
            if (!mergedEnUS[key]) {
              mergedEnUS[key] = {};
            }
            mergedZhCN[key] = deepMerge(mergedZhCN[key], localeConfig[key]);
            mergedEnUS[key] = deepMerge(mergedEnUS[key], localeConfig[key] || {});
          }
        }
        // 兼容旧格式：如果还有 page 层级，也处理（逐步迁移）
        if (localeConfig.page) {
          // 将 page 下的内容直接合并到顶层
          for (const moduleKey in localeConfig.page) {
            if (!mergedZhCN[moduleKey]) {
              mergedZhCN[moduleKey] = {};
            }
            if (!mergedEnUS[moduleKey]) {
              mergedEnUS[moduleKey] = {};
            }
            mergedZhCN[moduleKey] = deepMerge(mergedZhCN[moduleKey], localeConfig.page[moduleKey]);
            mergedEnUS[moduleKey] = deepMerge(mergedEnUS[moduleKey], localeConfig.page[moduleKey] || {});
          }
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

    const missingZhKeys = menuKeys.filter(key => !zhCNMessages[key]);
    const missingEnKeys = menuKeys.filter(key => !enUSMessages[key]);

    if (missingZhKeys.length > 0) {
      console.warn(`[i18n] Missing menu keys in zhCNMessages:`, missingZhKeys);
      console.log('[i18n] Available menu keys in zhCNMessages:', Object.keys(zhCNMessages).filter(k => k.startsWith('menu.')).slice(0, 20));
    }
    if (missingEnKeys.length > 0) {
      console.warn(`[i18n] Missing menu keys in enUSMessages:`, missingEnKeys);
      console.log('[i18n] Available menu keys in enUSMessages:', Object.keys(enUSMessages).filter(k => k.startsWith('menu.')).slice(0, 20));
    }

    // 验证页面键（新格式：不再有 page. 前缀）
    const pageKeys = [
      'org.tenants.tenant_name',
      'org.tenants.tenant_code',
      'platform.domains.fields.domain_name',
    ];

    const missingPageZhKeys = pageKeys.filter(key => !zhCNMessages[key]);
    const missingPageEnKeys = pageKeys.filter(key => !enUSMessages[key]);

    if (missingPageZhKeys.length > 0) {
      console.warn(`[i18n] Missing page keys in zhCNMessages:`, missingPageZhKeys);
      // 查找模块相关的键（新格式：org.xxx, platform.xxx 等）
      const moduleKeys = Object.keys(zhCNMessages).filter(k =>
        k.startsWith('org.') || k.startsWith('platform.') || k.startsWith('access.') ||
        k.startsWith('navigation.') || k.startsWith('governance.') || k.startsWith('strategy.') || k.startsWith('ops.')
      ).slice(0, 20);
      console.log('[i18n] Available module keys in zhCNMessages:', moduleKeys);
    }
    if (missingPageEnKeys.length > 0) {
      console.warn(`[i18n] Missing page keys in enUSMessages:`, missingPageEnKeys);
      // 查找模块相关的键（新格式：org.xxx, platform.xxx 等）
      const moduleKeys = Object.keys(enUSMessages).filter(k =>
        k.startsWith('org.') || k.startsWith('platform.') || k.startsWith('access.') ||
        k.startsWith('navigation.') || k.startsWith('governance.') || k.startsWith('strategy.') || k.startsWith('ops.')
      ).slice(0, 20);
      console.log('[i18n] Available module keys in enUSMessages:', moduleKeys);
    }

    // 验证应用键
    const appKeys = ['app.name', 'app.title'];
    const missingAppZhKeys = appKeys.filter(key => !zhCNMessages[key]);
    const missingAppEnKeys = appKeys.filter(key => !enUSMessages[key]);

    if (missingAppZhKeys.length > 0) {
      console.warn(`[i18n] Missing app keys in zhCNMessages:`, missingAppZhKeys);
      console.log('[i18n] Available app keys in zhCNMessages:', Object.keys(zhCNMessages).filter(k => k.startsWith('app.')).slice(0, 10));
    }
    if (missingAppEnKeys.length > 0) {
      console.warn(`[i18n] Missing app keys in enUSMessages:`, missingAppEnKeys);
      console.log('[i18n] Available app keys in enUSMessages:', Object.keys(enUSMessages).filter(k => k.startsWith('app.')).slice(0, 10));
    }

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

// 关键：在模块加载时就注册国际化消息获取器，而不是等到 createAdminApp
// 这样可以确保主应用在 beforeMount 时就能获取到动态生成的国际化消息
if (typeof window !== 'undefined') {
  const ADMIN_APP_ID = 'admin';
  // 在模块加载完成时立即注册（同步执行）
  if (!(window as any).__SUBAPP_I18N_GETTERS__) {
    (window as any).__SUBAPP_I18N_GETTERS__ = new Map();
  }
  // 注册 getLocaleMessages 函数
  (window as any).__SUBAPP_I18N_GETTERS__.set(ADMIN_APP_ID, getLocaleMessages);
}
