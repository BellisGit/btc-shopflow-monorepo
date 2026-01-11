/**
 * ViewGroup 数据管理 Hook
 */
import { ref, nextTick } from 'vue';
import type { ViewGroupOptions, ViewGroupItem } from '../types';

export function useViewGroupData(config: ViewGroupOptions, _tree: any, _isCustom: boolean, selectFn?: (item?: ViewGroupItem, ids?: any) => void) {
  const selected = ref<ViewGroupItem>();

  // 处理 BtcMasterList 的选中事件
  function handleSelect(item: any, ids?: any) {
    // 将 ids 附加到 item 对象上，供后续使用（可能是字符串或数组）
    if (ids !== undefined) {
      item.ids = ids;
    }
    selected.value = item;
    if (selectFn) {
      selectFn(item, ids);
    }
    // 调用用户配置的 onSelect 回调
    if (config.onSelect) {
      config.onSelect(item);
    }
  }

  // 处理 BtcMasterList 的加载事件
  function handleLoad(data: any[]) {
    // 可以在这里添加额外的数据处理逻辑
    // 只有在没有选中项且数据不为空时才自动选中第一项
    // 避免在初始化时重复触发选中事件
    if (data.length > 0 && !selected.value) {
      // 延迟选中，避免与初始化逻辑冲突
      nextTick(() => {
        if (!selected.value) {
          handleSelect(data[0]);
        }
      });
    }
    // 调用用户配置的 onLoad 回调
    if (config.onLoad) {
      config.onLoad(data);
    }
  }

  return {
    selected,
    handleSelect,
    handleLoad,
  };
}
