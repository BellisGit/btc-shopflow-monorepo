<template>
  <div ref="chartContainerRef" class="btc-kline-chart">
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
import { useKLineChart } from '../composables/useKLineChart';
import type { KLineChartProps } from '../../../types/kline';
import { getThemeColors } from '../../../utils/css-var';

const props = withDefaults(defineProps<KLineChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  grid: () => ({
    left: '10%',
    right: '8%',
    top: '15%',
    bottom: '10%'
  }),
  showLegend: true,
  showTooltip: true,
  showToolbar: false,
  showVolume: false,
  upColor: '#ec0000',
  downColor: '#00da3c'
});

const chartContainerRef = ref<HTMLElement | null>(null);
const themeColors = getThemeColors();

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark) => {
    const { buildOption } = useKLineChart(props, isDark, themeColors);
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

