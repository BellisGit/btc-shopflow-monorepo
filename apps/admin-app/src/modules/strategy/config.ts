/**
 * 策略模块配置
 * 包含策略管理、策略监控等页面的配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  locale: {
    strategy: {
        management: {
          fields: {
            strategy_name: '策略名称',
            strategy_code: '策略编码',
            type: '类型',
            version: '版本',
            status: '状态',
            priority: '优先级',
            tags: '标签',
            description: '描述',
            created_at: '创建时间',
            updated_at: '更新时间',
          },
        },
        monitor: {
          fields: {
            strategy_name: '策略名称',
            strategy_code: '策略编码',
            type: '类型',
            status: '状态',
            priority: '优先级',
            version: '版本',
            description: '描述',
            execution_count: '执行次数',
            success_count: '成功次数',
            failure_count: '失败次数',
            last_execution_time: '最后执行时间',
            updated_at: '更新时间',
          },
        },
      },
    },

  columns: {
    'strategy.management': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'name', label: 'strategy.management.fields.strategy_name', minWidth: 180 },
      {
        prop: 'type',
        label: 'strategy.management.fields.type',
        width: 120,
        dict: [
          { label: '权限', value: 'PERMISSION', type: 'danger' },
          { label: '业务', value: 'BUSINESS', type: 'success' },
          { label: '数据', value: 'DATA', type: 'warning' },
          { label: '工作流', value: 'WORKFLOW', type: 'info' }
        ],
        dictColor: true,
      },
      {
        prop: 'status',
        label: 'strategy.management.fields.status',
        width: 100,
        dict: [
          { label: '草稿', value: 'DRAFT', type: 'info' },
          { label: '测试中', value: 'TESTING', type: 'warning' },
          { label: '激活', value: 'ACTIVE', type: 'success' },
          { label: '停用', value: 'INACTIVE', type: 'danger' },
          { label: '已归档', value: 'ARCHIVED', type: 'default' }
        ],
        dictColor: true,
      },
      { prop: 'priority', label: 'strategy.management.fields.priority', width: 100 },
      {
        prop: 'version',
        label: 'strategy.management.fields.version',
        width: 100,
        // 使用 slot 自定义显示
      },
      {
        prop: 'tags',
        label: 'strategy.management.fields.tags',
        width: 150,
        // 使用 slot 自定义显示
      },
      { prop: 'description', label: 'strategy.management.fields.description', minWidth: 200 },
      { prop: 'updatedAt', label: 'strategy.management.fields.updated_at', width: 180 },
    ] as TableColumn[],

    'strategy.monitor': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'name', label: 'strategy.monitor.fields.strategy_name', minWidth: 180 },
      {
        prop: 'type',
        label: 'strategy.monitor.fields.type',
        width: 120,
        dict: [
          { label: '权限', value: 'PERMISSION', type: 'danger' },
          { label: '业务', value: 'BUSINESS', type: 'success' },
          { label: '数据', value: 'DATA', type: 'warning' },
          { label: '工作流', value: 'WORKFLOW', type: 'info' }
        ],
        dictColor: true,
      },
      {
        prop: 'status',
        label: 'strategy.monitor.fields.status',
        width: 100,
        dict: [
          { label: '草稿', value: 'DRAFT', type: 'info' },
          { label: '测试中', value: 'TESTING', type: 'warning' },
          { label: '激活', value: 'ACTIVE', type: 'success' },
          { label: '停用', value: 'INACTIVE', type: 'danger' },
          { label: '已归档', value: 'ARCHIVED', type: 'default' }
        ],
        dictColor: true,
      },
      { prop: 'priority', label: 'strategy.monitor.fields.priority', width: 100 },
      { prop: 'version', label: 'strategy.monitor.fields.version', width: 100 },
      { prop: 'description', label: 'strategy.monitor.fields.description', minWidth: 200 },
      { prop: 'updatedAt', label: 'strategy.monitor.fields.updated_at', width: 180 },
    ] as TableColumn[],
  },

  forms: {
    'strategy.management': [
      { prop: 'name', label: 'strategy.management.fields.strategy_name', span: 12, required: true, component: { name: 'el-input' } },
      {
        prop: 'type',
        label: 'strategy.management.fields.type',
        span: 12,
        required: true,
        component: {
          name: 'el-select',
          options: [
            { label: '权限策略', value: 'PERMISSION' },
            { label: '业务策略', value: 'BUSINESS' },
            { label: '数据策略', value: 'DATA' },
            { label: '工作流策略', value: 'WORKFLOW' }
          ],
        },
      },
      {
        prop: 'priority',
        label: 'strategy.management.fields.priority',
        span: 12,
        value: 100,
        component: {
          name: 'el-input-number',
          props: { min: 0, max: 1000 },
        },
      },
      {
        prop: 'tags',
        label: 'strategy.management.fields.tags',
        span: 12,
        component: {
          name: 'el-input',
          props: { placeholder: '多个标签用逗号分隔' },
        },
      },
      {
        prop: 'status',
        label: 'strategy.management.fields.status',
        span: 12,
        component: {
          name: 'el-select',
          options: [
            { label: '草稿', value: 'DRAFT' },
            { label: '测试中', value: 'TESTING' },
            { label: '激活', value: 'ACTIVE' },
            { label: '停用', value: 'INACTIVE' },
            { label: '已归档', value: 'ARCHIVED' },
          ],
        },
      },
      { prop: 'description', label: 'strategy.management.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],
  },

  service: {
    strategy: service.admin?.strategy,
  },
} satisfies PageConfig;
