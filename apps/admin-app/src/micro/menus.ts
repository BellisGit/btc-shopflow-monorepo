/**
 * 各个子应用的菜单配置
 */
export interface MenuItem {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
}

export interface AppMenuConfig {
  [appName: string]: MenuItem[];
}

/**
 * 所有应用的菜单配置
 * 注意：子应用的菜单应该由各自应用通过 registerMenus 注册，这里只保留管理域的菜单
 */
export const appMenus: AppMenuConfig = {
  // 管理域菜单
  admin: [
    {
      index: 'platform',
      title: 'menu.platform',
      children: [
        { index: '/admin/platform/domains', title: 'menu.platform.domains' },
        { index: '/admin/platform/modules', title: 'menu.platform.modules' },
        { index: '/admin/platform/plugins', title: 'menu.platform.plugins' },
      ],
    },
    {
      index: 'org',
      title: 'menu.org',
      children: [
        { index: '/admin/org/tenants', title: 'menu.org.tenants' },
        { index: '/admin/org/departments', title: 'menu.org.departments' },
        { index: '/admin/org/users', title: 'menu.org.users' },
      ],
    },
    {
      index: 'access',
      title: 'menu.access',
      children: [
        {
          index: 'access-config',
          title: 'menu.access.config',
          children: [
            { index: '/admin/access/resources', title: 'menu.access.resources' },
            { index: '/admin/access/actions', title: 'menu.access.actions' },
            { index: '/admin/access/permissions', title: 'menu.access.permissions' },
            { index: '/admin/access/roles', title: 'menu.access.roles' },
          ],
        },
        {
          index: 'access-relations',
          title: 'menu.access.relations',
          children: [
            { index: '/admin/access/perm-compose', title: 'menu.access.perm_compose' },
            {
              index: 'access-user',
              title: 'menu.access.user_assign',
              children: [
                {
                  index: '/admin/org/users/users-roles',
                  title: 'menu.access.user_role_bind',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      index: 'navigation',
      title: 'menu.navigation',
      children: [
        { index: '/admin/navigation/menus', title: 'menu.navigation.menus' },
        { index: '/admin/navigation/menus/preview', title: 'menu.navigation.menu_preview' },
      ],
    },
    {
      index: 'ops',
      title: 'menu.ops',
      children: [
        {
          index: 'logs',
          title: 'menu.ops.logs',
          children: [
            { index: '/admin/ops/logs/operation', title: 'menu.ops.operation_log' },
            { index: '/admin/ops/logs/request', title: 'menu.ops.request_log' },
          ],
        },
        { index: '/admin/ops/api-list', title: 'menu.ops.api_list' },
        { index: '/admin/ops/baseline', title: 'menu.ops.baseline' },
        { index: '/admin/ops/simulator', title: 'menu.ops.simulator' },
      ],
    },
    {
      index: 'strategy',
      title: 'menu.strategy',
      children: [
        { index: '/admin/strategy/management', title: 'menu.strategy.management' },
        { index: '/admin/strategy/designer', title: 'menu.strategy.designer' },
        { index: '/admin/strategy/monitor', title: 'menu.strategy.monitor' },
      ],
    },
    {
      index: 'governance',
      title: 'menu.governance',
      children: [
        {
          index: 'governance-files',
          title: 'menu.data.files',
          children: [
            { index: '/admin/governance/files/templates', title: 'menu.data.files.templates' },
          ],
        },
      ],
    },
    {
      index: 'test-features',
      title: 'menu.test_features',
      children: [
        { index: '/admin/test/components', title: 'menu.test_features.components' },
        { index: '/admin/test/api-test-center', title: 'menu.test_features.api_test_center' },
      ],
    },
    // 文档中心已移至汉堡菜单
  ],

  // 物流应用菜单
  logistics: [
    {
      index: '/logistics/procurement',
      title: 'menu.logistics.procurementModule',
      icon: 'svg:cart',
      children: [
        { index: '/logistics/procurement/auxiliary', title: 'menu.logistics.procurement.auxiliary' },
        { index: '/logistics/procurement/packaging', title: 'menu.logistics.procurement.packaging' },
        { index: '/logistics/procurement/supplier', title: 'menu.logistics.procurement.supplier' },
      ],
    },
    {
      index: '/logistics/warehouse',
      title: 'menu.logistics.warehouseModule',
      icon: 'svg:folder',
      children: [
        {
          index: '/logistics/warehouse/material',
          title: 'menu.logistics.warehouse.material',
          children: [
            { index: '/logistics/warehouse/material/list', title: 'menu.logistics.warehouse.material.list' },
          ],
        },
      ],
    },
    {
      index: '/logistics/customs',
      title: 'menu.logistics.customsModule',
      icon: 'svg:map',
    },
  ],

  // 工程应用菜单（已移除，使用 manifest 管理）
  engineering: [],

  // 品质应用菜单（已移除，使用 manifest 管理）
  quality: [],

  // 生产应用菜单（已移除，使用 manifest 管理）
  production: [],

  // 财务应用菜单（已移除，使用 manifest 管理）
  finance: [],
};
