<template>
  <div ref="chartContainerRef" class="btc-bar-chart">
    <v-chart
      :option="chartOption"
      :autoresize="autoresize"
      :style="{ height: height, width: width }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref, onBeforeUnmount } from 'vue';
import { useDark } from '@vueuse/core';
import { getInstanceByDom } from 'echarts/core';

export interface BarChartData {
  name: string;
  data: number[];
  color?: string;
  barWidth?: number | string;
}

export interface BarChartProps {
  title?: string;
  data: BarChartData[];
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
  yAxisFormatter?: string;
}

const props = withDefaults(defineProps<BarChartProps>(), {
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

const chartOption = reactive({
  title: {
    text: props.title || '',
    textStyle: {
      color: computed(() => isDark.value ? '#f1f1f9' : '#303133')
    }
  },
  tooltip: {
    trigger: 'axis',
    show: props.showTooltip,
    backgroundColor: computed(() => isDark.value ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
    borderColor: computed(() => isDark.value ? '#4c4d4f' : '#e4e7ed'),
    borderWidth: 1,
    textStyle: {
      color: computed(() => isDark.value ? '#f1f1f9' : '#303133')
    },
    confine: true,
    appendToBody: true
  },
  legend: {
    show: props.showLegend,
    top: '0%',
    left: 'center',
    textStyle: {
      color: computed(() => isDark.value ? '#f1f1f9' : '#303133')
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
      borderColor: computed(() => isDark.value ? '#4c4d4f' : '#e4e7ed')
    },
    emphasis: {
      iconStyle: {
        borderColor: computed(() => isDark.value ? '#409eff' : '#409eff')
      }
    }
  },
  grid: props.grid,
  xAxis: {
    type: 'category',
    data: props.xAxisData,
    axisLine: {
      lineStyle: {
        color: computed(() => isDark.value ? '#4c4d4f' : '#e4e7ed')
      }
    },
    axisLabel: {
      color: computed(() => isDark.value ? '#a8abb2' : '#606266')
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: computed(() => isDark.value ? '#4c4d4f' : '#e4e7ed')
      }
    },
    axisLabel: {
      color: computed(() => isDark.value ? '#a8abb2' : '#606266'),
      formatter: props.yAxisFormatter ? `{value}${props.yAxisFormatter}` : '{value}'
    }
  },
  series: [] as any[]
});

// 监听数据变化，更新图表
watch(() => [props.data, props.xAxisData, props.showLabel], () => {
  chartOption.xAxis.data = props.xAxisData;
  chartOption.series = props.data.map((item) => ({
    name: item.name,
    type: 'bar',
    data: item.data,
    barWidth: item.barWidth || '60%',
    itemStyle: {
      color: item.color || '#409eff'
    },
    label: {
      show: props.showLabel,
      position: 'top',
      color: computed(() => isDark.value ? '#f1f1f9' : '#303133'),
      fontSize: 12
    }
  }));
}, { immediate: true });

// 监听标题变化
watch(() => props.title, (newTitle) => {
  chartOption.title.text = newTitle || '';
}, { immediate: true });

// 图表容器引用
const chartContainerRef = ref<HTMLElement | null>(null);

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
.btc-bar-chart {
  width: 100%;
  height: 100%;
}
</style>
