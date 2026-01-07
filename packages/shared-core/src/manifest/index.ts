import adminManifestJson from "./manifests/admin.json" with { type: "json" };
import logisticsManifestJson from "./manifests/logistics.json" with { type: "json" };
import systemManifestJson from "./manifests/system.json" with { type: "json" };
import qualityManifestJson from "./manifests/quality.json" with { type: "json" };
import engineeringManifestJson from "./manifests/engineering.json" with { type: "json" };
import productionManifestJson from "./manifests/production.json" with { type: "json" };
import financeManifestJson from "./manifests/finance.json" with { type: "json" };
import operationsManifestJson from "./manifests/operations.json" with { type: "json" };
import docsManifestJson from "./manifests/docs.json" with { type: "json" };
import dashboardManifestJson from "./manifests/dashboard.json" with { type: "json" };
import personnelManifestJson from "./manifests/personnel.json" with { type: "json" };
import mainManifestJson from "./manifests/main.json" with { type: "json" };
import { getCurrentEnvironment, getCurrentSubApp } from '@configs/unified-env-config';

export interface SubAppManifestRoute {
  path: string;
  labelKey?: string;
  label?: string;
  tab?: { enabled?: boolean; labelKey?: string; label?: string; icon?: string };
  breadcrumbs?: Array<{ labelKey?: string; label?: string; icon?: string }>;
}

export interface MenuConfigItem {
  id: string;
  title?: string;
  labelKey?: string;
  icon?: string;
  sort?: number;
  showInOverview?: boolean;
  permission?: string;
  description?: string;
  hot?: boolean;
  mountTo?: string; // 子应用菜单挂载到主应用的哪个挂载点
  children?: MenuConfigItem[];
  path?: string; // 菜单项对应的路径
}

export interface MenuConfig {
  global?: MenuConfigItem[]; // 主应用自有概览级菜单
  mountPoints?: MenuConfigItem[]; // 子应用菜单挂载点
  module?: MenuConfigItem[]; // 子应用业务菜单（用于挂载）
}

export interface SubAppManifest<M = unknown> {
  app: { id: string; basePath?: string; nameKey?: string; 'app-name'?: string };
  routes: SubAppManifestRoute[];
  menus?: Array<{ index: string; labelKey?: string; label?: string; icon?: string; children?: any[] }>;
  menuConfig?: MenuConfig; // 阿里云控制台风格的菜单配置
  locales?: {
    'zh-CN'?: string | string[]; // 相对路径，如 'src/locales/zh-CN.json' 或 ['src/locales/zh-CN.json', 'src/modules/base/locales/zh-CN.json']
    'en-US'?: string | string[];
  };
  raw: M;
}

const manifestRegistry: Record<string, SubAppManifest> = {};

export function registerManifest(app: string, manifest: SubAppManifest) {
  manifestRegistry[app] = manifest;
}

export function getManifest(app: string): SubAppManifest | undefined {
  return manifestRegistry[app];
}

// 懒加载 getAppBySubdomain，避免构建时依赖
// 使用全局变量存储，在运行时由应用注入
let getAppBySubdomainFn: ((hostname: string) => any) | null = null;

/**
 * 设置 getAppBySubdomain 函数（由应用在运行时注入）
 * 应用应该在初始化时调用此函数来注入 getAppBySubdomain
 */
export function setAppBySubdomainFn(fn: (hostname: string) => any) {
  getAppBySubdomainFn = fn;
}

function getAppBySubdomain(hostname: string): any {
  if (typeof window === 'undefined') {
    return undefined;
  }

  // 如果函数已注入，使用它
  if (getAppBySubdomainFn) {
    return getAppBySubdomainFn(hostname);
  }

  // 否则返回 undefined（应用需要调用 setAppBySubdomainFn 来注入函数）
  return undefined;
}

export function getManifestRoute(app: string, fullPath: string): SubAppManifestRoute | undefined {
  const manifest = getManifest(app);
  if (!manifest) return undefined;

  // 使用统一的环境检测函数
  const env = getCurrentEnvironment();
  const isProductionOrTestSubdomain = env === 'production' || env === 'test';
  
  // 使用统一的应用检测函数获取当前应用
  const currentSubdomainApp = getCurrentSubApp();

  // 如果在生产环境或测试环境子域名下，且当前应用匹配子域名，路径应该是 / 或 /xxx（没有应用前缀）
  if (isProductionOrTestSubdomain && currentSubdomainApp === app) {
    // 在生产环境或测试环境子域名下，路径直接匹配（不需要 basePath 前缀）
    const normalized = fullPath === '/' ? '/' : (fullPath.startsWith('/') ? fullPath : `/${fullPath}`);
    return manifest.routes.find((route) => route.path === normalized);
  }

  // 开发环境或主域名访问：使用 basePath 匹配
  const basePath = manifest.app.basePath ?? `/${app}`;
  if (!fullPath.startsWith(basePath)) {
    return undefined;
  }

  const suffix = fullPath.slice(basePath.length) || "/";
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return manifest.routes.find((route) => route.path === normalized);
}

export function getManifestTabs(
  app: string,
): Array<{ key: string; path: string; labelKey?: string; label?: string }> {
  const manifest = getManifest(app);
  if (!manifest) return [];

  const basePath = manifest.app.basePath ?? `/${app}`;

  return manifest.routes
    .filter((route) => route.tab?.enabled !== false)
    .map((route) => {
      const fullPath = `${basePath}${route.path === "/" ? "" : route.path}`;
      const key = route.path.replace(/^\//, "") || "home";

      const labelKey = route.tab?.labelKey ?? route.labelKey;
      const label = route.tab?.label ?? route.label;

      return {
        key,
        path: fullPath,
        ...(labelKey != null ? { labelKey } : {}),
        ...(label != null ? { label } : {}),
      };
    });
}

export function getManifestMenus(app: string): Array<{ index: string; labelKey?: string; label?: string; icon?: string; children?: any[] }> {
  const manifest = getManifest(app);
  if (!manifest) return [];
  return manifest.menus ?? [];
}

export function getAllManifests() {
  return { ...manifestRegistry };
}

registerManifest("admin", {
  app: {
    id: adminManifestJson.app?.id ?? "admin",
    basePath: adminManifestJson.app?.basePath ?? "/admin",
    nameKey: adminManifestJson.app?.nameKey,
    'app-name': adminManifestJson.app?.['app-name'],
  },
  routes: adminManifestJson.routes ?? [],
  menus: adminManifestJson.menus ?? [],
  locales: adminManifestJson.locales,
  raw: adminManifestJson,
});

registerManifest("logistics", {
  app: {
    id: logisticsManifestJson.app?.id ?? "logistics",
    basePath: logisticsManifestJson.app?.basePath ?? "/logistics",
    nameKey: logisticsManifestJson.app?.nameKey,
    'app-name': logisticsManifestJson.app?.['app-name'],
  },
  routes: logisticsManifestJson.routes ?? [],
  menus: logisticsManifestJson.menus ?? [],
  locales: logisticsManifestJson.locales,
  raw: logisticsManifestJson,
});

registerManifest("system", {
  app: {
    id: systemManifestJson.app?.id ?? "system",
    basePath: systemManifestJson.app?.basePath ?? "/",
    nameKey: systemManifestJson.app?.nameKey,
    'app-name': systemManifestJson.app?.['app-name'],
  },
  routes: systemManifestJson.routes ?? [],
  menus: systemManifestJson.menus ?? [],
  locales: systemManifestJson.locales,
  raw: systemManifestJson,
});

registerManifest("quality", {
  app: {
    id: qualityManifestJson.app?.id ?? "quality",
    basePath: qualityManifestJson.app?.basePath ?? "/quality",
    nameKey: qualityManifestJson.app?.nameKey,
    'app-name': qualityManifestJson.app?.['app-name'],
  },
  routes: qualityManifestJson.routes ?? [],
  menus: qualityManifestJson.menus ?? [],
  locales: qualityManifestJson.locales,
  raw: qualityManifestJson,
});

registerManifest("engineering", {
  app: {
    id: engineeringManifestJson.app?.id ?? "engineering",
    basePath: engineeringManifestJson.app?.basePath ?? "/engineering",
    nameKey: engineeringManifestJson.app?.nameKey,
    'app-name': engineeringManifestJson.app?.['app-name'],
  },
  routes: engineeringManifestJson.routes ?? [],
  menus: engineeringManifestJson.menus ?? [],
  locales: engineeringManifestJson.locales,
  raw: engineeringManifestJson,
});

registerManifest("production", {
  app: {
    id: productionManifestJson.app?.id ?? "production",
    basePath: productionManifestJson.app?.basePath ?? "/production",
    nameKey: productionManifestJson.app?.nameKey,
    'app-name': productionManifestJson.app?.['app-name'],
  },
  routes: productionManifestJson.routes ?? [],
  menus: productionManifestJson.menus ?? [],
  locales: productionManifestJson.locales,
  raw: productionManifestJson,
});

registerManifest("finance", {
  app: {
    id: financeManifestJson.app?.id ?? "finance",
    basePath: financeManifestJson.app?.basePath ?? "/finance",
    nameKey: financeManifestJson.app?.nameKey,
    'app-name': financeManifestJson.app?.['app-name'],
  },
  routes: financeManifestJson.routes ?? [],
  menus: financeManifestJson.menus ?? [],
  locales: financeManifestJson.locales,
  raw: financeManifestJson,
});

registerManifest("operations", {
  app: {
    id: operationsManifestJson.app?.id ?? "operations",
    basePath: operationsManifestJson.app?.basePath ?? "/operations",
    nameKey: operationsManifestJson.app?.nameKey,
    'app-name': operationsManifestJson.app?.['app-name'],
  },
  routes: operationsManifestJson.routes ?? [],
  menus: operationsManifestJson.menus ?? [],
  locales: operationsManifestJson.locales,
  raw: operationsManifestJson,
});

registerManifest("docs", {
  app: {
    id: docsManifestJson.app?.id ?? "docs",
    basePath: docsManifestJson.app?.basePath ?? "/docs",
    nameKey: docsManifestJson.app?.nameKey,
    'app-name': docsManifestJson.app?.['app-name'],
  },
  routes: docsManifestJson.routes ?? [],
  menus: docsManifestJson.menus ?? [],
  locales: docsManifestJson.locales,
  raw: docsManifestJson,
});

registerManifest("dashboard", {
  app: {
    id: dashboardManifestJson.app?.id ?? "dashboard",
    basePath: dashboardManifestJson.app?.basePath ?? "/dashboard",
    nameKey: dashboardManifestJson.app?.nameKey,
    'app-name': dashboardManifestJson.app?.['app-name'],
  },
  routes: dashboardManifestJson.routes ?? [],
  menus: dashboardManifestJson.menus ?? [],
  locales: dashboardManifestJson.locales,
  raw: dashboardManifestJson,
});

registerManifest("personnel", {
  app: {
    id: personnelManifestJson.app?.id ?? "personnel",
    basePath: personnelManifestJson.app?.basePath ?? "/personnel",
    nameKey: personnelManifestJson.app?.nameKey,
    'app-name': personnelManifestJson.app?.['app-name'],
  },
  routes: personnelManifestJson.routes ?? [],
  menus: personnelManifestJson.menus ?? [],
  locales: personnelManifestJson.locales,
  raw: personnelManifestJson,
});

registerManifest("main", {
  app: {
    id: mainManifestJson.app?.id ?? "main",
    basePath: mainManifestJson.app?.basePath ?? "/",
    nameKey: mainManifestJson.app?.nameKey,
    'app-name': mainManifestJson.app?.['app-name'],
  },
  routes: mainManifestJson.routes ?? [],
  menus: mainManifestJson.menus ?? [],
  menuConfig: mainManifestJson.menuConfig, // 传递 menuConfig 用于概览页面
  locales: mainManifestJson.locales,
  raw: mainManifestJson,
});
