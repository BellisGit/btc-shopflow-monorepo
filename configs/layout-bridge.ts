import type { Plugin } from '@btc/shared-core';
import type { AppEnvConfig } from './app-env.config';
import { getAppConfig, getAllDevPorts, getAllPrePorts } from './app-env.config';
import { registerMenus, type MenuItem } from '@btc/shared-components/store/menuRegistry';
import { getManifestMenus, getManifestTabs } from '@btc/subapp-manifests';
import { storage } from '@btc/shared-utils';
import { assignIconsToMenuTree } from '@btc/shared-core';
import { getAppBySubdomain } from './app-scanner';

declare global {
  interface Window {
    __APP_GET_APP_CONFIG__?: (appName: string) => AppEnvConfig | undefined;
    __APP_GET_ALL_DEV_PORTS__?: () => string[];
    __APP_GET_ALL_PRE_PORTS__?: () => string[];
  }
}

const DEFAULT_DOMAIN_NAMES: Record<string, { code: string; name: string; host: string }> = {
  system: { code: 'SYSTEM', name: '系统域', host: 'bellis.com.cn' },
  admin: { code: 'ADMIN', name: '管理域', host: 'admin.bellis.com.cn' },
  logistics: { code: 'LOGISTICS', name: '物流域', host: 'logistics.bellis.com.cn' },
  engineering: { code: 'ENGINEERING', name: '工程域', host: 'engineering.bellis.com.cn' },
  quality: { code: 'QUALITY', name: '品质域', host: 'quality.bellis.com.cn' },
  production: { code: 'PRODUCTION', name: '生产域', host: 'production.bellis.com.cn' },
  finance: { code: 'FINANCE', name: '财务域', host: 'finance.bellis.com.cn' },
};

/**
 * 规范化菜单路径：在开发环境下自动添加应用前缀，生产子域环境下移除应用前缀
 * manifest 中的菜单路径已经移除了应用前缀，所以：
 * - 开发环境（qiankun模式）：需要添加前缀 `/${appName}/xxx`
 * - 生产子域环境：移除应用前缀，保持原路径 `/xxx`
 */
function normalizeMenuPath(path: string, appName: string): string {
  if (!path || !appName) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 检测是否在生产环境的子域名下
  if (typeof window === 'undefined') {
    // SSR 环境，保持原路径
    return normalizedPath;
  }

  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  if (isProductionSubdomain) {
    // 生产环境子域名：使用应用扫描器获取子域名应用
    const appBySubdomain = getAppBySubdomain(hostname);
    const currentSubdomainApp = appBySubdomain?.id;

    // 如果在子域名环境下，且路径以应用前缀开头，移除前缀
    if (currentSubdomainApp && currentSubdomainApp === appName) {
      const appPrefix = `/${appName}`;
      if (normalizedPath === appPrefix) {
        // 如果是应用根路径，返回 /
        return '/';
      } else if (normalizedPath.startsWith(`${appPrefix}/`)) {
        // 移除应用前缀
        return normalizedPath.substring(appPrefix.length);
      }
    }

    // 生产环境子域名：保持原路径（manifest 中已经没有前缀了）
    return normalizedPath;
  }

  // 开发环境（qiankun模式）：需要添加应用前缀
  // 如果路径已经是根路径，直接返回应用前缀
  if (normalizedPath === '/') {
    return `/${appName}`;
  }

  // 如果路径已经包含应用前缀，不需要重复添加
  if (normalizedPath.startsWith(`/${appName}/`) || normalizedPath === `/${appName}`) {
    return normalizedPath;
  }

  // 添加应用前缀
  return `/${appName}${normalizedPath}`;
}

// 递归转换菜单项（支持任意深度）
// 使用智能图标分配，确保同一域内图标不重复且语义匹配
function normalizeMenuItems(items: any[], appName: string, usedIcons?: Set<string>): MenuItem[] {
  // 创建已使用图标集合（用于域内去重），如果已存在则复用
  const iconSet = usedIcons || new Set<string>();

  // 将 title 字段映射到 labelKey 字段，以便图标分配工具使用
  const itemsWithLabelKey = items.map(item => ({
    ...item,
    labelKey: item.labelKey || item.title || item.label,
  }));

  // 使用智能图标分配工具（会递归处理所有子菜单）
  const itemsWithIcons = assignIconsToMenuTree(itemsWithLabelKey, iconSet);

  // 递归转换函数，将 assignIconsToMenuTree 返回的结构转换为 MenuItem 格式
  const convertToMenuItem = (item: any): MenuItem & { labelKey?: string } => {
    const normalizedIndex = normalizeMenuPath(item.index, appName);
    return {
      index: normalizedIndex,
      title: item.labelKey ?? item.label ?? item.title ?? normalizedIndex,
      icon: item.icon,
      // 保存 labelKey 用于面包屑图标查找
      labelKey: item.labelKey,
      children: item.children && item.children.length > 0
        ? item.children.map(convertToMenuItem)
        : undefined,
    };
  };

  // 转换为 MenuItem 格式（不需要再次调用 assignIconsToMenuTree，因为已经处理了所有层级）
  return itemsWithIcons.map(convertToMenuItem);
}

/**
 * 注册 AppLayout 运行时所需的环境配置访问器
 * 在独立运行的子应用中调用一次即可
 */
export function registerAppEnvAccessors(target: Window = window) {
  const win = target as typeof window & {
    __APP_GET_APP_CONFIG__?: (appName: string) => AppEnvConfig | undefined;
    __APP_GET_ALL_DEV_PORTS__?: () => string[];
    __APP_GET_ALL_PRE_PORTS__?: () => string[];
  };

  if (!win.__APP_GET_APP_CONFIG__) {
    win.__APP_GET_APP_CONFIG__ = (appName: string) => getAppConfig(appName);
  }

  if (!win.__APP_GET_ALL_DEV_PORTS__) {
    win.__APP_GET_ALL_DEV_PORTS__ = () => getAllDevPorts();
  }

  if (!win.__APP_GET_ALL_PRE_PORTS__) {
    win.__APP_GET_ALL_PRE_PORTS__ = () => getAllPrePorts();
  }
}

/**
 * 根据 manifest 注册当前应用的菜单
 */
export function registerManifestMenusForApp(appId: string) {
  const manifestMenus = getManifestMenus(appId);

  if (!manifestMenus?.length) {
    return;
  }

  // 使用 normalizeMenuItems 进行规范化，包含图标分配逻辑
  const normalizedMenus = normalizeMenuItems(manifestMenus, appId);

  registerMenus(appId, normalizedMenus);
}

/**
 * 根据 manifest 注册当前应用的 Tabs（用于 tabbar 显示）
 * 注意：tabbar 的标签是通过路由导航时自动添加到 processStore 的，
 * 标签的文本通过 getManifestRoute 从 manifest 中获取，不需要单独的 tabRegistry
 * 这个函数主要用于确保 manifest 数据已加载，实际标签文本由 tabbar 组件从 manifest 中读取
 */
export function registerManifestTabsForApp(appId: string) {
  const manifestTabs = getManifestTabs(appId);

  if (!manifestTabs?.length) {
    return;
  }

  // tabbar 的标签文本通过 getManifestRoute 从 manifest 中获取，不需要单独的注册
  // 这里只是确保 manifest 数据已加载
}

const normalizeBaseUrl = (candidate?: string | null, context?: string) => {
  if (!candidate) return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  try {
    const absolute = context ? new URL(trimmed, context) : new URL(trimmed);
    return new URL('.', absolute).href;
  } catch {
    return null;
  }
};

/**
 * 解析应用 Logo 地址（始终返回根路径，不依赖当前路由）
 */
export function resolveAppLogoUrl() {
  // 始终使用根路径，不依赖 document.baseURI（避免受当前路由影响）
  // 例如：当前路由是 /governance/files/... 时，不应该解析为 /governance/files/logo.png
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/logo.png`;
  }
  return '/logo.png';
}

/**
 * 创建一个轻量级的 AppStorage 适配器，满足 AppLayout 的最小依赖
 */
export function createAppStorageBridge(namespace: string) {
  const makeKey = (suffix: string) => `${namespace}:${suffix}`;

  const getJson = <T>(key: string): T | null => (storage.get(key) as T | null) ?? null;
  const setJson = (key: string, value: unknown) => storage.set(key, value);
  const removeKey = (key: string) => storage.remove(key);

  const userStore = {
    get: () => getJson<Record<string, any>>(makeKey('user')),
    set(data: Record<string, any>) {
      const next = { ...(userStore.get() ?? {}), ...data };
      setJson(makeKey('user'), next);
    },
    getAvatar: () => userStore.get()?.avatar ?? null,
    setAvatar(avatar: string) {
      userStore.set({ avatar });
    },
    getName: () => userStore.get()?.name ?? null,
    setName(name: string) {
      userStore.set({ name });
    },
    clear() {
      removeKey(makeKey('user'));
    },
  };

  const settingsStore = {
    get: () => getJson<Record<string, any>>(makeKey('settings')) ?? {},
    set(data: Record<string, any>) {
      const next = { ...settingsStore.get(), ...data };
      setJson(makeKey('settings'), next);
    },
    getItem(key: string) {
      return settingsStore.get()?.[key] ?? null;
    },
    setItem(key: string, value: unknown) {
      settingsStore.set({ [key]: value });
    },
  };

  return {
    user: userStore,
    settings: settingsStore,
  } as const;
}

/**
 * 返回一个默认的域名列表解析器，确保菜单抽屉不会因为缺失服务而报错
 */
export function createDefaultDomainResolver(appId: string) {
  const domains = Object.entries(DEFAULT_DOMAIN_NAMES).map(([id, info]) => ({
    domainCode: info.code,
    name: info.name,
    host: info.host,
    appId: id,
    active: id === appId,
  }));

  return async () => domains;
}

/**
 * 创建一个通用的用户设置插件，供未自定义实现的子应用复用
 */
export function createSharedUserSettingPlugin(): Plugin {
  return {
    name: 'user-setting',
    version: '1.0.0',
    description: 'Shared user setting toolbar',
    order: 20,
    toolbar: {
      order: 5,
      pc: true,
      h5: false,
      component: () => import('@btc/shared-components/components/others/btc-user-setting/index.vue'),
    },
  };
}

