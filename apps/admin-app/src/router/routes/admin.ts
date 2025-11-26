import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import Layout from '../../modules/base/components/layout/index.vue';

// 判断是否独立运行
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;

// 基础路由（页面组件）
const pageRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'AdminHome',
    component: () => import('../../pages/home/index.vue'),
    meta: { isHome: true, titleKey: 'menu.home' },
  },
  // 平台治理
  {
    path: '/platform/domains',
    name: 'AdminDomains',
    component: () => import('../../modules/platform/views/domains/index.vue'),
    meta: { titleKey: 'menu.platform.domains' },
  },
  {
    path: '/platform/modules',
    name: 'AdminModules',
    component: () => import('../../modules/platform/views/modules/index.vue'),
    meta: { titleKey: 'menu.platform.modules' },
  },
  {
    path: '/platform/plugins',
    name: 'AdminPlugins',
    component: () => import('../../modules/platform/views/plugins/index.vue'),
    meta: { titleKey: 'menu.platform.plugins' },
  },
  // 组织与账号
  {
    path: '/org/tenants',
    name: 'AdminTenants',
    component: () => import('../../modules/org/views/tenants/index.vue'),
    meta: { titleKey: 'menu.org.tenants' },
  },
  {
    path: '/org/departments',
    name: 'AdminDepartments',
    component: () => import('../../modules/org/views/departments/index.vue'),
    meta: { titleKey: 'menu.org.departments' },
  },
  {
    path: '/org/users',
    name: 'AdminUsers',
    component: () => import('../../modules/org/views/users/index.vue'),
    meta: { titleKey: 'menu.org.users' },
  },
  {
    path: '/org/departments/:id/roles',
    name: 'AdminDeptRoleBind',
    component: () => import('../../modules/org/views/dept-role-bind/index.vue'),
    meta: { titleKey: 'menu.org.dept_role_bind' },
  },
  {
    path: '/org/users/users-roles',
    name: 'AdminUserRoleAssign',
    component: () => import('../../modules/org/views/user-role-assign/index.vue'),
    meta: { titleKey: 'menu.access.user_role_bind' },
  },
  // 访问控制
  {
    path: '/access/resources',
    name: 'AdminResources',
    component: () => import('../../modules/access/views/resources/index.vue'),
    meta: { titleKey: 'menu.access.resources' },
  },
  {
    path: '/access/actions',
    name: 'AdminActions',
    component: () => import('../../modules/access/views/actions/index.vue'),
    meta: { titleKey: 'menu.access.actions' },
  },
  {
    path: '/access/permissions',
    name: 'AdminPermissions',
    component: () => import('../../modules/access/views/permissions/index.vue'),
    meta: { titleKey: 'menu.access.permissions' },
  },
  {
    path: '/access/roles',
    name: 'AdminRoles',
    component: () => import('../../modules/access/views/roles/index.vue'),
    meta: { titleKey: 'menu.access.roles' },
  },
  {
    path: '/access/roles/:id/permissions',
    name: 'AdminRolePermBind',
    component: () => import('../../modules/access/views/role-perm-bind/index.vue'),
    meta: { titleKey: 'menu.access.role_perm_bind' },
  },
  {
    path: '/access/perm-compose',
    name: 'AdminPermCompose',
    component: () => import('../../modules/access/views/perm-compose/index.vue'),
    meta: { titleKey: 'menu.access.perm_compose' },
  },
  {
    path: '/access/role-permission-bind',
    name: 'AdminRolePermissionBind',
    component: () => import('../../modules/access/views/role-permission-bind/index.vue'),
    meta: { titleKey: 'menu.access.role_permission_bind' },
  },
  // 导航与可见性
  {
    path: '/navigation/menus',
    name: 'AdminMenus',
    component: () => import('../../modules/navigation/views/menus/index.vue'),
    meta: { titleKey: 'menu.navigation.menus' },
  },
  {
    path: '/navigation/menus/:id/permissions',
    name: 'AdminMenuPermBind',
    component: () => import('../../modules/navigation/views/menu-perm-bind/index.vue'),
    meta: { titleKey: 'menu.navigation.menu_perm_bind' },
  },
  {
    path: '/navigation/menus/preview',
    name: 'AdminMenuPreview',
    component: () => import('../../modules/navigation/views/menu-preview/index.vue'),
    meta: { titleKey: 'menu.navigation.menu_preview' },
  },
  // 运维与审计
  {
    path: '/ops/logs/operation',
    name: 'AdminOperationLog',
    component: () => import('../../modules/ops/views/logs/operation/index.vue'),
    meta: { titleKey: 'menu.ops.operation_log' },
  },
  {
    path: '/ops/logs/request',
    name: 'AdminRequestLog',
    component: () => import('../../modules/ops/views/logs/request/index.vue'),
    meta: { titleKey: 'menu.ops.request_log' },
  },
  {
    path: '/ops/api-list',
    name: 'AdminApiList',
    component: () => import('../../modules/ops/views/api-list/index.vue'),
    meta: { titleKey: 'menu.ops.api_list' },
  },
  {
    path: '/ops/baseline',
    name: 'AdminBaseline',
    component: () => import('../../modules/ops/views/baseline/index.vue'),
    meta: { titleKey: 'menu.ops.baseline' },
  },
  {
    path: '/ops/simulator',
    name: 'AdminSimulator',
    component: () => import('../../modules/ops/views/simulator/index.vue'),
    meta: { titleKey: 'menu.ops.simulator' },
  },
  // 策略中心
  {
    path: '/strategy/management',
    name: 'AdminStrategyManagement',
    component: () => import('../../modules/strategy/views/management/index.vue'),
    meta: { titleKey: 'menu.strategy.management' },
  },
  {
    path: '/strategy/designer',
    name: 'AdminStrategyDesigner',
    component: () => import('../../modules/strategy/views/designer/index.vue'),
    meta: { titleKey: 'menu.strategy.designer' },
  },
  {
    path: '/strategy/monitor',
    name: 'AdminStrategyMonitor',
    component: () => import('../../modules/strategy/views/monitor/index.vue'),
    meta: { titleKey: 'menu.strategy.monitor' },
  },
  // 数据治理
  {
    path: '/governance/files/templates',
    name: 'AdminGovernanceFilesTemplates',
    component: () => import('../../modules/governance/views/files/templates/index.vue'),
    meta: { titleKey: 'menu.data.files.templates' },
  },
  // 测试功能
  {
    path: '/test/components',
    name: 'AdminTestComponents',
    component: () => import('../../pages/test/components/index.vue'),
    meta: { titleKey: 'menu.test_features.components' },
  },
  {
    path: '/test/api-test-center',
    name: 'AdminApiTestCenter',
    component: () => import('../../pages/test/api-test-center/index.vue'),
    meta: { titleKey: 'menu.test_features.api_test_center' },
  },
];

// 根据运行模式返回不同的路由配置
// 独立运行时：使用 Layout 包裹所有路由
// qiankun 模式：直接返回页面路由（由主应用提供 Layout）
export const adminRoutes: RouteRecordRaw[] = isStandalone
  ? [
      {
        path: '/',
        component: Layout,
        children: pageRoutes,
      },
    ]
  : pageRoutes;

