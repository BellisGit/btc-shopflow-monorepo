<template>
  <div class="tenant-list">
    <BtcCrud ref="crudRef" :service="tenantService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcFlex1 />
        <BtcSearchKey />
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
import { createCrudService } from '../../../utils/http';

const { t } = useI18n();
const crudRef = ref();

const tenantService = {
  ...createCrudService('tenant'),
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    const service = createCrudService('tenant');
    await service.delete({ ids });
    ElMessage.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'tenantName', label: '租户名称' },
  { prop: 'tenantCode', label: '租户编码' },
  { prop: 'tenantType', label: '类型' },
  { prop: 'status', label: '状态' },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'tenantName', label: '租户名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'tenantCode', label: '租户编码', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'tenantType', label: '类型', span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
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

onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>

<style lang="scss" scoped>
.tenant-list {
  // 内容样式由布局层统一控制，此处只定义业务相关样式
}
</style>
