<template>
  <div class="plugins-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedPluginService"
      :table-columns="pluginColumns"
      :form-items="pluginFormItems"
      left-title="业务域"
      right-title="插件列表"
      search-placeholder="搜索插件..."
      :show-unassigned="true"
      unassigned-label="未分配"
      @select="onDomainSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
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
    // 必须传递参数对象，即使为空对象{}，后端会设置默认值
    const finalParams = params || {};

    return service.sysdomain.list(finalParams);
  }
};

// 插件服务（右侧表）：使用真实API
const pluginService = service.sysplugin;

const wrappedPluginService = {
  ...pluginService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await pluginService.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};


// 用户点击选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

// 插件表格列
const pluginColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'pluginName', label: t('platform.plugin.name'), minWidth: 150 },
  { prop: 'pluginCode', label: t('platform.plugin.code'), minWidth: 150 },
  { prop: 'version', label: t('platform.plugin.version'), width: 100 },
  { prop: 'status', label: t('platform.plugin.status'), width: 100 },
  { prop: 'description', label: t('platform.plugin.description'), minWidth: 200 },
]);

// 插件表单
const pluginFormItems = computed<FormItem[]>(() => [
  { prop: 'pluginName', label: t('platform.plugin.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'pluginCode', label: t('platform.plugin.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'version', label: t('platform.plugin.version'), span: 12, component: { name: 'el-input' } },
  {
    prop: 'status',
    label: t('platform.plugin.status'),
    span: 12,
    value: 'ENABLED',
    component: {
      name: 'el-radio-group',
      options: [
        { label: t('platform.plugin.enabled'), value: 'ENABLED' },
        { label: t('platform.plugin.disabled'), value: 'DISABLED' },
      ]
    }
  },
  { prop: 'description', label: t('platform.plugin.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);



</script>

<style lang="scss" scoped>
.plugins-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
