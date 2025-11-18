import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { RadarChartProps } from '../../../types/radar';
import { getColorByIndex } from '../../../utils/color';

/**
 * ??? composable
 */
export function useRadarChart(
  props: RadarChartProps,
  isDark: Ref<boolean>,
  themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>
) {
  const buildOption = (): EChartsOption => {
    const textColor = isDark.value ? themeColors.dark.textColor : themeColors.textColor;
    const borderColor = isDark.value ? themeColors.dark.borderColor : themeColors.borderColorLight;
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
            borderColor: themeColors.primary
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

