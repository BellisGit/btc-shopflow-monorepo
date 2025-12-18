<template>
  <div class="logistics-crud-wrapper">
    <BtcCrud ref="crudRef" :service="storageLocationService">
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
import { useI18n } from '@btc/shared-core';
import type { CrudService } from '@btc/shared-core';
import type { FormItem, TableColumn } from '@btc/shared-components';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert, BtcConfirm, BtcMessage } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import { service } from '@services/eps';

defineOptions({
  name: 'btc-logistics-config-storage-location',
});

const { t } = useI18n();

const crudRef = ref();
const tableRef = ref();
const upsertRef = ref();

// 使用 logistics.base.position EPS 服务，并添加删除确认
const baseService = createCrudServiceFromEps(
  ['logistics', 'base', 'position'],
  service
);

// 包装 service，添加删除确认逻辑
const storageLocationService: CrudService<any> = {
  ...baseService,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await baseService.delete(id);
    BtcMessage.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await baseService.deleteBatch(ids);
    BtcMessage.success(t('crud.message.delete_success'));
  },
};

const formatDateCell = (_row: Record<string, any>, _column: TableColumn, value: any) =>
  value ? formatDateTime(value) : '--';

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 48 },
  { label: t('logistics.config.storageLocation.fields.name'), prop: 'name', minWidth: 140, showOverflowTooltip: true },
  { label: t('logistics.config.storageLocation.fields.position'), prop: 'position', minWidth: 180, showOverflowTooltip: true },
  { label: t('logistics.config.storageLocation.fields.description'), prop: 'description', minWidth: 200, showOverflowTooltip: true },
  { label: t('logistics.config.storageLocation.fields.createdAt'), prop: 'createdAt', width: 180, formatter: formatDateCell },
  { label: t('logistics.config.storageLocation.fields.updatedAt'), prop: 'updatedAt', width: 180, formatter: formatDateCell },
]);

// 域列表选项
const domainOptions = ref<{ label: string; value: string }[]>([]);
const domainLoading = ref(false);

// 加载域列表
const loadDomainOptions = async () => {
  domainLoading.value = true;
  try {
    // 调用管理域的域列表服务
    const response = await service.admin?.iam?.domain?.list({});
    
    // 处理响应数据：支持 response.data.list 或 response.list
    const domainList = Array.isArray(response?.data?.list) 
      ? response.data.list 
      : Array.isArray(response?.list) 
        ? response.list 
        : Array.isArray(response?.data) 
          ? response.data 
          : [];

    domainOptions.value = domainList
      .map((domain: any) => {
        const value = domain?.id;
        const label = domain?.name;

        if (!value || !label) {
          return null;
        }

        return {
          value: String(value),
          label: String(label),
        };
      })
      .filter((item): item is { label: string; value: string } => item !== null);
  } catch (error) {
    console.error('[StorageLocation] 获取域列表失败:', error);
    domainOptions.value = [];
  } finally {
    domainLoading.value = false;
  }
};

const formItems = computed<FormItem[]>(() => [
  {
    label: t('logistics.config.storageLocation.fields.name'),
    prop: 'domainId',
    required: true,
    component: {
      name: 'el-select',
      props: {
        filterable: true,
        clearable: true,
        loading: domainLoading.value,
        placeholder: t('logistics.config.storageLocation.fields.name'),
      },
      options: domainOptions.value,
    },
  },
  {
    label: t('logistics.config.storageLocation.fields.position'),
    prop: 'position',
    required: true,
    component: { name: 'el-input', props: { maxlength: 120, placeholder: t('logistics.config.storageLocation.fields.position') } },
  },
  {
    label: t('logistics.config.storageLocation.fields.description'),
    prop: 'description',
    component: { name: 'el-input', props: { type: 'textarea', rows: 3, maxlength: 500, placeholder: t('logistics.config.storageLocation.fields.description') } },
  },
]);

onMounted(() => {
  // 加载域列表（用于表单下拉选项）
  loadDomainOptions();
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

