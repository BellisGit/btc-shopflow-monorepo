import { computed, type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { LineChartProps } from '../../../types/line';
import { createVerticalGradient } from '../../../utils/gradient';
import { getColorByIndex } from '../../../utils/color';
import { getThemeColors } from '../../../utils/css-var';

/**
 * 折线图 composable
 */
export function useLineChart(
  props: LineChartProps,
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
    const bgColor = isDark.value ? currentThemeColors.dark.bgColorPage : currentThemeColors.bgColor;
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
        type: 'category',
        data: props.xAxisData,
        axisLine: {
          lineStyle: {
            color: borderColor
          }
        },
        axisLabel: {
          color: textColor
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
          color: textColor,
          formatter: props.yAxisFormatter ? `{value}${props.yAxisFormatter}` : '{value}'
        }
      },
      series: props.data.map((item, index) => {
        const baseColor = item.color || getColorByIndex(index);
        const seriesConfig: any = {
          name: item.name,
          type: 'line',
          data: item.data,
          smooth: item.smooth ?? true,
          itemStyle: {
            color: baseColor
          },
          lineStyle: {
            color: baseColor,
            width: item.lineWidth ?? 2
          },
          symbol: item.showSymbol !== false ? 'circle' : 'none',
          symbolSize: 6,
          label: {
            show: props.showLabel ?? false,
            position: 'top',
            color: textColor,
            fontSize: 12
          },
          animation: props.animation !== false,
          animationDuration: props.animationDuration ?? 1000
        };

        // 如果设置了 areaStyle，添加面积填充
        if (item.areaStyle) {
          seriesConfig.areaStyle = {
            color: createVerticalGradient(baseColor, 0.5, 0)
          };
        }

        // 如果设置了 stack，添加堆叠
        if (item.stack) {
          seriesConfig.stack = item.stack;
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

