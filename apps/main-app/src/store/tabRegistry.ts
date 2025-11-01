/**
 * Tab 元数据注册表（主应用主导，命名空间化）
 */

export interface TabMeta {
  key: string;
  title: string;
  path: string;
  i18nKey?: string;
}

// 两级映射：app 级 + 路由级
const registry: Record<string, Record<string, TabMeta>> = {
  // 主应用自己的 tabs
  main: {
    '': { key: '', title: '首页', path: '/', i18nKey: 'menu.home' },

    // 测试功能
    'test-components': { key: 'test-components', title: '组件测试中心', path: '/test/components', i18nKey: 'menu.test_features.components' },

    // 文档中心
    'docs': { key: 'docs', title: '文档中心', path: '/docs', i18nKey: 'menu.docs_center' },

    // 平台治理
    'platform-domains': { key: 'platform-domains', title: 'Domains', path: '/platform/domains', i18nKey: 'menu.platform.domains' },
    'platform-modules': { key: 'platform-modules', title: 'Modules', path: '/platform/modules', i18nKey: 'menu.platform.modules' },
    'platform-plugins': { key: 'platform-plugins', title: 'Plugins', path: '/platform/plugins', i18nKey: 'menu.platform.plugins' },

    // 组织与账号
    'org-tenants': { key: 'org-tenants', title: 'Tenants', path: '/org/tenants', i18nKey: 'menu.org.tenants' },
    'org-departments': { key: 'org-departments', title: 'Departments', path: '/org/departments', i18nKey: 'menu.org.departments' },
    'org-users': { key: 'org-users', title: 'Users', path: '/org/users', i18nKey: 'menu.org.users' },
    'org-dept-role-bind': { key: 'org-dept-role-bind', title: 'Dept Role Bind', path: '/org/departments/:id/roles', i18nKey: 'menu.org.dept_role_bind' },
    'org-user-role-assign': { key: 'org-user-role-assign', title: 'User Role Assign', path: '/org/users/:id/roles', i18nKey: 'menu.org.user_role_assign' },

    // 访问控制
    'access-resources': { key: 'access-resources', title: 'Resources', path: '/access/resources', i18nKey: 'menu.access.resources' },
    'access-actions': { key: 'access-actions', title: 'Actions', path: '/access/actions', i18nKey: 'menu.access.actions' },
    'access-permissions': { key: 'access-permissions', title: 'Permissions', path: '/access/permissions', i18nKey: 'menu.access.permissions' },
    'access-roles': { key: 'access-roles', title: 'Roles', path: '/access/roles', i18nKey: 'menu.access.roles' },
    'access-policies': { key: 'access-policies', title: 'Policies', path: '/access/policies', i18nKey: 'menu.access.policies' },
    'access-role-perm-bind': { key: 'access-role-perm-bind', title: 'Role Perm Bind', path: '/access/roles/:id/permissions', i18nKey: 'menu.access.role_perm_bind' },
    'access-perm-compose': { key: 'access-perm-compose', title: 'Perm Compose', path: '/access/perm-compose', i18nKey: 'menu.access.perm_compose' },

    // 导航与可见性
    'navigation-menus': { key: 'navigation-menus', title: 'Menus', path: '/navigation/menus', i18nKey: 'menu.navigation.menus' },
    'navigation-menu-perm-bind': { key: 'navigation-menu-perm-bind', title: 'Menu Perm Bind', path: '/navigation/menus/:id/permissions', i18nKey: 'menu.navigation.menu_perm_bind' },
    'navigation-menu-preview': { key: 'navigation-menu-preview', title: 'Menu Preview', path: '/navigation/menus/preview', i18nKey: 'menu.navigation.menu_preview' },

    // 数据管理
    'data-files-list': { key: 'data-files-list', title: 'File List', path: '/data/files/list', i18nKey: 'menu.data.files.list' },
    'data-files-templates': { key: 'data-files-templates', title: 'Process Templates', path: '/data/files/templates', i18nKey: 'menu.data.files.templates' },
    'data-files-preview': { key: 'data-files-preview', title: 'File Preview', path: '/data/files/preview', i18nKey: 'menu.data.files.preview' },
    'data-recycle': { key: 'data-recycle', title: 'Data Recycle Bin', path: '/data/recycle', i18nKey: 'menu.data.recycle' },

    // 策略相关
    'strategy-management': { key: 'strategy-management', title: 'Strategy Management', path: '/strategy/management', i18nKey: 'menu.strategy.management' },
    'strategy-designer': { key: 'strategy-designer', title: 'Strategy Designer', path: '/strategy/designer', i18nKey: 'menu.strategy.designer' },
    'strategy-monitor': { key: 'strategy-monitor', title: 'Strategy Monitor', path: '/strategy/monitor', i18nKey: 'menu.strategy.monitor' },

    // 运维与审计
    'ops-logs-operation': { key: 'ops-logs-operation', title: 'Operation Log', path: '/ops/logs/operation', i18nKey: 'menu.ops.operation_log' },
    'ops-logs-request': { key: 'ops-logs-request', title: 'Request Log', path: '/ops/logs/request', i18nKey: 'menu.ops.request_log' },
    'ops-baseline': { key: 'ops-baseline', title: 'Baseline', path: '/ops/baseline', i18nKey: 'menu.ops.baseline' },
    'ops-simulator': { key: 'ops-simulator', title: 'Simulator', path: '/ops/simulator', i18nKey: 'menu.ops.simulator' },

    // 旧路径兼容（避免刷新后找不到tab）
    'system-permission-domain': { key: 'platform-domains', title: 'Domains', path: '/platform/domains', i18nKey: 'menu.platform.domains' },
    'system-permission-plugin': { key: 'platform-plugins', title: 'Plugins', path: '/platform/plugins', i18nKey: 'menu.platform.plugins' },
    'system-permission-module': { key: 'platform-modules', title: 'Modules', path: '/platform/modules', i18nKey: 'menu.platform.modules' },
    'system-permission-user': { key: 'org-users', title: 'Users', path: '/org/users', i18nKey: 'menu.org.users' },
    'system-permission-tenant': { key: 'org-tenants', title: 'Tenants', path: '/org/tenants', i18nKey: 'menu.org.tenants' },
    'system-permission-menu': { key: 'navigation-menus', title: 'Menus', path: '/navigation/menus', i18nKey: 'menu.navigation.menus' },
    'system-permission-action': { key: 'access-actions', title: 'Actions', path: '/access/actions', i18nKey: 'menu.access.actions' },
    'system-permission-role': { key: 'access-roles', title: 'Roles', path: '/access/roles', i18nKey: 'menu.access.roles' },
    'system-permission-resource': { key: 'access-resources', title: 'Resources', path: '/access/resources', i18nKey: 'menu.access.resources' },
    'system-permission-department': { key: 'org-departments', title: 'Departments', path: '/org/departments', i18nKey: 'menu.org.departments' },
  },
  // 子应用的表在进入时注册
  logistics: {},
  engineering: {},
  quality: {},
  production: {},
};

/**
 * 当前激活应用（根据路径前缀判断）
 */
export function getActiveApp(pathname: string): string {
  if (pathname.startsWith('/logistics')) return 'logistics';
  if (pathname.startsWith('/engineering')) return 'engineering';
  if (pathname.startsWith('/quality')) return 'quality';
  if (pathname.startsWith('/production')) return 'production';
  return 'main';
}

/**
 * 从路径提取 key
 */
function extractKey(pathname: string, app: string): string {
  if (app === 'main') {
    // 主应用：/crud -> 'crud', /system/permission/user -> 'system-permission-user'
    const path = pathname.replace(/^\//, '');
    return path.replace(/\//g, '-') || 'home';
  } else {
    // 子应用：/logistics/orders -> 'orders'
    const prefix = `/${app}`;
    const suffix = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
    const path = suffix.replace(/^\//, '');
    return path || 'home';
  }
}

/**
 * 解析 Tab 元数据
 */
export function resolveTabMeta(pathname: string): TabMeta | null {
  const app = getActiveApp(pathname);
  const key = extractKey(pathname, app);

  // 先取当前应用的映射
  const appDict = registry[app];
  if (appDict && appDict[key]) {
    return appDict[key];
  }

  // 如果是子应用命名空间，查不到就直接放弃（不要 fallback 到 main）
  if (app !== 'main') {
    return null;
  }

  // main 命名空间可以兜底
  const mainDict = registry.main;
  if (mainDict[key]) {
    return mainDict[key];
  }

  // main 命名空间也查不到，返回 null（不要创建脏 Tab）
  return null;
}

/**
 * 注册子应用的 Tab 定义
 */
export function registerTabs(app: string, tabs: TabMeta[]) {
  if (!registry[app]) {
    registry[app] = {};
  }

  tabs.forEach(tab => {
    registry[app][tab.key] = tab;
  });
}

/**
 * 清理子应用的 Tab 定义
 */
export function clearTabs(app: string) {
  if (app !== 'main' && registry[app]) {
    registry[app] = {};
  }
}

/**
 * 清理除指定应用外的所有 Tab 定义
 */
export function clearTabsExcept(app: string) {
  Object.keys(registry).forEach(key => {
    if (key !== 'main' && key !== app) {
      registry[key] = {};
    }
  });
}

/**
 * 获取指定命名空间的所有 Tab 元数据
 */
export function getTabsForNamespace(app: string): TabMeta[] {
  return Object.values(registry[app] || {});
}

