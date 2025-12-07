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
    // 每次构建时重新获取主题颜色，确保获取到最新的 CSS 变量值
    const currentThemeColors = typeof window !== 'undefined' 
      ? getThemeColors()
      : themeColors;
    const textColor = isDark.value ? currentThemeColors.dark.textColor : currentThemeColors.textColor;
    const borderColor = isDark.value ? currentThemeColors.dark.borderColor : currentThemeColors.borderColorLight;
    const tooltipBg = isDark.value ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';

    const option: EChartsOption = {
      title: {
        text: props.title || '',
        textStyle: {
          color: textColor
        }
      },
      tooltip: {
        trigger: 'item',
        show: props.showTooltip ?? true,
        backgroundColor: tooltipBg,
        borderColor: borderColor,
        borderWidth: 1,
        textStyle: {
          color: textColor
        },
        extraCssText: `color: ${textColor}; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);`,
        confine: true,
        appendToBody: true
      },
      legend: {
        show: props.showLegend ?? true,
        top: '0%',
        left: 'center',
        textStyle: {
          color: textColor
        },
        data: (props.data || []).map(item => item.name)
      },
      toolbox: {
        show: props.showToolbar ?? false,
        right: '10px',
        top: '10px',
        feature: {
          saveAsImage: {
            show: true,
            title: '?????',
            type: 'png',
            pixelRatio: 2
          },
          dataView: {
            show: true,
            title: '????',
            readOnly: false
          },
          restore: {
            show: true,
            title: '??'
          }
        },
        iconStyle: {
          borderColor: borderColor
        },
        emphasis: {
          iconStyle: {
            borderColor: currentThemeColors.primary
          }
        }
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
        axisName: {
          color: textColor
        },
        splitArea: {
          areaStyle: {
            color: [borderColor + '20', borderColor + '10']
          }
        },
        splitLine: {
          lineStyle: {
            color: borderColor
          }
        },
        axisLine: {
          lineStyle: {
            color: borderColor
          }
        }
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

