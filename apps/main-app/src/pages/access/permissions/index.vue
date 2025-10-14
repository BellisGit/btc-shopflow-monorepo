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
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { createMockCrudService, mockHelpers } from '../../../utils/mock';

const { t } = useI18n();
const crudRef = ref();

// Mock数据服务
const permissionService = createMockCrudService('btc_permissions', {
  defaultData: [
    { id: 1, permissionName: '查看用户', resourceName: '用户', actionName: '查看', permissionCode: 'user:view', description: '查看用户信息', createTime: mockHelpers.randomDate() },
    { id: 2, permissionName: '编辑用户', resourceName: '用户', actionName: '编辑', permissionCode: 'user:edit', description: '编辑用户信息', createTime: mockHelpers.randomDate() },
    { id: 3, permissionName: '删除用户', resourceName: '用户', actionName: '删除', permissionCode: 'user:delete', description: '删除用户', createTime: mockHelpers.randomDate() },
    { id: 4, permissionName: '查看角色', resourceName: '角色', actionName: '查看', permissionCode: 'role:view', description: '查看角色信息', createTime: mockHelpers.randomDate() },
    { id: 5, permissionName: '分配角色', resourceName: '角色', actionName: '分配', permissionCode: 'role:assign', description: '分配角色给用户', createTime: mockHelpers.randomDate() },
  ]
});

// 添加delete确认
const wrappedService = {
  ...permissionService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await permissionService.delete({ ids });
    ElMessage.success(t('crud.message.delete_success'));
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
    ElMessage.success(t('crud.message.save_success'));
    close();
  } catch (error) {
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

