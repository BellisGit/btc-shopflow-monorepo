/**
 * 数据管理模块配置
 * 包含 inventory、files、dictionary 等页面的配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  locale: {
    data: {
      inventory: {
        list: {
          fields: {
            material_code: '物料编码',
            material_name: '物料名称',
            actual_qty: '实际数量',
            storage_location: '仓位',
            category: '分类',
            status: '状态',
            status_placeholder: '请选择状态',
            remark: '备注',
          },
        },
        confirm: {
          fields: {
            name: '名称',
            status: '状态',
            confirmer: '确认人',
            created_at: '确认时间',
          },
          status: {
            confirmed: '已确认',
            unconfirmed: '未确认',
          },
        },
        ticket: {
          fields: {
            check_no: '盘点单号',
            material_code: '物料编码',
            position: '仓位',
          },
        },
        bom: {
          fields: {
            component_name: '组件名称',
            material_code_name: '物料编码名称',
            component_total_qty: '组件总数量',
            parent_node: '父节点',
            child_node: '子节点',
          },
        },
        check: {
          fields: {
            material_code: '物料编码',
            actual_qty: '实际数量',
            checker_id: '负责人',
            storage_location: '仓位',
          },
        },
      },
      dictionary: {
        file_categories: {
          fields: {
            code: '编码',
            label: '标签',
            mime: 'MIME类型',
            created_at: '创建时间',
            updated_at: '更新时间',
          },
        },
      },
      files: {
        list: {
          fields: {
            file_url: '文件URL',
            original_name: '文件名',
            mime: '文件类型',
            size_bytes: '文件大小',
            created_at: '上传时间',
          },
        },
      },
      recycle: {
        fields: {
          name: '名称',
          type: '类型',
          deleted_at: '删除时间',
        },
      },
    },
  },

  columns: {
    'data.inventory.list': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'partName', label: 'data.inventory.list.fields.material_code', minWidth: 140 },
      { prop: 'partQty', label: 'data.inventory.list.fields.actual_qty', minWidth: 120 },
      { prop: 'position', label: 'data.inventory.list.fields.storage_location', minWidth: 120 },
      { prop: 'createdAt', label: 'system.inventory.base.fields.created_at', width: 180 },
    ] as TableColumn[],

    'data.inventory.list.export': [
      { prop: 'partName', label: 'system.material.fields.material_code' },
      { prop: 'partQty', label: 'inventory.result.fields.actual_qty' },
      { prop: 'position', label: 'inventory.result.fields.storage_location' },
    ] as TableColumn[],

    'data.inventory.confirm': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'name', label: 'data.inventory.confirm.fields.name', minWidth: 150 },
      {
        prop: 'status',
        label: 'data.inventory.confirm.fields.status',
        width: 120,
        dictColor: true,
        dict: [
          { label: 'data.inventory.confirm.status.confirmed', value: '已确认', type: 'success' },
          { label: 'data.inventory.confirm.status.unconfirmed', value: '未确认', type: 'info' },
          { label: 'data.inventory.confirm.status.confirmed', value: 'confirmed', type: 'success' },
          { label: 'data.inventory.confirm.status.unconfirmed', value: 'unconfirmed', type: 'info' },
          { label: 'data.inventory.confirm.status.confirmed', value: 'CONFIRMED', type: 'success' },
          { label: 'data.inventory.confirm.status.unconfirmed', value: 'UNCONFIRMED', type: 'info' },
        ],
      },
      { prop: 'confirmer', label: 'data.inventory.confirm.fields.confirmer', width: 120 },
      { prop: 'createdAt', label: 'data.inventory.confirm.fields.created_at', width: 180 },
    ] as TableColumn[],

    'data.inventory.ticket': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'partName', label: 'system.material.fields.material_code', minWidth: 140 },
      { prop: 'position', label: 'inventory.result.fields.storage_location', minWidth: 120 },
      { prop: 'createdAt', label: 'system.inventory.base.fields.created_at', width: 180 },
    ] as TableColumn[],

    'data.inventory.ticket.export': [
      { prop: 'partName', label: 'system.material.fields.material_code' },
      { prop: 'position', label: 'inventory.result.fields.storage_location' },
    ] as TableColumn[],

    'data.inventory.bom': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'childNode', label: 'data.inventory.bom.fields.component_name', minWidth: 160, showOverflowTooltip: true },
      { prop: 'parentNode', label: 'data.inventory.bom.fields.material_code_name', minWidth: 140, showOverflowTooltip: true },
      { prop: 'childQty', label: 'data.inventory.bom.fields.component_total_qty', width: 120 },
    ] as TableColumn[],

    'data.inventory.bom.export': [
      { prop: 'childNode', label: 'data.inventory.bom.fields.component_name' },
      { prop: 'parentNode', label: 'data.inventory.bom.fields.material_code_name' },
      { prop: 'childQty', label: 'data.inventory.bom.fields.component_total_qty' },
    ] as TableColumn[],

    'data.inventory.check': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'partName', label: 'system.material.fields.material_code', minWidth: 140 },
      { prop: 'partQty', label: 'data.inventory.check.fields.actual_qty', minWidth: 120 },
      { prop: 'checker', label: 'data.inventory.check.fields.checker_id', minWidth: 120 },
      { prop: 'position', label: 'data.inventory.check.fields.storage_location', minWidth: 120 },
    ] as TableColumn[],

    'data.inventory.check.export': [
      { prop: 'checkNo', label: 'system.inventory.base.fields.check_no' },
      { prop: 'partName', label: 'system.material.fields.material_code' },
      { prop: 'partQty', label: 'data.inventory.check.fields.actual_qty' },
      { prop: 'checker', label: 'data.inventory.check.fields.checker_id' },
      { prop: 'position', label: 'data.inventory.check.fields.storage_location' },
      { prop: 'createdAt', label: 'system.inventory.base.fields.created_at' },
    ] as TableColumn[],

    'data.dictionary.file-categories': [
      { type: 'selection' },
      { prop: 'category', label: 'data.dictionary.file_categories.fields.code', minWidth: 140, showOverflowTooltip: true },
      { prop: 'categoryLabel', label: 'data.dictionary.file_categories.fields.label', minWidth: 160, showOverflowTooltip: true },
      { prop: 'mime', label: 'data.dictionary.file_categories.fields.mime', minWidth: 160, showOverflowTooltip: true },
      { prop: 'createdAt', label: 'data.dictionary.file_categories.fields.created_at', width: 170 },
      { prop: 'updatedAt', label: 'data.dictionary.file_categories.fields.updated_at', width: 170 },
    ] as TableColumn[],

    'data.files.list': [
      { type: 'selection' },
      { type: 'index' },
      { prop: 'fileUrl', label: 'data.files.list.fields.file_url', width: 88, align: 'center', headerAlign: 'center' },
      { prop: 'originalName', label: 'data.files.list.fields.original_name', minWidth: 200 },
      { prop: 'mime', label: 'data.files.list.fields.mime', width: 120 },
      { prop: 'sizeBytes', label: 'data.files.list.fields.size_bytes', width: 120 },
      { prop: 'createdAt', label: 'data.files.list.fields.created_at', width: 180 },
    ] as TableColumn[],

    'data.recycle': [
      { type: 'selection' },
      { prop: 'name', label: 'data.recycle.fields.name', minWidth: 200 },
      { prop: 'type', label: 'data.recycle.fields.type', minWidth: 120 },
      { prop: 'deletedAt', label: 'data.recycle.fields.deleted_at', width: 180 },
    ] as TableColumn[],
  },

  forms: {
    'data.inventory.list': [
      { prop: 'materialCode', label: 'data.inventory.list.fields.material_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'materialName', label: 'data.inventory.list.fields.material_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'specification', label: 'system.material.fields.specification', span: 12, component: { name: 'el-input' } },
      { prop: 'unit', label: 'system.material.fields.unit', span: 12, component: { name: 'el-input' } },
      { prop: 'category', label: 'data.inventory.list.fields.category', span: 12, component: { name: 'el-input' } },
      {
        prop: 'status',
        label: 'data.inventory.list.fields.status',
        span: 12,
        component: {
          name: 'el-select',
          props: {
            placeholder: 'data.inventory.list.fields.status_placeholder',
          },
        },
        options: [
          { label: 'common.enabled', value: 1 },
          { label: 'common.disabled', value: 0 },
        ],
      },
      { prop: 'remark', label: 'system.inventory.base.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'data.inventory.confirm': [] as FormItem[],

    'data.inventory.ticket': [
      { prop: 'checkNo', label: 'system.inventory.base.fields.check_no', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'partName', label: 'system.material.fields.material_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'position', label: 'inventory.result.fields.storage_location', span: 12, component: { name: 'el-input' } },
      { prop: 'checkType', label: 'system.inventory.base.fields.check_type', span: 12, component: { name: 'el-input' } },
    ] as FormItem[],

    'data.inventory.bom': [
      { prop: 'parentNode', label: 'data.inventory.bom.fields.parent_node', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'childNode', label: 'data.inventory.bom.fields.child_node', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'childQty', label: 'data.inventory.bom.fields.component_total_qty', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
    ] as FormItem[],

    'data.inventory.check': [
      { prop: 'partName', label: 'system.material.fields.material_code', span: 12, component: { name: 'el-input', props: { readonly: true } }, required: true },
      { prop: 'partQty', label: 'data.inventory.check.fields.actual_qty', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'checker', label: 'data.inventory.check.fields.checker_id', span: 12, component: { name: 'el-input' } },
      { prop: 'position', label: 'data.inventory.check.fields.storage_location', span: 12, component: { name: 'el-input' } },
    ] as FormItem[],

    'data.dictionary.file-categories': [
      { prop: 'category', label: 'data.dictionary.file_categories.fields.code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'categoryLabel', label: 'data.dictionary.file_categories.fields.label', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'mime', label: 'data.dictionary.file_categories.fields.mime', span: 24, component: { name: 'el-input' } },
    ] as FormItem[],

    'data.files.list': [] as FormItem[],

    'data.recycle': [] as FormItem[],
  },

  service: {
    inventoryList: service.system?.base?.data,
    inventoryConfirm: service.system?.base?.approval,
    inventoryTicket: service.logistics?.warehouse?.ticket,
    inventoryBom: service.system?.base?.bom,
    inventoryCheck: service.system?.base?.data,
    checkList: service.logistics?.warehouse?.check,
    domainService: {
      list: async () => {
        try {
          const response = await service.logistics?.base?.position?.me?.();
          let list: any[] = [];
          if (Array.isArray(response)) {
            list = response;
          } else if (response && typeof response === 'object') {
            if ('data' in response) {
              const data = response.data;
              if (Array.isArray(data)) {
                list = data;
              } else if (data && typeof data === 'object') {
                list = Array.isArray(data.data) ? data.data : (Array.isArray(data.list) ? data.list : []);
              }
            } else if ('list' in response) {
              list = Array.isArray(response.list) ? response.list : [];
            }
          }
          const domainMap = new Map<string, any>();
          list.forEach((item: any) => {
            if (!item || typeof item !== 'object') return;
            const domainId = item.domianId || item.domainId;
            if (domainId && !domainMap.has(domainId)) {
              domainMap.set(domainId, {
                id: domainId,
                domainId: domainId,
                name: item.domainName || item.name || domainId,
              });
            }
          });
          return Array.from(domainMap.values());
        } catch (error) {
          console.warn('[DataInventoryList] Failed to load domain list:', error);
          return [];
        }
      },
    },
  },
} satisfies PageConfig;
