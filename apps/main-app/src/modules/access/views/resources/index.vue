<template>
  <div class="resources-page">
    <BtcViewGroup ref="viewGroupRef" :options="viewGroupOptions">
      <template #right>
        <el-tabs v-model="activeTab" class="resource-tabs">
          <!-- Tab 1: 资源详情 -->
          <el-tab-pane :label="t('access.resource.detail')" name="detail">
            <BtcCrud ref="crudRef" :service="wrappedResourceService">
              <BtcRow>
                <BtcRefreshBtn />
                <BtcAddBtn />
                <BtcMultiDeleteBtn />
                <BtcFlex1 />
                <BtcSearchKey :placeholder="t('access.resource.search_placeholder')" />
              </BtcRow>
              <BtcRow>
                <BtcTable ref="tableRef" :columns="resourceColumns" border />
              </BtcRow>
              <BtcRow>
                <BtcFlex1 />
                <BtcPagination />
              </BtcRow>
              <BtcUpsert ref="upsertRef" :items="resourceFormItems" width="800px" :on-submit="handleFormSubmit" />
            </BtcCrud>
          </el-tab-pane>

          <!-- Tab 2: 权限矩阵 -->
          <el-tab-pane label="权限矩阵" name="matrix">
            <div class="permission-matrix" v-if="selectedModule">
              <el-table :data="permissionMatrix" border>
                <el-table-column prop="resourceName" label="资源" width="150" fixed />
                <el-table-column
                  v-for="action in actions"
                  :key="action.id"
                  :label="action.actionNameCn"
                  width="100"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-checkbox
                      :model-value="hasPermission(row, action)"
                      @change="togglePermission(row, action, $event)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <el-empty v-else description="请先选择模块" />
          </el-tab-pane>
        </el-tabs>
      </template>
    </BtcViewGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '../../../../services/eps';

const { t } = useI18n();
const viewGroupRef = ref();
const crudRef = ref();
const selectedModule = ref<any>(null);
const activeTab = ref('detail');

// 模块服务（左侧树，用作资源分类）- 使用EPS服务
const moduleService = service.base.resourceModule;

// 资源服务（右侧表）- 使用EPS服务
const resourceService = service.base.resource;

const wrappedResourceService = {
  ...resourceService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), { type: 'warning' });
    await resourceService.delete({ ids });
    message.success(t('crud.message.delete_success'));
  },
};

// Mock 操作列表
const actions = ref([
  { id: 1, actionNameCn: '查看', actionCode: 'view' },
  { id: 2, actionNameCn: '新增', actionCode: 'create' },
  { id: 3, actionNameCn: '编辑', actionCode: 'edit' },
  { id: 4, actionNameCn: '删除', actionCode: 'delete' },
]);

// Mock 权限矩阵数据
const permissionMatrix = computed(() => {
  if (!selectedModule.value) return [];

  // 获取该模块下的资源
  return [
    { resourceName: '用户列表', permissions: [1, 2] },
    { resourceName: '用户详情', permissions: [1] },
  ];
});

// ViewGroup 配置
const viewGroupOptions = reactive({
  label: '模块列表',
  title: '资源',
  leftWidth: '300px',
  service: moduleService,
  enableRefresh: true,
  enableAdd: true,
  enableKeySearch: true,
  tree: {
    visible: true,
    props: {
      label: 'name',
      children: 'children',
    }
  },
  onSelect(module: any) {
    selectedModule.value = module;
    // 更新右侧资源列表
    crudRef.value?.crud.setParams({ moduleId: module.id });
    crudRef.value?.crud.handleRefresh();
  },
  onEdit(module?: any) {
    message.info(module ? `编辑模块：${module.name}` : '新增模块');
  }
});

// 资源表格列
const resourceColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('crud.table.index'), width: 60 },
  { prop: 'resourceNameCn', label: '资源名称', minWidth: 150 },
  { prop: 'resourceCode', label: '资源编码', minWidth: 150 },
  { prop: 'resourceType', label: '类型', width: 100 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
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
        { label: '页面', value: '页面' },
        { label: 'API', value: 'API' },
        { label: '按钮', value: '按钮' },
        { label: '字段', value: '字段' },
      ]
    }
  },
  { prop: 'description', label: '描述', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
]);

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    if (selectedModule.value) {
      data.moduleId = selectedModule.value.id;
    }
    await next(data);
    message.success(t('crud.message.save_success'));
    close();
  } catch (error) {
    done();
  }
};

// 权限矩阵操作
const hasPermission = (resource: any, action: any) => {
  return resource.permissions?.includes(action.id) || false;
};

const togglePermission = (resource: any, action: any, checked: boolean) => {
  message.success(checked ? `已授权：${resource.resourceName} - ${action.actionNameCn}` : `已取消：${resource.resourceName} - ${action.actionNameCn}`);
  // 这里应该调用后端API保存权限关系
};
</script>

<style lang="scss" scoped>
.resources-page {
  height: 100%;
  box-sizing: border-box;
}

.resource-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;

  :deep(.el-tabs__header) {
    margin: 0 0 10px 0;
    flex-shrink: 0;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
    overflow: hidden;
  }
}

.permission-matrix {
  padding: 20px;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}
</style>
