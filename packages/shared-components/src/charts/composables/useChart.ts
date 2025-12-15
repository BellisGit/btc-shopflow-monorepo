import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue';
import { useDark } from '@vueuse/core';
import { useResizeObserver } from '@vueuse/core';
import { getInstanceByDom } from 'echarts/core';
import type { EChartsOption } from 'echarts';
import type { BaseChartProps } from '../types/base';
import { registerEChartsThemes } from '../utils/theme';

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
    // 容器存在即允许渲染（不强依赖尺寸），避免 v-if 永远为 false 导致图表不渲染
    markContainerMounted();
    handleResize();

    // 尺寸变化后，如果实例还没拿到，尝试更新一次
    if (!chartInstance.value) {
      updateChartInstance();
    }
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

  // 检查容器是否准备好（有尺寸）
  const isContainerReady = ref(false);

  // 标记容器已挂载并且有尺寸
  // 只有当容器已挂载且 width/height > 0 时，才让 <v-chart> 渲染，避免 ECharts 以 0 尺寸初始化报错
  const markContainerMounted = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;
    // isConnected 在现代浏览器可用；fallback 到 document.contains
    const mounted = (el as any).isConnected === true || document.body.contains(el);
    const hasSize = checkContainerSize();
    if (mounted && hasSize && !isContainerReady.value) {
      isContainerReady.value = true;
    }
    return mounted && hasSize;
  };
  
  // 检查容器尺寸
  const checkContainerSize = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const rect = containerRef.value.getBoundingClientRect();
    const hasSize = rect.width > 0 && rect.height > 0;
    // 仅作为“是否可安全初始化/resize”的判断，不再用尺寸来决定是否渲染 v-chart
    return hasSize;
  };

  // 更新图表实例引用（在 v-chart 渲染后调用）
  let retryCount = 0;
  let checkIntervalId: number | null = null;
  const MAX_RETRY_COUNT = 50; // 最多重试 50 次（5 秒）
  
  const updateChartInstance = () => {
    if (!containerRef.value) {
      return;
    }
    
    // 检查容器是否有尺寸
    if (!checkContainerSize()) {
      retryCount++;
      if (retryCount < MAX_RETRY_COUNT) {
        // DOM 还没有尺寸，延迟重试
        setTimeout(() => {
          updateChartInstance();
        }, 100);
      } else {
        // 超过最大重试次数，记录警告
        if (import.meta.env.DEV) {
          console.warn('[useChart] 容器尺寸检查超时，图表可能无法正常显示');
        }
      }
      return;
    }
    
    // 容器已有尺寸，重置重试计数
    retryCount = 0;
    
    try {
      chartInstance.value = getInstanceByDom(containerRef.value);
      if (chartInstance.value && props.autoresize) {
        chartInstance.value.resize();
      }
    } catch (error) {
      // 忽略错误，可能图表还未初始化
      if (import.meta.env.DEV) {
        console.warn('[useChart] 获取图表实例失败:', error);
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
    if (checkIntervalId !== null) {
      clearInterval(checkIntervalId);
      checkIntervalId = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });

  // 组件挂载后检查容器尺寸
  onMounted(() => {
    // 立即检查一次容器尺寸
    nextTick(() => {
      // 先确保 v-chart 可渲染
      markContainerMounted();
      // 如果容器还没有尺寸，启动检查循环
      if (!isContainerReady.value) {
        checkIntervalId = window.setInterval(() => {
          // 容器只要挂载就允许渲染；实例获取仍取决于是否有尺寸
          if (markContainerMounted() || retryCount >= MAX_RETRY_COUNT) {
            if (checkIntervalId !== null) {
              clearInterval(checkIntervalId);
              checkIntervalId = null;
            }
            if (isContainerReady.value) {
              // 容器已准备好，延迟获取实例，确保 v-chart 已渲染
              setTimeout(() => {
                updateChartInstance();
              }, 100);
            }
          }
        }, 50); // 每 50ms 检查一次
      } else {
        // 容器已有尺寸，直接获取实例
        setTimeout(() => {
          updateChartInstance();
        }, 100);
      }
    });
  });

  // 计算图表主题 - 使用自定义主题
  // 添加 key 确保主题变化时强制重新渲染 v-chart 组件
  const chartThemeKey = ref(0);
  const chartTheme = computed(() => {
    return isDark.value ? 'btc-dark' : 'btc-light';
  });

  // 监听主题变化，重新注册 ECharts 主题并强制重新渲染图表
  watch(
    () => isDark.value,
    () => {
      // 主题切换时，先销毁旧实例
      if (chartInstance.value) {
        try {
          chartInstance.value.dispose();
          chartInstance.value = null;
        } catch (error) {
          // 忽略错误
        }
      }
      
      // 使用多重延迟确保 CSS 变量已经更新（useDark 更新 dark 类是异步的）
      // 1. 等待 DOM 更新
      nextTick(() => {
        // 2. 等待浏览器渲染
        requestAnimationFrame(() => {
          // 3. 等待 CSS 变量更新（给足够的时间让 useDark 更新 dark 类）
          setTimeout(() => {
            // 4. 再次等待浏览器重新计算样式
            requestAnimationFrame(() => {
              // 5. 重新注册 ECharts 主题（使用最新的 CSS 变量值）
              registerEChartsThemes();
              
              // 6. 再次延迟，确保主题注册完成
              setTimeout(() => {
                // 更新 key 强制重新渲染 v-chart 组件
                chartThemeKey.value++;
                // 重置容器准备状态，强制重新初始化
                isContainerReady.value = false;
                // 延迟后重新检查容器并初始化
                nextTick(() => {
                  setTimeout(() => {
                    // 主题切换后先允许渲染，再尝试拿实例
                    markContainerMounted();
                    if (isContainerReady.value) {
                      updateChartInstance();
                    }
                  }, 100);
                });
              }, 150);
            });
          }, 200);
        });
      });
    },
    { flush: 'post' } // 在 DOM 更新后执行
  );

  return {
    isDark,
    isEmpty,
    isLoading,
    isContainerReady,
    chartOption,
    chartTheme,
    chartThemeKey,
    chartInstance,
    getChartInstance,
    updateChartInstance,
    cleanupTooltip,
    setLoading: (loading: boolean) => {
      isLoading.value = loading;
    }
  };
}

