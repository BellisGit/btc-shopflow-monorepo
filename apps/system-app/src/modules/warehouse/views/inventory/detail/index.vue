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
          <BtcExportBtn :filename="t('menu.logistics.inventoryManagement.detail')" />
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
import { useI18n, usePageColumns, usePageForms, getPageConfigFull, usePageService } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { formatDateTime } from '@btc/shared-utils';

defineOptions({
  name: 'btc-logistics-warehouse-inventory-detail',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('warehouse.inventory.detail');
const { formItems } = usePageForms('warehouse.inventory.detail');
const pageConfig = getPageConfigFull('warehouse.inventory.detail');

// 使用 config.ts 中定义的服务
const inventoryDetailService = usePageService('warehouse.inventory.detail', 'inventoryDetail');

// 扩展配置以支持动态 formatter
const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果列是日期字段，添加动态 formatter
    if (col.prop === 'processTime') {
      return {
        ...col,
        formatter: formatDateCell,
      };
    }
    return col;
  });
});

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


