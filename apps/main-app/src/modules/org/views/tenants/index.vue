<template>
  <div class="tenant-list">
    <BtcCrud ref="crudRef" :service="tenantService">
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
import { ref, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();


// 使用真实的 EPS 租户服务，包装删除确认逻辑
const tenantService = {
  ...service.systenant,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await service.systenant.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};

const columns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'tenantName', label: t('org.tenant.name') },
  { prop: 'tenantCode', label: t('org.tenant.code') },
  { prop: 'tenantType', label: t('org.tenant.type') },
  { prop: 'status', label: t('org.user.status') },
]);

const formItems = computed<FormItem[]>(() => [
  { prop: 'tenantName', label: t('org.tenant.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'tenantCode', label: t('org.tenant.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'tenantType', label: t('org.tenant.type'), span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: t('org.tenant.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
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

// 移除手动调用 loadData，让 BtcCrud 自动加载
</script>

<style lang="scss" scoped>
.tenant-list {
  // 内嵌样式由布局系统统一控制，此处仅保留业务相关样式
}
</style>
