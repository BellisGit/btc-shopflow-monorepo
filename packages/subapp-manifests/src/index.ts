import logisticsManifestJson from "./manifests/logistics.json" with { type: "json" };

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

export function getAllManifests() {
  return { ...manifestRegistry };
}

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
