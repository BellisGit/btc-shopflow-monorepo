<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="inventoryInfoService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcTableButton
            class="btc-crud-action-icon"
            v-if="isMinimal"
            :config="pullButtonConfig"
          />
          <el-button
            v-else
            type="warning"
            class="btc-crud-btn"
            :loading="pullLoading"
            @click="handlePullData"
          >
            <BtcSvg name="pull" class="btc-crud-btn__icon" />
            <span class="btc-crud-btn__text">{{ t('logistics.inventory.base.button.pull') }}</span>
          </el-button>
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
          :op="{ buttons: ['edit'] }"
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
import { useI18n, useThemePlugin } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcExportBtn, BtcTable, BtcPagination, BtcUpsert, BtcMessage, BtcSvg, BtcTableButton } from '@btc/shared-components';
import type { BtcTableButtonConfig } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import { service } from '@services/eps';

defineOptions({
  name: 'btc-logistics-warehouse-inventory-info',
});

const { t } = useI18n();
const theme = useThemePlugin();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();
const pullLoading = ref(false);

const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

const pullButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'pull',
  tooltip: t('logistics.inventory.base.button.pull'),
  ariaLabel: t('logistics.inventory.base.button.pull'),
  type: 'warning',
  disabled: pullLoading.value,
  onClick: () => {
    if (!pullLoading.value) {
      handlePullData();
    }
  },
}));

const inventoryInfoService: CrudService<any> = createCrudServiceFromEps(
  ['logistics', 'warehouse', 'check'],
  service
);

const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed<TableColumn[]>(() => [
  { type: 'index', label: t('crud.table.index'), width: 60 },
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
    span: 24,
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.domainId'),
    prop: 'domainId',
    span: 24,
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.checkType'),
    prop: 'checkType',
    span: 24,
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.checkStatus'),
    prop: 'checkStatus',
    span: 24,
    component: {
      name: 'el-select',
      props: {
        clearable: true,
        placeholder: t('common.pleaseSelect'),
      },
      options: [
        { label: t('logistics.inventory.base.fields.checkStatus.notStarted'), value: 'notStarted' },
        { label: t('logistics.inventory.base.fields.checkStatus.inProgress'), value: 'inProgress' },
        { label: t('logistics.inventory.base.fields.checkStatus.completed'), value: 'completed' },
      ],
    },
  },
  {
    label: t('logistics.inventory.base.fields.startTime'),
    prop: 'startTime',
    span: 12,
    component: { name: 'el-date-picker', props: { type: 'datetime', clearable: true, style: 'width: 100%' } },
  },
  {
    label: t('logistics.inventory.base.fields.endTime'),
    prop: 'endTime',
    span: 12,
    component: { name: 'el-date-picker', props: { type: 'datetime', clearable: true, style: 'width: 100%' } },
  },
  {
    label: t('logistics.inventory.base.fields.checkerId'),
    prop: 'checkerId',
    span: 24,
    component: { name: 'el-input', props: { maxlength: 60 } },
  },
  {
    label: t('logistics.inventory.base.fields.remark'),
    prop: 'remark',
    span: 24,
    component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } },
  },
]);

// 拉取数据
const handlePullData = async () => {
  try {
    pullLoading.value = true;
    
    // 调用拉取数据的API
    await service.logistics?.warehouse?.check?.pull?.();
    
    BtcMessage.success(t('logistics.inventory.base.pull.success'));
    
    // 刷新表格数据
    crudRef.value?.crud?.loadData?.();
  } catch (error: any) {
    console.error('[InventoryInfo] Pull data failed:', error);
    BtcMessage.error(error?.message || t('logistics.inventory.base.pull.failed'));
  } finally {
    pullLoading.value = false;
  }
};

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


