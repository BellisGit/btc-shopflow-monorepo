<template>
  <div class="domains-page">
    <BtcCrud ref="crudRef" :service="wrappedDomainService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcFlex1 />
        <BtcSearchKey :placeholder="t('platform.domain.search_placeholder')" />
        <BtcExportBtn :filename="t('platform.domain.list')" />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px" :on-submit="handleFormSubmit" />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '../../../../services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const tableRef = ref();

// 租户下拉选项 - 暂时使用静态数据
const tenantOptions = ref<{ label: string; value: any }[]>([
  { label: '默认租户', value: 'default' },
  { label: '测试租户', value: 'test' }
]);

// 使用 EPS 域服务

const wrappedDomainService = {
  ...service.sysdomain,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await service.sysdomain.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};

  // 域表格列
  const columns = computed<TableColumn[]>(() => [
    { type: 'selection', width: 60 },
    { type: 'index', label: t('crud.table.index'), width: 60 },
    { prop: 'domainName', label: t('platform.domains.domain_name'), minWidth: 150 },
    { prop: 'domainCode', label: t('platform.domains.domain_code'), width: 120 },
    {
      prop: 'tenantId',
      label: t('org.tenant.name'),
      width: 150,
      formatter: (row: any) => {
        const tenant = tenantOptions.value.find(t => t.value === row.tenantId);
        return tenant?.label || row.tenantId;
      }
    },
    { prop: 'description', label: t('platform.domains.description'), minWidth: 200 },
    { prop: 'createdAt', label: t('platform.domains.created_at'), width: 180 },
    { prop: 'updatedAt', label: t('platform.domains.updated_at'), width: 180 },
    { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
  ]);

// 域表单
const formItems = computed<FormItem[]>(() => [
  { prop: 'domainName', label: t('platform.domain.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'domainCode', label: t('platform.domain.code'), span: 12, required: true, component: { name: 'el-input' } },
  {
    prop: 'tenantId',
    label: t('org.tenant.name'),
    span: 12,
    required: true,
    component: {
      name: 'el-select',
      props: {
        filterable: true,
        clearable: true,
      },
      options: tenantOptions.value
    }
  },
  { prop: 'description', label: t('common.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    message.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};

onMounted(() => {
  setTimeout(() => crudRef.value?.crud.loadData(), 100);
});
</script>

<style lang="scss" scoped>
.domains-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
