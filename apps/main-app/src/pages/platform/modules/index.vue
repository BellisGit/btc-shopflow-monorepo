<template>
  <div class="modules-page">
    <BtcViewGroup ref="viewGroupRef" :options="viewGroupOptions" style="height: 100%">
      <template #right>
        <BtcCrud ref="crudRef" :service="wrappedModuleService" :on-before-refresh="handleBeforeRefresh" style="padding: 10px;">
          <BtcRow>
            <BtcRefreshBtn />
            <BtcAddBtn />
            <BtcMultiDeleteBtn />
            <BtcFlex1 />
            <BtcSearchKey placeholder="搜索模块" />
          </BtcRow>
          <BtcRow>
            <BtcTable ref="tableRef" :columns="moduleColumns" border />
          </BtcRow>
          <BtcRow>
            <BtcFlex1 />
            <BtcPagination />
          </BtcRow>
          <BtcUpsert ref="upsertRef" :items="moduleFormItems" width="800px" :on-submit="handleFormSubmit" />
        </BtcCrud>
      </template>
    </BtcViewGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { createCrudService } from '../../../utils/http';

const { t } = useI18n();
const viewGroupRef = ref();
const crudRef = ref();
const selectedDomain = ref<any>(null);

// 域服务（左侧列表）- 使用真实API，包装为 ViewGroup 兼容格式
const baseDomainService = createCrudService('domain');
const domainService = {
  page: async (params: any) => {
    const result = await baseDomainService.page(params);
    return {
      list: result.list,
      pagination: {
        total: result.total,
        page: params.page,
        size: params.size,
      }
    };
  }
};

// 模块服务（右侧表）- 使用真实API
const moduleService = createCrudService('module');

const wrappedModuleService = {
  ...moduleService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await moduleService.delete({ ids });
    ElMessage.success(t('crud.message.delete_success'));
  },
};

// ViewGroup 配置
const viewGroupOptions = reactive({
  label: '域列表',
  title: '模块列表',
  leftWidth: '300px',
  service: domainService,
  enableRefresh: true,
  enableKeySearch: true,
  tree: {
    visible: false, // 域是列表，不是树形
    props: {
      label: 'domainName',
      id: 'domainId', // ✅ 指定 id 字段名
    }
  },
  onSelect(domain: any) {
    selectedDomain.value = domain;
    // 根据域刷新右侧模块列表
    crudRef.value?.crud.setParams({ domainId: domain.domainId });
    crudRef.value?.crud.handleRefresh();
  }
});

// 模块表格列
const moduleColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'moduleName', label: '模块名称', minWidth: 150 },
  { prop: 'moduleCode', label: '模块编码', minWidth: 150 },
  { prop: 'moduleType', label: '类型', width: 100 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

// 模块表单
const moduleFormItems = computed<FormItem[]>(() => [
  { prop: 'moduleName', label: '模块名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'moduleCode', label: '模块编码', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'moduleType', label: '类型', span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

// 刷新前钩子：添加域ID参数
const handleBeforeRefresh = (params: any) => {
  if (selectedDomain.value) {
    return {
      ...params,
      domainId: selectedDomain.value.domainId,
    };
  }
  return params;
};

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    // 自动添加域ID
    if (selectedDomain.value) {
      data.domainId = selectedDomain.value.domainId;
    }

    await next(data);
    ElMessage.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};
</script>

<style lang="scss" scoped>
.modules-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
