<template>
  <div class="domains-page">
    <BtcCrud ref="crudRef" :service="wrappedDomainService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcFlex1 />
        <BtcSearchKey placeholder="搜索域" />
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { createCrudService, http } from '../../../utils/http';

const { t } = useI18n();
const crudRef = ref();

// 租户下拉选项
const tenantOptions = ref<{ label: string; value: any }[]>([]);

// 域服务 - 使用真实API
const domainService = createCrudService('domain');

const wrappedDomainService = {
  ...domainService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await domainService.delete({ ids });
    ElMessage.success(t('crud.message.delete_success'));
  },
};

// 域表格列
const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'domainName', label: '域名称', minWidth: 150 },
  { prop: 'domainCode', label: '域编码', width: 120 },
  {
    prop: 'tenantId',
    label: '租户名称',
    width: 150,
    formatter: (row: any) => {
      const tenant = tenantOptions.value.find(t => t.value === row.tenantId);
      return tenant?.label || row.tenantId;
    }
  },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'createTime', label: '创建时间', width: 180 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

// 域表单
const formItems = computed<FormItem[]>(() => [
  { prop: 'domainName', label: '域名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'domainCode', label: '域编码', span: 12, required: true, component: { name: 'el-input' } },
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
      },
      options: tenantOptions.value
    }
  },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    ElMessage.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};

// 获取租户下拉数据
const fetchTenantOptions = async () => {
  try {
    const data = await http.get<{ label: string; value: any }[]>('/domain/drop');
    tenantOptions.value = data;
  } catch (error) {
    console.error('Failed to fetch tenant options:', error);
  }
};

onMounted(() => {
  fetchTenantOptions();
  setTimeout(() => crudRef.value?.crud.loadData(), 100);
});
</script>

<style lang="scss" scoped>
.domains-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
