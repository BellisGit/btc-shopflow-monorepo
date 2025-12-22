<template>
  <div class="role-list">
    <BtcCrud ref="crudRef" :service="roleService">
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
import { ref, computed } from 'vue';
import { BtcConfirm, BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const crudRef = ref();

const roleService = {
  ...service.admin?.iam?.role,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    // 注意：成功消息由 BtcCrud 的 onSuccess 回调统一处理，不需要在这里手动调用
    await service.admin?.iam?.role?.delete(id);
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    // 注意：成功消息由 BtcCrud 的 onSuccess 回调统一处理，不需要在这里手动调用
    await service.admin?.iam?.role?.deleteBatch(ids);
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'roleName', label: '角色名称' },
  { prop: 'roleCode', label: '角色编码' },
  { prop: 'roleType', label: '类型' },
  { prop: 'description', label: '描述' },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'roleName', label: '角色名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'roleCode', label: '角色编码', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'roleType', label: '类型', span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
]);


// 移除手动调用 loadData，让 BtcCrud 自动加载
</script>

<style lang="scss" scoped>
.role-list {
  // 内容样式由布局层统一控制，此处只定义业务相关样式
}
</style>

