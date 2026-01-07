/**
 * 财务盘点模块配置
 * 包含 result 等页面配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';
import { createCrudServiceFromEps } from '@btc/shared-core';

export default {
  locale: {
    finance: {
      inventory: {
        result: {
          fields: {
            material_code: '物料编码',
            position: '仓位',
            unit_cost: '单位成本',
            book_qty: '账面数量',
            actual_qty: '实际数量',
            diff_qty: '差异数量',
            variance_cost: '差异金额',
          },
          search_placeholder: '搜索盘点结果',
        },
      },
    },
  },

  columns: {
    'finance.inventory.result': [
      { type: 'selection', width: 48 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'materialCode', label: 'finance.inventory.result.fields.material_code', minWidth: 120, showOverflowTooltip: true },
      { prop: 'position', label: 'finance.inventory.result.fields.position', width: 80, showOverflowTooltip: true },
      { prop: 'unitCost', label: 'finance.inventory.result.fields.unit_cost', width: 100, align: 'right' },
      { prop: 'bookQty', label: 'finance.inventory.result.fields.book_qty', width: 100, align: 'right' },
      { prop: 'actualQty', label: 'finance.inventory.result.fields.actual_qty', width: 100, align: 'right' },
      { prop: 'diffQty', label: 'finance.inventory.result.fields.diff_qty', width: 100, align: 'right' },
      { prop: 'varianceCost', label: 'finance.inventory.result.fields.variance_cost', width: 120, align: 'right' },
    ] as TableColumn[],
  },

  forms: {
    'finance.inventory.result': [
      {
        prop: 'materialCode',
        label: 'finance.inventory.result.fields.material_code',
        span: 24,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'finance.inventory.result.fields.material_code',
            maxlength: 50,
          },
        },
      },
      {
        prop: 'position',
        label: 'finance.inventory.result.fields.position',
        span: 24,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'finance.inventory.result.fields.position',
            maxlength: 10,
          },
        },
      },
      {
        prop: 'unitCost',
        label: 'finance.inventory.result.fields.unit_cost',
        span: 24,
        required: true,
        component: {
          name: 'el-input-number',
          props: {
            placeholder: 'finance.inventory.result.fields.unit_cost',
            precision: 5,
            min: 0,
            step: 0.01,
            controlsPosition: 'right',
          },
        },
      },
      {
        prop: 'bookQty',
        label: 'finance.inventory.result.fields.book_qty',
        span: 24,
        required: true,
        component: {
          name: 'el-input-number',
          props: {
            placeholder: 'finance.inventory.result.fields.book_qty',
            precision: 0,
            min: 0,
            step: 1,
            controlsPosition: 'right',
          },
        },
      },
      {
        prop: 'actualQty',
        label: 'finance.inventory.result.fields.actual_qty',
        span: 24,
        required: true,
        component: {
          name: 'el-input-number',
          props: {
            placeholder: 'finance.inventory.result.fields.actual_qty',
            precision: 0,
            min: 0,
            step: 1,
            controlsPosition: 'right',
          },
        },
      },
    ] as FormItem[],
  },

  service: {
    financeResult: createCrudServiceFromEps(['finance', 'inventory', 'result'], service),
    checkList: service.logistics?.warehouse?.check,
  },
} satisfies PageConfig;
