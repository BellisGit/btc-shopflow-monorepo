/**
 * 财务盘点模块配置
 * 包含 result 等页面配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';
import { createCrudServiceFromEps } from '@btc/shared-core';

export default {
  // 国际化配置已移至 locales/config.ts，此处不再需要硬编码值
  locale: {},

  columns: {
    'finance.inventory.result': [
      { type: 'selection', width: 48 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'materialCode', label: 'common.inventory.result.fields.material_code', minWidth: 120, showOverflowTooltip: true },
      { prop: 'position', label: 'common.inventory.result.fields.position', width: 80, showOverflowTooltip: true },
      { prop: 'unitCost', label: 'common.inventory.result.fields.unit_cost', width: 100, align: 'right' },
      { prop: 'bookQty', label: 'common.inventory.result.fields.book_qty', width: 100, align: 'right' },
      { prop: 'actualQty', label: 'common.inventory.result.fields.actual_qty', width: 100, align: 'right' },
      { prop: 'diffQty', label: 'common.inventory.result.fields.diff_qty', width: 100, align: 'right' },
      { prop: 'varianceCost', label: 'common.inventory.result.fields.variance_cost', width: 120, align: 'right' },
    ] as TableColumn[],
  },

  forms: {
    'finance.inventory.result': [
      {
        prop: 'materialCode',
        label: 'common.inventory.result.fields.material_code',
        span: 24,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'common.inventory.result.fields.material_code',
            maxlength: 50,
          },
        },
      },
      {
        prop: 'position',
        label: 'common.inventory.result.fields.position',
        span: 24,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'common.inventory.result.fields.position',
            maxlength: 10,
          },
        },
      },
      {
        prop: 'unitCost',
        label: 'common.inventory.result.fields.unit_cost',
        span: 24,
        required: true,
        component: {
          name: 'el-input-number',
          props: {
            placeholder: 'common.inventory.result.fields.unit_cost',
            precision: 5,
            min: 0,
            step: 0.01,
            controlsPosition: 'right',
          },
        },
      },
      {
        prop: 'bookQty',
        label: 'common.inventory.result.fields.book_qty',
        span: 24,
        required: true,
        component: {
          name: 'el-input-number',
          props: {
            placeholder: 'common.inventory.result.fields.book_qty',
            precision: 0,
            min: 0,
            step: 1,
            controlsPosition: 'right',
          },
        },
      },
      {
        prop: 'actualQty',
        label: 'common.inventory.result.fields.actual_qty',
        span: 24,
        required: true,
        component: {
          name: 'el-input-number',
          props: {
            placeholder: 'common.inventory.result.fields.actual_qty',
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
