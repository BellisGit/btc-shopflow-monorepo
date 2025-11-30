import type { Plugin } from '@btc/shared-core';
import type { AppEnvConfig } from './app-env.config';
import { getAppConfig, getAllDevPorts, getAllPrePorts } from './app-env.config';
import { registerMenus, type MenuItem } from '@btc/shared-components/store/menuRegistry';
import { getManifestMenus } from '@btc/subapp-manifests';
import { storage } from '@btc/shared-utils';

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

const normalizeMenuItem = (item: any): MenuItem => ({
  index: item.index,
  title: item.labelKey ?? item.label ?? item.index,
  icon: item.icon,
  children: Array.isArray(item.children) ? item.children.map(normalizeMenuItem) : undefined,
});

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
  if (!manifestMenus?.length) return;
  registerMenus(appId, manifestMenus.map(normalizeMenuItem));
}

/**
 * 解析应用 Logo 地址（会根据 baseUrl 自动适配）
 */
export function resolveAppLogoUrl() {
  const defaultUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/logo.png`
      : '/logo.png';

  const baseCandidate =
    (import.meta as any)?.env?.BASE_URL ||
    (typeof document !== 'undefined' ? document.baseURI : undefined) ||
    defaultUrl;

  try {
    return new URL('logo.png', baseCandidate).href;
  } catch {
    return defaultUrl;
  }
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

