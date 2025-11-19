<template>
    <BtcCrud ref="crudRef" :service="wrappedService">
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
        <BtcTable ref="tableRef" :columns="columns" :op="{ buttons: ['edit', 'delete'] }" border />
      </BtcRow>
      <BtcRow>
        <BtcFlex1 />
        <BtcPagination />
      </BtcRow>
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px"  />
    </BtcCrud>
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

// 权限服务 - 使用EPS服务
const permissionService = service.system?.iam?.permission;

// 添加delete确认
const wrappedService = {
  ...permissionService,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await permissionService.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await permissionService.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'permName', label: t('access.permission.name'), minWidth: 150, showOverflowTooltip: true },
  { prop: 'permCode', label: t('access.permission.code'), minWidth: 150, showOverflowTooltip: true },
  { prop: 'permType', label: t('access.permission.type'), minWidth: 100 },
  { prop: 'permCategory', label: t('access.permission.category'), minWidth: 100 },
  { prop: 'moduleId', label: t('platform.module.name'), minWidth: 120 },
  { prop: 'pluginId', label: t('platform.plugin.name'), minWidth: 120 },
  { prop: 'description', label: t('common.description'), minWidth: 150, showOverflowTooltip: true },
  { prop: 'createdAt', label: t('common.create_time'), minWidth: 160, formatter: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '-' },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'permName', label: t('access.permission.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'permCode', label: t('access.permission.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'permType', label: t('access.permission.type'), span: 12, component: { name: 'el-input' } },
  { prop: 'permCategory', label: t('access.permission.category'), span: 12, component: { name: 'el-input' } },
  { prop: 'moduleId', label: t('platform.module.name'), span: 12, component: { name: 'el-input' } },
  { prop: 'pluginId', label: t('platform.plugin.name'), span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: t('common.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);


onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>


