import { ref, onMounted, onUnmounted, nextTick, watch, type Ref } from 'vue';
import type { TableProps } from '../types';

/**
 * 表格高度自动计算（对齐 cool-admin table/helper/height.ts）
 */
export function useTableHeight(props: TableProps, tableRef: Ref, crud?: any) {
  const maxHeight = ref<number | undefined>();

  /**
   * 计算最大高度（改进版本，更准确的高度计算）
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

      // 检查是否在 BtcViewGroup 中
      const viewGroupContent = tableEl.closest('.btc-view-group .content');
      let availableHeight: number;

      if (viewGroupContent) {
        // 在 BtcViewGroup 中，使用 content 区域的高度
        const contentRect = viewGroupContent.getBoundingClientRect();
        availableHeight = contentRect.height;
      } else {
        // 普通容器，使用 btc-crud 的高度
        const containerRect = container.getBoundingClientRect();
        availableHeight = containerRect.height;
      }

      // 计算表格上方的高度（包括所有前面的兄弟元素）
      let topHeight = 0;
      let prevSibling = tableEl.previousElementSibling;
      while (prevSibling) {
        const htmlElement = prevSibling as HTMLElement;
        if (htmlElement.offsetHeight > 0) {
          topHeight += htmlElement.offsetHeight;
          // 添加元素间的间距
          const marginBottom = parseInt(window.getComputedStyle(htmlElement).marginBottom, 10) || 0;
          topHeight += marginBottom;
        }
        prevSibling = prevSibling.previousElementSibling;
      }

      // 计算表格下方的高度（包括分页组件等）
      let bottomHeight = 0;
      let nextSibling = tableEl.nextElementSibling;
      while (nextSibling) {
        const htmlElement = nextSibling as HTMLElement;
        if (htmlElement.offsetHeight > 0) {
          bottomHeight += htmlElement.offsetHeight;
          // 添加元素间的间距
          const marginTop = parseInt(window.getComputedStyle(htmlElement).marginTop, 10) || 0;
          bottomHeight += marginTop;
        }
        nextSibling = nextSibling.nextElementSibling;
      }

      // 添加容器内边距
      const containerStyle = window.getComputedStyle(container);
      const paddingTop = parseInt(containerStyle.paddingTop, 10) || 0;
      const paddingBottom = parseInt(containerStyle.paddingBottom, 10) || 0;

      // 计算表格的最大高度
      const calculatedHeight = availableHeight - topHeight - bottomHeight - paddingTop - paddingBottom;

      // 设置最大高度（确保有足够的最小高度，并预留一些缓冲空间）
      maxHeight.value = Math.max(200, calculatedHeight - 20);
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

  // 监听数据变化，重新计算高度
  if (crud && props.autoHeight) {
    watch(
      () => crud.tableData.value,
      () => {
        nextTick(() => {
          calcMaxHeight();
        });
      },
      { deep: true }
    );
  }

  return {
    maxHeight,
    calcMaxHeight,
  };
}

