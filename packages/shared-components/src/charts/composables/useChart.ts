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
    // 当容器尺寸变化时，检查是否可以允许渲染
    const hadSize = isContainerReady.value;
    markContainerMounted();

    // 如果容器刚获得尺寸（从无尺寸变为有尺寸），需要初始化图表实例
    if (!hadSize && isContainerReady.value && !chartInstance.value) {
      // 延迟一下，确保DOM已更新
      nextTick(() => {
        setTimeout(() => {
          updateChartInstance();
        }, 50);
      });
    }

    // 如果图表实例已存在，调用resize
    if (chartInstance.value) {
      handleResize();
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

  // 检查是否在qiankun子应用环境中
  const isInQiankunSubApp = (): boolean => {
    return typeof window !== 'undefined' && !!(window as any).__POWERED_BY_QIANKUN__;
  };

  // 检查容器尺寸（使用clientWidth/clientHeight，在滚动容器内更准确）
  const checkContainerSize = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;
    // 使用 clientWidth 和 clientHeight，这些值在滚动容器内更可靠
    // 即使元素不在视口内，只要它有布局尺寸，clientWidth/clientHeight 就是正确的
    const width = el.clientWidth;
    const height = el.clientHeight;
    // 需要确保容器有合理的尺寸（至少10px，避免误判）
    const hasSize = width > 10 && height > 10;
    // 仅作为"是否可安全初始化/resize"的判断，不再用尺寸来决定是否渲染 v-chart
    return hasSize;
  };

  // 检查容器是否在可滚动的父元素内
  const isInScrollableContainer = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;
    let parent = el.parentElement;
    const maxDepth = 30; // 增加深度，确保能找到滚动容器
    let depth = 0;

    while (parent && depth < maxDepth) {
      // 检查是否是 Element Plus 的滚动条容器（btc-container 使用 el-scrollbar）
      if (parent.classList.contains('el-scrollbar') ||
          parent.classList.contains('el-scrollbar__wrap') ||
          parent.classList.contains('btc-container')) {
        // 检查滚动容器本身是否有尺寸
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return true;
        }
      }

      // 检查是否有 overflow、overflow-y、overflow-x 属性设置为 auto 或 scroll
      try {
        const style = window.getComputedStyle(parent);
        const overflow = style.overflow || style.overflowY || style.overflowX;
        if (overflow === 'auto' || overflow === 'scroll') {
          // 检查滚动容器本身是否有尺寸
          const rect = parent.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return true;
          }
        }
      } catch (e) {
        // 忽略样式计算错误
      }

      // 检查是否到达根元素
      if (parent === document.body || parent === document.documentElement) {
        break;
      }

      parent = parent.parentElement;
      depth++;
    }
    return false;
  };

  // 检查容器是否在qiankun子应用挂载点内且有父元素尺寸
  const hasParentSize = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;
    let parent = el.parentElement;
    const maxDepth = 20;
    let depth = 0;

    // 查找qiankun容器或任何有尺寸的父元素
    while (parent && depth < maxDepth) {
      const rect = parent.getBoundingClientRect();
      // 如果父元素有尺寸，认为容器可以渲染（子应用环境中，容器可能暂时无尺寸，但父元素有）
      if (rect.width > 0 && rect.height > 0) {
        return true;
      }
      // 如果到达qiankun容器，停止查找
      if (parent.id === 'subapp-viewport' ||
          parent.id?.startsWith('__qiankun_microapp_wrapper') ||
          parent.getAttribute('data-qiankun')) {
        break;
      }
      parent = parent.parentElement;
      depth++;
    }
    return false;
  };

  // 标记容器已挂载并且有尺寸
  // 关键：只有在容器真正有尺寸时才允许渲染，避免ECharts以0尺寸初始化
  const markContainerMounted = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;
    // isConnected 在现代浏览器可用；fallback 到 document.contains
    const mounted = (el as any).isConnected === true || document.body.contains(el);

    if (!mounted) {
      return false;
    }

    // 关键：只有在容器真正有尺寸时才允许渲染
    // 这是为了避免ECharts以0尺寸初始化导致报错
    const hasSize = checkContainerSize();

    if (hasSize) {
      if (!isContainerReady.value) {
        isContainerReady.value = true;
      }
      return true;
    }

    // 容器暂时无尺寸，不设置isContainerReady
    // updateChartInstance会处理这种情况，使用重试或IntersectionObserver
    return false;
  };

  // 检查容器是否可见（用于判断是否应该输出警告）
  const isContainerVisible = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;

    // 检查容器是否在DOM中
    if (!el.isConnected && !document.body.contains(el)) {
      return false;
    }

    const style = window.getComputedStyle(el);
    // 检查 display、visibility、opacity
    const isDisplayed = style.display !== 'none';
    const isVisible = style.visibility !== 'hidden';
    const isOpaque = parseFloat(style.opacity) > 0;

    // 如果样式显示容器被隐藏，直接返回 false
    if (!isDisplayed || !isVisible || !isOpaque) {
      return false;
    }

    // 在qiankun子应用环境中，检查容器是否在子应用挂载点内
    if (isInQiankunSubApp()) {
      // 查找最近的qiankun容器（subapp-viewport 或 __qiankun_microapp_wrapper）
      let parent = el.parentElement;
      let foundQiankunContainer = false;
      const maxDepth = 20; // 最多向上查找20层，避免无限循环
      let depth = 0;

      while (parent && depth < maxDepth) {
        if (parent.id === 'subapp-viewport' ||
            parent.id?.startsWith('__qiankun_microapp_wrapper') ||
            parent.getAttribute('data-qiankun')) {
          foundQiankunContainer = true;
          break;
        }
        parent = parent.parentElement;
        depth++;
      }

      // 如果在子应用环境中但容器不在子应用挂载点内，可能是容器还未挂载，不警告
      if (!foundQiankunContainer) {
        return false;
      }

      // 检查子应用容器是否有尺寸（子应用容器可能有尺寸，但内部元素还未渲染）
      if (parent) {
        const containerRect = parent.getBoundingClientRect();
        if (containerRect.width === 0 || containerRect.height === 0) {
          return false;
        }
      }
    }

    // 检查容器的实际尺寸
    const rect = el.getBoundingClientRect();

    // 如果容器尺寸为 0，可能是父元素被隐藏、折叠或还未完全渲染
    // 检查父元素链，看是否有隐藏的父元素
    let currentParent = el.parentElement;
    let parentDepth = 0;
    const maxParentDepth = 10;

    while (currentParent && parentDepth < maxParentDepth) {
      const parentStyle = window.getComputedStyle(currentParent);
      const parentRect = currentParent.getBoundingClientRect();

      // 如果父元素被隐藏或尺寸为0，容器不可见
      if (parentStyle.display === 'none' ||
          parentStyle.visibility === 'hidden' ||
          parseFloat(parentStyle.opacity) === 0 ||
          (parentRect.width === 0 && parentRect.height === 0)) {
        return false;
      }

      // 在子应用环境中，如果遇到主应用的布局容器，停止检查
      if (isInQiankunSubApp() &&
          (currentParent.id === 'app' ||
           currentParent.classList.contains('app-layout') ||
           currentParent.id?.startsWith('__qiankun_microapp_wrapper'))) {
        break;
      }

      currentParent = currentParent.parentElement;
      parentDepth++;
    }

    // 检查是否在视口内（或子应用容器内）
    // 在qiankun环境中，容器的视口可能是子应用容器，而不是window
    const isInViewport = rect.top < window.innerHeight &&
                        rect.bottom > 0 &&
                        rect.left < window.innerWidth &&
                        rect.right > 0;

    // 如果容器在视口内但尺寸为 0，可能是真正的问题
    // 但如果父元素链中有隐藏的元素，不需要警告
    return isInViewport && rect.width > 0 && rect.height > 0;
  };

  // 更新图表实例引用（在 v-chart 渲染后调用）
  let retryCount = 0;
  let checkIntervalId: number | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  // 在qiankun子应用环境中，需要更长的等待时间（容器挂载和渲染需要更多时间）
  const MAX_RETRY_COUNT = isInQiankunSubApp() ? 100 : 50; // 子应用：10秒，主应用：5秒

  const updateChartInstance = () => {
    if (!containerRef.value) {
      return;
    }

    // 检查容器是否有尺寸（使用clientWidth/clientHeight更可靠）
    if (!checkContainerSize()) {
      retryCount++;
      if (retryCount < MAX_RETRY_COUNT) {
        // DOM 还没有尺寸，延迟重试
        // 在子应用环境中，使用稍长的延迟，给容器更多时间渲染
        const retryDelay = isInQiankunSubApp() ? 150 : 100;
        setTimeout(() => {
          updateChartInstance();
        }, retryDelay);
      } else {
        // 超过最大重试次数，如果容器在滚动容器内，使用IntersectionObserver等待进入视口
        if (isInScrollableContainer() && !intersectionObserver) {
          try {
            intersectionObserver = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting && entry.target === containerRef.value) {
                    // 容器进入视口，再次尝试更新实例
                    retryCount = 0; // 重置重试计数
                    updateChartInstance();
                    // 如果成功，取消观察
                    if (intersectionObserver && containerRef.value) {
                      intersectionObserver.unobserve(containerRef.value);
                      intersectionObserver.disconnect();
                      intersectionObserver = null;
                    }
                  }
                });
              },
              {
                root: null, // 使用视口作为根
                threshold: 0.01, // 只要1%可见就触发
              }
            );
            if (containerRef.value) {
              intersectionObserver.observe(containerRef.value);
            }
          } catch (e) {
            // IntersectionObserver不支持时忽略
          }
        } else {
          // 不在滚动容器内或已使用过IntersectionObserver，记录警告
          if (import.meta.env.DEV) {
            // 再次检查容器可见性，只有在确实可见且应该显示时才警告
            const shouldWarn = isContainerVisible();
            if (shouldWarn) {
              console.warn('[useChart] 容器尺寸检查超时，图表可能无法正常显示', {
                container: containerRef.value,
                isQiankun: isInQiankunSubApp(),
                clientWidth: containerRef.value.clientWidth,
                clientHeight: containerRef.value.clientHeight,
                rect: containerRef.value.getBoundingClientRect(),
              });
            }
          }
        }
      }
      return;
    }

    // 容器已有尺寸，重置重试计数并清理IntersectionObserver
    retryCount = 0;
    if (intersectionObserver) {
      if (containerRef.value) {
        intersectionObserver.unobserve(containerRef.value);
      }
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }

    try {
      chartInstance.value = getInstanceByDom(containerRef.value);
      if (chartInstance.value && containerRef.value) {
        // 确保容器有尺寸后再调用resize
        const width = containerRef.value.clientWidth;
        const height = containerRef.value.clientHeight;

        if (width > 10 && height > 10) {
          // 容器有尺寸，可以安全地调用resize
          if (props.autoresize) {
            // 使用requestAnimationFrame确保浏览器已完成布局
            requestAnimationFrame(() => {
              if (chartInstance.value && containerRef.value) {
                // 再次检查尺寸，确保仍然有效
                const currentWidth = containerRef.value.clientWidth;
                const currentHeight = containerRef.value.clientHeight;
                if (currentWidth > 10 && currentHeight > 10) {
                  try {
                    chartInstance.value.resize();
                  } catch (error) {
                    if (import.meta.env.DEV) {
                      console.warn('[useChart] resize失败:', error);
                    }
                  }
                }
              }
            });
          }
        } else {
          // 容器尺寸仍然不够，延迟重试
          // 但不要无限重试，避免死循环
          if (retryCount < MAX_RETRY_COUNT) {
            setTimeout(() => {
              updateChartInstance();
            }, 100);
          } else {
            // 超过最大重试次数，等待IntersectionObserver或ResizeObserver触发
            if (import.meta.env.DEV) {
              console.warn('[useChart] 容器尺寸不足，等待ResizeObserver触发', {
                width,
                height,
                container: containerRef.value,
              });
            }
          }
        }
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
    if (intersectionObserver) {
      if (containerRef.value) {
        intersectionObserver.unobserve(containerRef.value);
      }
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });

  // 组件挂载后检查容器尺寸
  onMounted(() => {
    // 在子应用环境中，需要更长的初始延迟，等待子应用完全挂载
    const initialDelay = isInQiankunSubApp() ? 300 : 0;

    setTimeout(() => {
      // 立即检查一次容器尺寸
      nextTick(() => {
        // 先确保 v-chart 可渲染（在子应用环境中，这会使用更宽松的条件）
        const mounted = markContainerMounted();

        // 如果容器还没准备好，启动检查循环
        if (!isContainerReady.value) {
          const checkInterval = isInQiankunSubApp() ? 100 : 50; // 子应用环境使用更长的检查间隔
          let checkCount = 0;
          const maxCheckCount = isInQiankunSubApp() ? 100 : 50; // 最多检查次数

          checkIntervalId = window.setInterval(() => {
            checkCount++;
            // 尝试标记容器为已挂载（在子应用环境中，这会使用更宽松的条件）
            const nowMounted = markContainerMounted();

            // 如果容器已准备好，或者达到最大检查次数
            if (isContainerReady.value || checkCount >= maxCheckCount) {
              if (checkIntervalId !== null) {
                clearInterval(checkIntervalId);
                checkIntervalId = null;
              }

              // 只有在容器真正准备好时才获取实例
              if (isContainerReady.value) {
                // 容器已准备好，延迟获取实例，确保 v-chart 已渲染
                // 在子应用环境中，使用更长的延迟
                const instanceDelay = isInQiankunSubApp() ? 300 : 100;
                setTimeout(() => {
                  updateChartInstance();
                }, instanceDelay);
              }
            }
          }, checkInterval);
        } else {
          // 容器已有尺寸，直接获取实例
          const instanceDelay = isInQiankunSubApp() ? 300 : 100;
          setTimeout(() => {
            updateChartInstance();
          }, instanceDelay);
        }
      });
    }, initialDelay);
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

  // 安全的updateChartInstance包装，供外部调用（如handleChartReady）
  // 确保在调用时容器有尺寸，避免ECharts以0尺寸初始化
  const safeUpdateChartInstance = () => {
    if (!containerRef.value) {
      return;
    }

    // 检查容器尺寸，如果没有尺寸，延迟调用
    if (!checkContainerSize()) {
      // 延迟重试，给容器更多时间获取尺寸
      // 最多重试10次（500ms）
      let retryCount = 0;
      const maxSafeRetries = 10;
      const retrySafeUpdate = () => {
        retryCount++;
        if (retryCount < maxSafeRetries && containerRef.value && !checkContainerSize()) {
          setTimeout(retrySafeUpdate, 50);
        } else if (containerRef.value && checkContainerSize()) {
          // 容器有尺寸了，调用updateChartInstance
          updateChartInstance();
        } else {
          // 超过最大重试次数，仍然没有尺寸
          // 依赖ResizeObserver或IntersectionObserver来处理
          if (import.meta.env.DEV) {
            console.warn('[useChart] safeUpdateChartInstance: 容器尺寸不足，等待ResizeObserver');
          }
        }
      };
      setTimeout(retrySafeUpdate, 50);
      return;
    }

    // 容器有尺寸，直接调用updateChartInstance
    updateChartInstance();
  };

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
    updateChartInstance: safeUpdateChartInstance, // 返回安全的包装版本
    cleanupTooltip,
    setLoading: (loading: boolean) => {
      isLoading.value = loading;
    }
  };
}

