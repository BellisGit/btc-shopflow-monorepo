<template>
  <div ref="containerRef" class="btc-filter-table-group">
    <BtcFilterGroup
      ref="filterGroupRef"
      :filter-category="props.filterCategory"
      :filter-service="props.filterService"
      :enable-filter-search="props.enableFilterSearch"
      :default-expanded-count="props.defaultExpandedCount"
      :right-title="props.rightTitle"
      :left-width="computedLeftWidth"
      :left-size="props.leftSize"
      :default-expand="props.defaultExpand !== false"
      :auto-collapse-on-mobile="props.autoCollapseOnMobile !== false"
      :storage-key="props.storageKey"
      @filter-change="handleFilterChange"
      @expand-change="handleExpandChange"
    >
      <template #right="{ filterResult: slotFilterResult }">
        <BtcCrud
          ref="crudRef"
          :service="props.rightService"
          :auto-load="props.autoLoad !== false"
          :on-before-refresh="handleBeforeRefresh"
        >
          <BtcCrudRow>
            <div class="btc-crud-primary-actions">
              <BtcRefreshBtn />
              <slot name="after-refresh-btn" />
              <slot name="add-btn">
                <BtcAddBtn v-if="props.showAddBtn" />
              </slot>
              <slot name="multi-delete-btn">
                <BtcMultiDeleteBtn v-if="props.showMultiDeleteBtn" />
              </slot>
            </div>
            <BtcCrudFlex1 />
            <slot name="search">
              <BtcCrudSearchKey
                v-if="props.showSearchKey"
                :placeholder="props.searchPlaceholder || '搜索'"
              />
            </slot>
            <BtcCrudActions v-if="props.showToolbar" :show-toolbar="true">
              <template #default>
                <slot
                  name="actions"
                  :filter-result="slotFilterResult"
                />
              </template>
            </BtcCrudActions>
          </BtcCrudRow>
          <BtcCrudRow>
            <BtcTable
              ref="tableRef"
              :columns="computedTableColumns"
              v-bind="props.op ? { op: props.op } : {}"
              :border="true"
            />
          </BtcCrudRow>
          <BtcCrudRow>
            <BtcCrudFlex1 />
            <BtcPagination />
          </BtcCrudRow>
          <BtcUpsert
            :items="props.formItems || []"
            :width="props.upsertWidth || 800"
            @submit="handleFormSubmit"
          />
        </BtcCrud>
      </template>
    </BtcFilterGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted, type Ref } from 'vue';
import BtcFilterGroup from '../btc-filter-group/index.vue';
import BtcCrud from '@btc-crud/context/index.vue';
import BtcTable from '@btc-crud/table/index.vue';
import BtcPagination from '@btc-crud/pagination/index.vue';
import BtcAddBtn from '@btc-crud/add-btn/index.vue';
import BtcRefreshBtn from '@btc-crud/refresh-btn/index.vue';
import BtcMultiDeleteBtn from '@btc-crud/multi-delete-btn/index.vue';
import BtcCrudRow from '@btc-crud/crud-row/index.vue';
import BtcCrudFlex1 from '@btc-crud/crud-flex1/index.vue';
import BtcCrudSearchKey from '@btc-crud/crud-search-key/index.vue';
import BtcUpsert from '@btc-crud/upsert/index.vue';
import BtcCrudActions from '@btc-crud/actions/index.vue';
import { useColumnPriority } from './composables/useColumnPriority';
import { useDynamicWidth } from './composables/useDynamicWidth';
import type { FilterResult } from '../btc-filter-list/types';
import type { TableColumn } from '@btc-crud/table/types';
import type {
  BtcFilterTableGroupProps,
  BtcFilterTableGroupEmits,
  BtcFilterTableGroupExpose,
} from './types';

defineOptions({
  name: 'BtcFilterTableGroup',
  inheritAttrs: false,
  components: {
    BtcFilterGroup,
    BtcCrud,
    BtcTable,
    BtcPagination,
    BtcAddBtn,
    BtcRefreshBtn,
    BtcMultiDeleteBtn,
    BtcCrudRow,
    BtcCrudFlex1,
    BtcCrudSearchKey,
    BtcUpsert,
    BtcCrudActions,
  },
});

const props = withDefaults(defineProps<BtcFilterTableGroupProps>(), {
  enableFilterSearch: true,
  defaultExpandedCount: 3,
  columnPriority: 'auto',
  enableColumnReorder: false,
  categoryColumnMap: () => ({}),
  minLeftWidth: '200px',
  maxLeftWidth: '600px',
  enableAutoWidth: true,
  baseWidth: () => ({ small: 200, default: 300, large: 450 }),
  showAddBtn: true,
  showMultiDeleteBtn: true,
  showSearchKey: true,
  showToolbar: true,
  upsertWidth: 800,
  searchPlaceholder: '搜索',
  defaultExpand: true,
  autoCollapseOnMobile: true,
  autoLoad: true,
});

const emit = defineEmits<BtcFilterTableGroupEmits>();

// 定义插槽类型
defineSlots<{
  actions?: (props: { filterResult: FilterResult[] }) => any;
  'add-btn'?: () => any;
  'multi-delete-btn'?: () => any;
  'after-refresh-btn'?: () => any;
  search?: () => any;
}>();

// 组件引用
const containerRef = ref<HTMLElement>();
const filterGroupRef = ref<InstanceType<typeof BtcFilterGroup>>();
const crudRef = ref<any>();
const tableRef = ref<any>();

// 筛选结果
const filterResult = ref<FilterResult[]>([]);

// 列优先级管理
const { sortedColumns } = useColumnPriority(
  filterResult,
  computed(() => props.tableColumns),
  props.categoryColumnMap || {}
);

// 动态宽度计算
const { dynamicWidth, calculateWidth, cleanup } = useDynamicWidth(
  tableRef,
  containerRef,
  {
    minWidth: parseFloat(props.minLeftWidth),
    maxWidth: parseFloat(props.maxLeftWidth),
    baseWidths: props.baseWidth,
    enabled: props.enableAutoWidth,
  }
);

// 计算左侧宽度
const computedLeftWidth = computed(() => {
  if (props.enableAutoWidth) {
    // 启用自动宽度时，使用动态计算的宽度
    if (dynamicWidth.value) {
      return dynamicWidth.value;
    }
    // 如果动态宽度还未计算，使用默认宽度
    return `${props.baseWidth.default}px`;
  }
  // 禁用自动宽度时：
  // 1. 如果用户明确指定了 leftWidth，使用用户指定的值
  // 2. 否则返回 undefined，让 BtcFilterGroup 根据 BtcFilterList 的 size 自动调整
  return props.leftWidth;
});

// 计算表格列（应用优先级排序）
const computedTableColumns = computed(() => {
  if (props.columnPriority === 'auto') {
    return sortedColumns.value;
  }
  return props.tableColumns;
});

// 监听表格列变化，触发宽度重新计算
watch(
  () => tableRef.value?.columns,
  () => {
    if (props.enableAutoWidth) {
      nextTick(() => {
        calculateWidth();
      });
    }
  },
  { deep: true }
);

// 监听筛选结果变化，触发宽度重新计算
watch(
  filterResult,
  () => {
    if (props.enableAutoWidth) {
      nextTick(() => {
        calculateWidth();
      });
    }
  },
  { deep: true }
);

// 处理筛选变化
const handleFilterChange = (result: FilterResult[]) => {
  filterResult.value = result;
  emit('filter-change', result);
  
  // 触发列变化事件
  emit('column-change', computedTableColumns.value);
  
  // 触发宽度重新计算
  if (props.enableAutoWidth) {
    nextTick(() => {
      calculateWidth();
    });
  }
};

// 处理展开/收起变化
const handleExpandChange = (isExpand: boolean) => {
  emit('expand-change', isExpand);
  
  // 展开/收起时重新计算宽度
  if (props.enableAutoWidth) {
    nextTick(() => {
      calculateWidth();
    });
  }
};

// 处理刷新前钩子（将筛选结果转换为查询参数）
const handleBeforeRefresh = (params: Record<string, any>) => {
  const keyword: Record<string, any> = {};
  filterResult.value.forEach(item => {
    if (item.value && item.value.length > 0) {
      keyword[item.name] = item.value;
    }
  });
  
  if (Object.keys(keyword).length > 0) {
    params.keyword = { ...(params.keyword || {}), ...keyword };
  }
  
  return params;
};

// 处理表单提交
const handleFormSubmit = (
  data: any,
  formEvent: { close: () => void; done: () => void; next: (data: any) => Promise<any>; defaultPrevented: boolean }
) => {
  emit('form-submit', data, formEvent);
};

// 监听数据加载完成
watch(
  () => crudRef.value?.tableData,
  (data) => {
    if (data) {
      emit('load', data);
    }
  },
  { deep: true }
);

// 清理函数
onUnmounted(() => {
  if (cleanup) {
    cleanup();
  }
});

// 暴露
defineExpose<BtcFilterTableGroupExpose>({
  filterResult: computed(() => filterResult.value),
  crudRef,
  filterListRef: computed(() => filterGroupRef.value?.filterListRef),
  refresh: async (params?: any) => {
    await crudRef.value?.refresh(params);
  },
  updateColumns: (columns: TableColumn[]) => {
    // 暂未实现，未来可以支持手动更新列
    console.warn('[BtcFilterTableGroup] updateColumns 暂未实现');
  },
});
</script>

<style scoped lang="scss">
.btc-filter-table-group {
  width: 100%;
  height: 100%;
}
</style>
