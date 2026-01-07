/**
 * 治理模块配置
 * 包含字典管理、文件管理等页面的配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  locale: {
    governance: {
        dictionary: {
          fields: {
            field_name: '字段名称',
            field_code: '字典编码',
            entity_class: '实体类名',
            domain_id: '域ID',
            remark: '备注',
          },
          values: {
            type_code: '字典类型编码',
            value: '字典值',
            label: '字典标签',
            sort: '排序',
          },
        },
        files: {
          templates: {
            fields: {
              template_name: '模板名称',
              template_code: '模板编码',
              category: '模板分类',
              version: '版本号',
              status: '状态',
              description: '模板描述',
            },
          },
        },
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
            { label: '审批流程', value: 'APPROVAL' },
            { label: '采购流程', value: 'PURCHASE' },
            { label: '其他', value: 'OTHER' },
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
