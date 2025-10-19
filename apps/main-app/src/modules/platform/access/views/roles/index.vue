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
import { service } from '../../../../../services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

const roleService = {
  ...service.sysrole,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await service.sysrole.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'roleName', label: '角色名称' },
  { prop: 'roleCode', label: '角色编码' },
  { prop: 'roleType', label: '类型' },
  { prop: 'description', label: '描述' },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'roleName', label: '角色名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'roleCode', label: '角色编码', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'roleType', label: '类型', span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    await next(data);
    message.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};

// 移除手动调用 loadData，让 BtcCrud 自动加载
</script>

<style lang="scss" scoped>
.role-list {
  // 内容样式由布局层统一控制，此处只定义业务相关样式
}
</style>
