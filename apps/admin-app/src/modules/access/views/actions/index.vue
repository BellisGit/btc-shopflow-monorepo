<template>
    <BtcCrud ref="crudRef" :service="actionService">
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
import { BtcConfirm, BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const crudRef = ref();

const actionService = {
  ...service.admin?.iam?.action,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    // 注意：成功消息由 BtcCrud 的 onSuccess 回调统一处理，不需要在这里手动调用
    await service.admin?.iam?.action?.delete(id);
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    // 注意：成功消息由 BtcCrud 的 onSuccess 回调统一处理，不需要在这里手动调用
    await service.admin?.iam?.action?.deleteBatch(ids);
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'actionNameCn', label: t('access.action.name') },
  { prop: 'actionCode', label: t('access.action.code') },
  { prop: 'actionType', label: t('access.action.type') },
  { prop: 'httpMethod', label: t('access.action.http_method') },
  { prop: 'description', label: t('common.description') },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'actionNameCn', label: t('access.action.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'actionCode', label: t('access.action.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'actionType', label: t('access.action.type'), span: 12, component: { name: 'el-input' } },
  { prop: 'httpMethod', label: t('access.action.http_method'), span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: t('common.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
]);


onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>


