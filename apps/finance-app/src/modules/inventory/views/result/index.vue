<template>
  <div class="finance-crud-wrapper">
    <BtcCrud ref="crudRef" :service="financeInventoryService">
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
      :title="t('finance.inventory.result.detail.title')"
      width="900px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('finance.inventory.result.fields.materialCode')">
          {{ detailRow?.materialCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.position')">
          {{ detailRow?.position || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.unitCost')">
          {{ formatTableNumber(detailRow?.unitCost) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.bookQty')">
          {{ formatTableNumber(detailRow?.bookQty) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.actualQty')">
          {{ formatTableNumber(detailRow?.actualQty) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.diffQty')">
          <span :class="{ 'text-red-500': (detailRow?.diffQty || 0) < 0, 'text-green-500': (detailRow?.diffQty || 0) > 0 }">
            {{ formatTableNumber(detailRow?.diffQty) || '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.varianceCost')" :span="2">
          <span :class="{ 'text-red-500': (detailRow?.varianceCost || 0) < 0, 'text-green-500': (detailRow?.varianceCost || 0) > 0 }">
            {{ formatTableNumber(detailRow?.varianceCost) || '-' }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import { useI18n } from '@btc/shared-core';
import { formatTableNumber } from '@btc/shared-utils';
import { BtcSvg } from '@btc/shared-components';
import type { UseCrudReturn } from '@btc/shared-core';
import { useFinanceInventoryService } from './composables/useFinanceInventoryService';
import { useFinanceInventoryExport } from './composables/useFinanceInventoryExport';
import { useFinanceInventoryColumns } from './composables/useFinanceInventoryColumns';
import { useFinanceInventoryForm } from './composables/useFinanceInventoryForm';
import { useFinanceInventoryDetail } from './composables/useFinanceInventoryDetail';

defineOptions({
  name: 'btc-finance-inventory-result',
});

const { t } = useI18n();

// 获取CRUD上下文
const crudRef = ref<any>(null);
const injectedCrud = inject<UseCrudReturn<any> | undefined>('btc-crud', undefined);

// 使用 composables
const { financeInventoryService } = useFinanceInventoryService();
const { handleExport: handleExportInternal } = useFinanceInventoryExport();
const { columns } = useFinanceInventoryColumns();
const { formItems } = useFinanceInventoryForm();
const { detailVisible, detailRow, handleDetail } = useFinanceInventoryDetail();

// 导出处理函数
const handleExport = async () => {
  const crudInstance = crudRef.value?.crud || injectedCrud;
  await handleExportInternal(crudInstance);
};

// 操作按钮配置
const opButtons = computed(() => [
  {
    label: t('common.button.detail'),
    type: 'warning',
    icon: 'info',
    onClick: ({ scope }: { scope: any }) => handleDetail(scope.row),
  },
  {
    label: t('common.button.edit'),
    type: 'primary',
    icon: 'Edit',
  },
]);
</script>

<style scoped lang="scss">
.finance-crud-wrapper {
  height: 100%;
  box-sizing: border-box;
}
</style>

