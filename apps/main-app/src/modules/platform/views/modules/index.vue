<template>
  <div class="modules-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedModuleService"
      :table-columns="moduleColumns"
      :form-items="moduleFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="业务域"
      right-title="模块列表"
      search-placeholder="搜索模块..."
      :show-unassigned="true"
      unassigned-label="未分配"
      :enable-key-search="true"
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

// 域服务配置- 直接调用域列表的list API
const domainService = {
  list: (params?: any) => {
    // 必须传递参数至少为空对象{}，否则后台框架默认参数处理逻辑
    const finalParams = params || {};

    return service.system?.iam?.domain?.list(finalParams);
  }
};

// 模块服务（右侧表），使用纯后端API
const moduleService = service.system?.iam?.module;

const wrappedModuleService = {
  ...moduleService,
  delete: async (id: string | number) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await moduleService.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await moduleService.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};


// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

// 模块表格列
const moduleColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'moduleName', label: t('platform.module.name'), minWidth: 150 },
  { prop: 'moduleCode', label: t('platform.module.code'), minWidth: 150 },
  { prop: 'moduleType', label: t('platform.module.type'), width: 100 },
  { prop: 'description', label: t('platform.module.description'), minWidth: 200 },
]);

// 模块表单
const moduleFormItems = computed<FormItem[]>(() => [
  { prop: 'moduleName', label: t('platform.module.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'moduleCode', label: t('platform.module.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'moduleType', label: t('platform.module.type'), span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: t('platform.module.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);


</script>

<style lang="scss" scoped>
.modules-page {
  height: 100%;
  box-sizing: border-box;
}
</style>

