/**
 * 平台治理模块配置
 * 包含 domains、modules、plugins 等页面的配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  // 模块元数据（用于模块管理）
  name: 'platform',
  label: '平台治理',
  description: '域、租户、模块、插件管理',
  order: 1,

  // 国际化配置
  locale: {
    platform: {
        domains: {
          fields: {
            domain_name: '域名称',
            domain_code: '域编码',
            domain_type: '域类型',
            tenant_id: '租户名称',
            description: '描述',
          },
          search_placeholder: '搜索域名称或编码',
          list: '域列表',
        },
        modules: {
          fields: {
            module_name: '模块名称',
            module_code: '模块编码',
            module_type: '模块类型',
            description: '描述',
          },
        },
        plugins: {
          fields: {
            plugin_name: '插件名称',
            plugin_code: '插件编码',
            version: '版本',
            status: '状态',
            description: '描述',
          },
          enabled: '启用',
          disabled: '禁用',
        },
      },
    },

  columns: {
    'platform.domains': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'name', label: 'platform.domains.fields.domain_name', minWidth: 150 },
      { prop: 'domainCode', label: 'platform.domains.fields.domain_code', width: 120 },
      { prop: 'domainType', label: 'platform.domains.fields.domain_type', width: 120 },
      {
        prop: 'tenantId',
        label: 'platform.domains.fields.tenant_id',
        width: 150,
        formatter: (row: any) => {
          // formatter 需要在页面中动态处理
          return row.tenantId;
        },
      },
      { prop: 'description', label: 'platform.domains.fields.description', minWidth: 200 },
    ] as TableColumn[],

    'platform.modules': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'moduleName', label: 'platform.modules.fields.module_name', minWidth: 150 },
      { prop: 'moduleCode', label: 'platform.modules.fields.module_code', minWidth: 150 },
      { prop: 'moduleType', label: 'platform.modules.fields.module_type', width: 100 },
      { prop: 'description', label: 'platform.modules.fields.description', minWidth: 200 },
    ] as TableColumn[],

    'platform.plugins': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'pluginName', label: 'platform.plugins.fields.plugin_name', minWidth: 150 },
      { prop: 'pluginCode', label: 'platform.plugins.fields.plugin_code', minWidth: 150 },
      { prop: 'version', label: 'platform.plugins.fields.version', width: 100 },
      { prop: 'status', label: 'platform.plugins.fields.status', width: 100 },
      { prop: 'description', label: 'platform.plugins.fields.description', minWidth: 200 },
    ] as TableColumn[],
  },

  forms: {
    'platform.domains': [
      { prop: 'name', label: 'platform.domain.name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'domainCode', label: 'platform.domain.code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'domainType', label: 'platform.domains.fields.domain_type', span: 12, component: { name: 'el-input' } },
      {
        prop: 'tenantId',
        label: 'platform.domains.fields.tenant_id',
        span: 12,
        required: true,
        component: {
          name: 'el-select',
          props: {
            filterable: true,
            clearable: true,
            // loading 和 options 需要在页面中动态传入
          },
        },
      },
      { prop: 'description', label: 'common.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'platform.modules': [
      { prop: 'moduleName', label: 'platform.modules.fields.module_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'moduleCode', label: 'platform.modules.fields.module_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'moduleType', label: 'platform.modules.fields.module_type', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'platform.modules.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'platform.plugins': [
      { prop: 'pluginName', label: 'platform.plugins.fields.plugin_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'pluginCode', label: 'platform.plugins.fields.plugin_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'version', label: 'platform.plugins.fields.version', span: 12, component: { name: 'el-input' } },
      {
        prop: 'status',
        label: 'platform.plugins.fields.status',
        span: 12,
        value: 'ENABLED',
        component: {
          name: 'el-radio-group',
          options: [
            { label: 'platform.plugins.enabled', value: 'ENABLED' },
            { label: 'platform.plugins.disabled', value: 'DISABLED' },
          ],
        },
      },
      { prop: 'description', label: 'platform.plugins.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],
  },

  service: {
    domain: service.admin?.iam?.domain,
    tenant: service.admin?.iam?.tenant,
    module: service.admin?.iam?.module,
    plugin: service.admin?.iam?.plugin,
    // BtcTableGroup 需要的域服务（左侧服务）
    domainService: {
      list: (params?: any) => {
        const finalParams = params || {};
        return service.admin?.iam?.domain?.list(finalParams);
      }
    },
  },
} satisfies PageConfig;
