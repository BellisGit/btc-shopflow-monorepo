<template>
  <div ref="chartContainerRef" class="btc-scatter-chart" :style="chartStyle">
    <v-chart
      v-if="isContainerReady"
      :option="chartOption"
      :theme="chartTheme"
      :autoresize="autoresize"
      :style="{ width: '100%', height: '100%' }"
      @ready="handleChartReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChartComponent } from '../../../composables/useChartComponent';
import { useScatterChart } from '../composables/useScatterChart';
import type { ScatterChartProps } from '../../../types/scatter';
import { getThemeColors } from '../../../utils/css-var';

const props = withDefaults(defineProps<ScatterChartProps>(), {
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

const chartContainerRef = ref<HTMLElement | null>(null);
const themeColors = getThemeColors();

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark) => {
    const { buildOption } = useScatterChart(props, isDark, themeColors);
    return buildOption();
  }
);

const { chartOption, chartStyle, updateChartInstance, isContainerReady, chartTheme } = chart;

const handleChartReady = () => {
  updateChartInstance();
};
</script>

<style lang="scss" scoped>
@use '../styles/index.scss';
</style>

