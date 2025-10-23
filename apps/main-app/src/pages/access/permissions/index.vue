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

// 权限服务 - 使用EPS服务
const permissionService = service.base.permission;

// 添加delete确认
const wrappedService = {
  ...permissionService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await permissionService.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'permissionName', label: '权限名称', minWidth: 150 },
  { prop: 'permissionCode', label: '权限编码', minWidth: 120 },
  { prop: 'resourceName', label: '资源', minWidth: 100 },
  { prop: 'actionName', label: '行为', minWidth: 100 },
  { prop: 'description', label: '描述', minWidth: 150 },
  { prop: 'createTime', label: '创建时间', minWidth: 120 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'permissionName', label: '权限名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'permissionCode', label: '权限编码', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'resourceName', label: '资源', span: 12, required: true, component: { name: 'el-input', props: { placeholder: '如：用户、角色、菜单' } } },
  { prop: 'actionName', label: '行为', span: 12, required: true, component: { name: 'el-input', props: { placeholder: '如：查看、编辑、删除' } } },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
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
.permissions-list {
  padding: 20px;
}
</style>

