import adminManifestJson from "./manifests/admin.json" with { type: "json" };
import logisticsManifestJson from "./manifests/logistics.json" with { type: "json" };
import systemManifestJson from "./manifests/system.json" with { type: "json" };
import qualityManifestJson from "./manifests/quality.json" with { type: "json" };
import engineeringManifestJson from "./manifests/engineering.json" with { type: "json" };
import productionManifestJson from "./manifests/production.json" with { type: "json" };
import financeManifestJson from "./manifests/finance.json" with { type: "json" };
import monitorManifestJson from "./manifests/monitor.json" with { type: "json" };
import { getAppBySubdomain } from '@configs/app-scanner';

export interface SubAppManifestRoute {
  path: string;
  labelKey?: string;
  label?: string;
  tab?: { enabled?: boolean; labelKey?: string; label?: string };
  breadcrumbs?: Array<{ labelKey?: string; label?: string; icon?: string }>;
}

export interface SubAppManifest<M = unknown> {
  app: { id: string; basePath?: string; nameKey?: string };
  routes: SubAppManifestRoute[];
  menus?: Array<{ index: string; labelKey?: string; label?: string; icon?: string }>;
  raw: M;
}

const manifestRegistry: Record<string, SubAppManifest> = {};

export function registerManifest(app: string, manifest: SubAppManifest) {
  manifestRegistry[app] = manifest;
}

export function getManifest(app: string): SubAppManifest | undefined {
  return manifestRegistry[app];
}

export function getManifestRoute(app: string, fullPath: string): SubAppManifestRoute | undefined {
  const manifest = getManifest(app);
  if (!manifest) return undefined;

  // 检测是否在生产环境的子域名下
  // 在生产环境中，通过子域名访问时路径是 /，而不是 /finance
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
  
  // 使用应用扫描器获取子域名应用（顶层导入）
  const appBySubdomain = getAppBySubdomain(hostname);
  const currentSubdomainApp = appBySubdomain?.id;
  
  // 如果在生产环境子域名下，且当前应用匹配子域名，路径应该是 / 或 /xxx（没有应用前缀）
  if (isProductionSubdomain && currentSubdomainApp === app) {
    // 在生产环境子域名下，路径直接匹配（不需要 basePath 前缀）
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

      return {
        key,
        path: fullPath,
        labelKey: route.tab?.labelKey ?? route.labelKey,
        label: route.tab?.label ?? route.label,
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
  },
  routes: adminManifestJson.routes ?? [],
  menus: adminManifestJson.menus ?? [],
  raw: adminManifestJson,
});

registerManifest("logistics", {
  app: {
    id: logisticsManifestJson.app?.id ?? "logistics",
    basePath: logisticsManifestJson.app?.basePath ?? "/logistics",
    nameKey: logisticsManifestJson.app?.nameKey,
  },
  routes: logisticsManifestJson.routes ?? [],
  menus: logisticsManifestJson.menus ?? [],
  raw: logisticsManifestJson,
});

registerManifest("system", {
  app: {
    id: systemManifestJson.app?.id ?? "system",
    basePath: systemManifestJson.app?.basePath ?? "/",
    nameKey: systemManifestJson.app?.nameKey,
  },
  routes: systemManifestJson.routes ?? [],
  menus: systemManifestJson.menus ?? [],
  raw: systemManifestJson,
});

registerManifest("quality", {
  app: {
    id: qualityManifestJson.app?.id ?? "quality",
    basePath: qualityManifestJson.app?.basePath ?? "/quality",
    nameKey: qualityManifestJson.app?.nameKey,
  },
  routes: qualityManifestJson.routes ?? [],
  menus: qualityManifestJson.menus ?? [],
  raw: qualityManifestJson,
});

registerManifest("engineering", {
  app: {
    id: engineeringManifestJson.app?.id ?? "engineering",
    basePath: engineeringManifestJson.app?.basePath ?? "/engineering",
    nameKey: engineeringManifestJson.app?.nameKey,
  },
  routes: engineeringManifestJson.routes ?? [],
  menus: engineeringManifestJson.menus ?? [],
  raw: engineeringManifestJson,
});

registerManifest("production", {
  app: {
    id: productionManifestJson.app?.id ?? "production",
    basePath: productionManifestJson.app?.basePath ?? "/production",
    nameKey: productionManifestJson.app?.nameKey,
  },
  routes: productionManifestJson.routes ?? [],
  menus: productionManifestJson.menus ?? [],
  raw: productionManifestJson,
});

registerManifest("finance", {
  app: {
    id: financeManifestJson.app?.id ?? "finance",
    basePath: financeManifestJson.app?.basePath ?? "/finance",
    nameKey: financeManifestJson.app?.nameKey,
  },
  routes: financeManifestJson.routes ?? [],
  menus: financeManifestJson.menus ?? [],
  raw: financeManifestJson,
});

registerManifest("monitor", {
  app: {
    id: monitorManifestJson.app?.id ?? "monitor",
    basePath: monitorManifestJson.app?.basePath ?? "/monitor",
    nameKey: monitorManifestJson.app?.nameKey,
  },
  routes: monitorManifestJson.routes ?? [],
  menus: monitorManifestJson.menus ?? [],
  raw: monitorManifestJson,
});
