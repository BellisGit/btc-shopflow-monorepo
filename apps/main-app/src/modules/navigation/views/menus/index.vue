<template>
  <div class="menus-page">
    <BtcViewGroup
      ref="viewGroupRef"
      :options="viewGroupOptions"
      :title="t('navigation.menu.list')"
      :selected-item="selectedModule"
      style="height: 100%"
    >
      <template #left>
        <!-- 使用 btc-master-list 显示域和模块的两级树状结构 -->
        <BtcMasterList
          :service="domainModuleService"
          title="业务域"
          @select="onModuleSelect"
          @load="onModuleLoad"
        />
      </template>

      <template #right>
        <!-- 右侧显示具体模块下的菜单表 -->
        <BtcCrud
          ref="crudRef"
          :service="wrappedMenuService"
          :on-before-refresh="handleBeforeRefresh"
          style="padding: 10px"
        >
          <BtcRow>
            <BtcRefreshBtn />
            <BtcAddBtn />
            <BtcMultiDeleteBtn />
            <BtcFlex1 />
            <BtcSearchKey :placeholder="t('navigation.menu.search_placeholder')" />
          </BtcRow>
          <BtcRow>
            <BtcTable ref="tableRef" :columns="menuColumns" border />
          </BtcRow>
          <BtcRow>
            <BtcFlex1 />
            <BtcPagination />
          </BtcRow>
          <BtcUpsert
            ref="upsertRef"
            :items="menuFormItems"
            width="800px"
            :on-submit="handleFormSubmit"
          />
        </BtcCrud>
      </template>
    </BtcViewGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import {
  BtcViewGroup,
  BtcMasterList,
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcAddBtn,
  BtcRefreshBtn,
  BtcMultiDeleteBtn,
  BtcRow,
  BtcFlex1,
  BtcSearchKey,
} from '@btc/shared-components';
import { service } from '../../../../services/eps';

defineOptions({
  name: 'NavigationMenus',
});

const { t } = useI18n();
const viewGroupRef = ref();
const crudRef = ref();
const selectedModule = ref<any>(null);

// 域和模块服务配置 - 构建两级树状结构
const domainModuleService = {
  list: async () => {
    // 使用 AbortController 进行超时控制，避免 Promise.reject 触发调试器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10秒超时

    try {
      // 并行获取域列表和模块列表
      const [domains, modules] = await Promise.all([
        service.sysdomain.list(),
        service.sysmodule.list(),
      ]);

      // 清除超时定时器
      clearTimeout(timeoutId);

      // 构建树状结构：一级是域，二级是模块
      const domainModuleTree = domains.map((domain: any) => ({
        id: `domain_${domain.domainId}`,
        name: domain.domainName,
        domainId: domain.domainId,
        type: 'domain',
        children: modules
          .filter((module: any) => module.domainId === domain.domainId)
          .map((module: any) => ({
            id: `module_${module.moduleId}`,
            name: module.moduleName,
            moduleId: module.moduleId,
            domainId: module.domainId,
            type: 'module',
            parentId: `domain_${domain.domainId}`,
          })),
      }));

      return domainModuleTree;
    } catch (error: any) {
      // 清除超时定时器
      clearTimeout(timeoutId);

      // 检查是否是超时错误
      if (error.name === 'AbortError' || controller.signal.aborted) {
        // 超时情况：静默返回空数据，不显示错误信息
        console.warn('域和模块数据加载超时，返回空数据');
        return [];
      } else {
        // 其他错误：显示友好的错误信息
        console.error('加载域和模块数据失败:', error);
        const messageManager = (window as any).messageManager;
        if (messageManager) {
          messageManager.enqueue('warning', '数据加载失败，请稍后重试');
        }
        return [];
      }
    }
  },
};

// 菜单服务（右侧表）
const menuService = service.sysmenu;

const wrappedMenuService = {
  ...menuService,
  delete: async ({ ids }: { ids: (string | number)[] }) => {
    await ElMessageBox.confirm(t('crud.message.delete_confirm'), t('common.button.confirm'), {
      type: 'warning',
    });
    await menuService.delete({ ids });
    const messageManager = (window as any).messageManager;
    if (messageManager) {
      messageManager.enqueue('success', t('crud.message.delete_success'));
    }
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
const onModuleLoad = (_list: any[], firstItem: any | null) => {
  if (firstItem && firstItem.type === 'module') {
    selectedModule.value = firstItem;
    // 首次加载时，触发右侧表格加载
    crudRef.value?.crud.setParams({ moduleId: firstItem.moduleId });
    crudRef.value?.crud.handleRefresh();
  }
};

// 用户点击选择处理
const onModuleSelect = (item: any, _ids: any[]) => {
  // 只处理模块选择，忽略域选择
  if (item.type === 'module') {
    selectedModule.value = item;
    // 根据模块筛选菜单列表
    crudRef.value?.crud.setParams({ moduleId: item.moduleId });
    crudRef.value?.crud.handleRefresh();
  }
};

// 菜单表格列
const menuColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  {
    prop: 'name',
    label: t('navigation.menu.name'),
    align: 'left',
    width: 200,
    fixed: 'left',
  },
  {
    prop: 'isShow',
    label: t('navigation.menu.is_show'),
    width: 100,
  },
  {
    prop: 'icon',
    label: t('navigation.menu.icon'),
    width: 100,
  },
  {
    prop: 'type',
    label: t('navigation.menu.type'),
    width: 110,
    dict: [
      { label: t('navigation.menu.type.directory'), value: 0, type: 'warning' },
      { label: t('navigation.menu.type.menu'), value: 1, type: 'success' },
      { label: t('navigation.menu.type.permission'), value: 2, type: 'danger' },
    ],
  },
  {
    prop: 'router',
    label: t('navigation.menu.router'),
    minWidth: 170,
  },
  {
    prop: 'keepAlive',
    label: t('navigation.menu.keep_alive'),
    width: 100,
  },
  {
    prop: 'viewPath',
    label: t('navigation.menu.view_path'),
    minWidth: 200,
    showOverflowTooltip: true,
  },
  {
    prop: 'perms',
    label: t('navigation.menu.perms'),
    headerAlign: 'center',
    minWidth: 300,
    component: {
      name: 'cl-dict',
    },
  },
  {
    prop: 'orderNum',
    label: t('navigation.menu.order_num'),
    width: 120,
    fixed: 'right',
    sortable: 'custom',
  },
  {
    prop: 'updateTime',
    label: t('navigation.menu.update_time'),
    sortable: 'custom',
    width: 170,
  },
  { type: 'op', label: t('crud.table.operation'), width: 200, buttons: ['edit', 'delete'] },
]);

// 菜单类型选项
const menuTypeOptions = [
  { label: t('navigation.menu.type.directory'), value: 0, type: 'warning' },
  { label: t('navigation.menu.type.menu'), value: 1, type: 'success' },
  { label: t('navigation.menu.type.permission'), value: 2, type: 'danger' },
];

// 菜单表单
const menuFormItems = computed<FormItem[]>(() => [
  {
    prop: 'type',
    value: 0,
    label: t('navigation.menu.node_type'),
    required: true,
    component: {
      name: 'el-radio-group',
      options: menuTypeOptions,
    },
  },
  {
    prop: 'name',
    label: t('navigation.menu.node_name'),
    component: {
      name: 'el-input',
    },
    required: true,
  },
  {
    prop: 'parentId',
    label: t('navigation.menu.parent_node'),
    component: {
      name: 'el-select',
      props: {
        clearable: true,
        placeholder: t('navigation.menu.select_parent'),
      },
    },
  },
  {
    prop: 'router',
    label: t('navigation.menu.router'),
    hidden: ({ scope }: any) => scope.type != 1,
    component: {
      name: 'el-input',
      props: {
        placeholder: t('navigation.menu.router_placeholder'),
      },
    },
  },
  {
    prop: 'keepAlive',
    value: true,
    label: t('navigation.menu.keep_alive'),
    hidden: ({ scope }: any) => scope.type != 1,
    component: {
      name: 'el-radio-group',
      options: [
        { label: t('navigation.menu.keep_alive.enable'), value: true },
        { label: t('navigation.menu.keep_alive.disable'), value: false },
      ],
    },
  },
  {
    prop: 'isShow',
    label: t('navigation.menu.is_show'),
    value: true,
    hidden: ({ scope }: any) => scope.type == 2,
    component: {
      name: 'el-switch',
    },
  },
  {
    prop: 'viewPath',
    label: t('navigation.menu.view_path'),
    hidden: ({ scope }: any) => scope.type != 1,
    component: {
      name: 'el-input',
      props: {
        placeholder: t('navigation.menu.view_path_placeholder'),
      },
    },
  },
  {
    prop: 'icon',
    label: t('navigation.menu.icon'),
    hidden: ({ scope }: any) => scope.type == 2,
    component: {
      name: 'el-input',
      props: {
        placeholder: t('navigation.menu.icon_placeholder'),
      },
    },
  },
  {
    prop: 'orderNum',
    label: t('navigation.menu.order_num'),
    component: {
      name: 'el-input-number',
      props: {
        placeholder: t('navigation.menu.order_num_placeholder'),
        min: 0,
        max: 99,
        'controls-position': 'right',
      },
    },
  },
  {
    prop: 'perms',
    label: t('navigation.menu.perms'),
    hidden: ({ scope }: any) => scope.type != 2,
    component: {
      name: 'el-input',
      props: {
        type: 'textarea',
        rows: 3,
        placeholder: t('navigation.menu.perms_placeholder'),
      },
    },
  },
]);

// 刷新前钩子：添加模块ID参数
const handleBeforeRefresh = (params: any) => {
  if (selectedModule.value) {
    return {
      ...params,
      moduleId: selectedModule.value.moduleId,
    };
  }
  // 如果没有选中模块，返回空参数，让表格显示空状态
  return {
    ...params,
    moduleId: null, // 明确设置为null，让后端返回空数据
  };
};

const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  try {
    // 自动添加模块ID
    if (selectedModule.value) {
      data.moduleId = selectedModule.value.moduleId;
    }

    await next(data);
    const messageManager = (window as any).messageManager;
    if (messageManager) {
      messageManager.enqueue('success', t('crud.message.save_success'));
    }
    close();
  } catch (_error) {
    done();
  }
};
</script>

<style lang="scss" scoped>
.menus-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
