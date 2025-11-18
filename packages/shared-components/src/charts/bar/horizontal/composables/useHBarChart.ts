import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { HBarChartProps } from '../../../types/bar';
import { createHorizontalGradient } from '../../../utils/gradient';
import { getColorByIndex } from '../../../utils/color';

/**
 * 横向柱状图 composable
 */
export function useHBarChart(
  props: HBarChartProps,
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
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
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
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: borderColor
          }
        },
        axisLabel: {
          color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary,
          formatter: props.xAxisFormatter ? `{value}${props.xAxisFormatter}` : '{value}'
        }
      },
      yAxis: {
        type: 'category',
        data: props.yAxisData,
        axisLine: {
          lineStyle: {
            color: borderColor
          }
        },
        axisLabel: {
          color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary
        }
      },
      series: props.data.map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        
        const seriesConfig: any = {
          name: item.name,
          type: 'bar',
          data: item.data,
          barWidth: item.barWidth || '60%',
          label: {
            show: props.showLabel ?? false,
            position: 'right',
            color: textColor,
            fontSize: 12
          }
        };

        // 如果使用渐变
        if (props.useGradient) {
          seriesConfig.itemStyle = {
            color: createHorizontalGradient(baseColor, 0.8, 0.2)
          };
        } else {
          seriesConfig.itemStyle = {
            color: baseColor
          };
        }

        return seriesConfig;
      })
    };

    return option;
  };

  return {
    buildOption
  };
}

