/**
 * 导航模块配置
 * 包含菜单管理相关页面的配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.navigation': '导航管理',
      'menu.navigation.menus': '菜单列表',
      'menu.navigation.menu_perm_bind': '菜单权限绑定',
      'menu.navigation.menu_preview': '菜单预览',
      // 导航相关配置
      'navigation.menu.name': '菜单名称',
      'navigation.menu.is_show': '是否显示',
      'navigation.menu.icon': '图标',
      'navigation.menu.type': '类型',
      'navigation.menu.type.directory': '目录',
      'navigation.menu.type.menu': '菜单',
      'navigation.menu.type.permission': '权限',
      'navigation.menu.router': '路由',
      'navigation.menu.keep_alive': '缓存',
      'navigation.menu.keep_alive.enable': '启用',
      'navigation.menu.keep_alive.disable': '禁用',
      'navigation.menu.view_path': '视图路径',
      'navigation.menu.perms': '权限标识',
      'navigation.menu.order_num': '排序',
      'navigation.menu.node_type': '节点类型',
      'navigation.menu.node_name': '节点名称',
      'navigation.menu.parent_node': '父节点',
      'navigation.menu.select_parent': '请选择父节点',
      'navigation.menu.router_placeholder': '请输入路由地址',
      'navigation.menu.view_path_placeholder': '请输入视图路径',
      'navigation.menu.icon_placeholder': '请输入图标名称',
      'navigation.menu.order_num_placeholder': '请输入排序号',
      'navigation.menu.perms_placeholder': '请输入权限标识，多个用逗号分隔',
      'platform.navigation.label': '导航管理',
      'platform.navigation.description': '菜单、权限绑定、预览管理',
      'platform.navigation.menu.load_menu_info_failed': '加载菜单信息失败',
      'platform.navigation.menu.load_permissions_failed': '加载权限列表失败',
    },
    'en-US': {
      // 菜单配置
      'menu.navigation': 'Navigation',
      'menu.navigation.menus': 'Menu List',
      'menu.navigation.menu_perm_bind': 'Menu Permission Binding',
      'menu.navigation.menu_preview': 'Menu Preview',
      // 导航相关配置
      'navigation.menu.name': 'Menu Name',
      'navigation.menu.is_show': 'Is Show',
      'navigation.menu.icon': 'Icon',
      'navigation.menu.type': 'Type',
      'navigation.menu.type.directory': 'Directory',
      'navigation.menu.type.menu': 'Menu',
      'navigation.menu.type.permission': 'Permission',
      'navigation.menu.router': 'Router',
      'navigation.menu.keep_alive': 'Keep Alive',
      'navigation.menu.keep_alive.enable': 'Enable',
      'navigation.menu.keep_alive.disable': 'Disable',
      'navigation.menu.view_path': 'View Path',
      'navigation.menu.perms': 'Permissions',
      'navigation.menu.order_num': 'Order',
      'navigation.menu.node_type': 'Node Type',
      'navigation.menu.node_name': 'Node Name',
      'navigation.menu.parent_node': 'Parent Node',
      'navigation.menu.select_parent': 'Please select parent node',
      'navigation.menu.router_placeholder': 'Please enter router address',
      'navigation.menu.view_path_placeholder': 'Please enter view path',
      'navigation.menu.icon_placeholder': 'Please enter icon name',
      'navigation.menu.order_num_placeholder': 'Please enter order number',
      'navigation.menu.perms_placeholder': 'Please enter permissions, separated by commas',
      'platform.navigation.label': 'Navigation Management',
      'platform.navigation.description': 'Menu, permission binding, and preview management',
      'platform.navigation.menu.load_menu_info_failed': 'Failed to load menu info',
      'platform.navigation.menu.load_permissions_failed': 'Failed to load permissions list',
    },
  },

  columns: {
    'navigation.menus': [
      { type: 'selection', width: 60 },
      {
        prop: 'name',
        label: 'navigation.menu.name',
        align: 'left',
        width: 200,
        fixed: 'left',
      },
      {
        prop: 'isShow',
        label: 'navigation.menu.is_show',
        width: 100,
      },
      {
        prop: 'icon',
        label: 'navigation.menu.icon',
        width: 100,
      },
      {
        prop: 'type',
        label: 'navigation.menu.type',
        width: 110,
        dict: [
          { label: 'navigation.menu.type.directory', value: 0, type: 'warning' },
          { label: 'navigation.menu.type.menu', value: 1, type: 'success' },
          { label: 'navigation.menu.type.permission', value: 2, type: 'danger' },
        ],
      },
      {
        prop: 'router',
        label: 'navigation.menu.router',
        minWidth: 170,
      },
      {
        prop: 'keepAlive',
        label: 'navigation.menu.keep_alive',
        width: 100,
      },
      {
        prop: 'viewPath',
        label: 'navigation.menu.view_path',
        minWidth: 200,
        showOverflowTooltip: true,
      },
      {
        prop: 'perms',
        label: 'navigation.menu.perms',
        headerAlign: 'center',
        minWidth: 300,
        showOverflowTooltip: true,
      },
      {
        prop: 'orderNum',
        label: 'navigation.menu.order_num',
        width: 120,
        fixed: 'right',
        sortable: 'custom',
      },
    ] as TableColumn[],
  },

  forms: {
    'navigation.menus': [
      {
        prop: 'type',
        value: 0,
        label: 'navigation.menu.node_type',
        required: true,
        component: {
          name: 'el-radio-group',
          options: [
            { label: 'navigation.menu.type.directory', value: 0, type: 'warning' },
            { label: 'navigation.menu.type.menu', value: 1, type: 'success' },
            { label: 'navigation.menu.type.permission', value: 2, type: 'danger' },
          ],
        },
      },
      {
        prop: 'name',
        label: 'navigation.menu.node_name',
        component: {
          name: 'el-input',
        },
        required: true,
      },
      {
        prop: 'parentId',
        label: 'navigation.menu.parent_node',
        component: {
          name: 'el-select',
          props: {
            clearable: true,
            placeholder: 'navigation.menu.select_parent',
          },
        },
      },
      {
        prop: 'router',
        label: 'navigation.menu.router',
        hidden: ({ scope }: any) => scope.type != 1,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'navigation.menu.router_placeholder',
          },
        },
      },
      {
        prop: 'keepAlive',
        value: true,
        label: 'navigation.menu.keep_alive',
        hidden: ({ scope }: any) => scope.type != 1,
        component: {
          name: 'el-radio-group',
          options: [
            { label: 'navigation.menu.keep_alive.enable', value: true },
            { label: 'navigation.menu.keep_alive.disable', value: false },
          ],
        },
      },
      {
        prop: 'isShow',
        label: 'navigation.menu.is_show',
        value: true,
        hidden: ({ scope }: any) => scope.type == 2,
        component: {
          name: 'el-switch',
        },
      },
      {
        prop: 'viewPath',
        label: 'navigation.menu.view_path',
        hidden: ({ scope }: any) => scope.type != 1,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'navigation.menu.view_path_placeholder',
          },
        },
      },
      {
        prop: 'icon',
        label: 'navigation.menu.icon',
        hidden: ({ scope }: any) => scope.type == 2,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'navigation.menu.icon_placeholder',
          },
        },
      },
      {
        prop: 'orderNum',
        label: 'navigation.menu.order_num',
        component: {
          name: 'el-input-number',
          props: {
            placeholder: 'navigation.menu.order_num_placeholder',
            min: 0,
            max: 99,
            'controls-position': 'right',
          },
        },
      },
      {
        prop: 'perms',
        label: 'navigation.menu.perms',
        hidden: ({ scope }: any) => scope.type != 2,
        component: {
          name: 'el-input',
          props: {
            type: 'textarea',
            rows: 3,
            placeholder: 'navigation.menu.perms_placeholder',
          },
        },
      },
    ] as FormItem[],
  },

  service: {
    menu: service.admin?.iam?.menu,
    domain: service.admin?.iam?.domain,
    // BtcTableGroup 需要的域服务（左侧服务）
    domainService: {
      list: (params?: any) => {
        const finalParams = params || {};
        return service.admin?.iam?.domain?.list(finalParams);
      }
    },
  },
} satisfies PageConfig;
