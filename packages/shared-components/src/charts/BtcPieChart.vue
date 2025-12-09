<template>
  <div ref="chartContainerRef" class="btc-pie-chart" :style="{ height: height, width: width }">
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

export interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  title?: string;
  data: PieChartDataItem[];
  height?: string;
  width?: string;
  autoresize?: boolean;
  radius?: [string, string];
  center?: [string, string];
  showLegend?: boolean;
  showTooltip?: boolean;
  showToolbar?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const props = withDefaults(defineProps<PieChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  radius: () => ['40%', '70%'],
  center: () => ['50%', '50%'],
  showLegend: true,
  showTooltip: true,
  showToolbar: false,
  legendPosition: 'top'
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
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
    show: props.showTooltip,
    // backgroundColor, borderColor, textStyle.color 由 ECharts 主题处理
    confine: true,
    appendToBody: true
  },
  legend: {
    show: props.showLegend,
    orient: ['left', 'right'].includes(props.legendPosition) ? 'vertical' : 'horizontal',
    [props.legendPosition]: props.legendPosition === 'bottom' ? '0%' :
                           props.legendPosition === 'top' ? '0%' :
                           props.legendPosition === 'left' ? '0%' : '0%'
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
  series: [
    {
      name: '数据',
      type: 'pie',
      radius: props.radius,
      center: props.center,
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: computed(() => isDark.value ? themeColors.value.dark.bgColor : themeColors.value.bgColor),
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center',
        color: computed(() => isDark.value ? themeColors.value.dark.textColor : themeColors.value.textColor)
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
          // color 由 ECharts 主题处理
        }
      },
      labelLine: {
        show: false
        // lineStyle.color 由 ECharts 主题处理
      },
      data: [] as any[]
    }
  ]
});

// 监听数据变化，更新图表
watch(() => props.data, (newData) => {
  chartOption.series[0].data = newData.map((item, index) => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: item.color || getDefaultColor(index)
    }
  }));
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

// 默认颜色配置
const defaultColors = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c',
  '#909399', '#c71585', '#ff6347', '#40e0d0'
];

function getDefaultColor(index: number): string {
  return defaultColors[index % defaultColors.length];
}

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
.btc-pie-chart {
  width: 100%;
  height: 100%;
}
</style>
