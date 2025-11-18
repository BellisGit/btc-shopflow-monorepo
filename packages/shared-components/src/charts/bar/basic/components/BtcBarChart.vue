<template>
  <div ref="chartContainerRef" class="btc-bar-chart">
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
import { useBarChart } from '../composables/useBarChart';
import type { BarChartProps } from '../../../types/bar';
import { getThemeColors } from '../../../utils/css-var';

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
  showToolbar: false,
  useGradient: false,
  gradientDirection: 'vertical'
});

const chartContainerRef = ref<HTMLElement | null>(null);
const themeColors = getThemeColors();

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark) => {
    const { buildOption } = useBarChart(props, isDark, themeColors);
    return buildOption();
  }
);

const { chartOption, chartStyle, updateChartInstance } = chart;

const handleChartReady = () => {
  updateChartInstance();
};
</script>

<style lang="scss" scoped>
@import '../styles/index.scss';
</style>

