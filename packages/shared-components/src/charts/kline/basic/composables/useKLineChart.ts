import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { KLineChartProps } from '../../../types/kline';

/**
 * K?? composable
 */
export function useKLineChart(
  props: KLineChartProps,
  isDark: Ref<boolean>,
  themeColors: ReturnType<typeof import('../../../utils/css-var').getThemeColors>
) {
  const buildOption = (): EChartsOption => {
    const textColor = isDark.value ? themeColors.dark.textColor : themeColors.textColor;
    const borderColor = isDark.value ? themeColors.dark.borderColor : themeColors.borderColorLight;
    const tooltipBg = isDark.value ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    const upColor = props.upColor || '#ec0000';
    const downColor = props.downColor || '#00da3c';

    const option: EChartsOption = {
      title: {
        text: props.title || '',
        textStyle: {
          color: textColor
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        show: props.showTooltip ?? true,
        backgroundColor: tooltipBg,
        borderColor: borderColor,
        borderWidth: 1,
        textStyle: {
          color: textColor
        },
        formatter: (params: any) => {
          const data = params[0].data;
          if (Array.isArray(data)) {
            return `??: ${params[0].name}<br/>??: ${data[0]}<br/>??: ${data[1]}<br/>??: ${data[2]}<br/>??: ${data[3]}`;
          }
          return '';
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
        data: ['K?', ...(props.showVolume ? ['???'] : [])]
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
      grid: (props.showVolume ? [
        {
          left: '10%',
          right: '8%',
          top: '15%',
          bottom: '60%',
          gridIndex: 0
        },
        {
          left: '10%',
          right: '8%',
          top: '65%',
          bottom: '10%',
          gridIndex: 1
        }
      ] : [
        {
          left: '10%',
          right: '8%',
          top: '15%',
          bottom: '10%',
          gridIndex: 0
        }
      ]) as any,
      xAxis: (props.showVolume ? [
        {
          type: 'category',
          data: (props.data || []).map(item => item.date),
          scale: true,
          boundaryGap: false,
          gridIndex: 0,
          axisLine: {
            lineStyle: {
              color: borderColor
            }
          },
          axisLabel: {
            color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary
          },
          splitLine: {
            show: false
          },
          min: 'dataMin',
          max: 'dataMax'
        },
        {
          type: 'category',
          gridIndex: 1,
          data: (props.data || []).map(item => item.date),
          scale: true,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: borderColor
            }
          },
          axisLabel: {
            show: false
          },
          splitLine: {
            show: false
          },
          min: 'dataMin',
          max: 'dataMax'
        }
      ] : [
        {
          type: 'category',
          data: (props.data || []).map(item => item.date),
          scale: true,
          boundaryGap: false,
          gridIndex: 0,
          axisLine: {
            lineStyle: {
              color: borderColor
            }
          },
          axisLabel: {
            color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary
          },
          splitLine: {
            show: false
          },
          min: 'dataMin',
          max: 'dataMax'
        }
      ]) as any,
      yAxis: props.showVolume ? [
        {
          scale: true,
          gridIndex: 0,
          splitArea: {
            show: true
          },
          axisLine: {
            lineStyle: {
              color: borderColor
            }
          },
          axisLabel: {
            color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary
          },
          splitLine: {
            lineStyle: {
              color: borderColor
            }
          }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLine: {
            lineStyle: {
              color: borderColor
            }
          },
          axisLabel: {
            show: false
          },
          splitLine: {
            show: false
          }
        }
      ] : [
        {
          scale: true,
          gridIndex: 0,
          splitArea: {
            show: true
          },
          axisLine: {
            lineStyle: {
              color: borderColor
            }
          },
          axisLabel: {
            color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary
          },
          splitLine: {
            lineStyle: {
              color: borderColor
            }
          }
        }
      ],
      dataZoom: props.showVolume ? [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 50,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          top: '90%',
          start: 50,
          end: 100
        }
      ] : [
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 50,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0],
          type: 'slider',
          top: '90%',
          start: 50,
          end: 100
        }
      ],
      series: [
        {
          name: 'K?',
          type: 'candlestick' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: (props.data || []).map(item => item.value),
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upColor,
            borderColor0: downColor
          }
        },
        ...(props.showVolume ? [{
          name: '???',
          type: 'bar' as const,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: (props.data || []).map(item => item.volume || 0),
          itemStyle: {
            color: (params: any) => {
              const dataIndex = params.dataIndex;
              const klineData = (props.data || [])[dataIndex];
              if (klineData && klineData.value) {
                const [open, close] = klineData.value;
                return close >= open ? upColor : downColor;
              }
              return upColor;
            }
          }
        }] : [])
      ] as any
    };

    return option;
  };

  return {
    buildOption
  };
}
