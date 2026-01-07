/**
 * 导航模块配置
 * 包含菜单管理相关页面的配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  locale: {
    navigation: {
        menus: {
          fields: {
            name: '节点名称',
            is_show: '是否显示',
            icon: '图标',
            type: '节点类型',
            router: '节点路由',
            keep_alive: 'Keep Alive',
            view_path: '文件路径',
            perms: '权限',
            order_num: '排序号',
            parent_id: '上级节点',
          },
        },
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
