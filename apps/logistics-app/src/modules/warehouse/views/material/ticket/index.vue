<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="ticketService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcImportBtn
            :tips="t('logistics.ticket.import.tips')"
            :on-submit="handleImport"
          />
        </div>
        <BtcFlex1 />
        <BtcSearchKey :placeholder="t('logistics.ticket.searchPlaceholder')" />
        <BtcCrudActions>
          <BtcExportBtn :filename="t('menu.logistics.warehouse.material.ticket')" />
        </BtcCrudActions>
      </BtcRow>

      <BtcRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :disable-auto-created-at="true"
          border
          :op="{ buttons: ['edit'] }"
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
import {
  BtcCrud,
  BtcRow,
  BtcRefreshBtn,
  BtcImportBtn,
  BtcFlex1,
  BtcSearchKey,
  BtcCrudActions,
  BtcExportBtn,
  BtcTable,
  BtcPagination,
  BtcUpsert,
} from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import { service } from '@services/eps';
import { useMessage } from '@/utils/use-message';

defineOptions({
  name: 'btc-logistics-warehouse-ticket-list',
});

const { t } = useI18n();
const message = useMessage();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

const ticketService: CrudService<any> = createCrudServiceFromEps(
  ['logistics', 'warehouse', 'ticket'],
  service
);

const ticketRawService = service?.logistics?.warehouse?.ticket;

const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { label: t('logistics.ticket.fields.ticketCode'), prop: 'ticketCode', minWidth: 150, showOverflowTooltip: true },
  { label: t('logistics.ticket.fields.ticketName'), prop: 'ticketName', minWidth: 160, showOverflowTooltip: true },
  { label: t('logistics.ticket.fields.warehouseName'), prop: 'warehouseName', minWidth: 160, showOverflowTooltip: true },
  { label: t('logistics.ticket.fields.checkType'), prop: 'checkType', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.ticket.fields.ticketStatus'), prop: 'ticketStatus', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.ticket.fields.checkerName'), prop: 'checkerName', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.ticket.fields.planStartTime'), prop: 'planStartTime', width: 180, formatter: formatDateCell },
  { label: t('logistics.ticket.fields.planEndTime'), prop: 'planEndTime', width: 180, formatter: formatDateCell },
  { label: t('logistics.ticket.fields.remark'), prop: 'remark', minWidth: 200, showOverflowTooltip: true },
  { label: t('logistics.ticket.fields.createdAt'), prop: 'createdAt', width: 180, formatter: formatDateCell },
  { label: t('logistics.ticket.fields.updatedAt'), prop: 'updatedAt', width: 180, formatter: formatDateCell },
]);

const formItems = computed<FormItem[]>(() => [
  {
    label: t('logistics.ticket.fields.ticketCode'),
    prop: 'ticketCode',
    required: true,
    component: { name: 'el-input', props: { maxlength: 60, placeholder: t('logistics.ticket.fields.ticketCode') } },
  },
  {
    label: t('logistics.ticket.fields.ticketName'),
    prop: 'ticketName',
    required: true,
    component: { name: 'el-input', props: { maxlength: 120, placeholder: t('logistics.ticket.fields.ticketName') } },
  },
  {
    label: t('logistics.ticket.fields.warehouseName'),
    prop: 'warehouseName',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.ticket.fields.checkType'),
    prop: 'checkType',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.ticket.fields.ticketStatus'),
    prop: 'ticketStatus',
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.ticket.fields.checkerName'),
    prop: 'checkerName',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.ticket.fields.planStartTime'),
    prop: 'planStartTime',
    component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } },
  },
  {
    label: t('logistics.ticket.fields.planEndTime'),
    prop: 'planEndTime',
    component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } },
  },
  {
    label: t('logistics.ticket.fields.remark'),
    prop: 'remark',
    component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } },
  },
]);

const handleImport = async (
  payload: { list?: any[]; file?: File; filename?: string },
  helpers: { done?: (error?: unknown) => void; close?: () => void } = {}
) => {
  const { done, close } = helpers;
  const rows = Array.isArray(payload?.list)
    ? payload.list
        .filter(Boolean)
        .map((row: Record<string, any>) => {
          const { _index, ...rest } = row || {};
          return rest;
        })
    : [];

  if (!rows.length) {
    message.warning(t('logistics.ticket.import.empty'));
    done?.();
    return;
  }

  const importFn = (ticketRawService as Record<string, any>)?.import;
  if (typeof importFn !== 'function') {
    message.warning(t('logistics.ticket.import.unsupported'));
    done?.();
    return;
  }

  try {
    await importFn(rows);
    message.success(t('logistics.ticket.import.success'));
    crudRef.value?.crud?.refresh?.();
    done?.();
    close?.();
  } catch (error) {
    console.error('[logistics-ticket] import failed:', error);
    message.error(t('logistics.ticket.import.failed'));
    done?.(error);
  }
};

onMounted(() => {
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


