/**
 * 治理模块配置
 * 包含字典管理、文件管理等页面的配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.governance': '数据治理',
      'menu.data.files': '文件管理',
      'menu.data.files.templates': '模板管理',
      'menu.data.dictionary': '字典管理',
      'menu.data.dictionary.fields': '字段管理',
      'menu.data.dictionary.values': '字典值管理',
      // 字典相关
      'governance.dictionary.fields.field_name': '字段名称',
      'governance.dictionary.fields.field_code': '字典编码',
      'governance.dictionary.fields.entity_class': '实体类名',
      'governance.dictionary.fields.domain_id': '域ID',
      'governance.dictionary.fields.remark': '备注',
      'governance.dictionary.values.type_code': '字典类型编码',
      'governance.dictionary.values.value': '字典值',
      'governance.dictionary.values.label': '字典标签',
      'governance.dictionary.values.sort': '排序',
      // 文件相关
      'governance.files.templates.fields.template_name': '模板名称',
      'governance.files.templates.fields.template_code': '模板编码',
      'governance.files.templates.fields.category': '模板分类',
      'governance.files.templates.fields.version': '版本号',
      'governance.files.templates.fields.status': '状态',
      'governance.files.templates.fields.description': '模板描述',
      'governance.files.templates.categories.approval': '审批流程',
      'governance.files.templates.categories.purchase': '采购流程',
      'governance.files.templates.categories.other': '其他',
    },
    'en-US': {
      // 菜单配置
      'menu.governance': 'Data Governance',
      'menu.data.files': 'File Management',
      'menu.data.files.templates': 'Template Management',
      'menu.data.dictionary': 'Dictionary Management',
      'menu.data.dictionary.fields': 'Field Management',
      'menu.data.dictionary.values': 'Dictionary Value Management',
      // 字典相关
      'governance.dictionary.fields.field_name': 'Field Name',
      'governance.dictionary.fields.field_code': 'Dictionary Code',
      'governance.dictionary.fields.entity_class': 'Entity Class',
      'governance.dictionary.fields.domain_id': 'Domain ID',
      'governance.dictionary.fields.remark': 'Remark',
      'governance.dictionary.values.type_code': 'Dictionary Type Code',
      'governance.dictionary.values.value': 'Dictionary Value',
      'governance.dictionary.values.label': 'Dictionary Label',
      'governance.dictionary.values.sort': 'Sort',
      // 文件相关
      'governance.files.templates.fields.template_name': 'Template Name',
      'governance.files.templates.fields.template_code': 'Template Code',
      'governance.files.templates.fields.category': 'Template Category',
      'governance.files.templates.fields.version': 'Version',
      'governance.files.templates.fields.status': 'Status',
      'governance.files.templates.fields.description': 'Template Description',
      'governance.files.templates.categories.approval': 'Approval Process',
      'governance.files.templates.categories.purchase': 'Purchase Process',
      'governance.files.templates.categories.other': 'Other',
    },
  },

  columns: {
    'governance.dictionary.fields': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'fieldName', label: 'governance.dictionary.fields.field_name', minWidth: 150 },
      { prop: 'fieldCode', label: 'governance.dictionary.fields.field_code', minWidth: 150 },
      { prop: 'entityClass', label: 'governance.dictionary.fields.entity_class', minWidth: 150 },
      { prop: 'domainId', label: 'governance.dictionary.fields.domain_id', width: 120 },
      { prop: 'remark', label: 'governance.dictionary.fields.remark', minWidth: 200 },
    ] as TableColumn[],

    'governance.dictionary.values': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'dictTypeCode', label: 'governance.dictionary.values.type_code', minWidth: 150 },
      { prop: 'dictValue', label: 'governance.dictionary.values.value', minWidth: 150 },
      { prop: 'dictLabel', label: 'governance.dictionary.values.label', minWidth: 150 },
    ] as TableColumn[],

    'governance.files.templates': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'templateName', label: 'governance.files.templates.fields.template_name', minWidth: 150 },
      { prop: 'templateCode', label: 'governance.files.templates.fields.template_code', minWidth: 150 },
      { prop: 'category', label: 'governance.files.templates.fields.category', width: 120 },
      { prop: 'version', label: 'governance.files.templates.fields.version', width: 100 },
      { prop: 'status', label: 'governance.files.templates.fields.status', width: 100 },
      { prop: 'description', label: 'governance.files.templates.fields.description', minWidth: 200 },
    ] as TableColumn[],
  },

  forms: {
    'governance.dictionary.fields': [
      { prop: 'fieldName', label: 'governance.dictionary.fields.field_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'fieldCode', label: 'governance.dictionary.fields.field_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'entityClass', label: 'governance.dictionary.fields.entity_class', span: 12, component: { name: 'el-input' } },
      { prop: 'domainId', label: 'governance.dictionary.fields.domain_id', span: 12, component: { name: 'el-input' } },
      { prop: 'remark', label: 'governance.dictionary.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
    ] as FormItem[],

    'governance.dictionary.values': [
      { prop: 'dictTypeCode', label: 'governance.dictionary.values.type_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'dictValue', label: 'governance.dictionary.values.value', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'dictLabel', label: 'governance.dictionary.values.label', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'sort', label: 'governance.dictionary.values.sort', span: 12, component: { name: 'el-input-number', props: { min: 0 } } },
    ] as FormItem[],

    'governance.files.templates': [
      { prop: 'templateName', label: 'governance.files.templates.fields.template_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'templateCode', label: 'governance.files.templates.fields.template_code', span: 12, required: true, component: { name: 'el-input' } },
      {
        prop: 'category',
        label: 'governance.files.templates.fields.category',
        span: 12,
        component: {
          name: 'el-select',
          options: [
            { label: 'governance.files.templates.categories.approval', value: 'APPROVAL' },
            { label: 'governance.files.templates.categories.purchase', value: 'PURCHASE' },
            { label: 'governance.files.templates.categories.other', value: 'OTHER' },
          ],
        },
      },
      { prop: 'version', label: 'governance.files.templates.fields.version', span: 12, component: { name: 'el-input' } },
      { prop: 'status', label: 'governance.files.templates.fields.status', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'governance.files.templates.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
    ] as FormItem[],
  },

  service: {
    dictInfo: service.admin?.dict?.dictInfo,
    dictData: service.admin?.dict?.dictData,
    resource: service.admin?.iam?.resource,
    domain: service.admin?.iam?.domain,
    processTemplate: service.admin?.iam?.processTemplate,
    // BtcTableGroup 需要的域服务（左侧服务）
    domainService: {
      list: (params?: any) => {
        const finalParams = params || {};
        return service.admin?.iam?.domain?.list(finalParams);
      }
    },
    // BtcTableGroup 需要的资源服务（左侧服务，用于 dictionary.fields）
    resourceService: {
      list: (params?: any) => {
        const finalParams = params || {};
        return service.admin?.iam?.resource?.list(finalParams);
      }
    },
  },
} satisfies PageConfig;
