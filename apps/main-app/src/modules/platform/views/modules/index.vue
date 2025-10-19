<template>
  <div class="modules-page">
    <BtcViewGroup ref="viewGroupRef" :options="viewGroupOptions" :title="t('platform.module.list')" :selected-item="selectedDomain" style="height: 100%">
      <template #left>
        <!-- 使用通用主列表组件 - 直接调用域列表API -->
        <BtcMasterList
          :service="domainService"
          title="业务域"
          @select="onDomainSelect"
          @load="onDomainLoad"
        />
      </template>

      <template #right>
        <BtcCrud ref="crudRef" :service="wrappedModuleService" :on-before-refresh="handleBeforeRefresh" style="padding: 10px;">
          <BtcRow>
            <BtcRefreshBtn />
            <BtcAddBtn />
            <BtcMultiDeleteBtn />
            <BtcFlex1 />
            <BtcSearchKey :placeholder="t('platform.module.search_placeholder')" />
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
import { ElMessageBox } from 'element-plus';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcMasterList, BtcCrud, BtcTable, BtcUpsert, BtcPagination, BtcAddBtn, BtcRefreshBtn, BtcMultiDeleteBtn, BtcRow, BtcFlex1, BtcSearchKey } from '@btc/shared-components';
import { service } from '../../../../services/eps';

const { t } = useI18n();
const message = useMessage();
const viewGroupRef = ref();
const crudRef = ref();
const selectedDomain = ref<any>(null);

// 域服务配置 - 直接调用域列表的list API
const domainService = {
  list: () => service.sysdomain.list()
};

// 模块服务（右侧表）：使用真实API
const moduleService = service.sysmodule;

const wrappedModuleService = {
  ...moduleService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await moduleService.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};

// ViewGroup 配置
const viewGroupOptions = reactive({
  label: t('platform.domain.list'),
  leftWidth: '300px',
  enableRefresh: true,
  enableKeySearch: true,
  custom: true, // 使用自定义的左右侧内容
});


// 数据加载完成处理
const onDomainLoad = (list: any[], firstItem: any | null) => {
  if (firstItem) {
    selectedDomain.value = firstItem;
    // 首次加载时，触发右侧表格加载
    crudRef.value?.crud.setParams({ domainId: firstItem.domainId });
    crudRef.value?.crud.handleRefresh();
  }
};

// 用户点击选择处理
const onDomainSelect = (domain: any, domainIds: any[]) => {
  selectedDomain.value = domain;
  // 根据域筛选模块列表
  crudRef.value?.crud.setParams({ domainId: domain.domainId });
  crudRef.value?.crud.handleRefresh();
};

// 模块表格列
const moduleColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'moduleName', label: t('platform.module.name'), minWidth: 150 },
  { prop: 'moduleCode', label: t('platform.module.code'), minWidth: 150 },
  { prop: 'moduleType', label: t('platform.module.type'), width: 100 },
  { prop: 'description', label: t('platform.module.description'), minWidth: 200 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

// 模块表单
const moduleFormItems = computed<FormItem[]>(() => [
  { prop: 'moduleName', label: t('platform.module.name'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'moduleCode', label: t('platform.module.code'), span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'moduleType', label: t('platform.module.type'), span: 12, component: { name: 'el-input' } },
  { prop: 'description', label: t('platform.module.description'), span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

// 刷新前钩子：添加域ID参数
const handleBeforeRefresh = (params: any) => {
  if (selectedDomain.value) {
    return {
      ...params,
      domainId: selectedDomain.value.domainId,
    };
  }
  // 如果没有选中域，返回空参数，让表格显示空状态
  return {
    ...params,
    domainId: null, // 明确设置为null，让后端返回空数据
  };
};

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    // 自动添加域ID
    if (selectedDomain.value) {
      data.domainId = selectedDomain.value.domainId;
    }

    await next(data);
    message.success(t('crud.message.save_success'));
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
