/**
 * 运维模块配置
 * 包含日志管理、API列表、基线配置等页面的配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  locale: {
    ops: {
        baseline: {
          search_placeholder: '搜索基线...',
          fields: {
            baseline_name: '基线名称',
            baseline_code: '基线编码',
            version: '版本',
            status: '状态',
            description: '描述',
          },
        },
        api_list: {
          description: '接口列表展示系统内注册的所有 API 信息，用于便捷查询和排查接口情况。',
          fields: {
            controller: '所属控制器',
            method: 'HTTP 方法',
            name: '方法名',
            path: '请求路径',
            description: '接口说明',
            tags: '标签',
            parameters: '参数信息',
            request_type: '请求类型',
            notes: '备注',
          },
          search_placeholder: '按控制器、方法名、路径搜索...',
        },
        logs: {
          operation: {
            fields: {
              operator: '操作人',
              operation_desc: '操作描述',
              request_url: '请求的接口',
              request_params: '请求参数',
              ip_address: 'IP地址',
              create_time: '创建时间',
            },
          },
          request: {
            fields: {
              user: '用户',
              ip: 'IP地址',
              url: '请求地址',
              method: '请求方法',
              status: '状态码',
              duration: '耗时(ms)',
              create_time: '创建时间',
            },
          },
        },
      },
    },

  columns: {
    'ops.baseline': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'baselineName', label: 'ops.baseline.fields.baseline_name', minWidth: 150 },
      { prop: 'baselineCode', label: 'ops.baseline.fields.baseline_code', minWidth: 150 },
      { prop: 'version', label: 'ops.baseline.fields.version', width: 100 },
      { prop: 'status', label: 'ops.baseline.fields.status', width: 100 },
      { prop: 'description', label: 'ops.baseline.fields.description', minWidth: 200 },
    ] as TableColumn[],

    'ops.api_list': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'tagsText', label: 'ops.api_list.fields.tags', minWidth: 160 },
      { prop: 'controller', label: 'ops.api_list.fields.controller', minWidth: 200 },
      { prop: 'methodName', label: 'ops.api_list.fields.name', minWidth: 140 },
      { prop: 'httpMethods', label: 'ops.api_list.fields.method', width: 120 },
      { prop: 'paths', label: 'ops.api_list.fields.path', minWidth: 260 },
      { prop: 'description', label: 'ops.api_list.fields.description', minWidth: 220 },
      { prop: 'parameters', label: 'ops.api_list.fields.parameters', minWidth: 280 },
      { prop: 'notes', label: 'ops.api_list.fields.notes', minWidth: 220 },
    ] as TableColumn[],

    'ops.logs.operation': [
      { prop: 'username', label: 'ops.logs.operation.fields.operator', width: 120 },
      {
        prop: 'operationType',
        label: 'ops.logs.operation.fields.operation_type',
        width: 120,
        dict: [
          { label: '查询', value: 'SELECT', type: 'info' },
          { label: '新增', value: 'INSERT', type: 'success' },
          { label: '更新', value: 'UPDATE', type: 'warning' },
          { label: '删除', value: 'DELETE', type: 'danger' }
        ],
        dictColor: true
      },
      { prop: 'tableName', label: 'ops.logs.operation.fields.table_name', width: 150, showOverflowTooltip: true },
      { prop: 'ipAddress', label: 'ops.logs.operation.fields.ip_address', width: 120 },
      { prop: 'operationDesc', label: 'ops.logs.operation.fields.operation_desc', minWidth: 180, showOverflowTooltip: true },
      {
        prop: 'beforeData',
        label: 'ops.logs.operation.fields.before_data',
        width: 150,
        showOverflowTooltip: false,
        // component 需要在页面中动态添加
      },
      { prop: 'createdAt', label: 'ops.logs.operation.fields.create_time', width: 170, sortable: true, fixed: 'right' }
    ] as TableColumn[],

    'ops.logs.request': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'userId', label: 'ops.logs.request.fields.user_id', width: 100 },
      { prop: 'username', label: 'ops.logs.request.fields.username', width: 120 },
      { prop: 'requestUrl', label: 'ops.logs.request.fields.url', minWidth: 200, showOverflowTooltip: true },
      { prop: 'params', label: 'ops.logs.request.fields.params', minWidth: 200, showOverflowTooltip: false },
      { prop: 'method', label: 'ops.logs.request.fields.method', width: 100 },
      { prop: 'status', label: 'ops.logs.request.fields.status', width: 100 },
      { prop: 'ip', label: 'ops.logs.request.fields.ip', width: 120 },
      { prop: 'duration', label: 'ops.logs.request.fields.duration', width: 100 },
      { prop: 'createTime', label: 'ops.logs.request.fields.create_time', width: 160, sortable: true, fixed: 'right' }
    ] as TableColumn[],
  },

  forms: {
    'ops.baseline': [
      { prop: 'baselineName', label: 'ops.baseline.fields.baseline_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'baselineCode', label: 'ops.baseline.fields.baseline_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'version', label: 'ops.baseline.fields.version', span: 12, component: { name: 'el-input' } },
      {
        prop: 'status',
        label: 'ops.baseline.fields.status',
        span: 12,
        component: {
          name: 'el-select',
          options: [
            { label: '启用', value: 'enabled' },
            { label: '禁用', value: 'disabled' },
          ],
        },
      },
      { prop: 'description', label: 'ops.baseline.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],
  },

  service: {
    baseline: null, // 使用 Mock 服务
    apiDocs: service.admin?.log?.apiDocs,
    operation: service.admin?.log?.operation,
    request: service.admin?.log?.request,
  },
} satisfies PageConfig;
