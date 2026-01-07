/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '管理应用',
      title: '管理应用',
      description: '系统管理、平台治理、组织与账号、访问控制',
      version: '版本 1.0.0',
      welcome: '欢迎使用管理应用',
      slogan: '拜里斯：智慧验币・安全储存，因你而精彩！',
      loading: {
        title: '正在加载资源',
        subtitle: '部分资源可能加载时间较长，请耐心等待',
      },
    },
    menu: {
      platform: {
        domains: '域列表',
        modules: '模块列表',
        plugins: '插件列表',
      },
      org: {
        tenants: '租户列表',
        departments: '部门列表',
        users: '用户列表',
        dept_role_bind: '部门角色绑定',
      },
      access: {
        config: '基础配置',
        resources: '资源列表',
        actions: '行为列表',
        permissions: '权限列表',
        roles: '角色列表',
        role_perm_bind: '角色权限绑定',
        relations: '资源分配',
        perm_compose: '权限组合',
        user_assign: '用户分配',
        user_role_bind: '角色绑定',
        role_assign: '角色分配',
        role_permission_bind: '权限绑定',
      },
      navigation: {
        menus: '菜单列表',
        menu_perm_bind: '菜单权限绑定',
        menu_preview: '菜单预览',
      },
      ops: {
        logs: '日志中心',
        operation_log: '操作日志',
        request_log: '请求日志',
        api_list: '接口列表',
        baseline: '基线配置',
        simulator: '模拟器',
      },
      strategy: {
        management: '策略管理',
        designer: '策略编排',
        monitor: '策略监控',
      },
      governance: {},
      data: {
        files: {
          _: '文件管理',
          templates: '模板管理',
        },
        dictionary: {
          _: '字典管理',
          fields: '字段管理',
          values: '字典值管理',
        },
      },
      test_features: {
        components: '组件测试中心',
        api_test_center: '接口测试中心',
        inventory_ticket_print: '盘点票打印',
      },
    }
  },
  'en-US': {
    app: {
      name: 'Admin Application',
      title: 'Admin Application',
      description: 'System management, platform governance, organization and accounts, access control',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Admin Application',
      slogan: 'Bellis Technology: Intelligent Currency Verification, Secure Storage, Brilliance with You!',
      loading: {
        title: 'Loading resources',
        subtitle: 'Some resources may take longer to load, please wait patiently',
      },
    },
    menu: {
      platform: {
        domains: 'Domain List',
        modules: 'Module List',
        plugins: 'Plugin List',
      },
      org: {
        tenants: 'Tenant List',
        departments: 'Department List',
        users: 'User List',
        dept_role_bind: 'Department Role Binding',
      },
      access: {
        config: 'Configuration',
        resources: 'Resource List',
        actions: 'Action List',
        permissions: 'Permission List',
        roles: 'Role List',
        role_perm_bind: 'Role Permission Binding',
        relations: 'Resource Assignment',
        perm_compose: 'Permission Composition',
        user_assign: 'User Assignment',
        user_role_bind: 'Role Binding',
        role_assign: 'Role Assignment',
        role_permission_bind: 'Permission Binding',
      },
      navigation: {
        menus: 'Menu List',
        menu_perm_bind: 'Menu Permission Binding',
        menu_preview: 'Menu Preview',
      },
      ops: {
        logs: 'Log Center',
        operation_log: 'Operation Log',
        request_log: 'Request Log',
        api_list: 'API List',
        baseline: 'Baseline Configuration',
        simulator: 'Simulator',
      },
      strategy: {
        management: 'Strategy Management',
        designer: 'Strategy Designer',
        monitor: 'Strategy Monitor',
      },
      governance: {},
      data: {
        files: {
          _: 'File Management',
          templates: 'Template Management',
        },
        dictionary: {
          _: 'Dictionary Management',
          fields: 'Field Management',
          values: 'Dictionary Value Management',
        },
      },
      test_features: {
        components: 'Components Test Center',
        api_test_center: 'API Test Center',
        inventory_ticket_print: 'Inventory Ticket Print',
      },
    },
    page: {
      // 应用级页面配置（可选）
    },
  },
} satisfies LocaleConfig;
