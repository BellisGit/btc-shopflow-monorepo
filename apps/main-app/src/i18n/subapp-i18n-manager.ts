/**
 * 子应用国际化管理器
 * 负责从子应用加载国际化数据并合并到主应用i18n实例
 */

import type { I18n } from 'vue-i18n';
import type { SubAppManifest } from '@btc/shared-core';
import { getManifest } from '@btc/shared-core';
import { getAppsUsingDynamicI18n } from '../micro/apps';

// 内存缓存
const i18nCache = new Map<string, Record<string, any>>();

/**
 * 判断是否为开发环境
 */
function isDev(): boolean {
  return import.meta.env.DEV;
}

/**
 * 获取子应用的构建产物URL前缀
 * 在开发环境中，从子应用的开发服务器加载
 * 在生产环境中，子应用的资源通过CDN访问
 */
function getSubAppBaseUrl(appId: string): string {
  if (isDev()) {
    // 开发环境：从子应用的开发服务器加载（使用配置的端口）
    try {
      // 动态导入 getAppConfig（避免循环依赖）
      // 使用同步方式获取配置（在浏览器环境中，需要异步导入）
      // 注意：这里我们会在 loadFromDev 中异步获取配置
      return ''; // 占位符，实际 URL 在 loadFromDev 中构建
    } catch {
      return '';
    }
  }

  // 生产环境：根据子域名或配置确定CDN地址
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname.includes('bellis.com.cn')) {
    // 生产环境：使用子域名
    const protocol = window.location.protocol;
    const subdomain = appId === 'main' ? 'bellis.com.cn' : `${appId}.bellis.com.cn`;
    return `${protocol}//${subdomain}`;
  }

  // 默认：使用相对路径
  return `/${appId}`;
}

/**
 * 从开发环境加载国际化文件（使用fetch从子应用的开发服务器加载）
 */
async function loadFromDev(localePath: string, appId: string): Promise<Record<string, any>> {
  try {
    // 动态导入 getAppConfig（避免循环依赖）
    const { getAppConfig } = await import('@configs/app-env.config');

    // appId 转换为 appName：logistics -> logistics-app
    const appName = `${appId}-app`;
    const appConfig = getAppConfig(appName);

    if (!appConfig) {
      // 静默失败，不需要警告（某些应用可能没有配置）
      return {};
    }

    // 构建开发服务器的 URL

    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const baseUrl = `${protocol}//${appConfig.devHost}:${appConfig.devPort}`;
    const url = `${baseUrl}/${localePath}`;

    const response = await fetch(url);
    if (response.ok) {
      // 检查 Content-Type 是否为 JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          return data;
        } else {
          console.warn(`[SubAppI18nManager] Empty i18n data from dev: ${url}`);
          return {};
        }
      } else {
        // 如果返回的不是 JSON（可能是 HTML 404 页面），记录警告
        console.warn(`[SubAppI18nManager] Invalid content-type from dev: ${url} (got: ${contentType})`);
        return {};
      }
    } else {
      // 非 200 状态码，记录警告
      console.warn(`[SubAppI18nManager] Failed to load i18n from dev: ${url} (status: ${response.status})`);
      return {};
    }
  } catch (error: any) {
    // 处理连接错误（ERR_CONNECTION_RESET, ERR_CONNECTION_REFUSED 等）
    // 这些错误通常意味着子应用的开发服务器没有运行，属于正常情况
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes('CONNECTION_RESET') ||
        errorMessage.includes('CONNECTION_REFUSED') ||
        errorMessage.includes('Failed to fetch')) {
      // 连接错误，记录警告（子应用可能没有运行）
      console.warn(`[SubAppI18nManager] Connection error loading i18n from dev: ${localePath} (${errorMessage})`);
      return {};
    }

    // 其他错误（如 JSON 解析错误），可能是返回了 HTML 页面
    console.warn(`[SubAppI18nManager] Error loading i18n from dev: ${localePath}`, error);
    return {};
  }

  return {};
}

/**
 * 从生产环境加载国际化文件（使用fetch）
 */
async function loadFromProd(localePath: string, appId: string): Promise<Record<string, any>> {
  try {
    const baseUrl = getSubAppBaseUrl(appId);
    // 生产环境：从CDN加载
    // 路径格式：src/locales/zh-CN.json
    // 构建后JSON文件通常在assets目录下，但Vite可能使用hash文件名
    // 尝试几种可能的路径：
    // 1. /locales/zh-CN.json (如果JSON被复制到public)
    // 2. /assets/locales/zh-CN.json (如果JSON在assets目录)
    // 3. 直接使用相对路径
    const possiblePaths = [
      `/${localePath.replace('src/', '')}`, // src/locales/zh-CN.json -> /locales/zh-CN.json
      `/assets/${localePath.replace('src/', '')}`, // src/locales/zh-CN.json -> /assets/locales/zh-CN.json
      `/${localePath}`, // 直接使用原路径
    ];

    for (const path of possiblePaths) {
      try {
        const url = `${baseUrl}${path}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            return data;
          }
        }
      } catch {
        // 继续尝试下一个路径
        continue;
      }
    }

    throw new Error('All fetch attempts failed');
  } catch (error) {
    console.warn(`[SubAppI18nManager] Failed to load i18n from prod: ${localePath}`, error);
    return {};
  }
}

/**
 * 加载单个语言包文件
 */
async function loadLocaleFile(localePath: string, appId: string): Promise<Record<string, any>> {
  if (isDev()) {
    // 开发环境：使用 fetch 从子应用的开发服务器加载
    return await loadFromDev(localePath, appId);
  } else {
    // 生产环境：使用 fetch 从 CDN 加载
    return await loadFromProd(localePath, appId);
  }
}

/**
 * 加载子应用的国际化数据（支持多个 JSON 文件合并）
 */
async function loadSubAppI18nData(
  appId: string,
  locale: 'zh-CN' | 'en-US',
  manifest: SubAppManifest
): Promise<Record<string, any>> {
  const cacheKey = `${appId}-${locale}`;

  // 检查缓存
  if (i18nCache.has(cacheKey)) {
    return i18nCache.get(cacheKey)!;
  }

  // 从manifest获取路径（支持字符串或数组）
  const localePaths = manifest.locales?.[locale];
  if (!localePaths) {
    console.warn(`[SubAppI18nManager] No locale path found for ${appId} (${locale})`);
    return {};
  }

  // 统一转换为数组格式
  const paths = Array.isArray(localePaths) ? localePaths : [localePaths];

  // 并行加载所有语言包文件
  const loadPromises = paths.map(path => loadLocaleFile(path, appId));
  const loadedMessages = await Promise.all(loadPromises);

    // 检查每个文件的加载结果
    loadedMessages.forEach((msg, index) => {
      const path = paths[index];
      if (!msg || Object.keys(msg).length === 0) {
        console.warn(`[SubAppI18nManager] ⚠️ Failed to load or empty: ${path} for ${appId} (${locale})`);
      }
    });

  // 合并所有语言包（后面的会覆盖前面的）
  let messages: Record<string, any> = {};
  for (const msg of loadedMessages) {
    if (msg && Object.keys(msg).length > 0) {
      messages = deepMerge(messages, msg);
    }
  }

  // 缓存结果
  if (Object.keys(messages).length > 0) {
    i18nCache.set(cacheKey, messages);
  } else {
    console.warn(`[SubAppI18nManager] ⚠️ No messages loaded for ${appId} (${locale}) after merging ${paths.length} file(s)`);
  }

  return messages;
}

/**
 * 深合并对象
 */
export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * 加载并合并子应用的国际化数据到主应用i18n实例
 */
export async function loadAndMergeSubAppI18n(
  i18n: I18n,
  appId: string
): Promise<void> {
  try {
    // 跳过 docs-app，它的国际化方式和普通业务应用不一样（VitePress）
    if (appId === 'docs') {
      return;
    }

    // 获取当前语言
    const localeValue = i18n.global.locale;
    const currentLocale = (typeof localeValue === 'string' ? localeValue : localeValue.value) as 'zh-CN' | 'en-US';

    // 方案2：优先从全局获取动态生成的国际化消息（从 config.ts）
    // 检查子应用是否暴露了国际化消息获取函数
    if (typeof window !== 'undefined') {
      const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;

      if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(appId)) {
        const getLocaleMessages = subAppI18nGetters.get(appId);
        if (typeof getLocaleMessages === 'function') {
          try {
            const messages = getLocaleMessages();

            if (messages && messages[currentLocale]) {
              const localeMessages = messages[currentLocale];

              // 合并到主应用i18n实例
              const currentMessages = i18n.global.getLocaleMessage(currentLocale);
              const mergedMessages = deepMerge(currentMessages, localeMessages);
              i18n.global.setLocaleMessage(currentLocale, mergedMessages);

              return;
            } else {
              console.warn(`[SubAppI18nManager] ⚠️ ${appId} getLocaleMessages() 返回的消息中没有 ${currentLocale} 键:`, {
                appId,
                currentLocale,
                availableLocales: messages ? Object.keys(messages) : [],
                messages,
              });
            }
          } catch (error) {
            console.warn(`[SubAppI18nManager] Failed to get i18n messages from ${appId} getter:`, error);
            // 继续执行，回退到 JSON 文件加载
          }
        } else {
          console.warn(`[SubAppI18nManager] ⚠️ ${appId} 的 getLocaleMessages 不是函数:`, {
            appId,
            type: typeof getLocaleMessages,
            value: getLocaleMessages,
          });
        }
      }
    }

    // 关键：检查是否已经通过 globalState 发送了国际化消息
    // 如果已经发送，说明该应用使用动态国际化架构，不应该回退到 JSON 文件加载
    try {
      const { getGlobalState } = await import('@btc/shared-core');
      const globalState = getGlobalState();
      if (globalState) {
        const currentState = globalState.getGlobalState();
        if (currentState?.subAppI18nMessages?.[appId]) {
          // 已经通过 globalState 发送了国际化消息，不需要从 JSON 文件加载
          // 等待 globalState 监听器处理即可
          return;
        }
      }
    } catch (error) {
      // 忽略错误，继续执行
    }

    // 关键：对于使用动态国际化架构的应用（如 admin-app），不应该回退到 JSON 文件加载
    // 这些应用会通过 globalState 发送国际化消息，即使 getter 还没有注册，也应该等待
    // 判断方法：检查应用是否会在挂载时通过 globalState 发送国际化消息
    const appsUsingDynamicI18n = getAppsUsingDynamicI18n();
    if (appsUsingDynamicI18n.includes(appId)) {
      // 使用动态国际化的应用，不加载 JSON 文件，等待 globalState 消息
      // 如果 globalState 中还没有消息，说明子应用还没有挂载，等待即可
      return;
    }

    // 回退到原有的 JSON 文件加载方式（其他应用或动态获取失败时的备用方案）
    const manifest = getManifest(appId);
    if (!manifest) {
      console.warn(`[SubAppI18nManager] Manifest not found for app: ${appId}`);
      return;
    }

    if (!manifest.locales) {
      console.warn(`[SubAppI18nManager] No locales configured for app: ${appId}`);
      return;
    }

    // 加载当前语言的国际化数据
    const messages = await loadSubAppI18nData(appId, currentLocale, manifest);

    if (Object.keys(messages).length === 0) {
      console.warn(`[SubAppI18nManager] No messages loaded for ${appId} (${currentLocale})`);
      return;
    }


    // 合并到主应用i18n实例
    const currentMessages = i18n.global.getLocaleMessage(currentLocale);
    const mergedMessages = deepMerge(currentMessages, messages);
    i18n.global.setLocaleMessage(currentLocale, mergedMessages);

  } catch (error) {
    console.error(`[SubAppI18nManager] ❌ Failed to load i18n for ${appId}:`, error);
    // 不抛出错误，避免阻塞应用挂载
  }
}

/**
 * 预加载所有子应用的国际化数据（用于概览页面等需要显示所有应用信息的场景）
 */
export async function preloadAllSubAppsI18n(i18n: I18n): Promise<void> {
  try {
    const { getAllManifests } = await import('@btc/shared-core/manifest');
    const allManifests = getAllManifests();

    const localeValue = i18n.global.locale;
    const currentLocale = (typeof localeValue === 'string' ? localeValue : localeValue.value) as 'zh-CN' | 'en-US';

    // 并行加载所有子应用的国际化数据
    const loadPromises = Object.entries(allManifests).map(async ([appId, manifest]) => {
      // 跳过 docs-app，它的国际化方式和普通业务应用不一样（VitePress）
      if (appId === 'docs') {
        return {};
      }

      // 方案2：优先从全局获取动态生成的国际化消息（从 config.ts）
      if (typeof window !== 'undefined') {
        const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;
        if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(appId)) {
          const getLocaleMessages = subAppI18nGetters.get(appId);
          if (typeof getLocaleMessages === 'function') {
            try {
              const messages = getLocaleMessages();
              if (messages && messages[currentLocale]) {
                return messages[currentLocale];
              }
            } catch (error) {
              console.warn(`[SubAppI18nManager] Failed to get i18n messages from ${appId} getter:`, error);
              // 继续执行，回退到 JSON 文件加载
            }
          }
        }
      }

      // 关键：对于使用动态国际化架构的应用，不应该回退到 JSON 文件加载
      const appsUsingDynamicI18n = getAppsUsingDynamicI18n();
      if (appsUsingDynamicI18n.includes(appId)) {
        // 使用动态国际化的应用，不加载 JSON 文件
        return {};
      }

      try {
        const messages = await loadSubAppI18nData(appId, currentLocale, manifest);
        return messages;
      } catch (error) {
        console.warn(`[SubAppI18nManager] Failed to preload i18n for ${appId}:`, error);
        return {};
      }
    });

    const allMessages = await Promise.all(loadPromises);

    // 一次性合并所有消息
    const currentMessages = i18n.global.getLocaleMessage(currentLocale);
    let mergedMessages = { ...currentMessages };

    for (const messages of allMessages) {
      if (Object.keys(messages).length > 0) {
        mergedMessages = deepMerge(mergedMessages, messages);
      }
    }

    i18n.global.setLocaleMessage(currentLocale, mergedMessages);
  } catch (error) {
    console.error(`[SubAppI18nManager] ❌ Failed to preload all sub-apps i18n:`, error);
  }
}

/**
 * 清除缓存（用于开发环境热更新）
 */
export function clearI18nCache(appId?: string): void {
  if (appId) {
    i18nCache.delete(`${appId}-zh-CN`);
    i18nCache.delete(`${appId}-en-US`);
  } else {
    i18nCache.clear();
  }
}
