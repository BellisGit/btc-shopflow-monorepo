import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue';
import type { TableProps } from '../types';

/**
 * 表格高度自动计算（对齐 cool-admin table/helper/height.ts）
 */
export function useTableHeight(props: TableProps, tableRef: Ref) {
  const maxHeight = ref<number | undefined>();

  /**
   * 计算最大高度（对齐 cool-admin 逻辑）
   */
  function calcMaxHeight() {
    if (!props.autoHeight) {
      maxHeight.value = undefined;
      return;
    }

    nextTick(() => {
      const table = tableRef.value;
      if (!table || !table.$el) return;

      const tableEl = table.$el as HTMLElement;

      // 获取表格所在的容器（btc-crud）
      const container = tableEl.closest('.btc-crud');
      if (!container) return;

      // 计算表格上方的高度
      const topHeight = tableEl.offsetTop;

      // 计算表格下方的高度
      let bottomHeight = 0;
      let nextSibling = tableEl.nextElementSibling;

      while (nextSibling) {
        const htmlElement = nextSibling as HTMLElement;
        if (htmlElement.offsetHeight > 0) {
          bottomHeight += htmlElement.offsetHeight;

          // 如果是最后一个 btc-row，添加间距
          if (nextSibling.classList.contains('btc-row--last')) {
            bottomHeight += 10;
          }
        }
        nextSibling = nextSibling.nextElementSibling;
      }

      // 添加容器内边距
      const containerStyle = window.getComputedStyle(container);
      const paddingTop = parseInt(containerStyle.paddingTop, 10) || 0;
      const paddingBottom = parseInt(containerStyle.paddingBottom, 10) || 0;

      // 计算总高度（增加一些缓冲空间）
      const totalHeight = topHeight + bottomHeight + paddingTop + paddingBottom + 20;

      // 设置最大高度（确保有足够的最小高度）
      maxHeight.value = Math.max(300, container.clientHeight - totalHeight);
    });
  }

  onMounted(() => {
    if (props.autoHeight) {
      calcMaxHeight();
      window.addEventListener('resize', calcMaxHeight);
    }
  });

  onUnmounted(() => {
    if (props.autoHeight) {
      window.removeEventListener('resize', calcMaxHeight);
    }
  });

  return {
    maxHeight,
    calcMaxHeight,
  };
}

