<template>
  <div class="baseline-page">
    <BtcCrud ref="crudRef" :service="baselineService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey :placeholder="t('ops.baseline.search_placeholder')" />
        <BtcCrudActions />
      </BtcRow>

      <BtcRow>
        <BtcTable ref="tableRef" :columns="baselineColumns" :op="{ buttons: ['edit', 'delete'] }" border />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>

      <BtcUpsert ref="upsertRef" :items="baselineFormItems" width="800px" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { createMockCrudService } from '@utils/http';

const { t } = useI18n();
const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 基线服务 - 使用Mock服务
const baselineService = createMockCrudService('btc_baseline');

// 基线表格列
const baselineColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'baselineName', label: '基线名称', minWidth: 150 },
  { prop: 'baselineCode', label: '基线编码', minWidth: 150 },
  { prop: 'version', label: '版本', width: 100 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'status', label: '状态', width: 100 },
]);

// 基线表单
const baselineFormItems = computed<FormItem[]>(() => [
  { prop: 'baselineName', label: '基线名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'baselineCode', label: '基线编码', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'version', label: '版本', span: 12, component: { name: 'el-input' } },
  {
    prop: 'status',
    label: '状态',
    span: 12,
    component: {
      name: 'el-select',
      options: [
        { label: '启用', value: 'enabled' },
        { label: '禁用', value: 'disabled' },
      ]
    }
  },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

</script>

<style lang="scss" scoped>
.baseline-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
