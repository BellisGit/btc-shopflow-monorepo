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
import { useI18n, usePageColumns, usePageForms, getPageConfigFull, usePageService } from '@btc/shared-core';
import type { TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { formatDateTime } from '@btc/shared-utils';

defineOptions({
  name: 'btc-logistics-warehouse-material-list',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('logistics.warehouse.material.list');
const { formItems } = usePageForms('logistics.warehouse.material.list');
const pageConfig = getPageConfigFull('logistics.warehouse.material.list');

// 使用 config.ts 中定义的服务
const materialService = usePageService('logistics.warehouse.material.list', 'material');

// 扩展配置以支持动态 formatter
const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果列是日期字段，添加动态 formatter
    if (col.prop === 'createdAt' || col.prop === 'updatedAt') {
      return {
        ...col,
        formatter: formatDateCell,
      };
    }
    return col;
  });
});

onMounted(() => {
  // 移除手动调用 loadData，让 BtcCrud 自动加载
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


