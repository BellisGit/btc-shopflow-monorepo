/**
 * 仓储模块配置
 * 包含 material、config 等页面配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';
import { createCrudServiceFromEps } from '@btc/shared-core';

export default {
  // 国际化配置已移至 locales/config.ts，此处不再需要硬编码值
  locale: {},

  columns: {
    'logistics.warehouse.material.list': [
      { type: 'selection', width: 48 },
      { prop: 'materialCode', label: 'common.warehouse.material.fields.material_code', minWidth: 160, showOverflowTooltip: true },
      { prop: 'materialName', label: 'common.warehouse.material.fields.material_name', minWidth: 180, showOverflowTooltip: true },
      { prop: 'materialType', label: 'common.warehouse.material.fields.material_type', minWidth: 140, showOverflowTooltip: true },
      { prop: 'specification', label: 'common.warehouse.material.fields.specification', minWidth: 140, showOverflowTooltip: true },
      { prop: 'materialTexture', label: 'common.warehouse.material.fields.material_texture', minWidth: 140, showOverflowTooltip: true },
      { prop: 'unit', label: 'common.warehouse.material.fields.unit', width: 100 },
      { prop: 'supplierName', label: 'common.warehouse.material.fields.supplier_name', minWidth: 180, showOverflowTooltip: true },
      { prop: 'unitPrice', label: 'common.warehouse.material.fields.unit_price', minWidth: 140 },
      { prop: 'taxRate', label: 'common.warehouse.material.fields.tax_rate', minWidth: 120 },
      { prop: 'totalPrice', label: 'common.warehouse.material.fields.total_price', minWidth: 140 },
      { prop: 'createdAt', label: 'common.warehouse.material.fields.created_at', width: 180 },
      { prop: 'updatedAt', label: 'common.warehouse.material.fields.updated_at', width: 180 },
    ] as TableColumn[],

  },

  forms: {
    'logistics.warehouse.material.list': [
      { prop: 'materialCode', label: 'common.warehouse.material.fields.material_code', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'materialName', label: 'common.warehouse.material.fields.material_name', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialType', label: 'common.warehouse.material.fields.material_type', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'specification', label: 'common.warehouse.material.fields.specification', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialTexture', label: 'common.warehouse.material.fields.material_texture', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'unit', label: 'common.warehouse.material.fields.unit', span: 12, component: { name: 'el-input', props: { maxlength: 20 } } },
      { prop: 'supplierCode', label: 'common.warehouse.material.fields.supplier_code', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'supplierName', label: 'common.warehouse.material.fields.supplier_name', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'unitPrice', label: 'common.warehouse.material.fields.unit_price', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'taxRate', label: 'common.warehouse.material.fields.tax_rate', span: 12, component: { name: 'el-input-number', props: { min: 0, max: 1, step: 0.01, controlsPosition: 'right' } } },
      { prop: 'totalPrice', label: 'common.warehouse.material.fields.total_price', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'barCode', label: 'common.warehouse.material.fields.bar_code', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'safetyStock', label: 'common.warehouse.material.fields.safety_stock', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 0, controlsPosition: 'right' } } },
      { prop: 'storageRequirement', label: 'common.warehouse.material.fields.storage_requirement', span: 24, component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } } },
      { prop: 'expireCycle', label: 'common.warehouse.material.fields.expire_cycle', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'remark', label: 'common.warehouse.material.fields.remark', span: 24, component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } } },
    ] as FormItem[],

  },

  service: {
    material: createCrudServiceFromEps(['logistics', 'warehouse', 'material'], service),
  },
} satisfies PageConfig;
