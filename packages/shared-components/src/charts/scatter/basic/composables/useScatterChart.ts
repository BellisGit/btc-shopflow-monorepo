import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { ScatterChartProps } from '../../../types/scatter';
import { getColorByIndex } from '../../../utils/color';

/**
 * 散点图 composable
 */
export function useScatterChart(
  props: ScatterChartProps,
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
          color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary,
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
          color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary,
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
        
        return {
          name: item.name,
          type: 'scatter',
          data: (item.data || []).map(point => {
            // 确保 value 是数组格式 [x, y]
            const value = Array.isArray(point.value) ? point.value : [point.value, 0];
            return {
              value: value,
              name: point.name,
              symbolSize: point.symbolSize || item.symbolSize || 10,
              itemStyle: {
                color: point.color || baseColor
              }
            };
          }),
          symbol: item.symbol || 'circle',
          symbolSize: item.symbolSize || 10,
          itemStyle: {
            color: baseColor
          },
          label: {
            show: props.showLabel ?? false,
            color: textColor,
            fontSize: 12
          }
        };
      })
    };

    return option;
  };

  return {
    buildOption
  };
}

