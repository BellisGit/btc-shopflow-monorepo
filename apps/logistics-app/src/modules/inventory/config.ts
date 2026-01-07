/**
 * 盘点模块配置
 * 包含 info、detail、result 等页面配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';
import { createCrudServiceFromEps } from '@btc/shared-core';

export default {
  locale: {
    logistics: {
      inventory: {
        info: {
          fields: {
            check_no: '盘点单号',
            domain_id: '域ID',
            check_type: '盘点类型',
            check_status: '盘点状态',
            start_time: '开始时间',
            end_time: '结束时间',
            checker_id: '负责人',
            remark: '备注',
            created_at: '创建时间',
            update_at: '更新时间',
          },
        },
        detail: {
          fields: {
            material_code: '物料编码',
            diff_reason: '差异原因',
            process_person: '处理人',
            process_time: '处理时间',
            process_remark: '处理备注',
            check_no: '盘点流程ID',
            position: '仓位',
            diff_qty: '差异数量',
          },
        },
        result: {
          fields: {
            material_code: '物料编码',
            position: '仓位',
            book_qty: '账面数量',
            actual_qty: '实际数量',
            diff_qty: '差异数量',
          },
        },
        sub_process: {
          fields: {
            sub_process_no: '子流程编号',
            check_status: '盘点状态',
            start_time: '开始时间',
            end_time: '结束时间',
            remaining_seconds: '剩余秒数',
            parent_process_no: '父流程编号',
          },
        },
      },
    },
  },

  columns: {
    'logistics.inventory.info': [
      { type: 'index', label: 'crud.table.index', width: 60 },
      { prop: 'checkNo', label: 'logistics.inventory.info.fields.check_no', minWidth: 160, showOverflowTooltip: true },
      { prop: 'domainId', label: 'logistics.inventory.info.fields.domain_id', minWidth: 140, showOverflowTooltip: true },
      { prop: 'checkType', label: 'logistics.inventory.info.fields.check_type', minWidth: 140, showOverflowTooltip: true },
      { prop: 'checkStatus', label: 'logistics.inventory.info.fields.check_status', minWidth: 140, showOverflowTooltip: true },
      { prop: 'startTime', label: 'logistics.inventory.info.fields.start_time', width: 180 },
      { prop: 'endTime', label: 'logistics.inventory.info.fields.end_time', width: 180 },
      { prop: 'checkerId', label: 'logistics.inventory.info.fields.checker_id', minWidth: 140, showOverflowTooltip: true },
      { prop: 'remark', label: 'logistics.inventory.info.fields.remark', minWidth: 200, showOverflowTooltip: true },
      { prop: 'createdAt', label: 'logistics.inventory.info.fields.created_at', width: 180 },
      { prop: 'updateAt', label: 'logistics.inventory.info.fields.update_at', width: 180 },
    ] as TableColumn[],

    'logistics.inventory.detail': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'materialCode', label: 'logistics.inventory.detail.fields.material_code', minWidth: 160, showOverflowTooltip: true },
      { prop: 'diffReason', label: 'logistics.inventory.detail.fields.diff_reason', minWidth: 200, showOverflowTooltip: true },
      { prop: 'processPerson', label: 'logistics.inventory.detail.fields.process_person', minWidth: 140 },
      { prop: 'processTime', label: 'logistics.inventory.detail.fields.process_time', width: 180 },
      { prop: 'processRemark', label: 'logistics.inventory.detail.fields.process_remark', minWidth: 200, showOverflowTooltip: true },
    ] as TableColumn[],

    'logistics.inventory.result': [
      { type: 'selection', width: 48 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'materialCode', label: 'logistics.inventory.result.fields.material_code', minWidth: 140, showOverflowTooltip: true },
      { prop: 'position', label: 'logistics.inventory.result.fields.position', minWidth: 140, showOverflowTooltip: true },
      { prop: 'bookQty', label: 'logistics.inventory.result.fields.book_qty', minWidth: 120 },
      { prop: 'actualQty', label: 'logistics.inventory.result.fields.actual_qty', minWidth: 120 },
      { prop: 'diffQty', label: 'logistics.inventory.result.fields.diff_qty', minWidth: 120 },
    ] as TableColumn[],

    'logistics.inventory.info.subProcess': [
      { type: 'index', label: 'crud.table.index', width: 60 },
      { prop: 'subProcessNo', label: 'logistics.inventory.sub_process.fields.sub_process_no', minWidth: 160, showOverflowTooltip: true },
      { prop: 'checkStatus', label: 'logistics.inventory.sub_process.fields.check_status', minWidth: 140, showOverflowTooltip: true },
      { prop: 'startTime', label: 'logistics.inventory.sub_process.fields.start_time', width: 180 },
      { prop: 'endTime', label: 'logistics.inventory.sub_process.fields.end_time', width: 180 },
      { prop: 'remainingSeconds', label: 'logistics.inventory.sub_process.fields.remaining_seconds', minWidth: 120 },
      { prop: 'parentProcessNo', label: 'logistics.inventory.sub_process.fields.parent_process_no', minWidth: 160, showOverflowTooltip: true },
      { prop: 'createdAt', label: 'logistics.inventory.info.fields.created_at', width: 180 },
      { prop: 'updatedAt', label: 'logistics.inventory.info.fields.update_at', width: 180 },
    ] as TableColumn[],

    'logistics.inventory.detail.export': [
      { prop: 'materialCode', label: 'logistics.inventory.detail.fields.material_code' },
      { prop: 'position', label: 'logistics.inventory.detail.fields.position' },
      { prop: 'diffQty', label: 'logistics.inventory.detail.fields.diff_qty' },
      { prop: 'diffReason', label: 'logistics.inventory.detail.fields.diff_reason' },
      { prop: 'processPerson', label: 'logistics.inventory.detail.fields.process_person' },
      { prop: 'processTime', label: 'logistics.inventory.detail.fields.process_time' },
      { prop: 'processRemark', label: 'logistics.inventory.detail.fields.process_remark' },
    ] as TableColumn[],
  },

  forms: {
    'logistics.inventory.info': [
      { prop: 'checkNo', label: 'logistics.inventory.info.fields.check_no', span: 24, required: true, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'domainId', label: 'logistics.inventory.info.fields.domain_id', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'checkType', label: 'logistics.inventory.info.fields.check_type', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'checkStatus', label: 'logistics.inventory.info.fields.check_status', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'startTime', label: 'logistics.inventory.info.fields.start_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'endTime', label: 'logistics.inventory.info.fields.end_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'checkerId', label: 'logistics.inventory.info.fields.checker_id', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'remark', label: 'logistics.inventory.info.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } } },
    ] as FormItem[],

    'logistics.inventory.detail': [
      { prop: 'checkNo', label: 'logistics.inventory.detail.fields.check_no', span: 24, component: { name: 'el-input', props: { readonly: true } } },
      { prop: 'materialCode', label: 'logistics.inventory.detail.fields.material_code', span: 24, component: { name: 'el-input', props: { readonly: true, maxlength: 120 } } },
      { prop: 'position', label: 'logistics.inventory.detail.fields.position', span: 24, component: { name: 'el-input', props: { readonly: true, maxlength: 120 } } },
      { prop: 'diffQty', label: 'logistics.inventory.detail.fields.diff_qty', span: 24, component: { name: 'el-input-number', props: { readonly: true, controlsPosition: 'right' } } },
      { prop: 'diffReason', label: 'logistics.inventory.detail.fields.diff_reason', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255, readonly: true } } },
      { prop: 'processPerson', label: 'logistics.inventory.detail.fields.process_person', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'processTime', label: 'logistics.inventory.detail.fields.process_time', span: 24, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'processRemark', label: 'logistics.inventory.detail.fields.process_remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } } },
    ] as FormItem[],

    'logistics.inventory.result': [
      { prop: 'baseId', label: 'logistics.inventory.check.fields.base_id', span: 24, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialCode', label: 'logistics.inventory.check.fields.material_code', span: 24, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialName', label: 'logistics.inventory.check.fields.material_name', span: 24, component: { name: 'el-input', props: { maxlength: 200 } } },
      { prop: 'specification', label: 'logistics.inventory.check.fields.specification', span: 24, component: { name: 'el-input', props: { maxlength: 200 } } },
      { prop: 'unit', label: 'logistics.inventory.check.fields.unit', span: 24, component: { name: 'el-input', props: { maxlength: 20 } } },
      { prop: 'batchNo', label: 'logistics.inventory.check.fields.batch_no', span: 24, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'bookQty', label: 'logistics.inventory.check.fields.book_qty', span: 24, component: { name: 'el-input', props: { maxlength: 50 } } },
      { prop: 'actualQty', label: 'logistics.inventory.check.fields.actual_qty', span: 24, component: { name: 'el-input', props: { maxlength: 50 } } },
      { prop: 'storageLocation', label: 'logistics.inventory.check.fields.storage_location', span: 24, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'diffQty', label: 'logistics.inventory.check.fields.diff_qty', span: 24, component: { name: 'el-input', props: { maxlength: 50 } } },
      { prop: 'diffRate', label: 'logistics.inventory.check.fields.diff_rate', span: 24, component: { name: 'el-input', props: { maxlength: 50 } } },
      { prop: 'checkerId', label: 'logistics.inventory.check.fields.checker_id', span: 24, component: { name: 'el-input', props: { maxlength: 120 } } },
      {
        prop: 'isDiff',
        label: 'logistics.inventory.check.fields.is_diff',
        span: 24,
        component: {
          name: 'el-select',
          props: {
            clearable: true,
          },
          options: [
            { label: 'common.enabled', value: 1 },
            { label: 'common.disabled', value: 0 },
          ],
        },
      },
      { prop: 'remark', label: 'logistics.inventory.check.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3, maxlength: 500 } } },
    ] as FormItem[],

    'logistics.inventory.info.subProcess': [
      { prop: 'subProcessNo', label: 'logistics.inventory.sub_process.fields.sub_process_no', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'parentProcessNo', label: 'logistics.inventory.sub_process.fields.parent_process_no', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'checkStatus', label: 'logistics.inventory.sub_process.fields.check_status', span: 12, component: { name: 'el-select', props: { clearable: true, placeholder: 'common.pleaseSelect' } } },
      { prop: 'startTime', label: 'logistics.inventory.sub_process.fields.start_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'endTime', label: 'logistics.inventory.sub_process.fields.end_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'remainingSeconds', label: 'logistics.inventory.sub_process.fields.remaining_seconds', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 0, controlsPosition: 'right' } } },
    ] as FormItem[],
  },

  service: {
    info: createCrudServiceFromEps(['logistics', 'warehouse', 'check'], service),
    detail: createCrudServiceFromEps(['logistics', 'warehouse', 'diff'], service),
    result: createCrudServiceFromEps(['logistics', 'base', 'check'], service),
    checkList: service.logistics?.warehouse?.check,
  },
} satisfies PageConfig;
