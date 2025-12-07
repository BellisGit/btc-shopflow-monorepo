import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { ScatterChartProps } from '../../../types/scatter';
import { getColorByIndex } from '../../../utils/color';
import { getThemeColors } from '../../../utils/css-var';

/**
 * ??? composable
 */
export function useScatterChart(
  props: ScatterChartProps,
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
        formatter: (params: any) => {
          const data = params.data;
          if (Array.isArray(data.value)) {
            return `${params.seriesName}<br/>${props.xAxisName || 'X'}: ${data.value[0]}<br/>${props.yAxisName || 'Y'}: ${data.value[1]}`;
          }
          return `${params.seriesName}<br/>${params.name || ''}`;
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
        }
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
      grid: props.grid || {
        left: '3%',
        right: '4%',
        top: '10%',
        bottom: '3%'
      },
      xAxis: {
        type: 'value',
        name: props.xAxisName,
        nameTextStyle: {
          color: textColor
        },
        axisLine: {
          lineStyle: {
            color: borderColor
          }
        },
        axisLabel: {
          color: textColor,
          formatter: props.xAxisFormatter || '{value}'
        },
        splitLine: {
          lineStyle: {
            color: borderColor
          }
        }
      },
      yAxis: {
        type: 'value',
        name: props.yAxisName,
        nameTextStyle: {
          color: textColor
        },
        axisLine: {
          lineStyle: {
            color: borderColor
          }
        },
        axisLabel: {
          color: textColor,
          formatter: props.yAxisFormatter || '{value}'
        },
        splitLine: {
          lineStyle: {
            color: borderColor
          }
        }
      },
      series: (props.data || []).map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        const symbolSize = item.symbolSize || 10;
        
        return {
          name: item.name,
          type: 'scatter' as const,
          data: (item.data || []).map(point => {
            // ?? value ????? [x, y]
            const value = Array.isArray(point.value) ? point.value : [point.value, 0];
            const pointSymbolSize = point.symbolSize || symbolSize;
            return {
              value: value,
              name: point.name,
              symbolSize: typeof pointSymbolSize === 'function' ? pointSymbolSize : (typeof pointSymbolSize === 'number' ? pointSymbolSize : 10),
              itemStyle: {
                color: point.color || baseColor
              }
            };
          }),
          symbol: item.symbol || 'circle',
          symbolSize: typeof symbolSize === 'function' ? symbolSize : (typeof symbolSize === 'number' ? symbolSize : 10),
          itemStyle: {
            color: baseColor
          },
          label: {
            show: props.showLabel ?? false,
            color: textColor,
            fontSize: 12
          }
        };
      }) as any
    };

    return option;
  };

  return {
    buildOption
  };
}
