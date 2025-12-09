import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { RadarChartProps } from '../../../types/radar';
import { getColorByIndex } from '../../../utils/color';
import { getThemeColors } from '../../../utils/css-var';

/**
 * ??? composable
 */
export function useRadarChart(
  props: RadarChartProps,
  isDark: Ref<boolean>,
  themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>
) {
  const buildOption = (): EChartsOption => {
    // 每次构建时重新获取主题颜色，用于需要动态计算的颜色（如雷达图分割区域）
    const currentThemeColors = typeof window !== 'undefined' 
      ? getThemeColors()
      : themeColors;
    const borderColor = isDark.value ? currentThemeColors.dark.borderColor : currentThemeColors.borderColorLight;

    const option: EChartsOption = {
      title: {
        text: props.title || ''
        // textStyle.color 由 ECharts 主题处理
      },
      tooltip: {
        trigger: 'item',
        show: props.showTooltip ?? true,
        // backgroundColor, borderColor, textStyle.color 由 ECharts 主题处理
        confine: true,
        appendToBody: true
      },
      legend: {
        show: props.showLegend ?? true,
        top: '0%',
        left: 'center',
        data: (props.data || []).map(item => item.name)
        // textStyle.color 由 ECharts 主题处理
      },
      toolbox: {
        show: props.showToolbar ?? false,
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
        }
        // iconStyle.borderColor 由 ECharts 主题处理
      },
      radar: {
        center: props.center || ['50%', '55%'],
        radius: props.radius || '75%',
        splitNumber: props.splitNumber || 5,
        indicator: props.indicators.map(indicator => ({
          name: indicator.name,
          max: indicator.max,
          min: indicator.min ?? 0
        })),
        // axisName.color 由 ECharts 主题处理
        splitArea: {
          areaStyle: {
            color: [borderColor + '20', borderColor + '10']
          }
        },
        // splitLine.lineStyle.color, axisLine.lineStyle.color 由 ECharts 主题处理
      },
      series: (props.data || []).map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        
        return {
          name: item.name,
          type: 'radar',
          data: [
            {
              value: item.data || [],
              itemStyle: {
                color: baseColor
              },
              areaStyle: item.areaStyle ? {
                color: baseColor + '40'
              } : undefined,
              lineStyle: {
                color: baseColor,
                width: 2
              }
            }
          ]
        };
      })
    };

    return option;
  };

  return {
    buildOption
  };
}

