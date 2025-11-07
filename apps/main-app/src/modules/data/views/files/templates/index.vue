<template>
  <div class="templates-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedTemplateService"
      :table-columns="templateColumns"
      :form-items="templateFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="业务域"
      right-title="流程模板列表"
      search-placeholder="搜索流程模板..."
      :show-unassigned="true"
      unassigned-label="未分配"
      :enable-key-search="true"
      @select="onDomainSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup } from '@btc/shared-components';
import { service } from '@services/eps';

defineOptions({
  name: 'DataFilesTemplates'
});

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);

// 域服务配置- 直接调用域列表的list API
const domainService = {
  list: (params?: any) => {
    // 必须传递参数至少为空对象{}，否则后台框架默认参数处理逻辑
    const finalParams = params || {};
    return service.system?.iam?.domain?.list(finalParams);
  }
};

// 流程模板服务（右侧表），使用纯后端API
const templateService = service.system?.iam?.processTemplate;

const wrappedTemplateService = {
  ...templateService,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await templateService?.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await templateService?.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

// 流程模板表格列
const templateColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'templateName', label: t('data.template.name'), minWidth: 150 },
  { prop: 'templateCode', label: t('data.template.code'), minWidth: 150 },
  { prop: 'category', label: t('data.template.category'), width: 120 },
  { prop: 'version', label: t('data.template.version'), width: 100 },
  { prop: 'status', label: t('data.template.status'), width: 100 },
  { prop: 'description', label: t('data.template.description'), minWidth: 200 },
]);

// 流程模板表单
const templateFormItems = computed<FormItem[]>(() => [
  { prop: 'templateName', label: t('data.template.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'templateCode', label: t('data.template.code'), span: 12, required: true, component: { name: 'el-input' } },
  {
    prop: 'category',
    label: t('data.template.category'),
    span: 12,
    component: {
      name: 'el-select',
      options: [
        { label: '审批流程', value: 'APPROVAL' },
        { label: '采购流程', value: 'PURCHASE' },
        { label: '报销流程', value: 'REIMBURSEMENT' },
        { label: '用印流程', value: 'SEAL' },
        { label: '用印流程', value: 'OTHER' },
      ]
    }
  },
  { prop: 'version', label: t('data.template.version'), span: 12, component: { name: 'el-input' } },
  {
    prop: 'status',
    label: t('data.template.status'),
    span: 12,
    value: 'DRAFT',
    component: {
      name: 'el-radio-group',
      options: [
        { label: '草稿', value: 'DRAFT' },
        { label: '已发布', value: 'PUBLISHED' },
        { label: '已停用', value: 'DISABLED' },
      ]
    }
  },
  { prop: 'description', label: t('data.template.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

</script>

<style lang="scss" scoped>
.templates-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
