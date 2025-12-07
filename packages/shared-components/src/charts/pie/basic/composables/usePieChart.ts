import { computed, type Ref } from 'vue';
import type { EChartsOption } from 'echarts';
import type { PieChartProps } from '../../../types/pie';
import { getColorByIndex } from '../../../utils/color';
import { getThemeColors } from '../../../utils/css-var';

/**
 * ?? composable
 */
export function usePieChart(
  props: PieChartProps,
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
    const bgColor = isDark.value ? currentThemeColors.dark.bgColor : currentThemeColors.bgColor;
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
        formatter: '{a} <br/>{b}: {c} ({d}%)',
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
        orient: ['left', 'right'].includes(props.legendPosition || 'top') ? 'vertical' : 'horizontal',
        [props.legendPosition || 'top']: '0%',
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
      series: [
        {
          name: '??',
          type: 'pie',
          // ??????????????????????????????
          radius: Array.isArray(props.radius) ? props.radius : (props.radius || '60%'),
          center: props.center || ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: bgColor,
            borderWidth: 2
          },
          label: {
            show: props.showLabel ?? false,
            position: props.labelPosition || 'outside',
            color: textColor,
            fontSize: 12
          },
          labelLine: {
            show: props.showLabelLine ?? true,
            lineStyle: {
              color: borderColor
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
              color: textColor
            }
          },
          data: props.data.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color || getColorByIndex(index)
            }
          }))
        }
      ]
    };

    return option;
  };

  return {
    buildOption
  };
}
