<template>
  <div ref="chartContainerRef" class="btc-line-chart" :style="{ height: height, width: width }">
    <v-chart
      v-if="isContainerReady"
      :key="chartThemeKey"
      :option="chartOption"
      :theme="chartTheme"
      :autoresize="autoresize"
      :style="{ width: '100%', height: '100%' }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useDark } from '@vueuse/core';
import { getInstanceByDom } from 'echarts/core';
import { getThemeColors } from './utils/css-var';
import { registerEChartsThemes } from './utils/theme';

export interface LineChartData {
  name: string;
  data: number[];
  color?: string;
  smooth?: boolean;
  areaStyle?: boolean;
}

export interface LineChartProps {
  title?: string;
  data: LineChartData[];
  xAxisData: string[];
  height?: string;
  width?: string;
  autoresize?: boolean;
  grid?: {
    left?: string | number;
    right?: string | number;
    top?: string | number;
    bottom?: string | number;
  };
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabel?: boolean;
  showToolbar?: boolean;
}

const props = withDefaults(defineProps<LineChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  grid: () => ({
    left: '3%',
    right: '4%',
    top: '10%',
    bottom: '3%'
  }),
  showLegend: true,
  showTooltip: true,
  showLabel: false,
  showToolbar: false
});

const isDark = useDark();
// 使用 computed 让 themeColors 响应式，每次访问时都重新获取最新的 CSS 变量值
const themeColors = computed(() => getThemeColors());
const chartTheme = computed(() => isDark.value ? 'btc-dark' : 'btc-light');
// 添加 key 确保主题变化时强制重新渲染
const chartThemeKey = ref(0);

const chartOption = reactive({
  title: {
    text: props.title || ''
    // textStyle.color 由 ECharts 主题处理
  },
  tooltip: {
    trigger: 'axis',
    show: props.showTooltip,
    // backgroundColor, borderColor, textStyle.color 由 ECharts 主题处理
    confine: true,
    appendToBody: true
  },
  legend: {
    show: props.showLegend,
    top: '0%',
    left: 'center'
    // textStyle.color 由 ECharts 主题处理
  },
  toolbox: {
    show: props.showToolbar,
    right: '10px',
    top: '10px',
    feature: {
      saveAsImage: {
        show: true,
        title: '保存为图片',
        type: 'png',
        pixelRatio: 2
      },
      dataView: {
        show: true,
        title: '数据视图',
        readOnly: false
      },
      restore: {
        show: true,
        title: '还原'
      }
    }
    // iconStyle.borderColor 由 ECharts 主题处理
  },
  grid: props.grid,
  xAxis: {
    type: 'category',
    data: props.xAxisData
    // axisLine.lineStyle.color, axisLabel.color 由 ECharts 主题处理
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    // splitLine.lineStyle.color, axisLabel.color 由 ECharts 主题处理
  },
  series: [] as any[]
});

// 监听数据变化，更新图表
watch(() => [props.data, props.xAxisData, props.showLabel], () => {
  chartOption.xAxis.data = props.xAxisData;
  chartOption.series = props.data.map((item) => {
    const baseColor = item.color || '#409eff';
    const seriesConfig: any = {
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: item.smooth ?? true,
      itemStyle: {
        color: baseColor
      },
      lineStyle: {
        color: baseColor
      },
      label: {
        show: props.showLabel,
        position: 'top',
        color: computed(() => isDark.value ? themeColors.value.dark.textColor : themeColors.value.textColor),
        fontSize: 12
      }
    };
    
    // 如果设置了 areaStyle，添加面积填充
    if (item.areaStyle) {
      seriesConfig.areaStyle = {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: baseColor + '80' // 80 表示 50% 透明度
            },
            {
              offset: 1,
              color: baseColor + '00' // 00 表示完全透明
            }
          ]
        }
      };
    }
    
    return seriesConfig;
  });
}, { immediate: true });

// 监听标题变化
watch(() => props.title, (newTitle) => {
  chartOption.title.text = newTitle || '';
}, { immediate: true });

// 监听主题变化，重新注册 ECharts 主题并强制重新渲染图表
watch(
  () => isDark.value,
  () => {
    // 主题切换时，先销毁旧实例
    if (chartContainerRef.value) {
      try {
        const chartInstance = getInstanceByDom(chartContainerRef.value);
        if (chartInstance) {
          chartInstance.dispose();
        }
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
                  checkContainerSize();
                  if (isContainerReady.value) {
                    // 图表会在 v-chart 重新渲染时自动初始化
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

// 图表容器引用
const chartContainerRef = ref<HTMLElement | null>(null);
const isContainerReady = ref(false);

// 检查容器尺寸
const checkContainerSize = (): boolean => {
  if (!chartContainerRef.value) {
    return false;
  }
  const rect = chartContainerRef.value.getBoundingClientRect();
  const hasSize = rect.width > 0 && rect.height > 0;
  if (hasSize && !isContainerReady.value) {
    isContainerReady.value = true;
  }
  return hasSize;
};

// 组件挂载后检查容器尺寸
onMounted(() => {
  nextTick(() => {
    checkContainerSize();
    if (!isContainerReady.value) {
      const checkInterval = setInterval(() => {
        if (checkContainerSize()) {
          clearInterval(checkInterval);
        }
      }, 50);
      // 最多等待 5 秒
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);
    }
  });
});

// 组件卸载时清理 tooltip、toolbox 和 ECharts 实例
onBeforeUnmount(() => {
  if (chartContainerRef.value) {
    try {
      const chartInstance = getInstanceByDom(chartContainerRef.value);
      if (chartInstance) {
        // 隐藏 tooltip
        chartInstance.dispatchAction({
          type: 'hideTip'
        });
        // 销毁 ECharts 实例，这会自动清理所有相关的 DOM 元素（包括 toolbox）
        chartInstance.dispose();
      }
    } catch (error) {
      // 忽略错误，可能图表已经销毁
    }
  }
  
  // 清理 body 中残留的 tooltip DOM
  const tooltipElements = document.querySelectorAll('.echarts-tooltip');
  tooltipElements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  
  // 清理 body 中残留的 toolbox 相关 DOM（数据视图弹窗等）
  const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
  toolboxElements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
});
</script>

<style lang="scss" scoped>
.btc-line-chart {
  width: 100%;
  height: 100%;
}
</style>
