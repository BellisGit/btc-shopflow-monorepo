import { ref, computed } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';
import type { TableProps } from '../types';

/**
 * 表格排序处理（对齐 cool-admin table/helper/sort.ts）
 */
export function useTableSort(crud: UseCrudReturn<any>, props: TableProps, emit: any) {
  // 当前排序
  const currentSort = ref<{prop: string; order: string} | null>(null);

  // 默认排序
  const defaultSort = computed(() => {
    return props.defaultSort || currentSort.value || undefined;
  });

  /**
   * 排序变化处理
   */
  function onSortChange({ prop, order }: { prop: string; order: string }) {
    currentSort.value = { prop, order };

    emit('sort-change', { prop, order });

    // 是否在排序后刷新数据
    if (props.sortRefresh !== false && crud) {
      // 注意: crud.loadData() 不接受参数，排序参数应通过其他方式传递
      // 这里仅触发刷新，实际排序由 el-table 的 sortable 属性控制
      crud.loadData();
    }
  }

  /**
   * 清除排序
   */
  function clearSort() {
    currentSort.value = null;
  }

  return {
    defaultSort,
    currentSort,
    onSortChange,
    clearSort,
  };
}

