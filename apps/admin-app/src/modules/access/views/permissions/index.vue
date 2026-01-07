<template>
    <BtcCrud ref="crudRef" :service="wrappedService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey />
        <BtcCrudActions />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" :op="{ buttons: ['edit', 'delete'] }" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px"  />
    </BtcCrud>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { usePageColumns, usePageForms, usePageService } from '@btc/shared-core';

const crudRef = ref();

// 从 config.ts 读取配置
const { columns } = usePageColumns('access.permissions');
const { formItems } = usePageForms('access.permissions');
const wrappedService = usePageService('access.permissions', 'permission', {
  showSuccessMessage: true,
});

onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>


