import { debounce, last } from "lodash-es";
import { nextTick, onActivated, onMounted, ref, Ref } from "vue";
import { addClass, removeClass } from "@btc/shared-components/utils/dom";
import { globalMitt } from "@btc/shared-components/utils/mitt";
import type { TableProps } from '../types';

// 全局处理 ResizeObserver 错误（这是一个已知的浏览器问题）
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  const resizeObserverErrorHandler = (e: ErrorEvent) => {
    if (e.message && e.message.includes('ResizeObserver loop')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  };

  window.addEventListener('error', resizeObserverErrorHandler);

  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && e.reason.message && e.reason.message.includes('ResizeObserver loop')) {
      e.preventDefault();
    }
  });
}

// 表格高度计算 - 适配 Vue 3 的 DOM 结构
export function useTableHeight(props: TableProps, tableRef: Ref) {
  // 最大高度
  const maxHeight = ref(0);

  // 计算表格最大高度 - 适配 Vue 3
  const update = debounce(async () => {
    await nextTick();

    const table = tableRef.value;
    if (!table || !table.$el) return;

    const tableEl = table.$el as HTMLElement;

    // 找到 btc-crud 容器
    const crudContainer = tableEl.closest('.btc-crud') as HTMLElement;
    if (!crudContainer) return;

    // 找到表格所在的 btc-crud-row
    const tableRow = tableEl.closest('.btc-crud-row') as HTMLElement;
    if (!tableRow) return;

    await nextTick();

    // 高度计算
    let h = 0;

    // 表格下间距
    h += 10;

    // 上高度：表格行相对于 crud 容器的 offsetTop
    h += tableRow.offsetTop;

    // 获取下高度：遍历表格行后续的所有兄弟元素
    let nextSibling = tableRow.nextElementSibling;
    const siblings = [tableRow];

    while (nextSibling) {
      const htmlElement = nextSibling as HTMLElement;
      if (htmlElement.offsetHeight > 0) {
        h += htmlElement.offsetHeight || 0;
        siblings.push(htmlElement);

        if (htmlElement.className.includes("btc-crud-row--last")) {
          h += 10;
        }
      }
      nextSibling = nextSibling.nextElementSibling;
    }

    // 移除 btc-crud-row--last
    siblings.forEach((e) => {
      removeClass(e, "btc-crud-row--last");
    });

    // 最后一个可视元素
    const z = last(siblings);

    // 去掉 btc-crud-row 下间距高度
    if (z?.className.includes("btc-crud-row")) {
      addClass(z, "btc-crud-row--last");
      h -= 10;
    }

    // 上间距
    h += parseInt(window.getComputedStyle(crudContainer).paddingTop, 10);

    // 设置最大高度（参考 cool-admin 的实现）
    if (props.autoHeight) {
      maxHeight.value = crudContainer.clientHeight - h;
    }
  }, 100);

  // 窗口大小改变事件 - 使用 mitt 事件系统
  globalMitt.on("resize", () => {
    update();
  });

  onMounted(function () {
    update();
  });

  onActivated(function () {
    update();
  });

  return {
    maxHeight,
    calcMaxHeight: update
  };
}
