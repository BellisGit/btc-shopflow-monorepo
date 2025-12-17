<template>
  <div class="btc-double-group" :class="{ 'is-left-collapsed': !isLeftExpanded }">
    <div class="btc-double-group__left" :style="leftPaneStyle">
      <div class="btc-double-group__column">
        <BtcMasterList
          ref="primaryListRef"
          :service="primaryService"
          :title="primaryTitle"
          :show-unassigned="showPrimaryUnassigned"
          :unassigned-label="primaryUnassignedLabel"
          :enable-key-search="enablePrimarySearch"
          :drag="false"
          hide-expand-icon
          @select="handlePrimarySelect"
          @load="handlePrimaryLoad"
        />
      </div>
      <div class="btc-double-group__column">
        <BtcMasterList
          ref="secondaryListRef"
          :service="secondaryServiceProxy"
          :title="secondaryTitle"
          :show-unassigned="showSecondaryUnassigned"
          :unassigned-label="secondaryUnassignedLabel"
          :enable-key-search="enableSecondarySearch"
          :drag="false"
          hide-expand-icon
          @select="handleSecondarySelect"
          @load="handleSecondaryLoad"
        />
      </div>
    </div>

    <div class="btc-double-group__right">
      <!-- 右侧顶栏：与 btc-view-group 完全一致 -->
      <div class="head">
        <div
          class="icon is-bg absolute left-[10px]"
          :class="{ 'is-fold': !isLeftExpanded }"
          @click="toggleLeftExpand"
        >
          <BtcSvg name="back" />
        </div>

        <span class="title">
          <slot name="title" :primary="selectedPrimary" :secondary="selectedSecondary">
            {{ rightTitle }}（{{ currentSelectionText }}）
          </slot>
        </span>

        <div class="absolute right-[10px]">
          <slot name="right-op"></slot>
        </div>
      </div>

      <div class="content page">
        <BtcCrud
        :key="`crud-${typeof rightService === 'object' && rightService !== null ? (rightService._serviceId || 'unknown') : rightService}`"
        ref="crudRef"
        :service="rightService"
        :auto-load="false"
        :on-before-refresh="handleBeforeRefresh"
        class="btc-double-group__crud"
      >
        <BtcRow>
          <div class="btc-crud-primary-actions">
            <BtcRefreshBtn />
            <slot name="add-btn">
              <BtcAddBtn v-if="showAddBtn" />
            </slot>
          </div>
          <BtcFlex1 />
          <BtcSearchKey v-if="showSearchKey" :placeholder="searchPlaceholder" />
          <BtcCrudActions v-if="showToolbar" :show-toolbar="op !== undefined">
            <template #default>
              <slot
                name="actions"
                :selected="selectedEntity"
                :keyword="selectedKeyword"
                :primary="selectedPrimary"
                :secondary="selectedSecondary"
                :left-data="leftDataContext"
              />
            </template>
          </BtcCrudActions>
        </BtcRow>

        <BtcRow>
          <BtcTable
            :columns="tableColumns"
            :op="op"
            :disable-auto-created-at="disableAutoCreatedAt"
            border
          />
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { globalMitt } from '@btc/shared-components';
import { useContentHeight } from '@btc/shared-components/composables/content-height';
import BtcMasterList from '@btc-components/data/btc-master-list/index.vue';
import BtcCrud from '@btc-crud/context/index.vue';
import BtcTable from '@btc-crud/table/index.vue';
import BtcPagination from '@btc-crud/pagination/index.vue';
import BtcAddBtn from '@btc-crud/add-btn/index.vue';
import BtcRefreshBtn from '@btc-crud/refresh-btn/index.vue';
import BtcMultiDeleteBtn from '@btc-crud/multi-delete-btn/index.vue';
import BtcRow from '@btc-crud/row/index.vue';
import BtcFlex1 from '@btc-crud/flex1/index.vue';
import BtcSearchKey from '@btc-crud/search-key/index.vue';
import BtcUpsert from '@btc-crud/upsert/index.vue';
import BtcCrudActions from '@btc-crud/actions/index.vue';
import BtcSvg from '@btc-components/others/btc-svg/index.vue';
import type { DoubleGroupProps, DoubleGroupEmits, DoubleGroupExpose } from './types';

defineOptions({
  name: 'BtcDoubleGroup',
  components: {
    BtcMasterList,
    BtcCrud,
    BtcTable,
    BtcPagination,
    BtcAddBtn,
    BtcRefreshBtn,
    BtcMultiDeleteBtn,
    BtcRow,
    BtcFlex1,
    BtcSearchKey,
    BtcUpsert,
    BtcCrudActions,
    BtcSvg,
  },
});

const props = withDefaults(defineProps<DoubleGroupProps>(), {
  primaryTitle: '一级列表',
  secondaryTitle: '二级列表',
  rightTitle: '详情',
  showPrimaryUnassigned: false,
  showSecondaryUnassigned: false,
  primaryUnassignedLabel: '未分配',
  secondaryUnassignedLabel: '未配置',
  enablePrimarySearch: false,
  enableSecondarySearch: false,
  secondaryFilterKey: 'parentId',
  primaryIdField: 'id',
  leftColumnWidth: 160,
  columnGap: 8,
  upsertWidth: 800,
  searchPlaceholder: '搜索',
  showAddBtn: false,
  showMultiDeleteBtn: false,
  showSearchKey: true,
  showToolbar: true,
  showCreateTime: true,
  showUpdateTime: false,
  secondaryKeywordStrategy: 'inherit',
});

const emit = defineEmits<DoubleGroupEmits>();

const primaryListRef = ref<any>(null);
const secondaryListRef = ref<any>(null);
const crudRef = ref<any>(null);

const { emit: emitContentResize } = useContentHeight();

const selectedPrimary = ref<any>(null);
const selectedSecondary = ref<any>(null);
const primaryKeyword = ref<any>(undefined);
const selectedKeyword = ref<any>(undefined);

const primaryListData = ref<any[]>([]);
const secondaryListData = ref<any[]>([]);

// 左侧展开/折叠状态
const isLeftExpanded = ref(true);

const disableAutoCreatedAt = computed(() => !props.showCreateTime);
const selectedEntity = computed(() => selectedSecondary.value || selectedPrimary.value);
const leftDataContext = computed(() => ({
  primary: primaryListData.value,
  secondary: secondaryListData.value,
}));

// 计算当前选项的显示文本
const currentSelectionText = computed(() => {
  const selected = selectedSecondary.value || selectedPrimary.value;
  if (selected) {
    return selected.name || selected.label || selected[props.primaryIdField] || '已选择';
  }
  return '未选择';
});

// 切换左侧展开/折叠
function toggleLeftExpand() {
  isLeftExpanded.value = !isLeftExpanded.value;
  triggerResize();
}

const secondaryServiceProxy = {
  list: async (params?: any) => {
    if (!props.secondaryService?.list || !selectedPrimary.value) {
      return [];
    }
    const baseParams =
      props.resolveSecondaryParams?.(selectedPrimary.value, params) ??
      {
        [props.secondaryFilterKey]: selectedPrimary.value?.[props.primaryIdField],
      };
    return props.secondaryService.list({
      ...(params || {}),
      ...baseParams,
    });
  },
};

const leftPaneStyle = computed(() => {
  const width = Number(props.leftColumnWidth) || 160;
  const gap = Number(props.columnGap) || 8;
  const total = width * 2 + gap;
  return {
    width: `${total}px`,
    '--double-group-column-width': `${width}px`,
    '--double-group-column-gap': `${gap}px`,
  };
});

const tableColumns = computed(() => {
  const columns = [...(props.tableColumns || [])];
  const filteredColumns = columns.filter(
    (col) =>
      !(
        col.prop === 'createdAt' ||
        col.prop === 'updatedAt' ||
        col.prop === 'createTime' ||
        col.prop === 'updateTime' ||
        col.prop === 'create_time' ||
        col.prop === 'update_time'
      )
  );

  const opColumnIndex = filteredColumns.findIndex((col) => col.type === 'op');
  const hasOpColumn = opColumnIndex !== -1;

  const timeColumns: any[] = [];
  if (props.showCreateTime) {
    timeColumns.push({
      prop: 'createdAt',
      label: '创建时间',
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right',
    });
  }
  if (props.showUpdateTime) {
    timeColumns.push({
      prop: 'updatedAt',
      label: '更新时间',
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right',
    });
  }

  if (hasOpColumn && timeColumns.length > 0) {
    filteredColumns.splice(opColumnIndex, 0, ...timeColumns);
  } else if (timeColumns.length > 0) {
    filteredColumns.push(...timeColumns);
  }

  if (!hasOpColumn && props.op !== undefined) {
    const buttons = props.op.buttons || ['edit', 'delete'];
    const buttonCount = Array.isArray(buttons) ? buttons.length : 2;
    const opWidth = buttonCount === 1 ? 126 : buttonCount === 2 ? 220 : 300;
    const opMinWidth = buttonCount === 1 ? 126 : 200;

    filteredColumns.push({
      type: 'op',
      minWidth: opMinWidth,
      width: opWidth,
      fixed: 'right',
      buttons,
    });
  }

  return filteredColumns;
});

const computedFormItems = computed(() => {
  if (!props.formItems || !Array.isArray(props.formItems)) {
    return [];
  }
  return props.formItems.map((item) => {
    if (item.component?.name === 'btc-cascader') {
      return {
        ...item,
        component: {
          ...item.component,
          options: secondaryListData.value.length ? secondaryListData.value : primaryListData.value,
        },
      };
    }
    return item;
  });
});

function normalizeKeyword(keyword: any) {
  if (keyword === undefined || keyword === null || keyword === '') {
    return undefined;
  }
  if (typeof keyword === 'object' && !Array.isArray(keyword)) {
    if ('ids' in keyword) {
      const normalizedIds = Array.isArray(keyword.ids)
        ? keyword.ids
        : keyword.ids
        ? [keyword.ids]
        : [];
      return normalizedIds.length ? { ...keyword, ids: normalizedIds } : undefined;
    }
    return keyword;
  }
  const normalizedIds = Array.isArray(keyword) ? keyword : [keyword];
  return normalizedIds.length ? { ids: normalizedIds } : undefined;
}

function triggerResize() {
  nextTick(() => {
    emitContentResize();
    globalMitt.emit('resize');
  });
}

// 防抖标记，避免重复刷新
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
const isRefreshing = ref(false);

// 标记服务是否变化，用于避免在 handleSecondarySelect 中重复刷新
const previousServiceId = ref<string | undefined>(undefined);

// 监听 rightService 的变化，当服务变化时标记需要刷新
watch(
  () => props.rightService,
  (newService) => {
    const newServiceId = typeof newService === 'object' && newService !== null
      ? (newService as any)._serviceId || 'unknown'
      : String(newService);

    // 如果服务 ID 变化，标记需要刷新
    if (previousServiceId.value !== undefined && previousServiceId.value !== newServiceId) {
      // 服务已变化，等待组件重新创建后刷新
      nextTick(() => {
        nextTick(() => {
          if (crudRef.value?.refresh) {
            refreshRight();
          }
        });
      });
    }

    previousServiceId.value = newServiceId;
  },
  { immediate: true }
);

function refreshRight() {
  // 清除之前的定时器
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // 如果正在刷新，跳过
  if (isRefreshing.value) {
    return;
  }

  // 设置防抖延迟，避免短时间内多次调用
  refreshTimer = setTimeout(() => {
    if (isRefreshing.value) {
      return;
    }
    isRefreshing.value = true;
    nextTick(() => {
      crudRef.value?.refresh();
      triggerResize();
      // 刷新完成后重置标记
      setTimeout(() => {
        isRefreshing.value = false;
        refreshTimer = null;
      }, 100);
    });
  }, 50);
}

function handlePrimarySelect(item: any, keyword: any) {
  selectedPrimary.value = item;
  primaryKeyword.value = keyword;
  selectedSecondary.value = null;
  selectedKeyword.value = keyword;

  emit('primary-select', item, keyword);
  refreshRight();

  nextTick(() => {
    secondaryListRef.value?.refresh();
  });
}

function handleSecondarySelect(item: any, keyword: any) {
  selectedSecondary.value = item;
  const strategy = props.secondaryKeywordStrategy || 'inherit';
  if (strategy === 'ignore') {
    selectedKeyword.value = primaryKeyword.value;
  } else if (strategy === 'override') {
    selectedKeyword.value = keyword;
  } else {
    selectedKeyword.value = keyword ?? primaryKeyword.value;
  }
  emit('secondary-select', item, keyword);
  emit('select', item || selectedPrimary.value, selectedKeyword.value);

  // 检查服务是否变化，如果服务没有变化，才触发刷新
  // 如果服务变化，watch 会处理刷新，避免重复调用
  const currentServiceId = typeof props.rightService === 'object' && props.rightService !== null
    ? (props.rightService as any)._serviceId || 'unknown'
    : String(props.rightService);

  if (previousServiceId.value === currentServiceId) {
    // 服务没有变化，正常触发刷新
    refreshRight();
  }
  // 如果服务变化，watch 会处理刷新，这里不重复调用
}

function handlePrimaryLoad(data: any[]) {
  primaryListData.value = data;
  emit('load', data);
  triggerResize();
}

function handleSecondaryLoad(data: any[]) {
  secondaryListData.value = data;
  triggerResize();

  // 如果二级列表数据为空，不需要刷新右侧
  // 因为 handlePrimarySelect 已经触发了刷新，避免重复调用
  if (!data || data.length === 0) {
    selectedSecondary.value = null;
    selectedKeyword.value = primaryKeyword.value;
    // 不再调用 refreshRight()，因为 handlePrimarySelect 已经处理了
  }
}

function handleBeforeRefresh(params: Record<string, unknown>) {
  const normalized = normalizeKeyword(selectedKeyword.value);
  if (normalized) {
    (params as any).keyword = normalized;
  } else if ('keyword' in params) {
    delete (params as any).keyword;
  }
  return params;
}

async function handleFormSubmit(data: any, event: any) {
  emit('form-submit', data, event);
  if (!event.defaultPrevented && typeof event.next === 'function') {
    await event.next(data);
  }
  triggerResize();
}

const refresh = async (params?: any) => {
  await primaryListRef.value?.refresh(params);
  await secondaryListRef.value?.refresh(params);
  await crudRef.value?.refresh(params);
  emit('refresh', params);
  triggerResize();
};

defineExpose<DoubleGroupExpose>({
  refresh,
  crudRef,
  primaryListRef,
  secondaryListRef,
});
</script>

<style scoped lang="scss">
.btc-double-group {
  display: flex;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  gap: var(--double-group-column-gap, 8px);

  &__left {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    box-sizing: border-box;
    background-color: var(--el-bg-color-overlay);
    gap: var(--double-group-column-gap, 8px);
    position: relative;

    // 在左栏和右栏之间添加分割线
    &::after {
      content: '';
      position: absolute;
      right: calc(-1 * var(--double-group-column-gap, 8px));
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: var(--el-border-color-extra-light);
      z-index: 1;
    }
  }

  &__column {
    width: var(--double-group-column-width, 160px);
    min-width: var(--double-group-column-width, 160px);
    height: 100%;
    background-color: var(--el-bg-color);
    border-radius: 4px;
    box-shadow: var(--el-box-shadow-light);
    overflow: hidden;
    position: relative;

    // 应用 small 尺寸的居中样式（参考 btc-view-group 的 is-left-size-small）
    :deep(.btc-master-list) {
      // 隐藏 el-tree 的 checkbox（如果启用）
      .el-tree-node__checkbox {
        display: none !important;
      }

      // 隐藏 el-tree 的 selection 相关元素
      .el-tree-node__selection {
        display: none !important;
      }

      .el-tree-node__content {
        justify-content: center !important;

        // 完全隐藏展开/折叠图标元素
        .el-tree-node__expand-icon {
          display: none !important;
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .btc-master-list__node {
          justify-content: center !important;
          width: auto !important; // 不占据全部宽度，让内容自然居中
          flex: 0 0 auto !important; // 不占据剩余空间

          .btc-master-list__node-label {
            justify-content: center !important;
            text-align: center !important;
            flex: 0 0 auto !important; // 移除 flex: 1，不占据剩余空间
          }
        }
      }
    }

  }

  &__right {
    flex: 1;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color);

    .head {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      flex-shrink: 0;

      .title {
        font-size: 15px;
        font-weight: 500;
      }

      .icon {
        height: 28px;
        width: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        transition: transform 0.2s ease-in-out;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        &.is-fold {
          transform: rotate(180deg);
        }

        &.is-bg {
          background-color: var(--el-fill-color-lighter);
        }

        &.absolute {
          position: absolute;
        }

        &.left-\[10px\] {
          left: 10px;
        }

        &.right-\[10px\] {
          right: 10px;
        }
      }
    }

    .content {
      height: calc(100% - 40px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
    }
  }

  &__crud {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }

  // 折叠状态
  &.is-left-collapsed {
    .btc-double-group__left {
      width: 0;
      padding: 0;
      overflow: hidden;
    }
  }
}
</style>

