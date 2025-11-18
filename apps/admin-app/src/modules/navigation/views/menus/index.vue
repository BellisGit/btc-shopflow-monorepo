<template>
  <div class="menus-page">
    <BtcTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedMenuService"
      :table-columns="menuColumns"
      :form-items="menuFormItems"
      :op="{ buttons: ['edit', 'delete'] }"
      left-title="业务域"
      right-title="菜单列表"
      search-placeholder="搜索菜单..."
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
import { ElTree } from 'element-plus';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { BtcTableGroup } from '@btc/shared-components';
import { service } from '@services/eps';

defineOptions({
  name: 'NavigationMenus',
});

const { t } = useI18n();
const tableGroupRef = ref();
const selectedModule = ref<any>(null);

// 域服务配置- 直接调用域列表的list API
const domainService = {
  list: (params?: any) => {
    // 必须传递参数至少为空对象{}，否则后台框架默认参数处理逻辑
    const finalParams = params || {};
    return service.system?.iam?.domain?.list(finalParams);
  }
};

// 菜单服务（右侧表）
const menuService = service.system?.iam?.menu;

const wrappedMenuService = {
  ...menuService,
  delete: async (id: string | number) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), {
      type: 'warning',
    });

    // 单个删除：直接传递 ID
    await menuService.delete(id);

    const messageManager = (window as any).messageManager;
    if (messageManager) {
      messageManager.enqueue('success', t('crud.message.delete_success'));
    }
  },
  deleteBatch: async (ids: (string | number)[]) => {
    await BtcConfirm(t('crud.message.delete_confirm'), t('common.button.confirm'), {
      type: 'warning',
    });

    // 批量删除：调用 deleteBatch 方法，传递 ID 数组
    await menuService.deleteBatch(ids);

    const messageManager = (window as any).messageManager;
    if (messageManager) {
      messageManager.enqueue('success', t('crud.message.delete_success'));
    }
  },
};


// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedModule.value = domain;
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
    showOverflowTooltip: true,
  },
  {
    prop: 'orderNum',
    label: t('navigation.menu.order_num'),
    width: 120,
    fixed: 'right',
    sortable: 'custom',
  },
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


</script>

<style lang="scss" scoped>
.menus-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
