<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="inventoryDetailService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey />
        <BtcCrudActions>
          <BtcExportBtn :filename="t('menu.logistics.warehouse.inventory.detail')" />
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

      <BtcUpsert ref="upsertRef" :items="formItems" width="640px" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { createWarehouseCrudService } from '@/services/warehouse';
import { formatDateTime } from '@btc/shared-utils';

defineOptions({
  name: 'btc-logistics-warehouse-inventory-detail',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

const inventoryDetailService: CrudService<any> = createWarehouseCrudService('diff');

const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { label: 'ID', prop: 'id', width: 100 },
  { label: t('logistics.inventory.diff.fields.materialCode'), prop: 'materialCode', minWidth: 160, showOverflowTooltip: true },
  { label: t('logistics.inventory.diff.fields.diffReason'), prop: 'diffReason', minWidth: 200, showOverflowTooltip: true },
  { label: t('logistics.inventory.diff.fields.processPerson'), prop: 'processPerson', minWidth: 140 },
  { label: t('logistics.inventory.diff.fields.processTime'), prop: 'processTime', width: 180, formatter: formatDateCell },
  { label: t('logistics.inventory.diff.fields.processRemark'), prop: 'processRemark', minWidth: 200, showOverflowTooltip: true },
]);

const formItems = computed<FormItem[]>(() => [
  {
    label: t('logistics.inventory.diff.fields.inventoryCheckId'),
    prop: 'inventoryCheckId',
    required: true,
    component: { name: 'el-input-number', props: { min: 0, step: 1, controlsPosition: 'right' } },
  },
  {
    label: t('logistics.inventory.diff.fields.materialCode'),
    prop: 'materialCode',
    required: true,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.diff.fields.diffReason'),
    prop: 'diffReason',
    component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } },
  },
  {
    label: t('logistics.inventory.diff.fields.processPerson'),
    prop: 'processPerson',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.diff.fields.processTime'),
    prop: 'processTime',
    component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } },
  },
  {
    label: t('logistics.inventory.diff.fields.processRemark'),
    prop: 'processRemark',
    component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } },
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


