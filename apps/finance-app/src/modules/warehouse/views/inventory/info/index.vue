<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="inventoryInfoService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey />
        <BtcCrudActions>
          <BtcExportBtn :filename="t('menu.logistics.warehouse.inventory.info')" />
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

      <BtcUpsert ref="upsertRef" :items="formItems" width="680px" />
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
import { service } from '@services/eps';
import { formatDateTime } from '@btc/shared-utils';

defineOptions({
  name: 'btc-logistics-warehouse-inventory-info',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

const inventoryInfoService: CrudService<any> = createCrudServiceFromEps(
  ['logistics', 'warehouse', 'check'],
  service
);

const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { label: t('logistics.inventory.base.fields.checkNo'), prop: 'checkNo', minWidth: 160, showOverflowTooltip: true },
  { label: t('logistics.inventory.base.fields.domainId'), prop: 'domainId', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.inventory.base.fields.checkType'), prop: 'checkType', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.inventory.base.fields.checkStatus'), prop: 'checkStatus', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.inventory.base.fields.startTime'), prop: 'startTime', width: 180, formatter: formatDateCell },
  { label: t('logistics.inventory.base.fields.endTime'), prop: 'endTime', width: 180, formatter: formatDateCell },
  { label: t('logistics.inventory.base.fields.checkerId'), prop: 'checkerId', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.inventory.base.fields.remark'), prop: 'remark', minWidth: 200, showOverflowTooltip: true },
  { label: t('logistics.inventory.base.fields.createdAt'), prop: 'createdAt', width: 180, formatter: formatDateCell },
  { label: t('logistics.inventory.base.fields.updateAt'), prop: 'updateAt', width: 180, formatter: formatDateCell },
]);

const formItems = computed<FormItem[]>(() => [
  {
    label: t('logistics.inventory.base.fields.checkNo'),
    prop: 'checkNo',
    required: true,
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.domainId'),
    prop: 'domainId',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.checkType'),
    prop: 'checkType',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.checkStatus'),
    prop: 'checkStatus',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.startTime'),
    prop: 'startTime',
    component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } },
  },
  {
    label: t('logistics.inventory.base.fields.endTime'),
    prop: 'endTime',
    component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } },
  },
  {
    label: t('logistics.inventory.base.fields.checkerId'),
    prop: 'checkerId',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.remark'),
    prop: 'remark',
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


