<template>
  <div class="plugins-page">
    <BtcViewGroup ref="viewGroupRef" :options="viewGroupOptions" :title="t('platform.plugin.list')" :selected-item="selectedDomain" style="height: 100%">
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
        <BtcCrud ref="crudRef" :service="wrappedPluginService" :on-before-refresh="handleBeforeRefresh" style="padding: 10px;">
          <BtcRow>
            <BtcRefreshBtn />
            <BtcAddBtn />
            <BtcMultiDeleteBtn />
            <BtcFlex1 />
            <BtcSearchKey :placeholder="t('platform.plugin.search_placeholder')" />
          </BtcRow>
          <BtcRow>
            <BtcTable ref="tableRef" :columns="pluginColumns" border :row-key="'id'" @selection-change="handleSelectionChange">
              <template #column-status="{ row }">
                <el-tag :type="row.status === 'ENABLED' ? 'success' : 'info'">
                  {{ row.status === 'ENABLED' ? t('platform.plugin.enabled') : t('platform.plugin.disabled') }}
                </el-tag>
              </template>
            </BtcTable>
          </BtcRow>
          <BtcRow>
            <BtcFlex1 />
            <BtcPagination />
          </BtcRow>
          <BtcUpsert ref="upsertRef" :items="pluginFormItems" width="800px" :on-submit="handleFormSubmit" />
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
  // 根据域筛选插件列表
  crudRef.value?.crud.setParams({ domainId: domain.domainId });
  crudRef.value?.crud.handleRefresh();
};

// 插件表格列
const pluginColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'pluginName', label: t('platform.plugin.name'), minWidth: 150 },
  { prop: 'pluginCode', label: t('platform.plugin.code'), minWidth: 150 },
  { prop: 'version', label: t('platform.plugin.version'), width: 100 },
  { prop: 'status', label: t('platform.plugin.status'), width: 100 },
  { prop: 'description', label: t('platform.plugin.description'), minWidth: 200 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
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

// 调试选择变化
const handleSelectionChange = (selection: any[]) => {
  console.log('选择变化:', selection);
  console.log('选择的数据ID:', selection.map(item => item.id));
};
</script>

<style lang="scss" scoped>
.plugins-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
