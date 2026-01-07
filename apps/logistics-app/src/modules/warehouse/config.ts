/**
 * 仓储模块配置
 * 包含 material、config 等页面配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';
import { createCrudServiceFromEps } from '@btc/shared-core';

export default {
  locale: {
    logistics: {
      warehouse: {
        material: {
          fields: {
            material_code: '物料编码',
            material_name: '物料名称',
            material_type: '物料类型',
            specification: '规格型号',
            material_texture: '材质',
            unit: '单位',
            supplier_code: '供应商编码',
            supplier_name: '供应商名称',
            unit_price: '单价',
            tax_rate: '税率',
            total_price: '含税总价',
            bar_code: '条形码',
            safety_stock: '安全库存',
            storage_requirement: '储存要求',
            expire_cycle: '保质周期',
            remark: '备注',
            created_at: '创建时间',
            updated_at: '更新时间',
          },
        },
        config: {
          storage_location: {
            fields: {
              name: '名称',
              position: '仓位',
              description: '描述',
              domain_id: '域ID',
              createdAt: '创建时间',
              updatedAt: '更新时间',
            },
          },
        },
      },
    },
  },

  columns: {
    'logistics.warehouse.material.list': [
      { type: 'selection', width: 48 },
      { prop: 'materialCode', label: 'logistics.warehouse.material.fields.material_code', minWidth: 160, showOverflowTooltip: true },
      { prop: 'materialName', label: 'logistics.warehouse.material.fields.material_name', minWidth: 180, showOverflowTooltip: true },
      { prop: 'materialType', label: 'logistics.warehouse.material.fields.material_type', minWidth: 140, showOverflowTooltip: true },
      { prop: 'specification', label: 'logistics.warehouse.material.fields.specification', minWidth: 140, showOverflowTooltip: true },
      { prop: 'materialTexture', label: 'logistics.warehouse.material.fields.material_texture', minWidth: 140, showOverflowTooltip: true },
      { prop: 'unit', label: 'logistics.warehouse.material.fields.unit', width: 100 },
      { prop: 'supplierName', label: 'logistics.warehouse.material.fields.supplier_name', minWidth: 180, showOverflowTooltip: true },
      { prop: 'unitPrice', label: 'logistics.warehouse.material.fields.unit_price', minWidth: 140 },
      { prop: 'taxRate', label: 'logistics.warehouse.material.fields.tax_rate', minWidth: 120 },
      { prop: 'totalPrice', label: 'logistics.warehouse.material.fields.total_price', minWidth: 140 },
      { prop: 'createdAt', label: 'logistics.warehouse.material.fields.created_at', width: 180 },
      { prop: 'updatedAt', label: 'logistics.warehouse.material.fields.updated_at', width: 180 },
    ] as TableColumn[],

    'logistics.warehouse.config.storage-location': [
      { type: 'selection', width: 48 },
      { prop: 'name', label: 'logistics.warehouse.config.storage_location.fields.name', minWidth: 140, showOverflowTooltip: true },
      { prop: 'position', label: 'logistics.warehouse.config.storage_location.fields.position', minWidth: 180, showOverflowTooltip: true },
      { prop: 'description', label: 'logistics.warehouse.config.storage_location.fields.description', minWidth: 200, showOverflowTooltip: true },
      { prop: 'createdAt', label: 'logistics.warehouse.config.storage_location.fields.createdAt', width: 180 },
      { prop: 'updatedAt', label: 'logistics.warehouse.config.storage_location.fields.updatedAt', width: 180 },
    ] as TableColumn[],
  },

  forms: {
    'logistics.warehouse.material.list': [
      { prop: 'materialCode', label: 'logistics.warehouse.material.fields.material_code', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'materialName', label: 'logistics.warehouse.material.fields.material_name', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialType', label: 'logistics.warehouse.material.fields.material_type', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'specification', label: 'logistics.warehouse.material.fields.specification', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialTexture', label: 'logistics.warehouse.material.fields.material_texture', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'unit', label: 'logistics.warehouse.material.fields.unit', span: 12, component: { name: 'el-input', props: { maxlength: 20 } } },
      { prop: 'supplierCode', label: 'logistics.warehouse.material.fields.supplier_code', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'supplierName', label: 'logistics.warehouse.material.fields.supplier_name', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'unitPrice', label: 'logistics.warehouse.material.fields.unit_price', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'taxRate', label: 'logistics.warehouse.material.fields.tax_rate', span: 12, component: { name: 'el-input-number', props: { min: 0, max: 1, step: 0.01, controlsPosition: 'right' } } },
      { prop: 'totalPrice', label: 'logistics.warehouse.material.fields.total_price', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'barCode', label: 'logistics.warehouse.material.fields.bar_code', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'safetyStock', label: 'logistics.warehouse.material.fields.safety_stock', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 0, controlsPosition: 'right' } } },
      { prop: 'storageRequirement', label: 'logistics.warehouse.material.fields.storage_requirement', span: 24, component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } } },
      { prop: 'expireCycle', label: 'logistics.warehouse.material.fields.expire_cycle', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'remark', label: 'logistics.warehouse.material.fields.remark', span: 24, component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } } },
    ] as FormItem[],

    'logistics.warehouse.config.storage-location': [
      { prop: 'name', label: 'logistics.warehouse.config.storage_location.fields.name', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'position', label: 'logistics.warehouse.config.storage_location.fields.position', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'description', label: 'logistics.warehouse.config.storage_location.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3, maxlength: 500 } } },
      { prop: 'domainId', label: 'logistics.warehouse.config.storage_location.fields.domain_id', span: 24, component: { name: 'el-select', props: { clearable: true, placeholder: 'common.pleaseSelect' } } },
    ] as FormItem[],
  },

  service: {
    material: createCrudServiceFromEps(['logistics', 'warehouse', 'material'], service),
    storageLocation: createCrudServiceFromEps(['logistics', 'base', 'position'], service),
  },
} satisfies PageConfig;
