<template>
  <div class="btc-pie-chart">
    <v-chart
      :option="chartOption"
      :autoresize="autoresize"
      :style="{ height: height, width: width }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useDark } from '@vueuse/core';

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
  legendPosition: 'top'
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
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
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
    orient: ['left', 'right'].includes(props.legendPosition) ? 'vertical' : 'horizontal',
    [props.legendPosition]: props.legendPosition === 'bottom' ? '0%' :
                           props.legendPosition === 'top' ? '0%' :
                           props.legendPosition === 'left' ? '0%' : '0%',
    textStyle: {
      color: computed(() => isDark.value ? '#f1f1f9' : '#303133')
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
        borderColor: computed(() => isDark.value ? '#1d1e1f' : '#fff'),
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold',
          color: computed(() => isDark.value ? '#f1f1f9' : '#303133')
        }
      },
      labelLine: {
        show: false
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
</script>

<style lang="scss" scoped>
.btc-pie-chart {
  width: 100%;
  height: 100%;
}
</style>
