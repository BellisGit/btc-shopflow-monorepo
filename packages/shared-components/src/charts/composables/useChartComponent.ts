import { computed, type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { BaseChartProps } from '../types/base';
import { useChart } from './useChart';
import { getThemeColors } from '../utils/css-var';

/**
 * 组件抽象 composable
 * 简化图表组件的开发
 */
export function useChartComponent(
  containerRef: Ref<HTMLElement | null>,
  props: BaseChartProps,
  buildOption: (isDark: Ref<boolean>, themeColors: ReturnType<typeof getThemeColors>) => EChartsOption | Ref<EChartsOption> | (() => EChartsOption)
) {
  const themeColors = getThemeColors();
  
  const chart = useChart(containerRef, props, (isDark) => {
    const option = buildOption(isDark, themeColors);
    if (typeof option === 'function') {
      return option();
    }
    return option;
  });

  // 计算样式
  const chartStyle = computed(() => ({
    height: props.height || '300px',
    width: props.width || '100%'
  }));

  return {
    ...chart,
    chartStyle
  };
}

