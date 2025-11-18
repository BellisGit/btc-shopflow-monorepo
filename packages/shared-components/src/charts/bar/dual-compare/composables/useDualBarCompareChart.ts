import { type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { DualBarCompareChartProps } from '../../../types/bar';
import { getColorByIndex } from '../../../utils/color';

/**
 * 双柱对比图 composable
 */
export function useDualBarCompareChart(
  props: DualBarCompareChartProps,
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
        },
        data: [props.label1 || '数据1', props.label2 || '数据2']
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
        type: 'category',
        data: props.xAxisData,
        axisLine: {
          lineStyle: {
            color: borderColor
          }
        },
        axisLabel: {
          color: isDark.value ? themeColors.dark.textColorSecondary : themeColors.textColorSecondary
        }
      },
      yAxis: {
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
          formatter: props.yAxisFormatter ? `{value}${props.yAxisFormatter}` : '{value}'
        }
      },
      series: [
        ...props.data1.map((item, index) => ({
          name: props.label1 || '数据1',
          type: 'bar',
          data: item.data,
          barWidth: item.barWidth || '30%',
          itemStyle: {
            color: item.color || getColorByIndex(0)
          },
          label: {
            show: props.showLabel ?? false,
            position: 'top',
            color: textColor,
            fontSize: 12
          }
        })),
        ...props.data2.map((item, index) => ({
          name: props.label2 || '数据2',
          type: 'bar',
          data: item.data,
          barWidth: item.barWidth || '30%',
          itemStyle: {
            color: item.color || getColorByIndex(1)
          },
          label: {
            show: props.showLabel ?? false,
            position: 'top',
            color: textColor,
            fontSize: 12
          }
        }))
      ]
    };

    return option;
  };

  return {
    buildOption
  };
}

