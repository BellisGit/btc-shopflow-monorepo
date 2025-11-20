<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="materialService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey />
        <BtcCrudActions>
          <BtcExportBtn :filename="t('menu.logistics.warehouse.material.list')" />
        </BtcCrudActions>
      </BtcRow>

      <BtcRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :disable-auto-created-at="true"
          border
          :op="{ buttons: ['edit', 'delete'] }"
        />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>

      <BtcUpsert ref="upsertRef" :items="formItems" width="720px" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import { service } from '@services/eps';

defineOptions({
  name: 'btc-logistics-warehouse-material-list',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

const materialService: CrudService<any> = createCrudServiceFromEps(
  ['logistics', 'warehouse', 'material'],
  service
);

const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { label: t('logistics.material.fields.materialCode'), prop: 'materialCode', minWidth: 160, showOverflowTooltip: true },
  { label: t('logistics.material.fields.materialName'), prop: 'materialName', minWidth: 180, showOverflowTooltip: true },
  { label: t('logistics.material.fields.materialType'), prop: 'materialType', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.material.fields.specification'), prop: 'specification', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.material.fields.materialTexture'), prop: 'materialTexture', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.material.fields.unit'), prop: 'unit', width: 100 },
  { label: t('logistics.material.fields.supplierName'), prop: 'supplierName', minWidth: 180, showOverflowTooltip: true },
  { label: t('logistics.material.fields.unitPrice'), prop: 'unitPrice', minWidth: 140 },
  { label: t('logistics.material.fields.taxRate'), prop: 'taxRate', minWidth: 120 },
  { label: t('logistics.material.fields.totalPrice'), prop: 'totalPrice', minWidth: 140 },
  { label: t('logistics.material.fields.createdAt'), prop: 'createdAt', width: 180, formatter: formatDateCell },
  { label: t('logistics.material.fields.updatedAt'), prop: 'updatedAt', width: 180, formatter: formatDateCell },
]);

const formItems = computed<FormItem[]>(() => [
  {
    label: t('logistics.material.fields.materialCode'),
    prop: 'materialCode',
    required: true,
    component: { name: 'el-input', props: { maxlength: 60, placeholder: t('logistics.material.fields.materialCode') } },
  },
  {
    label: t('logistics.material.fields.materialName'),
    prop: 'materialName',
    required: true,
    component: { name: 'el-input', props: { maxlength: 120, placeholder: t('logistics.material.fields.materialName') } },
  },
  {
    label: t('logistics.material.fields.materialType'),
    prop: 'materialType',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.material.fields.specification'),
    prop: 'specification',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.material.fields.materialTexture'),
    prop: 'materialTexture',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.material.fields.unit'),
    prop: 'unit',
    component: { name: 'el-input', props: { maxlength: 20 } },
  },
  {
    label: t('logistics.material.fields.supplierCode'),
    prop: 'supplierCode',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.material.fields.supplierName'),
    prop: 'supplierName',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.material.fields.unitPrice'),
    prop: 'unitPrice',
    component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } },
  },
  {
    label: t('logistics.material.fields.taxRate'),
    prop: 'taxRate',
    component: { name: 'el-input-number', props: { min: 0, max: 1, step: 0.01, controlsPosition: 'right' } },
  },
  {
    label: t('logistics.material.fields.totalPrice'),
    prop: 'totalPrice',
    component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } },
  },
  {
    label: t('logistics.material.fields.barCode'),
    prop: 'barCode',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.material.fields.safetyStock'),
    prop: 'safetyStock',
    component: { name: 'el-input-number', props: { min: 0, precision: 0, controlsPosition: 'right' } },
  },
  {
    label: t('logistics.material.fields.storageRequirement'),
    prop: 'storageRequirement',
    component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } },
  },
  {
    label: t('logistics.material.fields.expireCycle'),
    prop: 'expireCycle',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.material.fields.remark'),
    prop: 'remark',
    component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } },
  },
]);

onMounted(() => {
  crudRef.value?.crud?.loadData?.();
  nextTick(() => {
    tableRef.value?.calcMaxHeight?.();
  });
});
</script>

<style scoped lang="scss">
.logistics-crud-wrapper {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}
</style>


