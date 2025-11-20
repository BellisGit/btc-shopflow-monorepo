/**
 * 各个子应用的菜单配置
 */
export interface MenuItem {
  index: string;
  title: string;
  icon: string;
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
      icon: 'Coin',
      children: [
        { index: '/admin/platform/domains', title: 'menu.platform.domains', icon: 'Location' },
        { index: '/admin/platform/modules', title: 'menu.platform.modules', icon: 'Files' },
        { index: '/admin/platform/plugins', title: 'menu.platform.plugins', icon: 'Connection' },
      ],
    },
    {
      index: 'org',
      title: 'menu.org',
      icon: 'OfficeBuilding',
      children: [
        { index: '/admin/org/tenants', title: 'menu.org.tenants', icon: 'School' },
        { index: '/admin/org/departments', title: 'menu.org.departments', icon: 'Postcard' },
        { index: '/admin/org/users', title: 'menu.org.users', icon: 'User' },
      ],
    },
    {
      index: 'access',
      title: 'menu.access',
      icon: 'Lock',
      children: [
        {
          index: 'access-config',
          title: 'menu.access.config',
          icon: 'Setting',
          children: [
            { index: '/admin/access/resources', title: 'menu.access.resources', icon: 'FolderOpened' },
            { index: '/admin/access/actions', title: 'menu.access.actions', icon: 'TrendCharts' },
            { index: '/admin/access/permissions', title: 'menu.access.permissions', icon: 'Key' },
            { index: '/admin/access/roles', title: 'menu.access.roles', icon: 'UserFilled' },
          ],
        },
        {
          index: 'access-relations',
          title: 'menu.access.relations',
          icon: 'Link',
          children: [
            { index: '/admin/access/perm-compose', title: 'menu.access.perm_compose', icon: 'Grid' },
            {
              index: 'access-user',
              title: 'menu.access.user_assign',
              icon: 'User',
              children: [
                {
                  index: '/admin/org/users/users-roles',
                  title: 'menu.access.user_role_bind',
                  icon: 'UserFilled',
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
      icon: 'Menu',
      children: [
        { index: '/admin/navigation/menus', title: 'menu.navigation.menus', icon: 'List' },
        { index: '/admin/navigation/menus/preview', title: 'menu.navigation.menu_preview', icon: 'View' },
      ],
    },
    {
      index: 'ops',
      title: 'menu.ops',
      icon: 'Monitor',
      children: [
        {
          index: 'logs',
          title: 'menu.ops.logs',
          icon: 'Document',
          children: [
            { index: '/admin/ops/logs/operation', title: 'menu.ops.operation_log', icon: 'Operation' },
            { index: '/admin/ops/logs/request', title: 'menu.ops.request_log', icon: 'Connection' },
          ],
        },
        { index: '/admin/ops/api-list', title: 'menu.ops.api_list', icon: 'List' },
        { index: '/admin/ops/baseline', title: 'menu.ops.baseline', icon: 'Histogram' },
        { index: '/admin/ops/simulator', title: 'menu.ops.simulator', icon: 'Opportunity' },
      ],
    },
    {
      index: 'strategy',
      title: 'menu.strategy',
      icon: 'Document',
      children: [
        { index: '/admin/strategy/management', title: 'menu.strategy.management', icon: 'Setting' },
        { index: '/admin/strategy/designer', title: 'menu.strategy.designer', icon: 'Edit' },
        { index: '/admin/strategy/monitor', title: 'menu.strategy.monitor', icon: 'TrendCharts' },
      ],
    },
    {
      index: 'governance',
      title: 'menu.governance',
      icon: 'DataAnalysis',
      children: [
        {
          index: 'governance-files',
          title: 'menu.data.files',
          icon: 'Document',
          children: [
            { index: '/admin/governance/files/templates', title: 'menu.data.files.templates', icon: 'Files' },
          ],
        },
      ],
    },
    {
      index: 'test-features',
      title: 'menu.test_features',
      icon: 'Coin',
      children: [
        { index: '/admin/test/components', title: 'menu.test_features.components', icon: 'Tickets' },
        { index: '/admin/test/api-test-center', title: 'menu.test_features.api_test_center', icon: 'Connection' },
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
        { index: '/logistics/procurement/auxiliary', title: 'menu.logistics.procurement.auxiliary', icon: 'Collection' },
        { index: '/logistics/procurement/packaging', title: 'menu.logistics.procurement.packaging', icon: 'CollectionTag' },
        { index: '/logistics/procurement/supplier', title: 'menu.logistics.procurement.supplier', icon: 'User' },
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
          icon: 'Files',
          children: [
            { index: '/logistics/warehouse/material/list', title: 'menu.logistics.warehouse.material.list', icon: 'List' },
          ],
        },
        {
          index: '/logistics/warehouse/inventory',
          title: 'menu.logistics.warehouse.inventory',
          icon: 'Odometer',
          children: [
            { index: '/logistics/warehouse/inventory/info', title: 'menu.logistics.warehouse.inventory.info', icon: 'Document' },
            { index: '/logistics/warehouse/inventory/detail', title: 'menu.logistics.warehouse.inventory.detail', icon: 'Histogram' },
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
