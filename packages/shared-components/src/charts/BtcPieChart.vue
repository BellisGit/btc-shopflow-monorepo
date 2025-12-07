<template>
  <div ref="chartContainerRef" class="btc-pie-chart" :style="{ height: height, width: width }">
    <v-chart
      v-if="isContainerReady"
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
const themeColors = getThemeColors();
const chartTheme = computed(() => isDark.value ? 'btc-dark' : 'btc-light');

const chartOption = reactive({
  title: {
    text: props.title || '',
    textStyle: {
      color: computed(() => isDark.value ? themeColors.dark.textColor : themeColors.textColor)
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
    show: props.showTooltip,
    backgroundColor: computed(() => isDark.value ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
    borderColor: computed(() => isDark.value ? themeColors.dark.borderColor : themeColors.borderColorLight),
    borderWidth: 1,
    textStyle: {
      color: computed(() => isDark.value ? themeColors.dark.textColor : themeColors.textColor)
    },
    extraCssText: computed(() => {
      const color = isDark.value ? themeColors.dark.textColor : themeColors.textColor;
      return `color: ${color}; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);`;
    }),
    confine: true,
    appendToBody: true
  },
  legend: {
    show: props.showLegend,
    orient: ['left', 'right'].includes(props.legendPosition) ? 'vertical' : 'horizontal',
    [props.legendPosition]: props.legendPosition === 'bottom' ? '0%' :
                           props.legendPosition === 'top' ? '0%' :
                           props.legendPosition === 'left' ? '0%' : '0%',
    textStyle: {
      color: computed(() => isDark.value ? themeColors.dark.textColor : themeColors.textColor)
    }
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
    },
    iconStyle: {
      borderColor: computed(() => isDark.value ? themeColors.dark.borderColor : themeColors.borderColorLight)
    },
    emphasis: {
      iconStyle: {
        borderColor: themeColors.primary
      }
    }
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
        borderColor: computed(() => isDark.value ? themeColors.dark.bgColor : themeColors.bgColor),
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center',
        color: computed(() => isDark.value ? themeColors.dark.textColor : themeColors.textColor)
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold',
          color: computed(() => isDark.value ? themeColors.dark.textColor : themeColors.textColor)
        }
      },
      labelLine: {
        show: false,
        lineStyle: {
          color: computed(() => isDark.value ? themeColors.dark.borderColor : themeColors.borderColorLight)
        }
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
