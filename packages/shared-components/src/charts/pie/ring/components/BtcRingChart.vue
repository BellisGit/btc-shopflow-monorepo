<template>
  <div ref="chartContainerRef" class="btc-ring-chart" :style="chartStyle">
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
import { useRingChart } from '../composables/useRingChart';
import type { RingChartProps } from '../../../types/pie';
import { getThemeColors } from '../../../utils/css-var';

const props = withDefaults(defineProps<RingChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  radius: () => ['40%', '70%'],
  center: () => ['50%', '50%'],
  showLegend: true,
  showTooltip: true,
  showToolbar: false,
  legendPosition: 'top',
  showLabel: false,
  showLabelLine: true,
  labelPosition: 'outside'
});

const chartContainerRef = ref<HTMLElement | null>(null);
const themeColors = getThemeColors();

const chart = useChartComponent(
  chartContainerRef,
  props,
  (isDark) => {
    const { buildOption } = useRingChart(props, isDark, themeColors);
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

