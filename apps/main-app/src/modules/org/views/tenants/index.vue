<template>
  <BtcCrud ref="crudRef" :service="tenantService">
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
    <BtcUpsert ref="upsertRef" :items="formItems" width="800px" />
  </BtcCrud>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();


// 使用纯后端 EPS 租户服务，封装删除确认逻辑
const tenantService = {
  ...service.system?.iam?.tenant,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await service.system?.iam?.tenant?.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await service.system?.iam?.tenant?.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'tenantName', label: t('org.tenant.name') },
  { prop: 'tenantCode', label: t('org.tenant.code') },
  { prop: 'tenantType', label: t('org.tenant.type') },
  {
    prop: 'status',
    label: t('org.user.status'),
    width: 120,
    dict: [
      { label: '启用', value: 'ACTIVE', type: 'success' },
      { label: '禁用', value: 'INACTIVE', type: 'danger' },
    ],
    dictColor: true,
  },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'tenantName', label: t('org.tenant.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'tenantCode', label: t('org.tenant.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'tenantType', label: t('org.tenant.type'), span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: t('org.tenant.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
]);


// 移除手动调用 loadData，让 BtcCrud 自动加载
</script>

