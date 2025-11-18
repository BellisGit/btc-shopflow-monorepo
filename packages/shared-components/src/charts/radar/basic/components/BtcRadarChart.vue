<template>
  <div ref="chartContainerRef" class="btc-radar-chart">
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
import { useRadarChart } from '../composables/useRadarChart';
import type { RadarChartProps } from '../../../types/radar';
import { getThemeColors } from '../../../utils/css-var';

const props = withDefaults(defineProps<RadarChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  center: () => ['50%', '55%'],
  radius: '75%',
  splitNumber: 5,
  showLegend: true,
  showTooltip: true,
  showToolbar: false
});

const chartContainerRef = ref<HTMLElement | null>(null);
const themeColors = getThemeColors();

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark) => {
    const { buildOption } = useRadarChart(props, isDark, themeColors);
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

