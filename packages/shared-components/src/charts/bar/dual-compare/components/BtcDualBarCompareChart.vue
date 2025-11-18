<template>
  <div ref="chartContainerRef" class="btc-dual-bar-compare-chart">
    <v-chart
      :option="chartOption"
      :autoresize="autoresize"
      :style="chartStyle"
      @ready="handleChartReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChartComponent } from '../../../composables/useChartComponent';
import { useDualBarCompareChart } from '../composables/useDualBarCompareChart';
import type { DualBarCompareChartProps } from '../../../types/bar';
import { getThemeColors } from '../../../utils/css-var';

const props = withDefaults(defineProps<DualBarCompareChartProps>(), {
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
  showToolbar: false,
  label1: '数据1',
  label2: '数据2'
});

const chartContainerRef = ref<HTMLElement | null>(null);
const themeColors = getThemeColors();

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark) => {
    const { buildOption } = useDualBarCompareChart(props, isDark, themeColors);
    return buildOption();
  }
);

const { chartOption, chartStyle, updateChartInstance } = chart;

const handleChartReady = () => {
  updateChartInstance();
};
</script>

<style lang="scss" scoped>
@use '../styles/index.scss';
</style>

