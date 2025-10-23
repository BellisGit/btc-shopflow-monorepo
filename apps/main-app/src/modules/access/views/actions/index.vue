<template>
  <div class="action-list">
    <BtcCrud ref="crudRef" :service="actionService">
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
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

const actionService = {
  ...service.sysaction,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await service.sysaction.delete({ ids });
    message.success(t('crud.message.delete_success'));
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
  { type: 'op', label: '操作', width: 200, buttons: ['edit', 'delete'] },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'actionNameCn', label: t('access.action.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'actionCode', label: t('access.action.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'actionType', label: t('access.action.type'), span: 12, component: { name: 'el-input' } },
  { prop: 'httpMethod', label: t('access.action.http_method'), span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: t('common.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    message.success(t('crud.message.save_success'));
    close();
  } catch (_error) {
    done();
  }
};

onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>

<style lang="scss" scoped>
.action-list {
  // 内容样式由布局层统一控制，此处只定义业务相关样式
}
</style>
