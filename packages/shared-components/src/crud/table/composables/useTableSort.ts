import { ref, computed } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';
import type { TableProps } from '../types';

/**
 * 琛ㄦ牸鎺掑簭澶勭悊锛堝榻?cool-admin table/helper/sort.ts锛? */
export function useTableSort(crud: UseCrudReturn<any>, props: TableProps, emit: any) {
  // 褰撳墠鎺掑簭
  const currentSort = ref<{prop: string; order: string} | null>(null);

  // 榛樿鎺掑簭
  const defaultSort = computed(() => {
    return props.defaultSort || currentSort.value || undefined;
  });

  /**
   * 鎺掑簭鍙樺寲澶勭悊
   */
  function onSortChange({ prop, order }: { prop: string; order: string }) {
    currentSort.value = { prop, order };

    emit('sort-change', { prop, order });

    // 鏄惁鍦ㄦ帓搴忓悗鍒锋柊鏁版嵁
    if (props.sortRefresh !== false && crud) {
      // 娉ㄦ剰: crud.loadData() 涓嶆帴鍙楀弬鏁帮紝鎺掑簭鍙傛暟搴旈€氳繃鍏朵粬鏂瑰紡浼犻€?      // 杩欓噷浠呰Е鍙戝埛鏂帮紝瀹為檯鎺掑簭鐢?el-table 鐨?sortable 灞炴€ф帶鍒?      crud.loadData();
    }
  }

  /**
   * 娓呴櫎鎺掑簭
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


