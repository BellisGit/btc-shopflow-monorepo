<template>
  <div class="btc-views-tabs-group">
    <BtcViewGroup
      ref="viewGroupRef"
      :left-service="viewGroupOptions.leftService"
      :left-title="viewGroupOptions.title"
      :show-unassigned="viewGroupOptions.showUnassigned"
      :unassigned-label="viewGroupOptions.unassignedLabel"
      :enable-drag="viewGroupOptions.enableDrag"
      :enable-key-search="viewGroupOptions.enableKeySearch"
      :enable-refresh="viewGroupOptions.enableRefresh"
      @select="handleViewGroupSelect"
      style="height: 100%"
    >
      <template #right>
        <BtcTabs v-model="activeTab" :tabs="tabList" @tab-change="handleTabChange">
          <template #content>
            <BtcCrud
              ref="crudRef"
              :service="crudServiceInstance"
              :on-before-refresh="handleBeforeRefresh"
              style="padding: 10px;"
            >
              <BtcRow>
                <BtcRefreshBtn />
                <BtcAddBtn />
                <BtcMultiDeleteBtn />
                <BtcFlex1 />
                <BtcSearchKey :placeholder="searchPlaceholder" />
              </BtcRow>
              <BtcRow>
                <BtcTable :columns="columns" :row-key="'id'" :auto-height="false" :max-height="tableMaxHeight" border />
              </BtcRow>
              <BtcRow>
                <BtcFlex1 />
                <BtcPagination />
              </BtcRow>
              <BtcUpsert
                :items="computedFormItems"
                :width="upsertWidth"
                :on-submit="handleFormSubmit"
              />
            </BtcCrud>
          </template>
        </BtcTabs>
      </template>
    </BtcViewGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import BtcViewGroup from '@btc-common/view-group/index.vue';
import BtcTabs from '@btc-components/navigation/btc-tabs/index.vue';
import { BtcCrud, BtcRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcFlex1, BtcSearchKey, BtcTable, BtcPagination } from '../../../index';
import BtcUpsert from '@btc-crud/upsert/index.vue';
import type { BtcViewsTabsGroupConfig } from './types';

defineOptions({
  name: 'BtcViewsTabsGroup'
});

const props = defineProps<{
  config: BtcViewsTabsGroupConfig;
}>();

const emit = defineEmits<{
  'tab-change': [tab: any, index: number];
  'selected-change': [item: any];
}>();

// 组件引用
const viewGroupRef = ref();
const crudRef = ref();

// 表格最大高度
const tableMaxHeight = ref<number>(600); // 默认600px

// 计算表格最大高度
const calcTableMaxHeight = () => {
  nextTick(() => {
    const viewGroupContent = document.querySelector('.btc-view-group .content');
    if (viewGroupContent) {
      const contentHeight = viewGroupContent.clientHeight;
      // 预留空间给搜索栏(50px) + 分页(50px) + 间距(20px) = 120px
      tableMaxHeight.value = Math.max(400, contentHeight - 120);
    }
  });
};

onMounted(() => {
  calcTableMaxHeight();
  window.addEventListener('resize', calcTableMaxHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', calcTableMaxHeight);
});

// 当前选中的 tab
const activeTab = ref('');
// 当前选中的树节点
const selectedItem = ref<any>(null);
// 标记是否已经初始化完成
const isInitialized = ref(false);
// 服务缓存，避免重复创建相同的服务对象
const serviceCache = new Map<string, any>();

// 计算表单配置（支持动态获取左侧菜单数据）
const computedFormItems = computed(() => {
  if (typeof props.config.formItems === 'function') {
    // 如果是函数，获取左侧菜单数据并调用函数
    const leftMenuData = getLeftMenuData();

    // 检查左侧数据是否可用
    if (leftMenuData && (leftMenuData.departments?.length > 0 || leftMenuData.roles?.length > 0)) {
      return props.config.formItems(leftMenuData);
    } else {
      // 如果左侧数据不可用，返回一个不依赖左侧数据的表单配置
      return props.config.formItems();
    }
  }
  return props.config.formItems;
});

// 计算属性
const tabList = computed(() => props.config.tabs);
const columns = computed(() => props.config.columns);
const formItems = computed(() => props.config.formItems);
const searchPlaceholder = computed(() => props.config.searchPlaceholder || '搜索...');
const upsertWidth = computed(() => props.config.upsertWidth || '800px');

// 获取服务实例
const getMasterService = (serviceName: string, queryParams?: any) => {
  // 在 shared-components 中，服务实例应该通过 props 传递
  const originalService = props.config.services?.[serviceName];
  if (!originalService) {
    console.error('[BtcViewsTabsGroup] Service not found:', serviceName);
    return null;
  }

  // 如果没有查询参数，直接返回原始服务
  if (!queryParams) return originalService;

  // 创建缓存键
  const cacheKey = `${serviceName}-${JSON.stringify(queryParams)}`;


  // 如果缓存中存在，直接返回
  if (serviceCache.has(cacheKey)) {
    const cachedService = serviceCache.get(cacheKey);
    return cachedService;
  }

  // 创建包装服务，传递查询参数
  const wrappedService = {
    ...originalService,
    list: (params: any = {}) => {
      // 合并默认查询参数和传入的参数
      const mergedParams = {
        keyword: '',
        order: 'createdAt',
        page: 1,
        size: 100,
        sort: 'asc',
        ...queryParams,
        ...params
      };
      return originalService.list(mergedParams);
    }
  };

  // 缓存服务对象
  serviceCache.set(cacheKey, wrappedService);
  return wrappedService;
};

const crudServiceInstance = computed(() => props.config.services?.[props.config.crudService] || null);

// ViewGroup 配置 - 动态切换
const viewGroupOptions = computed(() => {
  // 如果没有选中 tab 或找不到对应的 tab，使用第一个 tab
  let currentTab = props.config.tabs.find(t => t.name === activeTab.value);
  if (!currentTab && props.config.tabs.length > 0) {
    currentTab = props.config.tabs[0];
  }


  if (!currentTab) {
    // 返回默认配置，确保类型匹配
    return {
      label: '',
      leftService: null, // 修复：使用 leftService 而不是 service
      tree: { props: { id: 'id', label: 'name' } }
    };
  }

  const service = getMasterService(currentTab.masterService, currentTab.queryParams);

  return {
    label: currentTab.listLabel,
    title: currentTab.listLabel,
    leftWidth: props.config.leftWidth || '300px',
    leftService: service, // 修复：使用 leftService 而不是 service
    showUnassigned: props.config.showUnassigned ?? true,
    unassignedLabel: props.config.unassignedLabel || '未分配',
    enableDrag: false,
    enableKeySearch: props.config.enableKeySearch ?? false,
    enableRefresh: true,
    tree: { props: { id: 'id', label: 'name' } }
  };
});

// Tab 切换处理
const handleTabChange = async (tab: any, index: number) => {

  emit('tab-change', tab, index);

  // 清除服务缓存，确保使用新的服务对象
  serviceCache.clear();

  // 等待DOM更新
  await nextTick();


  // 强制重新渲染 BtcMasterList 组件，确保使用新的服务
  if (viewGroupRef.value) {
    await viewGroupRef.value.refresh();
  }
};

// CRUD 刷新前处理
const handleBeforeRefresh = (params: any) => {
  if (!params) params = {};

  if (selectedItem.value) {
    if (selectedItem.value.id === 'UNASSIGNED') {
      // 未分配项 - 清空keyword，让后端返回所有数据
      params.keyword = '';
    } else {
      // 指定项 - 将选中项的ID作为keyword传递
      // 如果selectedItem包含ids，则使用ids（可能是字符串或数组），否则使用单个id
      if (selectedItem.value.ids !== undefined) {
        params.keyword = selectedItem.value.ids;
      } else {
        params.keyword = selectedItem.value.id;
      }
    }
  }

  return params;
};

// 表单提交处理
const handleFormSubmit = async (data: any, { close, done, next }: any) => {
  if (props.config.onFormSubmit) {
    return await props.config.onFormSubmit(data, { close, done, next });
  }
  return data;
};

// 处理 ViewGroup 的 select 事件
const handleViewGroupSelect = (item: any, ids?: any) => {
  selectedItem.value = item;
  emit('selected-change', item);

  // 延迟触发右侧 BtcCrud 的刷新，确保组件已挂载
  nextTick(() => {
    if (crudRef.value && crudRef.value.crud && crudRef.value.crud.loadData) {
      crudRef.value.crud.loadData();
    } else {
      // 如果 nextTick 后还是没有引用，再延迟一点
      setTimeout(() => {
        if (crudRef.value && crudRef.value.crud && crudRef.value.crud.loadData) {
          crudRef.value.crud.loadData();
        }
      }, 100);
    }
  });
};

// 注意：不再需要监听 viewGroupRef.value?.selected，因为现在直接通过 @select 事件处理

// 注意：不再需要监听服务变化，因为 handleTabChange 中已经处理了刷新
// 这里监听会导致与 handleTabChange 的竞争条件

// 初始化
onMounted(() => {
  // 默认选中第一个 tab
  if (props.config.tabs.length > 0) {
    activeTab.value = props.config.tabs[0].name;
  }
  // 标记初始化完成
  isInitialized.value = true;
});

// 获取左侧菜单数据的方法
const getLeftMenuData = () => {
  if (!viewGroupRef.value?.masterListRef) {
    return null;
  }

  const listData = viewGroupRef.value.masterListRef.list || [];
  const currentTab = props.config.tabs.find(t => t.name === activeTab.value);


  if (currentTab?.masterService === 'sysdepartment') {
    return { departments: listData };
  } else if (currentTab?.masterService === 'sysrole') {
    return { roles: listData };
  }

  return null;
};

// 暴露方法
defineExpose({
  activeTab,
  selectedItem,
  viewGroupRef,
  crudRef,
  refresh: () => viewGroupRef.value?.refresh(),
  getLeftMenuData
});
</script>

<style lang="scss" scoped>
.btc-views-tabs-group {
  width: 100%;
  height: 100%;
}
</style>
