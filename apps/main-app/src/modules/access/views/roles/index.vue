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
import { ref, computed, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

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
  { type: 'index', label: '序号', width: 60 },
  { prop: 'roleName', label: t('access.role.name') },
  { prop: 'roleCode', label: t('access.role.code') },
  { prop: 'roleType', label: t('access.role.type') },
  { prop: 'description', label: t('common.description') },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'roleName', label: t('access.role.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'roleCode', label: t('access.role.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'roleType', label: t('access.role.type'), span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: t('common.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
]);


onMounted(() => setTimeout(() => crudRef.value?.crud.loadData(), 100));
</script>

<style lang="scss" scoped>
.role-list {
  // 内容样式由布局层统一控制，此处只定义业务相关样式
}
</style>
