<template>
  <div class="domains-page">
    <BtcCrud ref="crudRef" :service="wrappedDomainService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcFlex1 />
        <BtcSearchKey placeholder="搜索域" />
        <BtcExportBtn filename="域列表" />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px"  />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();
const tableRef = ref();

// 租户下拉选项 - 暂时使用静态数据
const tenantOptions = ref<{ label: string; value: any }[]>([
  { label: '默认租户', value: 'default' },
  { label: '测试租户', value: 'test' }
]);

// 域服务 - 使用真实API
const domainService = service.sysdomain;

const wrappedDomainService = {
  ...domainService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await domainService.delete({ ids });
    message.success(t('crud.message.delete_success'));
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
  { prop: 'createdAt', label: '创建时间', width: 180 },
  { prop: 'updatedAt', label: '更新时间', width: 180 },
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
