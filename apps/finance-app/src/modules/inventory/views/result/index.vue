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
          <BtcExportBtn :filename="t('menu.finance.inventoryManagement.result')" />
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
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('finance.inventory.result.fields.materialCode')">
          {{ detailRow?.materialCode || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('finance.inventory.result.fields.position')">
          {{ detailRow?.position || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import type { CrudService } from '@btc/shared-core';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatTableNumber } from '@btc/shared-utils';
import { service } from '@/services/eps';

defineOptions({
  name: 'btc-finance-inventory-result',
});

const { t } = useI18n();

// 详情弹窗相关
const detailVisible = ref(false);
const detailRow = ref<any>(null);

// 创建财务盘点结果服务
const financeInventoryService: CrudService<any> = createCrudServiceFromEps(
  ['finance', 'base'],
  service
);

const formatNumber = (_row: Record<string, any>, _column: TableColumn, value: any) => formatTableNumber(value);

// 盘点结果表格列
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { type: 'index', label: t('common.index'), width: 60 },
  { label: t('finance.inventory.result.fields.materialCode'), prop: 'materialCode', minWidth: 140, showOverflowTooltip: true },
  { label: t('finance.inventory.result.fields.position'), prop: 'position', minWidth: 140, showOverflowTooltip: true },
]);

// 操作按钮配置
const opButtons = computed(() => [
  {
    label: t('common.button.view'),
    type: 'warning',
    icon: 'View',
    onClick: ({ scope }: { scope: any }) => handleDetail(scope.row),
  },
  {
    label: t('common.button.edit'),
    type: 'primary',
    icon: 'Edit',
  },
]);

// 处理详情按钮点击
const handleDetail = (row: any) => {
  detailRow.value = row;
  detailVisible.value = true;
};

// 表单项配置
const formItems = computed<FormItem[]>(() => [
  {
    label: t('finance.inventory.result.fields.materialCode'),
    prop: 'materialCode',
    required: true,
    component: {
      name: 'el-input',
      props: {
        placeholder: t('finance.inventory.result.fields.materialCode'),
        maxlength: 120
      }
    },
  },
  {
    label: t('finance.inventory.result.fields.position'),
    prop: 'position',
    required: true,
    component: {
      name: 'el-input',
      props: {
        placeholder: t('finance.inventory.result.fields.position'),
        maxlength: 120
      }
    },
  },
]);
</script>

<style scoped lang="scss">
.finance-crud-wrapper {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
}
</style>

