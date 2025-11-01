<template>
  <div class="resources-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="moduleService"
      :right-service="wrappedResourceService"
      :table-columns="resourceColumns"
      :form-items="resourceFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="模块列表"
      right-title="资源列表"
      search-placeholder="搜索资源..."
      :show-unassigned="true"
      unassigned-label="未分配"
      @select="onModuleSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const message = useMessage();
const tableGroupRef = ref();
const selectedModule = ref<any>(null);

// 模块服务（左侧树，用作资源分类）- 使用EPS服务
const moduleService = {
  list: (params?: any) => {
    // 必须传递参数至少为空对象{}，否则后台框架默认参数处理逻辑
    const finalParams = params || {};
    return service.system?.iam?.sys.module?.list(finalParams);
  }
};

// 资源服务（右侧表）- 使用EPS服务
const resourceService = service.system?.iam?.sys.resource;

const wrappedResourceService = {
  ...resourceService,
  delete: async (id: string | number) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 单个删除：直接传递 ID
    await resourceService.delete(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await resourceService.deleteBatch(ids);

    message.success(t('crud.message.delete_success'));
  },
};


// 模块选择处理
const onModuleSelect = (module: any) => {
  selectedModule.value = module;
};

// 资源表格列
const resourceColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'resourceNameCn', label: '资源名称', minWidth: 150 },
  { prop: 'resourceCode', label: '资源编码', minWidth: 150 },
  { prop: 'resourceType', label: '类型', width: 100 },
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
      options: [
        { label: '菜单', value: '菜单' },
        { label: 'API', value: 'API' },
        { label: '按钮', value: '按钮' },
        { label: '字段', value: '字段' },
      ]
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
