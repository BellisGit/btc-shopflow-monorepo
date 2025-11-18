<template>
  <div class="resources-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedResourceService"
      :table-columns="resourceColumns"
      :form-items="resourceFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="业务域"
      right-title="资源列表"
      search-placeholder="搜索资源..."
      :show-unassigned="true"
      unassigned-label="未分配"
      :enable-key-search="true"
      :left-size="'small'"
      @select="onDomainSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedDomain = ref<any>(null);

// 域服务配置 - 直接调用域列表的list API
const domainService = {
  list: (params?: any) => {
    // 必须传递参数至少为空对象{}，否则后台框架默认参数处理逻辑
    const finalParams = params || {};
    return service.system?.iam?.domain?.list(finalParams);
  }
};

// 资源服务（右侧表）- 使用EPS服务
const resourceService = service.system?.iam?.resource;

const wrappedResourceService = {
  ...resourceService,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await resourceService.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await resourceService.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};


// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

// 资源表格列
const resourceTypeDict = [
  { label: '文件', value: 'FILE', type: 'info' },
  { label: 'API', value: 'API', type: 'warning' },
  { label: '数据表', value: 'TABLE', type: 'primary' },
] as const;

const resourceColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'resourceNameCn', label: '资源名称', minWidth: 150 },
  { prop: 'resourceCode', label: '资源编码', minWidth: 150 },
  {
    prop: 'resourceType',
    label: '类型',
    width: 120,
    dict: resourceTypeDict.map((item) => ({ ...item })),
    dictColor: true,
  },
  { prop: 'description', label: '描述', minWidth: 200 },
]);

// 资源表单
const resourceFormItems = computed<FormItem[]>(() => [
  { prop: 'resourceNameCn', label: '资源名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'resourceCode', label: '资源编码', span: 12, required: true, component: { name: 'el-input' } },
  {
    prop: 'resourceType',
    label: '类型',
    span: 12,
    component: {
      name: 'el-select',
      options: resourceTypeDict.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    }
  },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);


</script>

<style lang="scss" scoped>
.resources-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
