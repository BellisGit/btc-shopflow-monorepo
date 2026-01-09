// i18n/getters.ts
import { createI18n } from 'vue-i18n';
import type { I18n } from 'vue-i18n';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedLocalesZhCN from '@btc/shared-components/locales/zh-CN.json';
import sharedLocalesEnUS from '@btc/shared-components/locales/en-US.json';
import { registerSubAppI18n } from '@btc/shared-core';
import systemAppZhCN from '../locales/zh-CN.json';
import systemAppEnUS from '../locales/en-US.json';

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

// 关键：注册子应用的国际化消息获取器，让主应用能够访问子应用的国际化配置
// 这样主应用的概览页就能正确显示子应用的名称和菜单名称
if (typeof window !== 'undefined') {
  const SYSTEM_APP_ID = 'system';
  // 合并 JSON 文件中的国际化消息（补充 config.ts 中可能缺失的消息）
  registerSubAppI18n(SYSTEM_APP_ID, configFiles, {
    'zh-CN': systemAppZhCN as Record<string, any>,
    'en-US': systemAppEnUS as Record<string, any>,
  });
}

// 延迟加载 messages，避免初始化顺序问题
let messagesCache: Record<string, any> | null = null;
const getMessages = (): Record<string, any> => {
  if (!messagesCache) {
    try {
      // 使用动态导入，避免在模块顶层初始化
      // 注意：@intlify/unplugin-vue-i18n/messages 在构建时会被替换为实际的消息对象
      // 这里使用同步导入，因为 unplugin-vue-i18n 在构建时会处理
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const messagesModule = require('@intlify/unplugin-vue-i18n/messages');
      messagesCache = (messagesModule.default || messagesModule) as Record<string, any>;
    } catch {
      // 如果导入失败，使用空对象
      messagesCache = {};
    }
  }
  return messagesCache;
};

// 合并 shared-core 的语言包
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
 * 所有配置都使用扁平结构：{ 'zh-CN': { key: value, ... }, 'en-US': { key: value, ... } }
 */
function mergeConfigFiles(): { zhCN: Record<string, string>; enUS: Record<string, string> } {
  let flatZhCN: Record<string, string> = {};
  let flatEnUS: Record<string, string> = {};

  // 遍历所有加载的 config.ts 文件
  for (const path in configFiles) {
    const config = configFiles[path].default;
    if (!config) continue;

    // 处理应用级配置（src/locales/config.ts）
    // 应用级配置格式：{ 'zh-CN': { ... }, 'en-US': { ... } }
    if (path.includes('/locales/config.ts')) {
      if (config['zh-CN']) {
        // 应用级配置可能是嵌套结构，需要扁平化
        const flat = flattenObject(config['zh-CN']);
        flatZhCN = { ...flatZhCN, ...flat };
      }
      if (config['en-US']) {
        // 应用级配置可能是嵌套结构，需要扁平化
        const flat = flattenObject(config['en-US']);
        flatEnUS = { ...flatEnUS, ...flat };
      }
    } else {
      // 处理模块级配置（src/modules/**/config.ts）
      // 模块级配置格式：{ locale: { 'zh-CN': { key: value, ... }, 'en-US': { key: value, ... } } }
      const localeConfig = config.locale;

      if (localeConfig) {
        // 扁平结构：localeConfig['zh-CN'] 已经是扁平化的键值对，直接合并
        if (localeConfig['zh-CN']) {
          flatZhCN = { ...flatZhCN, ...localeConfig['zh-CN'] };
        }
        if (localeConfig['en-US']) {
          flatEnUS = { ...flatEnUS, ...localeConfig['en-US'] };
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

// 类型定义
type LocaleMessages = Record<'zh-CN' | 'en-US', Record<string, any>>;

// 缓存合并结果，避免每次调用都重新合并
let cachedMessages: LocaleMessages | null = null;

// 清除缓存（开发环境使用，确保获取最新消息）
export const clearLocaleMessagesCache = () => {
  cachedMessages = null;
};

/**
 * 获取国际化消息（用于主应用获取子应用的国际化配置）
 * 返回格式：{ 'zh-CN': {...}, 'en-US': {...} }
 * 包括从 config.ts 中提取的国际化消息
 */
export const getLocaleMessages = (): LocaleMessages => {
  // 开发环境：每次都重新合并，确保包含最新的国际化文件
  // 生产环境：使用缓存以提高性能
  if (import.meta.env.DEV || !cachedMessages) {
    // 处理 sharedCore 的默认导出（TypeScript 文件使用 export default）
    const sharedCoreZhMessages = (sharedCoreZh as any)?.default ?? sharedCoreZh;
    const sharedCoreEnMessages = (sharedCoreEn as any)?.default ?? sharedCoreEn;

    // 从 config.ts 文件中合并配置
    const configMessages = mergeConfigFiles();

    // 合并所有语言包
    // 合并顺序：sharedCore -> sharedComponents -> config.ts (应用级+页面级) -> 旧的 JSON 文件（兼容）
    const zhCNMessages = mergeMessages(
      sharedCoreZhMessages || {},
      sharedLocalesZhCN as Record<string, any> || {},
      configMessages.zhCN || {}, // 从 config.ts 合并的配置
      systemAppZhCN as Record<string, any> || {} // 旧的 JSON 文件（兼容，逐步迁移）
    );
    const enUSMessages = mergeMessages(
      sharedCoreEnMessages || {},
      sharedLocalesEnUS as Record<string, any> || {},
      configMessages.enUS || {}, // 从 config.ts 合并的配置
      systemAppEnUS as Record<string, any> || {} // 旧的 JSON 文件（兼容，逐步迁移）
    );

    // 更新缓存
    cachedMessages = {
      'zh-CN': zhCNMessages,
      'en-US': enUSMessages,
    };
  }

  return cachedMessages!;
};

// 延迟初始化 i18n 实例，避免在模块顶层初始化
let i18nInstance: I18n | null = null;

const getI18nInstance = (): I18n => {
  if (!i18nInstance) {
    const messages = getMessages();
    // 合并所有语言包：shared-core + shared-components + unplugin 自动加载的 messages
    const normalizedMessages = {
      'zh-CN': mergeMessages(
        sharedCoreZh as Record<string, any>,
        sharedLocalesZhCN as Record<string, any>,
        (messages as Record<string, any>)['zh-CN'] || {}
      ),
      'en-US': mergeMessages(
        sharedCoreEn as Record<string, any>,
        sharedLocalesEnUS as Record<string, any>,
        (messages as Record<string, any>)['en-US'] || {}
      ),
    };

    // 创建一个独立的 i18n 实例用于路由标题
    i18nInstance = createI18n({
      legacy: false,
      globalInjection: false, // 路由中不需要全局注入
      locale: 'zh-CN',
      fallbackLocale: ['zh-CN', 'en-US'],
      messages: normalizedMessages
    }) as I18n;
  }
  return i18nInstance;
};

export function tSync(key: string): string {
  try {
    // 延迟获取 i18n 实例，避免初始化顺序问题
    const i18n = getI18nInstance();

    // 获取当前语言设置（从 Cookie 读取，与主应用保持一致）
    let currentLocale = 'zh-CN';
    try {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          let c = cookies[i];
          if (!c) continue;
          while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
          }
          if (c.indexOf('locale=') === 0) {
            currentLocale = c.substring('locale='.length, c.length);
            break;
          }
        }
      }
    } catch {
      // 如果 Cookie 读取失败，使用默认值
    }

    // 更新 i18n 实例的语言
    if (typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
      (i18n.global.locale as any).value = currentLocale;
    } else {
      (i18n.global as any).locale = currentLocale;
    }

    const g = i18n.global as any;

    // 检查 i18n 是否已初始化
    if (!g || !g.te) {
      return key;
    }

    // 直接检查消息对象中是否存在该键
    const localeMessages = g.getLocaleMessage(currentLocale) || {};

    if (localeMessages[key]) {
      const value = localeMessages[key];
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'function') {
        // Vue I18n 编译时优化，返回函数需要调用
        try {
          return value({ normalize: (arr: any[]) => arr[0] });
        } catch (_error) {
          return key;
        }
      }
    }

    // 如果直接检查失败，尝试使用 g.te 和 g.t
    if (g.te(key)) {
      return String(g.t(key));
    } else {
      // 如果当前语言没有找到，尝试回退语言
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
