<template>
  <div class="domains-page">
    <BtcCrud ref="crudRef" :service="wrappedDomainService">
      <BtcRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>
        <BtcFlex1 />
        <BtcSearchKey :placeholder="t('platform.domain.search_placeholder')" />
        <BtcCrudActions>
          <BtcExportBtn :filename="t('platform.domain.list')" />
        </BtcCrudActions>
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" :op="{ buttons: ['edit', 'delete'] }" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcConfirm } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const tableRef = ref();

// 租户下拉选项
const tenantOptions = ref<{ label: string; value: any }[]>([]);
const tenantLoading = ref(false);
const tenantLabelMap = computed(() => {
  const map = new Map<any, string>();
  tenantOptions.value.forEach((item) => {
    map.set(item.value, item.label);
  });
  return map;
});

const loadTenantOptions = async () => {
  const tenantService = service.system?.iam?.tenant;

  if (!tenantService || typeof tenantService.list !== 'function') {
    console.warn('[Domain] 租户列表服务不可用');
    tenantOptions.value = [];
    return;
  }

  tenantLoading.value = true;
  try {
    const response = await tenantService.list({});
    const list = Array.isArray(response?.list) ? response.list : Array.isArray(response) ? response : [];

    tenantOptions.value = list
      .map((tenant: any) => {
        const value = tenant?.id ?? tenant?.tenantId ?? tenant?.tenantCode ?? tenant?.code;
        const label = tenant?.tenantName ?? tenant?.name ?? tenant?.tenantCode ?? value;

        if (value === undefined || value === null) {
          return null;
        }

        return {
          value,
          label: String(label ?? value),
        };
      })
      .filter((item): item is { label: string; value: any } => !!item);
  } catch (error) {
    console.warn('[Domain] 获取租户列表失败:', error);
    tenantOptions.value = [];
  } finally {
    tenantLoading.value = false;
  }
};

onMounted(() => {
  loadTenantOptions();
});

// 使用 EPS 域服务
const wrappedDomainService = {
  ...service.system?.iam?.domain,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await service.system?.iam?.domain?.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await service.system?.iam?.domain?.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};

// 域表格列
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: t('platform.domains.domain_name'), minWidth: 150 },
  { prop: 'domainCode', label: t('platform.domains.domain_code'), width: 120 },
  {
    prop: 'tenantId',
    label: '租户名称',
    width: 150,
    formatter: (_row, _column, cellValue) => tenantLabelMap.value.get(cellValue) ?? cellValue ?? '-',
  },
  { prop: 'description', label: t('platform.domains.description'), minWidth: 200 },
]);

// 域表单
const formItems = computed<FormItem[]>(() => [
  { prop: 'name', label: t('platform.domain.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'domainCode', label: t('platform.domain.code'), span: 12, required: true, component: { name: 'el-input' } },
  {
    prop: 'tenantId',
    label: '租户名称',
    span: 12,
    required: true,
    component: {
      name: 'el-select',
      props: {
        filterable: true,
        clearable: true,
        loading: tenantLoading.value,
      },
      options: tenantOptions.value
    }
  },
  { prop: 'description', label: t('common.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);


// 移除手动调用 loadData，让 BtcCrud 自动加载
</script>

<style lang="scss" scoped>
.domains-page {
  height: 100%;
  box-sizing: border-box;

  :deep(.btc-table-toolbar-host),
  :deep(.btc-table-toolbar--inline) {
    margin-bottom: 0;
  }
}
</style>
