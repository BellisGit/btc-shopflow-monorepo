/**
 * 访问控制模块配置
 * 包含国际化配置、表格列配置和表单配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  // 国际化配置
  locale: {
    access: {
        actions: {
          fields: {
            action_name_cn: '行为名称',
            action_code: '行为编码',
            action_type: '类型',
            http_method: 'HTTP方法',
            description: '描述',
          },
        },
        permissions: {
          fields: {
            perm_name: '权限名称',
            perm_code: '权限编码',
            perm_type: '权限类型',
            perm_category: '权限分类',
            module_id: '模块ID',
            plugin_id: '插件ID',
            description: '描述',
          },
        },
        resources: {
          sync: '数据同步',
          sync_success: '数据同步成功',
          sync_failed: '数据同步失败',
          fields: {
            resource_name_cn: '资源名称',
            resource_code: '资源编码',
            resource_type: '类型',
            description: '描述',
          },
        },
        roles: {
          fields: {
            role_name: '角色名称',
            role_code: '角色编码',
            role_type: '角色类型',
            parent_id: '父级角色',
            domain_id: '所属域',
            description: '描述',
          },
        },
      },
    },

  // 表格列配置
  columns: {
    'access.actions': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'actionNameCn', label: 'access.actions.fields.action_name_cn' },
      { prop: 'actionCode', label: 'access.actions.fields.action_code' },
      { prop: 'actionType', label: 'access.actions.fields.action_type' },
      { prop: 'httpMethod', label: 'access.actions.fields.http_method' },
      { prop: 'description', label: 'common.description' },
    ] as TableColumn[],

    'access.permissions': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'permName', label: 'access.permissions.fields.perm_name', minWidth: 150, showOverflowTooltip: true },
      { prop: 'permCode', label: 'access.permissions.fields.perm_code', minWidth: 150, showOverflowTooltip: true },
      { prop: 'permType', label: 'access.permissions.fields.perm_type', minWidth: 100 },
      { prop: 'permCategory', label: 'access.permissions.fields.perm_category', minWidth: 100 },
      { prop: 'moduleId', label: 'platform.module.name', minWidth: 120 },
      { prop: 'pluginId', label: 'platform.plugin.name', minWidth: 120 },
      { prop: 'description', label: 'common.description', minWidth: 150, showOverflowTooltip: true },
      { prop: 'createdAt', label: 'common.create_time', minWidth: 160, formatter: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '-' },
    ] as TableColumn[],

    'access.resources': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'resourceNameCn', label: 'access.resources.fields.resource_name_cn', minWidth: 150 },
      { prop: 'resourceCode', label: 'access.resources.fields.resource_code', minWidth: 150 },
      {
        prop: 'resourceType',
        label: 'access.resources.fields.resource_type',
        width: 120,
        dict: [
          { label: '文件', value: 'FILE', type: 'info' },
          { label: 'API', value: 'API', type: 'warning' },
          { label: '数据表', value: 'TABLE', type: 'primary' },
        ],
        dictColor: true,
      },
      { prop: 'description', label: 'common.description', minWidth: 200 },
    ] as TableColumn[],

    'access.roles': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'roleName', label: 'access.roles.fields.role_name', minWidth: 150 },
      { prop: 'roleCode', label: 'access.roles.fields.role_code', width: 180 },
      {
        prop: 'roleType',
        label: 'access.roles.fields.role_type',
        width: 100,
        dict: [
          { label: '管理员', value: 'ADMIN', type: 'danger' },
          { label: '业务员', value: 'BUSINESS', type: 'success' },
          { label: '访客', value: 'GUEST', type: 'info' },
        ],
        dictColor: true,
      },
      {
        prop: 'parentId',
        label: 'access.roles.fields.parent_id',
        width: 100,
        formatter: (row: any) => {
          // formatter 需要在页面中动态处理
          return row.parentId === '0' ? '无' : row.parentId;
        },
      },
      {
        prop: 'domainId',
        label: 'access.roles.fields.domain_id',
        width: 100,
        formatter: (row: any) => {
          // formatter 需要在页面中动态处理
          return row.domainId || '未分配';
        },
      },
      { prop: 'description', label: 'common.description', minWidth: 200, showOverflowTooltip: true },
      { prop: 'createdAt', label: 'common.create_time', width: 160, sortable: true },
    ] as TableColumn[],
  },

  // 表单配置
  forms: {
    'access.actions': [
      { prop: 'actionNameCn', label: 'access.actions.fields.action_name_cn', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'actionCode', label: 'access.actions.fields.action_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'actionType', label: 'access.actions.fields.action_type', span: 12, component: { name: 'el-input' } },
      { prop: 'httpMethod', label: 'access.actions.fields.http_method', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'common.description', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
    ] as FormItem[],

    'access.permissions': [
      { prop: 'permName', label: 'access.permissions.fields.perm_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'permCode', label: 'access.permissions.fields.perm_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'permType', label: 'access.permissions.fields.perm_type', span: 12, component: { name: 'el-input' } },
      { prop: 'permCategory', label: 'access.permissions.fields.perm_category', span: 12, component: { name: 'el-input' } },
      { prop: 'moduleId', label: 'platform.module.name', span: 12, component: { name: 'el-input' } },
      { prop: 'pluginId', label: 'platform.plugin.name', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'common.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'access.resources': [
      { prop: 'resourceNameCn', label: 'access.resources.fields.resource_name_cn', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'resourceCode', label: 'access.resources.fields.resource_code', span: 12, required: true, component: { name: 'el-input' } },
      {
        prop: 'resourceType',
        label: 'access.resources.fields.resource_type',
        span: 12,
        component: {
          name: 'el-select',
          options: [
            { label: '文件', value: 'FILE' },
            { label: 'API', value: 'API' },
            { label: '数据表', value: 'TABLE' },
          ],
        },
      },
      { prop: 'description', label: 'common.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'access.roles': [
      {
        prop: 'roleName',
        label: 'access.roles.fields.role_name',
        span: 12,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: '请输入角色名称',
          },
        },
      },
      {
        prop: 'roleCode',
        label: 'access.roles.fields.role_code',
        span: 12,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: '请输入角色编码',
          },
        },
      },
      {
        prop: 'roleType',
        label: 'access.roles.fields.role_type',
        span: 12,
        required: true,
        component: {
          name: 'el-select',
          props: {
            placeholder: '请选择角色类型',
            clearable: true,
          },
          options: [
            { label: '管理员', value: 'ADMIN' },
            { label: '业务员', value: 'BUSINESS' },
            { label: '访客', value: 'GUEST' },
          ],
        },
      },
      {
        prop: 'parentId',
        label: 'access.roles.fields.parent_id',
        span: 12,
        component: {
          name: 'btc-cascader',
          props: {
            placeholder: '请选择父级角色',
            clearable: true,
            filterable: true,
            // options 需要在页面中动态传入
          },
        },
      },
      {
        prop: 'domainId',
        label: 'access.roles.fields.domain_id',
        span: 12,
        component: {
          name: 'btc-cascader',
          props: {
            placeholder: '请选择所属域',
            clearable: true,
            filterable: true,
            // options 需要在页面中动态传入
          },
        },
      },
      {
        prop: 'description',
        label: 'common.description',
        span: 24,
        component: {
          name: 'el-input',
          props: {
            type: 'textarea',
            rows: 3,
            placeholder: '请输入角色描述',
          },
        },
      },
    ] as FormItem[],
  },

  // 服务配置
  service: {
    action: service.admin?.iam?.action,
    permission: service.admin?.iam?.permission,
    resource: service.admin?.iam?.resource,
    role: service.admin?.iam?.role,
    domain: service.admin?.iam?.domain,
    // BtcTableGroup 需要的左右服务
    sysdomain: service.admin?.iam?.domain,
    sysrole: service.admin?.iam?.role,
  },
} satisfies PageConfig;
