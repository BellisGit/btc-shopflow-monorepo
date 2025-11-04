<template>
  <div class="permissions-list">
    <BtcCrud ref="crudRef" :service="wrappedService">
      <BtcRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
        <BtcMultiDeleteBtn />
        <BtcFlex1 />
        <BtcSearchKey />
      </BtcRow>
      <BtcRow>
        <BtcTable ref="tableRef" :columns="columns" :op="{ buttons: ['edit', 'delete'] }" border />
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

// 权限服务 - 使用EPS服务
const permissionService = service.system?.iam?.permission;

// 添加delete确认
const wrappedService = {
  ...permissionService,
  delete: async (id: string | number) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await permissionService.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await permissionService.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'permissionName', label: t('access.permission.name'), minWidth: 150 },
  { prop: 'permissionCode', label: t('access.permission.code'), minWidth: 120 },
  { prop: 'resourceName', label: t('access.resource.name'), minWidth: 100 },
  { prop: 'actionName', label: t('access.action.name'), minWidth: 100 },
  { prop: 'description', label: t('common.description'), minWidth: 150 },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'permissionName', label: t('access.permission.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'permissionCode', label: t('access.permission.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'resourceName', label: t('access.resource.name'), span: 12, required: true, component: { name: 'el-input', props: { placeholder: t('access.resource.placeholder') } } },
  { prop: 'actionName', label: t('access.action.name'), span: 12, required: true, component: { name: 'el-input', props: { placeholder: t('access.action.placeholder') } } },
  { prop: 'description', label: t('common.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);


onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>

<style lang="scss" scoped>
.permissions-list {
}
</style>

