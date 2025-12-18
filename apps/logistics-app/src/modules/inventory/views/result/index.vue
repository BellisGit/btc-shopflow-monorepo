<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="inventoryCheckService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey />
        <BtcCrudActions>
          <el-button type="info" @click="handleExport">
            <BtcSvg name="export" class="mr-[5px]" />
            {{ t('ui.export') }}
          </el-button>
        </BtcCrudActions>
      </BtcRow>

      <BtcRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :disable-auto-created-at="true"
          border
          :op="{ buttons: opButtons }"
          @detail-click="handleDetail"
        />
      </BtcRow>

      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>

      <BtcUpsert ref="upsertRef" :items="formItems" width="640px" />
    </BtcCrud>

    <!-- 详情弹窗 -->
    <BtcDialog
      v-model="detailVisible"
      :title="t('logistics.inventory.result.detail.title')"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.baseId')">
          {{ detailRow?.baseId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.materialCode')">
          {{ detailRow?.materialCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.materialName')">
          {{ detailRow?.materialName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.specification')">
          {{ detailRow?.specification || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.unit')">
          {{ detailRow?.unit || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.batchNo')">
          {{ detailRow?.batchNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.bookQty')">
          {{ detailRow?.bookQty || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.actualQty')">
          {{ detailRow?.actualQty !== null && detailRow?.actualQty !== undefined ? detailRow.actualQty : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.diffQty')">
          {{ detailRow?.diffQty || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.diffRate')">
          {{ detailRow?.diffRate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.isDiff')">
          <el-tag :type="detailRow?.isDiff === 1 ? 'danger' : 'success'">
            {{ detailRow?.isDiff === 1 ? t('common.yes') : t('common.no') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.checkerId')">
          {{ detailRow?.checkerId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.base.fields.createdAt')">
          {{ detailRow?.createdAt ? formatDateTime(detailRow.createdAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logistics.inventory.check.fields.remark')" :span="2">
          {{ detailRow?.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ t('common.button.close') }}</el-button>
      </template>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, inject } from 'vue';
import { useI18n, type UseCrudReturn } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcDialog, BtcSvg } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatDateTime, formatTableNumber } from '@btc/shared-utils';
import { service } from '@services/eps';
import { useLogisticsInventoryExport } from './composables/useLogisticsInventoryExport';

defineOptions({
  name: 'btc-logistics-inventory-result',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();
const detailVisible = ref(false);
const detailRow = ref<any>(null);

// 获取CRUD上下文（使用可选注入，避免警告）
const injectedCrud = inject<UseCrudReturn<any> | undefined>('btc-crud', undefined);

const inventoryCheckService: CrudService<any> = createCrudServiceFromEps(
  ['logistics', 'base', 'check'],
  service
);

// 使用导出 composable
const { handleExport: handleExportInternal } = useLogisticsInventoryExport();

// 导出处理函数
const handleExport = async () => {
  const crudInstance = crudRef.value?.crud || injectedCrud;
  await handleExportInternal(crudInstance);
};

const formatNumber = (_row: Record<string, any>, _column: TableColumn, value: any) => formatTableNumber(value);

// 盘点结果表格列（只显示：序号、物料编码、仓位、账面数量、实际数量、差异数量、操作列）
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { type: 'index', label: t('common.index'), width: 60 },
  { label: t('logistics.inventory.check.fields.materialCode'), prop: 'materialCode', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.inventory.check.fields.position'), prop: 'position', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.inventory.check.fields.bookQty'), prop: 'bookQty', minWidth: 120, formatter: formatNumber },
  { label: t('logistics.inventory.check.fields.actualQty'), prop: 'actualQty', minWidth: 120, formatter: formatNumber },
  { label: t('logistics.inventory.check.fields.diffQty'), prop: 'diffQty', minWidth: 120, formatter: formatNumber },
]);

// 处理详情按钮点击
const handleDetail = (row: any) => {
  detailRow.value = row;
  detailVisible.value = true;
};

// 监听编辑操作（通过重写操作列配置来添加调试）
// 注意：由于 BtcTable 的编辑按钮是内置的，我们需要通过自定义按钮来添加调试
const opButtons = ({ scope }: { scope?: any } = {}) => {
  return [
    'detail',
    {
      label: t('crud.button.edit'),
      type: 'primary',
      icon: 'edit',
      onClick: ({ scope }: { scope?: any } = {}) => {
        const row = scope?.row;
        if (!row) {
          return;
        }
        // 在点击时获取 crud 实例，确保实例已准备好
        const crudInstance = crudRef.value?.crud || injectedCrud;
        // 调用默认的编辑功能
        if (crudInstance?.handleEdit) {
          crudInstance.handleEdit(row);
        }
      },
    },
  ];
};

const formItems = computed<FormItem[]>(() => [
  {
    label: t('logistics.inventory.check.fields.baseId'),
    prop: 'baseId',
    required: true,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.materialCode'),
    prop: 'materialCode',
    required: true,
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.materialName'),
    prop: 'materialName',
    component: { name: 'el-input', props: { maxlength: 200 } },
  },
  {
    label: t('logistics.inventory.check.fields.specification'),
    prop: 'specification',
    component: { name: 'el-input', props: { maxlength: 200 } },
  },
  {
    label: t('logistics.inventory.check.fields.unit'),
    prop: 'unit',
    component: { name: 'el-input', props: { maxlength: 20 } },
  },
  {
    label: t('logistics.inventory.check.fields.batchNo'),
    prop: 'batchNo',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.bookQty'),
    prop: 'bookQty',
    component: { name: 'el-input', props: { maxlength: 50 } },
  },
  {
    label: t('logistics.inventory.check.fields.actualQty'),
    prop: 'actualQty',
    component: { name: 'el-input', props: { maxlength: 50 } },
  },
  {
    label: t('logistics.inventory.check.fields.storageLocation'),
    prop: 'storageLocation',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.diffQty'),
    prop: 'diffQty',
    component: { name: 'el-input', props: { maxlength: 50 } },
  },
  {
    label: t('logistics.inventory.check.fields.diffRate'),
    prop: 'diffRate',
    component: { name: 'el-input', props: { maxlength: 50 } },
  },
  {
    label: t('logistics.inventory.check.fields.checkerId'),
    prop: 'checkerId',
    component: { name: 'el-input', props: { maxlength: 120 } },
  },
  {
    label: t('logistics.inventory.check.fields.isDiff'),
    prop: 'isDiff',
    component: {
      name: 'el-select',
      props: {
        clearable: true,
      },
      options: [
        { label: t('common.enabled'), value: 1 },
        { label: t('common.disabled'), value: 0 },
      ],
    },
  },
  {
    label: t('logistics.inventory.check.fields.remark'),
    prop: 'remark',
    component: { name: 'el-input', props: { type: 'textarea', rows: 3, maxlength: 500 } },
  },
]);

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

