import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue';
import type { TableProps } from '../types';

/**
 * 表格高度自动计算（对齐 cool-admin table/helper/height.ts）
 */
export function useTableHeight(props: TableProps, tableRef: Ref) {
  const maxHeight = ref<number | undefined>();

  /**
   * 计算最大高度
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

      // 获取表格所在的容器
      const container = tableEl.closest('.btc-crud, .el-main, .app-layout__content');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const tableRect = tableEl.getBoundingClientRect();

      // 计算表格上方的其他元素高度
      const offsetTop = tableRect.top - containerRect.top;

      // 计算表格下方的其他元素高度（如分页）
      let offsetBottom = 0;
      const nextSibling = tableEl.nextElementSibling;
      if (nextSibling) {
        const siblingRect = nextSibling.getBoundingClientRect();
        offsetBottom = siblingRect.height + 20; // 20px 间距
      }

      // 计算可用高度
      const availableHeight = containerRect.height - offsetTop - offsetBottom;

      // 设置最大高度（减去一些缓冲空间）
      maxHeight.value = Math.max(200, availableHeight - 20);
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

