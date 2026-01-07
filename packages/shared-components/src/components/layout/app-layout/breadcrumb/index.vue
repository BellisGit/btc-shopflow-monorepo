<template>
  <div class="app-breadcrumb">
    <el-breadcrumb separator="|">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
        <span class="breadcrumb-item">
          <!-- SVG 图标 -->
          <btc-svg
            v-if="item.icon && isSvgIcon(item.icon)"
            :name="getSvgName(item.icon)"
            :size="14"
            class="breadcrumb-icon"
          />
          <!-- Element Plus 图标 -->
          <el-icon
            v-else-if="item.icon && ElementPlusIconsVue[item.icon as keyof typeof ElementPlusIconsVue]"
            :size="14"
            class="breadcrumb-icon"
          >
            <component :is="ElementPlusIconsVue[item.icon as keyof typeof ElementPlusIconsVue]" />
          </el-icon>
          <span>{{ item.label }}</span>
        </span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutBreadcrumb',
});

import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { useProcessStore, getCurrentAppFromPath } from '../../../../store/process';
import { getManifestRoute } from '@btc/shared-core/manifest';
import { getMenusForApp } from '../../../../store/menuRegistry';
import { getSubApps, getAppBySubdomain } from '@configs/app-scanner';
import { initGlobalTabBreadcrumbListener, globalBreadcrumbList } from '../../../../composables/useGlobalTabBreadcrumbState';

// 判断是否为SVG图标
function isSvgIcon(iconName?: string): boolean {
  return iconName?.startsWith('svg:') ?? false;
}

// 获取SVG图标名称（移除 svg: 前缀）
function getSvgName(iconName?: string): string {
  return iconName?.replace(/^svg:/, '') || '';
}

const route = useRoute();
const { t, te } = useI18n();
const processStore = useProcessStore();

// 初始化全局状态监听器（单例模式，只注册一次）
onMounted(() => {
  initGlobalTabBreadcrumbListener();
});

interface BreadcrumbItem {
  label: string;
  icon?: string;
  path?: string;
}

// 内部使用的面包屑配置类型
interface BreadcrumbConfig {
  i18nKey: string;
  icon?: string;
}

// 从菜单注册表中查找菜单项的图标
function findMenuIconByI18nKey(i18nKey: string, app: string): string | undefined {
  const menus = getMenusForApp(app);

  // 递归查找菜单项
  function findInMenuItems(items: any[]): string | undefined {
    for (const item of items) {
      // 优先通过 labelKey 匹配（菜单注册时保存的原始 i18n key）
      // 如果 labelKey 不存在，则通过 title 匹配（兼容旧数据）
      const matches = (item.labelKey === i18nKey) || (item.title === i18nKey);
      if (matches && item.icon) {
        return item.icon;
      }
      // 递归查找子菜单
      if (item.children && item.children.length > 0) {
        const found = findInMenuItems(item.children);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  return findInMenuItems(menus);
}

// 根据路由生成面包屑（应用隔离）
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  // 如果路由 meta 中标记为首页，不显示面包屑
  if (route.meta?.isHome === true) {
    return [];
  }

  // 关键：优先使用 window.location.pathname，因为它不受路由初始化时机影响
  // 在页面刷新时，window.location.pathname 已经有正确的值，而 route.path 可能还在初始化
  const locationPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const routePath = route?.path || '';
  const pathToUse = locationPath || routePath;
  const normalizedPath = pathToUse.replace(/\/+$/, '') || '/';

  // 生产环境子域名判断：路径为 / 且当前应用是子应用（双重保险，即使 showBreadcrumb 判断失败也能保证不显示内容）
  if (normalizedPath === '/' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const appBySubdomain = getAppBySubdomain(hostname);
    // 如果通过子域名识别到子应用，则不显示面包屑
    if (appBySubdomain && appBySubdomain.type === 'sub') {
      return [];
    }
  }

  // 开发/预览环境：检查路径是否匹配任何子应用的 pathPrefix
  const subApps = getSubApps();
  for (const app of subApps) {
    const normalizedPathPrefix = app.pathPrefix.endsWith('/')
      ? app.pathPrefix.slice(0, -1)
      : app.pathPrefix;
    const normalizedPathForCheck = normalizedPath.endsWith('/') && normalizedPath !== '/'
      ? normalizedPath.slice(0, -1)
      : normalizedPath;

    // 精确匹配 pathPrefix 不显示面包屑
    if (normalizedPathForCheck === normalizedPathPrefix) {
      return [];
    }
  }

  const currentApp = getCurrentAppFromPath(normalizedPath);

  const currentTab =
    processStore.list.find(
      (tab) =>
        (tab.fullPath && tab.fullPath.replace(/\/+$/, '') === normalizedPath) ||
        (tab.path && tab.path.replace(/\/+$/, '') === normalizedPath),
    ) ?? null;

  const normalizeBreadcrumbEntries = (entries: any[] | undefined) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    // 使用外部已经计算好的 normalizedPath，确保路径一致性
    const currentApp = getCurrentAppFromPath(normalizedPath);

    return entries
      .map((item) => {
        const key =
          (typeof item.labelKey === 'string' && item.labelKey) ||
          (typeof item.i18nKey === 'string' && item.i18nKey);
        const rawLabel =
          (typeof item.label === 'string' && item.label) ||
          (typeof key === 'string' ? key : '');

        if (!rawLabel) {
          return null;
        }

        // 优先使用主应用的 i18n 实例进行翻译
        let label: string;
        if (key) {
          // 优先使用主应用的 i18n 实例进行翻译
          const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
          if (mainAppI18n && mainAppI18n.global) {
            const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
            const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
            
            // 直接访问消息对象，确保能访问到已合并的语言包
            if (key in messages) {
              const value = messages[key];
              if (typeof value === 'string' && value.trim() !== '') {
                label = value;
              } else if (typeof value === 'function') {
                try {
                  const result = value({ normalize: (arr: any[]) => arr[0] });
                  if (typeof result === 'string' && result.trim() !== '') {
                    label = result;
                  }
                } catch {
                  // 如果函数调用失败，继续使用其他方法
                }
              }
            }
            
            // 如果直接访问失败，使用 t() 函数
            if (!label && mainAppI18n.global.te(key, currentLocale)) {
              const mainTranslated = mainAppI18n.global.t(key, currentLocale);
              if (mainTranslated && typeof mainTranslated === 'string' && mainTranslated !== key && mainTranslated.trim() !== '') {
                label = mainTranslated;
              }
            }
          }
          
          // 如果主应用翻译失败，尝试使用子应用的 t() 函数
          if (!label && te(key)) {
            label = t(key);
          } else if (!label) {
            // 翻译键不存在，使用兜底文本
            label = rawLabel;
          }
        } else {
          // 没有翻译键，尝试翻译 rawLabel
          // 优先使用主应用的 i18n 实例进行翻译
          const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
          if (mainAppI18n && mainAppI18n.global && rawLabel.includes('.')) {
            const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
            const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
            
            // 直接访问消息对象，确保能访问到已合并的语言包
            if (rawLabel in messages) {
              const value = messages[rawLabel];
              if (typeof value === 'string' && value.trim() !== '') {
                label = value;
              } else if (typeof value === 'function') {
                try {
                  const result = value({ normalize: (arr: any[]) => arr[0] });
                  if (typeof result === 'string' && result.trim() !== '') {
                    label = result;
                  }
                } catch {
                  // 如果函数调用失败，继续使用其他方法
                }
              }
            }
            
            // 如果直接访问失败，使用 t() 函数
            if (!label && mainAppI18n.global.te(rawLabel, currentLocale)) {
              const mainTranslated = mainAppI18n.global.t(rawLabel, currentLocale);
              if (mainTranslated && typeof mainTranslated === 'string' && mainTranslated !== rawLabel && mainTranslated.trim() !== '') {
                label = mainTranslated;
              }
            }
          }
          
          // 如果主应用翻译失败，尝试使用子应用的 t() 函数
          if (!label) {
            label = te(rawLabel) ? t(rawLabel) : rawLabel;
          }
        }

        // 优先从菜单注册表中查找图标（确保与左侧菜单图标一致）
        let icon: string | undefined;
        if (key) {
          const menuIcon = findMenuIconByI18nKey(key, currentApp);
          if (menuIcon) {
            icon = menuIcon;
          }
        }
        // 如果菜单注册表中没有找到图标，使用 manifest/路由 meta 中指定的图标（兜底）
        if (!icon && item.icon) {
          icon = item.icon;
        }

        const result: BreadcrumbItem = {
          label,
        };
        if (icon) {
          result.icon = icon;
        }
        if (item.path) {
          result.path = item.path;
        }
        return result;
      })
      .filter(Boolean) as BreadcrumbItem[];
  };

  // 优先级 1: 全局状态的 breadcrumbList（微应用推送或主应用更新）
  if (globalBreadcrumbList.value.length > 0) {
    return normalizeBreadcrumbEntries(globalBreadcrumbList.value);
  }

  const metaBreadcrumbs = normalizeBreadcrumbEntries(
    currentTab?.meta?.breadcrumbs,
  );
  if (metaBreadcrumbs.length > 0) {
    return metaBreadcrumbs;
  }

  const manifestBreadcrumbs = normalizeBreadcrumbEntries(
    getManifestRoute(currentApp, normalizedPath)?.breadcrumbs,
  );
  if (manifestBreadcrumbs.length > 0) {
    return manifestBreadcrumbs;
  }

  // 管理域的路径映射（完整层级结构）
  // 注意：图标将从菜单注册表中自动获取，这里只保留 i18nKey
  // 生产环境下路径没有 /admin 前缀（如 /platform/domains 而不是 /admin/platform/domains）
  const adminAppBreadcrumbs: Record<string, BreadcrumbConfig[]> = {
    // 平台治理
    '/platform/domains': [
      { i18nKey: 'menu.platform' },
      { i18nKey: 'menu.platform.domains' },
    ],
    '/platform/modules': [
      { i18nKey: 'menu.platform' },
      { i18nKey: 'menu.platform.modules' },
    ],
    '/platform/plugins': [
      { i18nKey: 'menu.platform' },
      { i18nKey: 'menu.platform.plugins' },
    ],

    // 组织与账号
    '/org/tenants': [
      { i18nKey: 'menu.org' },
      { i18nKey: 'menu.org.tenants' },
    ],
    '/org/departments': [
      { i18nKey: 'menu.org' },
      { i18nKey: 'menu.org.departments' },
    ],
    '/org/users': [
      { i18nKey: 'menu.org' },
      { i18nKey: 'menu.org.users' },
    ],

    // 访问控制
    '/access/resources': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.config' },
      { i18nKey: 'menu.access.resources' },
    ],
    '/access/actions': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.config' },
      { i18nKey: 'menu.access.actions' },
    ],
    '/access/permissions': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.config' },
      { i18nKey: 'menu.access.permissions' },
    ],
    '/access/roles': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.config' },
      { i18nKey: 'menu.access.roles' },
    ],
    '/access/perm-compose': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.relations' },
      { i18nKey: 'menu.access.perm_compose' },
    ],
    '/org/users/:id/roles': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.relations' },
      { i18nKey: 'menu.access.user_assign' },
      { i18nKey: 'menu.access.user_role_bind' },
    ],
    '/org/users/users-roles': [
      { i18nKey: 'menu.access' },
      { i18nKey: 'menu.access.relations' },
      { i18nKey: 'menu.access.user_assign' },
      { i18nKey: 'menu.access.user_role_bind' },
    ],

    // 导航与可见性
    '/navigation/menus': [
      { i18nKey: 'menu.navigation' },
      { i18nKey: 'menu.navigation.menus' },
    ],
    '/navigation/menus/preview': [
      { i18nKey: 'menu.navigation' },
      { i18nKey: 'menu.navigation.menu_preview' },
    ],

    // 运维与审计
    '/ops/logs/operation': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.logs' },
      { i18nKey: 'menu.ops.operation_log' },
    ],
    '/ops/logs/request': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.logs' },
      { i18nKey: 'menu.ops.request_log' },
    ],
    '/ops/baseline': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.baseline' },
    ],
    '/ops/api-list': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.api_list' },
    ],
    '/ops/simulator': [
      { i18nKey: 'menu.ops' },
      { i18nKey: 'menu.ops.simulator' },
    ],
    // 策略相关
    '/strategy/management': [
      { i18nKey: 'menu.strategy' },
      { i18nKey: 'menu.strategy.management' },
    ],
    '/strategy/designer': [
      { i18nKey: 'menu.strategy' },
      { i18nKey: 'menu.strategy.designer' },
    ],
    '/strategy/monitor': [
      { i18nKey: 'menu.strategy' },
      { i18nKey: 'menu.strategy.monitor' },
    ],
    // 数据治理
    '/governance/files/templates': [
      { i18nKey: 'menu.governance' },
      { i18nKey: 'menu.data.files' },
      { i18nKey: 'menu.data.files.templates' },
    ],
    // 测试功能（图标将从菜单注册表中获取）
    '/test/components': [
      { i18nKey: 'menu.test_features' },
      { i18nKey: 'menu.test_features.components' },
    ],
    '/test/api-test-center': [
      { i18nKey: 'menu.test_features' },
      { i18nKey: 'menu.test_features.api_test_center' },
    ],
    '/test/inventory-ticket-print': [
      { i18nKey: 'menu.test_features' },
      { i18nKey: 'menu.test_features.inventory_ticket_print' },
    ],
    // 开发环境路径（带 /admin 前缀）
    '/admin/test/inventory-ticket-print': [
      { i18nKey: 'menu.test_features' },
      { i18nKey: 'menu.test_features.inventory_ticket_print' },
    ],
  };

  // 子应用的面包屑映射（暂时为空，待实现具体页面）
  const subAppBreadcrumbs: Record<string, Record<string, BreadcrumbConfig[]>> = {
    system: {
      '/404': [
        { i18nKey: 'common.page_not_found', icon: 'svg:404' },
      ],
    },
    logistics: {},
    engineering: {},
    quality: {},
    production: {},
    finance: {},
    operations: {
      '/': [
        { i18nKey: 'menu.operations.overview' },
      ],
      '/ops/error': [
        { i18nKey: 'menu.operations.name' },
        { i18nKey: 'menu.operations.error' },
      ],
      '/ops/deployment-test': [
        { i18nKey: 'menu.operations.name' },
        { i18nKey: 'menu.operations.deploymentTest' },
      ],
    },
  };

  // 如果路由 meta 中标记为首页，不显示面包屑（已在开头检查，这里保留兼容逻辑）
  // 系统应用和管理应用的首页不显示面包屑
  const homePaths = new Set([
    '/',
    '/admin',
  ]);

  // 特殊处理：系统应用（system）和管理应用（admin）的首页不显示面包屑
  if (homePaths.has(normalizedPath)) {
    // 如果是系统应用或管理应用的首页，不显示面包屑
    if (normalizedPath === '/' && currentApp === 'system') {
      return [];
    }
    if (normalizedPath === '/admin' && currentApp === 'admin') {
      return [];
    }
  }

  // 获取面包屑数据
  // 生产环境下路径没有 /admin 前缀（如 /platform/domains），开发环境有 /admin 前缀
  let breadcrumbData: BreadcrumbConfig[] | undefined;

  // 优先使用识别到的应用类型
  if (currentApp === 'admin') {
    // 先尝试直接匹配（开发环境路径，如 /admin/governance/dictionary/fields）
    breadcrumbData = adminAppBreadcrumbs[normalizedPath];

    // 如果没匹配到，尝试去掉 /admin 前缀后再匹配（处理开发环境和生产环境的路径差异）
    if (!breadcrumbData && normalizedPath.startsWith('/admin/')) {
      const pathWithoutAdmin = normalizedPath.substring('/admin'.length) || '/';
      breadcrumbData = adminAppBreadcrumbs[pathWithoutAdmin];
    }

    // 如果还没匹配到，尝试添加 /admin 前缀后再匹配（处理生产环境路径）
    if (!breadcrumbData && !normalizedPath.startsWith('/admin')) {
      breadcrumbData = adminAppBreadcrumbs[`/admin${normalizedPath}`];
    }
  } else if (currentApp && subAppBreadcrumbs[currentApp]) {
    // 先尝试直接匹配
    breadcrumbData = subAppBreadcrumbs[currentApp][normalizedPath];

    // 如果直接匹配失败，尝试移除应用前缀（处理主域名访问的情况，如 /operations/ops/error -> /ops/error）
    if (!breadcrumbData && normalizedPath.startsWith(`/${currentApp}/`)) {
      const pathWithoutPrefix = normalizedPath.substring(`/${currentApp}`.length) || '/';
      breadcrumbData = subAppBreadcrumbs[currentApp][pathWithoutPrefix];
    }

    // 如果仍然没有匹配到，尝试在所有子应用中查找（处理子域名访问的情况，如 operations.bellis.com.cn/ops/error）
    if (!breadcrumbData) {
      for (const [_appId, appBreadcrumbs] of Object.entries(subAppBreadcrumbs)) {
        if (appBreadcrumbs[normalizedPath]) {
          breadcrumbData = appBreadcrumbs[normalizedPath];
          break;
        }
      }
    }
  } else {
    // 如果无法识别应用，先尝试在所有子应用中查找
    for (const [_appId, appBreadcrumbs] of Object.entries(subAppBreadcrumbs)) {
      if (appBreadcrumbs[normalizedPath]) {
        breadcrumbData = appBreadcrumbs[normalizedPath];
        break;
      }
    }

    // 如果仍然没有匹配到，尝试使用 admin 应用的面包屑配置（作为后备方案）
    if (!breadcrumbData) {
      breadcrumbData = adminAppBreadcrumbs[normalizedPath];
    }
  }

  if (!breadcrumbData) {
    return [];
  }

  // 转换为带翻译的面包屑，并从菜单注册表中获取图标
  return breadcrumbData.map((item): BreadcrumbItem => {
    // 优先使用配置中的图标，如果没有则从菜单注册表中查找
    const menuIcon = item.i18nKey ? findMenuIconByI18nKey(item.i18nKey, currentApp) : undefined;
    const result: BreadcrumbItem = {
      label: item.i18nKey ? t(item.i18nKey) : '',
    };
    const icon = item.icon || menuIcon;
    if (icon) {
      result.icon = icon;
    }
    return result;
  });
});
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
  position: relative;
  padding: 5px 10px; // 统一左右 padding
  user-select: none;
  background-color: var(--el-bg-color);
  overflow: hidden;
  height: 39px; // 总高度 39px（包含 padding）
  width: 100% !important; // 使用 !important 防止被覆盖，确保宽度稳定
  box-sizing: border-box !important; // 使用 !important 防止被覆盖，确保边框包含在宽度内

  :deep(.el-breadcrumb) {
    font-size: 14px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  :deep(.el-breadcrumb__item) {
    display: flex;
    align-items: center;

    .el-breadcrumb__inner {
      color: var(--el-text-color-regular);
      font-weight: normal;
      cursor: default;
      pointer-events: none;
      padding: 0; // 移除默认 padding
    }

    &:last-child .el-breadcrumb__inner {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }

  :deep(.el-breadcrumb__separator) {
    color: var(--el-text-color-placeholder);
    margin: 0 8px;
    font-weight: normal;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-blank);
    height: 26px;
  }

  .breadcrumb-icon {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  // 最后一级样式（当前页面）
  :deep(.el-breadcrumb__item:last-child) {
    .breadcrumb-item {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-5);
      color: var(--el-text-color-primary);

      .breadcrumb-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

// 深色主题样式（全局样式，不使用 scoped）
html.dark .app-breadcrumb {
  .breadcrumb-item {
    border-color: var(--el-border-color) !important;
    background-color: var(--el-bg-color) !important;
  }

  :deep(.el-breadcrumb__item:last-child) {
    .breadcrumb-item {
      background-color: var(--el-color-primary-light-9) !important;
      border-color: var(--el-color-primary-light-5) !important;
    }
  }
}
</style>
