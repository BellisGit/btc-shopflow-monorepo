/**
 * ECharts 统一清理工具
 * 用于自动清理所有 ECharts 实例和相关的 DOM 元素
 */
import { getInstanceByDom } from 'echarts/core';

/**
 * 清理所有 ECharts 实例和相关的 DOM 元素
 * 包括 tooltip、toolbox、数据视图弹窗等
 * 
 * 注意：此函数会清理所有 ECharts 实例，包括当前页面正在使用的图表
 * 通常应该在路由切换时调用，而不是在组件卸载时调用
 */
export function cleanupAllECharts() {
  // 1. 清理 body 中残留的 tooltip DOM（这些是 appendToBody 的元素）
  const tooltipElements = document.querySelectorAll('.echarts-tooltip');
  tooltipElements.forEach((el) => {
    if (el.parentNode === document.body) {
      el.parentNode.removeChild(el);
    }
  });

  // 2. 清理 body 中残留的 toolbox 相关 DOM（数据视图弹窗等）
  // 这些元素通常是通过 appendToBody 添加到 body 的
  const toolboxElements = document.querySelectorAll(
    '.echarts-toolbox, .echarts-data-view, [class*="echarts-toolbox"], [class*="echarts-data-view"]'
  );
  toolboxElements.forEach((el) => {
    // 只清理 body 中的残留元素（appendToBody 的元素）
    if (el.parentNode === document.body) {
      el.parentNode.removeChild(el);
    }
  });

  // 3. 清理可能存在的遮罩层
  const overlayElements = document.querySelectorAll('[class*="echarts-overlay"]');
  overlayElements.forEach((el) => {
    if (el.parentNode === document.body) {
      el.parentNode.removeChild(el);
    }
  });
  
  // 注意：不主动销毁所有 ECharts 实例，因为：
  // 1. 组件卸载时会自动调用 dispose（通过 useChart composable）
  // 2. 主动销毁可能会影响当前页面正在使用的图表
  // 3. 我们只需要清理 appendToBody 的残留 DOM 元素即可
}

/**
 * 清理指定容器内的所有 ECharts 实例
 * @param container 容器元素
 */
export function cleanupEChartsInContainer(container: HTMLElement | Document) {
  const chartContainers = container.querySelectorAll('[data-echarts], .echarts-container, [class*="echarts"]');
  
  chartContainers.forEach((chartContainer) => {
    if (chartContainer instanceof HTMLElement) {
      try {
        const chartInstance = getInstanceByDom(chartContainer);
        if (chartInstance) {
          try {
            chartInstance.dispatchAction({
              type: 'hideTip'
            });
          } catch (error) {
            // 忽略错误
          }
          chartInstance.dispose();
        }
      } catch (error) {
        // 忽略错误
      }
    }
  });
}

