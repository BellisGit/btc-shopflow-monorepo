/**
 * ViewGroup 拖拽排序 Hook
 */
import { ref } from 'vue';

import type { ViewGroupOptions } from '../types';
import { BtcMessage } from '@btc/shared-components';

export function useViewGroupDrag(config: ViewGroupOptions, list: any, refresh: any) {
  const isDrag = ref(false);

  // 拖拽排序确认
  function treeOrder(confirm: boolean) {
    if (confirm) {
      // 确认排序 - 这里应该调用后端API保存新的顺序
      BtcMessage.success('排序已保存');

      if (config.onDragEnd) {
        config.onDragEnd(list.value);
      }
    } else {
      // 取消排序 - 刷新列表恢复原状
      refresh();
    }
    isDrag.value = false;
  }

  // 处理拖拽结束
  function handleDrop(draggingNode: any, dropNode: any, dropType: string) {
    // 这里可以添加拖拽逻辑
    console.log('Node dropped', draggingNode, dropNode, dropType);
  }

  return {
    isDrag,
    treeOrder,
    handleDrop,
  };
}
