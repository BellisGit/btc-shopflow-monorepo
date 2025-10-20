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
 */
export const appMenus: AppMenuConfig = {
  // 主应用菜单
  main: [
    {
      index: 'platform',
      title: 'menu.platform',
      icon: 'Coin',
      children: [
        { index: '/platform/domains', title: 'menu.platform.domains', icon: 'Location' },
        { index: '/platform/modules', title: 'menu.platform.modules', icon: 'Files' },
        { index: '/platform/plugins', title: 'menu.platform.plugins', icon: 'Connection' },
      ],
    },
    {
      index: 'org',
      title: 'menu.org',
      icon: 'OfficeBuilding',
      children: [
        { index: '/org/tenants', title: 'menu.org.tenants', icon: 'School' },
        { index: '/org/departments', title: 'menu.org.departments', icon: 'Postcard' },
        { index: '/org/users', title: 'menu.org.users', icon: 'User' },
      ],
    },
    {
      index: 'access',
      title: 'menu.access',
      icon: 'Lock',
      children: [
        { index: '/access/resources', title: 'menu.access.resources', icon: 'FolderOpened' },
        { index: '/access/actions', title: 'menu.access.actions', icon: 'TrendCharts' },
        { index: '/access/permissions', title: 'menu.access.permissions', icon: 'Key' },
        { index: '/access/roles', title: 'menu.access.roles', icon: 'UserFilled' },
        { index: '/access/policies', title: 'menu.access.policies', icon: 'Document' },
        { index: '/access/perm-compose', title: 'menu.access.perm_compose', icon: 'Grid' },
      ],
    },
    {
      index: 'navigation',
      title: 'menu.navigation',
      icon: 'Menu',
      children: [
        { index: '/navigation/menus', title: 'menu.navigation.menus', icon: 'List' },
        { index: '/navigation/menus/preview', title: 'menu.navigation.menu_preview', icon: 'View' },
      ],
    },
    {
      index: 'ops',
      title: 'menu.ops',
      icon: 'Monitor',
      children: [
        { index: '/ops/audit', title: 'menu.ops.audit', icon: 'DocumentCopy' },
        { index: '/ops/baseline', title: 'menu.ops.baseline', icon: 'Histogram' },
        { index: '/ops/simulator', title: 'menu.ops.simulator', icon: 'Opportunity' },
      ],
    },
    {
      index: 'test-features',
      title: 'menu.test_features',
      icon: 'Coin',
      children: [
        { index: '/test/crud', title: 'menu.test_features.crud', icon: 'Tickets' },
        { index: '/test/svg-plugin', title: 'menu.test_features.svg', icon: 'Picture' },
        { index: '/test/i18n', title: 'menu.test_features.i18n', icon: 'ChatDotRound' },
        { index: '/test/select-button', title: 'menu.test_features.select_button', icon: 'Coin' },
        {
          index: '/test/message-notification',
          title: 'menu.test_features.message_notification',
          icon: 'Message',
        },
      ],
    },
    // 文档中心已移至汉堡菜单
  ],

  // 物流应用菜单
  logistics: [
    {
      index: '/logistics',
      title: '物流概览',
      icon: 'home',
    },
    {
      index: '/logistics/orders',
      title: '订单管理',
      icon: 'icon-list',
    },
    {
      index: '/logistics/transport',
      title: '运输管理',
      icon: 'icon-device',
    },
    {
      index: '/logistics/warehouse',
      title: '仓储管理',
      icon: 'icon-folder',
    },
  ],

  // 工程应用菜单
  engineering: [
    {
      index: '/engineering',
      title: '工程概览',
      icon: 'home',
    },
    {
      index: '/engineering/projects',
      title: '项目列表',
      icon: 'icon-design',
    },
    {
      index: '/engineering/progress',
      title: '进度管理',
      icon: 'trend',
    },
    {
      index: '/engineering/monitoring',
      title: '施工监控',
      icon: 'icon-monitor',
    },
  ],

  // 品质应用菜单
  quality: [
    {
      index: '/quality',
      title: '品质概览',
      icon: 'home',
    },
    {
      index: '/quality/inspection',
      title: '质量检验',
      icon: 'icon-approve',
    },
    {
      index: '/quality/reports',
      title: '质量报告',
      icon: 'icon-doc',
    },
    {
      index: '/quality/defects',
      title: '不良品管理',
      icon: 'icon-warn',
    },
  ],

  // 生产应用菜单
  production: [
    {
      index: '/production',
      title: '生产概览',
      icon: 'home',
    },
    {
      index: '/production/plans',
      title: '生产计划',
      icon: 'icon-task',
    },
    {
      index: '/production/schedule',
      title: '排程管理',
      icon: 'icon-time',
    },
    {
      index: '/production/materials',
      title: '物料管理',
      icon: 'icon-goods',
    },
  ],
};
