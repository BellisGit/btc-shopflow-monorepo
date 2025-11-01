<template>
  <div class="role-list">
    <BtcCrud ref="crudRef" :service="roleService">
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
      <BtcUpsert ref="upsertRef" :items="formItems" width="800px"  />
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

const roleService = {
  ...service.system?.iam?.sys.role,
  delete: async (id: string | number) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await service.system?.iam?.sys.role?.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await service.system?.iam?.sys.role?.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
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

