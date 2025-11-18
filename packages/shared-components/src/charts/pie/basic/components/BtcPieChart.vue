<template>
  <div ref="chartContainerRef" class="btc-pie-chart">
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
import { usePieChart } from '../composables/usePieChart';
import type { PieChartProps } from '../../../types/pie';
import { getThemeColors } from '../../../utils/css-var';

const props = withDefaults(defineProps<PieChartProps>(), {
  height: '300px',
  width: '100%',
  autoresize: true,
  radius: () => '60%', // 饼图默认实心，使用坕个坊径�?
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
    const { buildOption } = usePieChart(props, isDark, themeColors);
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

