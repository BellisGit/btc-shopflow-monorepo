<template>
  <div class="plugins-page">
    <BtcViewGroup ref="viewGroupRef" :options="viewGroupOptions" style="height: 100%">
      <template #right>
        <BtcCrud ref="crudRef" :service="wrappedPluginService" :on-before-refresh="handleBeforeRefresh" style="padding: 10px;">
          <BtcRow>
            <BtcRefreshBtn />
            <BtcAddBtn />
            <BtcMultiDeleteBtn />
            <BtcFlex1 />
            <BtcSearchKey placeholder="搜索插件" />
          </BtcRow>
          <BtcRow>
            <BtcTable ref="tableRef" :columns="pluginColumns" border>
              <template #column-status="{ row }">
                <el-tag :type="row.status === 'ENABLED' ? 'success' : 'info'">
                  {{ row.status === 'ENABLED' ? '已启用' : '未启用' }}
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
import { service } from '../../../services/eps';

const { t } = useI18n();
const message = useMessage();
const viewGroupRef = ref();
const crudRef = ref();
const selectedDomain = ref<any>(null);

// 域服务（左侧列表）- 使用真实API，包装为 ViewGroup 兼容格式
const baseDomainService = service.sysdomain;
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

// 插件服务（右侧表）- 使用真实API
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
  label: '域列表',
  title: '插件列表',
  leftWidth: '300px',
  service: domainService,
  enableRefresh: true,
  enableKeySearch: true,
  tree: {
    visible: false, // 域是列表，不是树形
    props: {
      label: 'domainName',
      id: 'domainId', // 指定 id 字段名
    }
  },
  onSelect(domain: any) {
    selectedDomain.value = domain;
    // 根据域刷新右侧插件列表
    crudRef.value?.crud.setParams({ domainId: domain.domainId });
    crudRef.value?.crud.handleRefresh();
  }
});

// 插件表格列
const pluginColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'pluginName', label: '插件名称', minWidth: 150 },
  { prop: 'pluginCode', label: '插件编码', minWidth: 150 },
  { prop: 'version', label: '版本', width: 100 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

// 插件表单
const pluginFormItems = computed<FormItem[]>(() => [
  { prop: 'pluginName', label: '插件名称', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'pluginCode', label: '插件编码', span: 12, required: true, component: { name: 'el-input' } },
  { prop: 'version', label: '版本', span: 12, component: { name: 'el-input' } },
  {
    prop: 'status',
    label: '状态',
    span: 12,
    value: 'ENABLED',
    component: {
      name: 'el-radio-group',
      options: [
        { label: '已启用', value: 'ENABLED' },
        { label: '未启用', value: 'DISABLED' },
      ]
    }
  },
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
    message.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};
</script>

<style lang="scss" scoped>
.plugins-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
