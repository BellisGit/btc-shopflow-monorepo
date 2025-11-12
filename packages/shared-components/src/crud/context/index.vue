<template>
  <div ref="crudRef" class="btc-crud" :class="{ 'is-border': border, 'has-pagination': hasPagination }" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  provide,
  onMounted,
  ref,
  onUpdated,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  computed,
  reactive,
  watchEffect,
  watch,
} from 'vue';
import { useCrud } from '@btc/shared-core';
import { BtcMessage } from '../../components/feedback/btc-message';
import {
  crudLayoutKey,
  type CrudLayoutTrailingKey,
  DEFAULT_OPERATION_WIDTH,
  DEFAULT_CRUD_GAP,
} from './layout';
import { useContentHeight } from '../../composables/content-height';

/**
 * BtcCrud 上下文容器
 * 提供 CRUD 上下文给所有子组件使用
 */

type UseCrudParams = Parameters<typeof useCrud>[0];
type CrudService = NonNullable<UseCrudParams['service']>;

export interface Props {
  // CRUD 服务（必填）
  service: CrudService;

  // CRUD 配置
  options?: Omit<UseCrudParams, 'service'>;

  // 样式
  border?: boolean;
  padding?: string;

  // 是否自动加载数据
  autoLoad?: boolean;

  // 刷新前钩子
  onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown> | void;
}

const props = withDefaults(defineProps<Props>(), {
  border: false,
  padding: '10px',
  autoLoad: true,
});

// 检测是否有分页组件
const hasPagination = ref(false);
const crudRef = ref<HTMLElement>();

// 创建 CRUD 实例
const crud = useCrud({
  service: props.service,
  onBeforeRefresh: props.onBeforeRefresh,
  onSuccess: (message: string) => {
    BtcMessage.success(message);
  },
  ...props.options,
});

// 提供给子组件
provide('btc-crud', crud);

// 检测分页组件的存在
function checkPagination() {
  if (!crudRef.value) return;

  // 在当前组件实例内查找分页组件
  const paginationEl = crudRef.value.querySelector('.el-pagination');
  hasPagination.value = !!paginationEl;
}

// 管理表格引用
const tableRef = ref();

const containerStyle = computed(() => ({
  padding: props.padding,
}));

const { height: contentHeight } = useContentHeight();
const scheduleTableAutoHeight = () => {
  nextTick(() => {
    tableRef.value?.calcMaxHeight?.();
  });
};

let containerResizeObserver: ResizeObserver | null = null;

// 提供给子组件
provide('btc-table-ref', tableRef);
provide(
  'btc-crud-toolbar-binding',
  computed(() => tableRef.value?.toolbarBinding ?? null),
);

const operationWidth = ref<number>(DEFAULT_OPERATION_WIDTH);
const layoutGap = ref<number>(DEFAULT_CRUD_GAP);
const trailingWidths = reactive<Record<CrudLayoutTrailingKey, number>>({
  export: 0,
  toolbar: 0,
});
const trailingObservers = new Map<CrudLayoutTrailingKey, ResizeObserver>();

interface RegisterOptions {
  immediate?: boolean;
}

function parseCssVarPx(value: string) {
  if (!value) return 0;
  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

const trailingWidth = computed(() =>
  (Object.values(trailingWidths) as number[]).reduce((acc, width) => acc + (Number.isFinite(width) ? width : 0), 0),
);

const trailingCount = computed(() =>
  (Object.values(trailingWidths) as number[]).reduce((acc, width) => acc + (width > 0 ? 1 : 0), 0),
);

const searchWidth = computed(() => {
  const totalGap = trailingCount.value > 0 ? layoutGap.value * trailingCount.value : 0;
  const width = operationWidth.value - trailingWidth.value - totalGap;
  return width > 0 ? width : 0;
});

const registerTrailing = (key: CrudLayoutTrailingKey, el: HTMLElement | null, options: RegisterOptions = {}) => {
  const existingObserver = trailingObservers.get(key);
  if (existingObserver) {
    existingObserver.disconnect();
    trailingObservers.delete(key);
  }
  if (!el) {
    if (options.immediate) {
      trailingWidths[key] = 0;
    }
    trailingWidths[key] = 0;
    return;
  }

  const updateWidth = () => {
    const width = el.getBoundingClientRect().width;
    if (!Number.isFinite(width) || width <= 0) {
      return;
    }
    const rounded = Math.max(0, Math.round(width * 1000) / 1000);
    if (rounded <= 1 && (trailingWidths[key] ?? 0) > 0) {
      return;
    }
    if (Math.abs((trailingWidths[key] ?? 0) - rounded) > 0.5) {
      trailingWidths[key] = rounded;
    }
  };

  updateWidth();

  const observer = new ResizeObserver(() => {
    updateWidth();
  });

  observer.observe(el);
  trailingObservers.set(key, observer);
};

const setOperationWidth = (width: number | null | undefined) => {
  if (typeof width === 'number' && Number.isFinite(width) && width > 0) {
    operationWidth.value = width;
  }
};

const setGap = (gap: number) => {
  if (Number.isFinite(gap) && gap > 0) {
    layoutGap.value = gap;
  }
};

watchEffect(() => {
  if (!crudRef.value) return;
  crudRef.value.style.setProperty('--btc-crud-op-width', `${operationWidth.value}px`);
  crudRef.value.style.setProperty('--btc-crud-search-width', `${searchWidth.value}px`);
  crudRef.value.style.setProperty('--btc-crud-trailing-width', `${trailingWidth.value}px`);
  const reservedGap = trailingCount.value > 0 ? layoutGap.value : 0;
  crudRef.value.style.setProperty('--btc-crud-trailing-gap', `${reservedGap}px`);
});

const resolveInitialMetrics = () => {
  if (!crudRef.value) return;
  const rootStyles = getComputedStyle(crudRef.value);
  const opWidth = parseCssVarPx(rootStyles.getPropertyValue('--btc-crud-op-width'));
  if (opWidth > 0) {
    operationWidth.value = opWidth;
  }

  const firstRow = crudRef.value.querySelector<HTMLElement>('.btc-crud-row');
  if (firstRow) {
    const rowStyles = getComputedStyle(firstRow);
    const gapValue = parseCssVarPx(rowStyles.columnGap || rowStyles.gap);
    if (gapValue > 0) {
      layoutGap.value = gapValue;
    }
  }
};

provide(crudLayoutKey, {
  operationWidth,
  gap: layoutGap,
  trailingWidth,
  trailingCount,
  searchWidth,
  registerTrailing,
  setOperationWidth,
  setGap,
});

// 检测父组件的辅助函数
function checkParentComponent(componentName: string): boolean {
  let parent = getCurrentInstance()?.parent;

  while (parent) {
    if (parent.type.name === componentName || parent.type.__name === componentName) {
      return true;
    }
    parent = parent.parent;
  }

  return false;
}

// 组件挂载时自动加载数据
onMounted(() => {
  // 智能检测：如果有 BtcViewGroup 父组件，则不自动加载
  // BtcTableGroup 中的 BtcCrud 应该能够自动加载
  const hasViewGroupParent = checkParentComponent('BtcViewGroup');

  if (props.autoLoad && !hasViewGroupParent) {
    crud.loadData();
  }
  // 延迟检测分页组件，确保子组件已经渲染
  setTimeout(checkPagination, 500);
  nextTick(() => {
    resolveInitialMetrics();
    scheduleTableAutoHeight();
  });
  if (crudRef.value && typeof ResizeObserver !== 'undefined') {
    containerResizeObserver = new ResizeObserver(() => {
      scheduleTableAutoHeight();
    });
    containerResizeObserver.observe(crudRef.value);
  }
});

// 组件更新时重新检测分页组件
onUpdated(() => {
  checkPagination();
  nextTick(() => {
    resolveInitialMetrics();
    scheduleTableAutoHeight();
  });
});

onBeforeUnmount(() => {
  trailingObservers.forEach((observer) => observer.disconnect());
  trailingObservers.clear();
  if (containerResizeObserver) {
    containerResizeObserver.disconnect();
    containerResizeObserver = null;
  }
});

// 暴露给父组件
defineExpose({
  crud,
  ...crud,
});

watch(
  () => contentHeight.value,
  () => {
    scheduleTableAutoHeight();
  },
);

watch(
  () => crud.pagination.size,
  () => {
    scheduleTableAutoHeight();
  },
);

watch(
  () => crud.pagination.page,
  () => {
    scheduleTableAutoHeight();
  },
);
</script>

