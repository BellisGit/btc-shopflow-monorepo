import { ref, computed, watch, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useDark } from '@vueuse/core';
import { useResizeObserver } from '@vueuse/core';
import { getInstanceByDom } from 'echarts/core';
import type { EChartsOption } from 'echarts';
import type { BaseChartProps } from '../types/base';

/**
 * 核心图表 composable
 * 提供生命周期管理、resize处理、主题支持、空状态管理等
 */
export function useChart(
  containerRef: Ref<HTMLElement | null>,
  props: BaseChartProps,
  buildOption: (isDark: Ref<boolean>) => EChartsOption | Ref<EChartsOption> | (() => EChartsOption)
) {
  const isDark = useDark();
  const isEmpty = ref(false);
  const isLoading = ref(false);
  const chartInstance = ref<any>(null);

  // 构建图表配置
  const chartOption = computed(() => {
    const option = buildOption(isDark);
    if (typeof option === 'function') {
      return option();
    }
    if (option && typeof option === 'object' && 'value' in option) {
      return option.value;
    }
    return option as EChartsOption;
  });

  // 检查数据是否为空
  const checkEmpty = (data: any[] | null | undefined): boolean => {
    if (!data || data.length === 0) return true;
    // 检查数据项是否有效
    return data.every(item => {
      if (Array.isArray(item)) {
        return item.length === 0;
      }
      if (typeof item === 'object' && item !== null) {
        return Object.keys(item).length === 0;
      }
      return false;
    });
  };

  // 监听数据变化，更新空状态
  watch(() => props.data, (newData) => {
    isEmpty.value = checkEmpty(newData);
  }, { immediate: true });

  // Resize 处理
  let resizeTimer: number | null = null;
  const handleResize = () => {
    if (resizeTimer) {
      cancelAnimationFrame(resizeTimer);
    }
    resizeTimer = requestAnimationFrame(() => {
      if (chartInstance.value) {
        try {
          chartInstance.value.resize();
        } catch (error) {
          // 忽略错误
        }
      }
    });
  };

  // 使用 ResizeObserver 监听容器大小变化
  useResizeObserver(containerRef, () => {
    handleResize();
  });

  // 监听窗口大小变化
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }

  // 获取图表实例
  const getChartInstance = () => {
    if (containerRef.value && !chartInstance.value) {
      try {
        chartInstance.value = getInstanceByDom(containerRef.value);
      } catch (error) {
        // 忽略错误
      }
    }
    return chartInstance.value;
  };

  // 更新图表实例引用（在 v-chart 渲染后调用）
  const updateChartInstance = () => {
    if (containerRef.value) {
      try {
        // 检查 DOM 是否有尺寸
        const rect = containerRef.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          // DOM 还没有尺寸，延迟重试
          setTimeout(() => {
            updateChartInstance();
          }, 100);
          return;
        }
        
        chartInstance.value = getInstanceByDom(containerRef.value);
        if (chartInstance.value && props.autoresize) {
          chartInstance.value.resize();
        }
      } catch (error) {
        // 忽略错误
      }
    }
  };

  // 清理 tooltip、toolbox 和 ECharts 实例
  const cleanupTooltip = () => {
    if (chartInstance.value) {
      try {
        chartInstance.value.dispatchAction({
          type: 'hideTip'
        });
      } catch (error) {
        // 忽略错误
      }
    }
    
    // 清理 body 中残留的 tooltip DOM
    const tooltipElements = document.querySelectorAll('.echarts-tooltip');
    tooltipElements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };

  // 清理 toolbox 相关 DOM
  const cleanupToolbox = () => {
    // 清理 body 中残留的 toolbox 相关 DOM（数据视图弹窗等）
    const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
    toolboxElements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };

  // 销毁 ECharts 实例
  const disposeChart = () => {
    if (chartInstance.value) {
      try {
        // 销毁 ECharts 实例，这会自动清理所有相关的 DOM 元素（包括 toolbox）
        chartInstance.value.dispose();
        chartInstance.value = null;
      } catch (error) {
        // 忽略错误，可能图表已经销毁
      }
    }
  };

  // 组件卸载时清理
  onBeforeUnmount(() => {
    cleanupTooltip();
    cleanupToolbox();
    disposeChart();
    if (resizeTimer) {
      cancelAnimationFrame(resizeTimer);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });

  // 组件挂载后更新实例
  onMounted(() => {
    // 延迟获取实例，确保 v-chart 已渲染
    setTimeout(() => {
      updateChartInstance();
    }, 100);
  });

  return {
    isDark,
    isEmpty,
    isLoading,
    chartOption,
    chartInstance,
    getChartInstance,
    updateChartInstance,
    cleanupTooltip,
    setLoading: (loading: boolean) => {
      isLoading.value = loading;
    }
  };
}

