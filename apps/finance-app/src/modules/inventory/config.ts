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
    'zh-CN': {
      // 菜单配置
      'menu.finance.inventory_management': '盘点管理',
      'menu.finance.inventory_management.result': '盘点结果',
      // 页面配置
      'finance.inventory.result.detail.title': '盘点结果详情',
      'finance.inventory.result.fields.material_code': '物料编码',
      'finance.inventory.result.fields.position': '仓位',
      'finance.inventory.result.fields.unit_cost': '单位成本',
      'finance.inventory.result.fields.book_qty': '账面数量',
      'finance.inventory.result.fields.actual_qty': '实际数量',
      'finance.inventory.result.fields.diff_qty': '差异数量',
      'finance.inventory.result.fields.variance_cost': '差异金额',
      'finance.inventory.result.search_placeholder': '搜索盘点结果',
      'finance.placeholder.inventory_management': '盘点管理页面内容待建设',
      'inventory.check.list': '盘点列表',
      // 标题配置（用于 BtcViewGroup/BtcTableGroup 的 left-title 和 right-title）
      'title.finance.inventory.check.list': '盘点列表',
      // common 配置
      'common.inventory.result.fields.material_code': '物料编码',
      'common.inventory.result.fields.position': '仓位',
      'common.inventory.result.fields.unit_cost': '单位成本',
      'common.inventory.result.fields.book_qty': '账面数量',
      'common.inventory.result.fields.actual_qty': '实际数量',
      'common.inventory.result.fields.diff_qty': '差异数量',
      'common.inventory.result.fields.variance_cost': '差异金额',
    },
    'en-US': {
      // 菜单配置
      'menu.finance.inventory_management': 'Inventory Management',
      'menu.finance.inventory_management.result': 'Inventory Result',
      // 页面配置
      'finance.inventory.result.detail.title': 'Inventory Result Details',
      'finance.inventory.result.fields.material_code': 'Material Code',
      'finance.inventory.result.fields.position': 'Position',
      'finance.inventory.result.fields.unit_cost': 'Unit Cost',
      'finance.inventory.result.fields.book_qty': 'Book Quantity',
      'finance.inventory.result.fields.actual_qty': 'Actual Quantity',
      'finance.inventory.result.fields.diff_qty': 'Difference Quantity',
      'finance.inventory.result.fields.variance_cost': 'Variance Cost',
      'finance.inventory.result.search_placeholder': 'Search inventory results',
      'finance.placeholder.inventory_management': 'Inventory management page is under construction',
      'inventory.check.list': 'Check List',
      // 标题配置（用于 BtcViewGroup/BtcTableGroup 的 left-title  and right-title）
      'title.finance.inventory.check.list': 'Check List',
      // common 配置
      'common.inventory.result.fields.material_code': 'Material Code',
      'common.inventory.result.fields.position': 'Position',
      'common.inventory.result.fields.unit_cost': 'Unit Cost',
      'common.inventory.result.fields.book_qty': 'Book Quantity',
      'common.inventory.result.fields.actual_qty': 'Actual Quantity',
      'common.inventory.result.fields.diff_qty': 'Difference Quantity',
      'common.inventory.result.fields.variance_cost': 'Variance Cost',
    },
  },

  columns: {
    'finance.inventory.result': [
      { type: 'selection', width: 48 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'materialCode', label: 'common.inventory.result.fields.material_code', showOverflowTooltip: true },
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
    financeResult: createCrudServiceFromEps(['finance', 'base', 'financeResult'], service),
    checkList: service.logistics?.warehouse?.check,
  },
} satisfies PageConfig;

